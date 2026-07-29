import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RedoIcon from "@mui/icons-material/Redo";
import RemoveIcon from "@mui/icons-material/Remove";
import UndoIcon from "@mui/icons-material/Undo";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import {
    FloorElementView,
    SEAT_RANGE,
    TableGraphic,
    clampSeats,
    floorColors,
    floorRoomOrder,
    type FloorElement,
    type TableShape,
} from "@/components/screens/restaurant/floor-plan";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { useActions, useStore } from "../store";

/**
 * Table Chart — the floor-plan editor.
 *
 * Built from `references/072926/10-tablechart/`, with the interaction model taken
 * from the artifact prototype in that folder: a shape palette down the left, a
 * gridded canvas, direct manipulation with handles, undo/redo in the app bar, and
 * per-room layouts that each save independently.
 *
 * The important structural decision: **the editor writes back**. SAVE commits the
 * working copy to the store, and the live Tables screen renders from that same
 * store. Before this the two screens held separate hard-coded layouts, so moving
 * a table here changed nothing an operator would ever see.
 *
 * Unsaved work is flagged by an orange dot on the SAVED segment rather than a
 * dialog, which is right for a tablet — nothing blocks, and the state is visible
 * without being in the way.
 */

const CANVAS_W = 1280;
const CANVAS_H = 760;
const GRID = 20;

interface PaletteItem {
    key: string;
    label: string;
    make: () => Omit<FloorElement, "id">;
}

/** The palette, in the artifact's order: five table shapes, then three items. */
const TABLES: PaletteItem[] = [
    { key: "circle", label: "Round table", make: () => ({ kind: "table", shape: "circle", x: 0, y: 0, w: 110, h: 110, seats: 4, lockAR: true, status: "empty" }) },
    { key: "square", label: "Square table", make: () => ({ kind: "table", shape: "square", x: 0, y: 0, w: 100, h: 100, seats: 4, status: "empty" }) },
    { key: "rectangle", label: "Long table", make: () => ({ kind: "table", shape: "rectangle", x: 0, y: 0, w: 160, h: 100, seats: 6, status: "empty" }) },
    { key: "oval", label: "Oval table", make: () => ({ kind: "table", shape: "oval", x: 0, y: 0, w: 130, h: 100, seats: 4, status: "empty" }) },
    { key: "diamond", label: "Diamond table", make: () => ({ kind: "table", shape: "diamond", x: 0, y: 0, w: 100, h: 100, seats: 4, lockAR: true, status: "empty" }) },
];

const ITEMS: PaletteItem[] = [
    { key: "barrier", label: "Barrier", make: () => ({ kind: "barrier", x: 0, y: 0, w: 240, h: 10 }) },
    { key: "box", label: "Region", make: () => ({ kind: "box", x: 0, y: 0, w: 160, h: 90 }) },
    { key: "label", label: "Label", make: () => ({ kind: "label", x: 0, y: 0, w: 90, h: 24, text: "Label" }) },
];

/** Palette thumbnails reuse the real table renderer, so they cannot drift. */
const PaletteThumb = ({ item }: { item: PaletteItem }) => {
    const spec = item.make();
    if (spec.kind !== "table") {
        if (spec.kind === "barrier") return <Box sx={{ width: 40, height: 5, bgcolor: floorColors.idle, borderRadius: "2px" }} />;
        if (spec.kind === "box") return <Box sx={{ width: 40, height: 24, border: `2px solid ${floorColors.idle}`, borderRadius: "3px" }} />;
        return (
            <Box sx={{ px: 1, py: 0.25, border: "1px dashed rgba(0,0,0,0.4)", borderRadius: "3px", fontSize: 11 }}>Label</Box>
        );
    }
    const el = { ...spec, id: "thumb", w: 44, h: spec.shape === "rectangle" || spec.shape === "oval" ? 34 : 44 } as FloorElement;
    return (
        <Box sx={{ transform: spec.shape === "diamond" ? "rotate(45deg)" : undefined, display: "grid", placeItems: "center" }}>
            <TableGraphic element={el} fill={floorColors.idle} />
        </Box>
    );
};

const HANDLES = [
    { key: "nw", x: 0, y: 0 },
    { key: "n", x: 0.5, y: 0 },
    { key: "ne", x: 1, y: 0 },
    { key: "e", x: 1, y: 0.5 },
    { key: "se", x: 1, y: 1 },
    { key: "s", x: 0.5, y: 1 },
    { key: "sw", x: 0, y: 1 },
    { key: "w", x: 0, y: 0.5 },
] as const;

type HandleKey = (typeof HANDLES)[number]["key"];

const snap = (n: number) => Math.round(n / GRID) * GRID;

export const TableChartScreen = () => {
    const { state } = useStore();
    const { setFloorRoom, saveFloorPlan } = useActions();
    const navigate = useNavigate();

    const room = state.floorRoom;
    const saved = state.floorPlans[room] ?? [];

    const [elements, setElements] = useState<FloorElement[]>(saved);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [roomsOpen, setRoomsOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(true);

    // Undo/redo hold whole snapshots. The layouts are small enough that diffing
    // would be more code than it saves.
    const past = useRef<FloorElement[][]>([]);
    const future = useRef<FloorElement[][]>([]);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Switching rooms discards nothing: the working copy is reseeded from the
    // room you switch into, and each room saves independently.
    useEffect(() => {
        setElements(state.floorPlans[room] ?? []);
        setSelectedId(null);
        past.current = [];
        future.current = [];
    }, [room, state.floorPlans]);

    const dirty = useMemo(() => JSON.stringify(elements) !== JSON.stringify(saved), [elements, saved]);
    const selected = elements.find((e) => e.id === selectedId) ?? null;

    const commit = useCallback(
        (next: FloorElement[] | ((prev: FloorElement[]) => FloorElement[])) => {
            setElements((prev) => {
                past.current = [...past.current.slice(-40), prev];
                future.current = [];
                return typeof next === "function" ? next(prev) : next;
            });
        },
        [],
    );

    /** Live drag updates bypass the undo stack; only the gesture's start is pushed. */
    const nudge = (next: FloorElement[] | ((prev: FloorElement[]) => FloorElement[])) => setElements(next);

    const undo = () => {
        const prev = past.current.pop();
        if (!prev) return;
        setElements((current) => {
            future.current = [...future.current, current];
            return prev;
        });
        setSelectedId(null);
    };

    const redo = () => {
        const next = future.current.pop();
        if (!next) return;
        setElements((current) => {
            past.current = [...past.current, current];
            return next;
        });
    };

    const addElement = (item: PaletteItem) => {
        const spec = item.make();
        const n = elements.filter((e) => e.kind === "table").length + 1;
        // New elements land in the first clear-ish spot rather than at 0,0 —
        // dropping one under the palette is the fastest way to lose it.
        const el: FloorElement = {
            ...spec,
            id: `${item.key}-${Date.now().toString(36)}`,
            x: snap(120 + ((n * 40) % 400)),
            y: snap(160 + ((n * 30) % 300)),
            num: spec.kind === "table" ? String(n) : undefined,
        };
        commit((prev) => [...prev, el]);
        setSelectedId(el.id);
    };

    const patch = (id: string, changes: Partial<FloorElement>, live = false) =>
        (live ? nudge : commit)((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));

    const remove = (id: string) => {
        commit((prev) => prev.filter((e) => e.id !== id));
        setSelectedId(null);
    };

    /* ------------------------------------------------------------ gestures */

    const startDrag = (e: React.PointerEvent, el: FloorElement) => {
        e.stopPropagation();
        setSelectedId(el.id);
        past.current = [...past.current.slice(-40), elements];
        future.current = [];

        const startX = e.clientX;
        const startY = e.clientY;
        const originX = el.x;
        const originY = el.y;
        const target = e.currentTarget as HTMLElement;
        target.setPointerCapture(e.pointerId);

        const move = (ev: PointerEvent) => {
            const dx = (ev.clientX - startX) / zoom;
            const dy = (ev.clientY - startY) / zoom;
            patch(
                el.id,
                {
                    x: Math.max(0, Math.min(CANVAS_W - el.w, snap(originX + dx))),
                    y: Math.max(0, Math.min(CANVAS_H - el.h, snap(originY + dy))),
                },
                true,
            );
        };
        const up = () => {
            target.removeEventListener("pointermove", move);
            target.removeEventListener("pointerup", up);
        };
        target.addEventListener("pointermove", move);
        target.addEventListener("pointerup", up);
    };

    const startResize = (e: React.PointerEvent, el: FloorElement, handle: HandleKey) => {
        e.stopPropagation();
        past.current = [...past.current.slice(-40), elements];
        future.current = [];

        const startX = e.clientX;
        const startY = e.clientY;
        const box = { x: el.x, y: el.y, w: el.w, h: el.h };
        const ratio = el.w / el.h;
        const target = e.currentTarget as HTMLElement;
        target.setPointerCapture(e.pointerId);

        const move = (ev: PointerEvent) => {
            const dx = (ev.clientX - startX) / zoom;
            const dy = (ev.clientY - startY) / zoom;
            let { x, y, w, h } = box;

            if (handle.includes("e")) w = box.w + dx;
            if (handle.includes("s")) h = box.h + dy;
            if (handle.includes("w")) {
                w = box.w - dx;
                x = box.x + dx;
            }
            if (handle.includes("n")) {
                h = box.h - dy;
                y = box.y + dy;
            }

            // A round table that stops being round stops reading as a table, so
            // lockAR elements resize on one axis and mirror it to the other.
            if (el.lockAR) {
                if (handle === "n" || handle === "s") w = h * ratio;
                else h = w / ratio;
            }

            w = Math.max(40, snap(w));
            h = Math.max(el.kind === "barrier" || el.kind === "label" ? 10 : 40, snap(h));
            patch(el.id, { x: Math.max(0, snap(x)), y: Math.max(0, snap(y)), w, h }, true);
        };
        const up = () => {
            target.removeEventListener("pointermove", move);
            target.removeEventListener("pointerup", up);
        };
        target.addEventListener("pointermove", move);
        target.addEventListener("pointerup", up);
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!selectedId) return;
            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                remove(selectedId);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    /* -------------------------------------------------------------- render */

    return (
        <Shell
            title="Table Chart"
            active="tablechart"
            topBarRight={
                <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                    <IconButton aria-label="Undo" onClick={undo} sx={{ color: past.current.length ? "#fff" : "rgba(255,255,255,0.3)" }}>
                        <UndoIcon />
                    </IconButton>
                    <IconButton aria-label="Redo" onClick={redo} sx={{ color: future.current.length ? "#fff" : "rgba(255,255,255,0.3)" }}>
                        <RedoIcon />
                    </IconButton>
                    <ButtonBase
                        onClick={() => addElement(TABLES[1])}
                        sx={{ px: 2, py: 1, color: "#fff", fontSize: 15, letterSpacing: "0.06em", gap: 0.5 }}
                    >
                        <AddIcon sx={{ fontSize: 20 }} />
                        NEW TABLE
                    </ButtonBase>
                </Stack>
            }
            actionBar={
                <>
                    <ActionButton
                        icon={<ArrowBackIosNewIcon />}
                        tone={paletteOpen ? "default" : "disabled"}
                        onClick={() => setPaletteOpen((o) => !o)}
                    >
                        Tables
                    </ActionButton>
                    <ActionButton icon={<DashboardIcon />} preserveCase onClick={() => setRoomsOpen(true)}>
                        FLOOR PLAN
                    </ActionButton>
                    <ActionButton
                        icon={<CheckIcon />}
                        tone={dirty ? "primary" : "disabled"}
                        preserveCase
                        onClick={() => dirty && saveFloorPlan(room, elements)}
                    >
                        {dirty ? "SAVE •" : "SAVED"}
                    </ActionButton>
                </>
            }
        >
            <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
                {/* Palette. Tap to place — dragging from here onto the canvas is
                    the artifact's gesture, but tap-to-place is the reliable one
                    on a tablet with no hover. */}
                {paletteOpen && (
                    <Stack sx={{ width: 84, flexShrink: 0, bgcolor: "#fff", borderRight: `1px solid ${appColors.divider}`, py: 1.5, gap: 1.5 }}>
                        <Typography sx={{ fontSize: 10, letterSpacing: "0.1em", color: appColors.textSecondary, textAlign: "center" }}>
                            TABLES
                        </Typography>
                        {TABLES.map((item) => (
                            <ButtonBase
                                key={item.key}
                                aria-label={item.label}
                                onClick={() => addElement(item)}
                                sx={{ height: 48, display: "grid", placeItems: "center" }}
                            >
                                <PaletteThumb item={item} />
                            </ButtonBase>
                        ))}
                        <Typography sx={{ fontSize: 10, letterSpacing: "0.1em", color: appColors.textSecondary, textAlign: "center", mt: 1 }}>
                            ITEMS
                        </Typography>
                        {ITEMS.map((item) => (
                            <ButtonBase
                                key={item.key}
                                aria-label={item.label}
                                onClick={() => addElement(item)}
                                sx={{ height: 44, display: "grid", placeItems: "center" }}
                            >
                                <PaletteThumb item={item} />
                            </ButtonBase>
                        ))}
                    </Stack>
                )}

                {/* Canvas. */}
                <Box sx={{ flex: 1, minWidth: 0, position: "relative", overflow: "auto", bgcolor: floorColors.canvas }}>
                    <Box
                        ref={canvasRef}
                        onPointerDown={() => setSelectedId(null)}
                        sx={{
                            position: "relative",
                            width: CANVAS_W,
                            height: CANVAS_H,
                            transform: `scale(${zoom})`,
                            transformOrigin: "top left",
                            backgroundImage: `linear-gradient(${floorColors.grid} 1px, transparent 1px), linear-gradient(90deg, ${floorColors.grid} 1px, transparent 1px)`,
                            backgroundSize: `${GRID}px ${GRID}px`,
                        }}
                    >
                        {elements.map((el) => (
                            <FloorElementView
                                key={el.id}
                                element={el}
                                // Everything is idle-coloured in the editor —
                                // service state belongs to the live view.
                                fill={floorColors.idle}
                                onPointerDown={(e) => startDrag(e, el)}
                            />
                        ))}

                        {selected && (
                            <>
                                <Box
                                    sx={{
                                        position: "absolute",
                                        left: selected.x - 3,
                                        top: selected.y - 3,
                                        width: selected.w + 6,
                                        height: selected.h + 6,
                                        border: `1px solid ${floorColors.idle}`,
                                        pointerEvents: "none",
                                    }}
                                />
                                {HANDLES.map((hd) => (
                                    <Box
                                        key={hd.key}
                                        role="button"
                                        aria-label={`Resize ${hd.key}`}
                                        onPointerDown={(e) => startResize(e, selected, hd.key)}
                                        sx={{
                                            position: "absolute",
                                            left: selected.x + selected.w * hd.x - 5,
                                            top: selected.y + selected.h * hd.y - 5,
                                            width: 10,
                                            height: 10,
                                            bgcolor: floorColors.idle,
                                            cursor: "nwse-resize",
                                            touchAction: "none",
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </Box>

                    {/* Floating room pill, as in the artifact. */}
                    <ButtonBase
                        onClick={() => setRoomsOpen(true)}
                        sx={{
                            position: "absolute",
                            top: 12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            bgcolor: "#fff",
                            boxShadow: 2,
                            borderRadius: 999,
                            px: 2.5,
                            py: 1,
                            gap: 1.5,
                        }}
                    >
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>Floor plan</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{room}</Typography>
                    </ButtonBase>

                    {/* Zoom pill. */}
                    <Stack
                        direction="row"
                        sx={{
                            position: "absolute",
                            right: 16,
                            bottom: 16,
                            alignItems: "center",
                            bgcolor: "#fff",
                            boxShadow: 2,
                            borderRadius: 999,
                            px: 1,
                        }}
                    >
                        <IconButton aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}>
                            <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ fontSize: 14, minWidth: 48, textAlign: "center" }}>{Math.round(zoom * 100)}%</Typography>
                        <IconButton aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}>
                            <AddIcon />
                        </IconButton>
                    </Stack>

                    {/* Inspector for the selected element. */}
                    {selected && (
                        <Stack
                            sx={{
                                position: "absolute",
                                left: 16,
                                bottom: 16,
                                bgcolor: "#fff",
                                boxShadow: 3,
                                borderRadius: 1,
                                p: 2,
                                gap: 1.5,
                                width: 260,
                            }}
                        >
                            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                                <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary }}>
                                    {selected.kind === "table" ? "TABLE" : selected.kind.toUpperCase()}
                                </Typography>
                                <IconButton aria-label="Delete element" onClick={() => remove(selected.id)} size="small">
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Stack>

                            {selected.kind === "table" && (
                                <>
                                    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontSize: 14, width: 56 }}>Name</Typography>
                                        <Box
                                            component="input"
                                            value={selected.num ?? ""}
                                            onChange={(e) => patch(selected.id, { num: e.target.value })}
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                border: 0,
                                                borderBottom: `1px solid ${appColors.divider}`,
                                                fontSize: 15,
                                                fontFamily: "inherit",
                                                outline: "none",
                                                py: 0.5,
                                            }}
                                        />
                                    </Stack>

                                    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontSize: 14, width: 56 }}>Seats</Typography>
                                        <IconButton
                                            aria-label="Fewer seats"
                                            size="small"
                                            onClick={() => patch(selected.id, { seats: clampSeats((selected.seats ?? 4) - 1) })}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        <Typography sx={{ fontSize: 16, minWidth: 24, textAlign: "center" }}>
                                            {clampSeats(selected.seats)}
                                        </Typography>
                                        <IconButton
                                            aria-label="More seats"
                                            size="small"
                                            onClick={() => patch(selected.id, { seats: clampSeats((selected.seats ?? 4) + 1) })}
                                        >
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                        <Typography sx={{ fontSize: 12, color: appColors.textSecondary, ml: "auto" }}>
                                            max {SEAT_RANGE.max}
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" sx={{ gap: 0.75 }}>
                                        {(["square", "circle", "rectangle", "oval", "diamond"] as TableShape[]).map((sh) => (
                                            <ButtonBase
                                                key={sh}
                                                aria-label={sh}
                                                onClick={() => patch(selected.id, { shape: sh, lockAR: sh === "circle" || sh === "diamond" })}
                                                sx={{
                                                    flex: 1,
                                                    py: 0.75,
                                                    fontSize: 11,
                                                    textTransform: "capitalize",
                                                    bgcolor: selected.shape === sh ? floorColors.idle : appColors.canvas,
                                                    color: selected.shape === sh ? "#fff" : appColors.textPrimary,
                                                    borderRadius: 0.5,
                                                }}
                                            >
                                                {sh.slice(0, 4)}
                                            </ButtonBase>
                                        ))}
                                    </Stack>
                                </>
                            )}

                            {selected.kind === "label" && (
                                <Box
                                    component="input"
                                    value={selected.text ?? ""}
                                    onChange={(e) => patch(selected.id, { text: e.target.value })}
                                    sx={{
                                        border: 0,
                                        borderBottom: `1px solid ${appColors.divider}`,
                                        fontSize: 15,
                                        fontFamily: "inherit",
                                        outline: "none",
                                        py: 0.5,
                                    }}
                                />
                            )}

                            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>
                                {selected.w} × {selected.h} at {selected.x}, {selected.y}
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </Stack>

            {/* Room picker. Each room's layout saves on its own. */}
            <Dialog open={roomsOpen} onClose={() => setRoomsOpen(false)} slotProps={{ paper: { sx: { width: 480, borderRadius: 1 } } }}>
                <Typography sx={{ fontSize: 22, px: 3, pt: 3, pb: 2 }}>Floor plans</Typography>
                {floorRoomOrder.map((r) => {
                    const count = (state.floorPlans[r] ?? []).length;
                    return (
                        <ButtonBase
                            key={r}
                            onClick={() => {
                                setFloorRoom(r);
                                setRoomsOpen(false);
                            }}
                            sx={{
                                display: "flex",
                                width: "100%",
                                px: 3,
                                py: 2,
                                gap: 2,
                                justifyContent: "flex-start",
                                bgcolor: r === room ? "#EFF6FF" : "transparent",
                            }}
                        >
                            <DashboardIcon sx={{ color: "#2F6BB5" }} />
                            <Stack sx={{ alignItems: "flex-start" }}>
                                <Typography sx={{ fontSize: 16 }}>{r}</Typography>
                                {count === 0 && (
                                    <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Empty — set it up</Typography>
                                )}
                            </Stack>
                            <Box sx={{ ml: "auto", color: r === room ? "#2F6BB5" : appColors.textSecondary }}>
                                {r === room ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                            </Box>
                        </ButtonBase>
                    );
                })}
                <Stack direction="row" sx={{ justifyContent: "flex-end", p: 2 }}>
                    <ButtonBase onClick={() => navigate("/tables")} sx={{ px: 2, py: 1, fontSize: 14, color: appColors.textSecondary }}>
                        VIEW LIVE FLOOR
                    </ButtonBase>
                </Stack>
            </Dialog>
        </Shell>
    );
};
