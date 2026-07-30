import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlined";
import RedoIcon from "@mui/icons-material/Redo";
import RemoveIcon from "@mui/icons-material/Remove";
import UndoIcon from "@mui/icons-material/Undo";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import {
    FloorElementView,
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

/**
 * Palette glyphs.
 *
 * Purpose-drawn rather than a shrunken `TableGraphic`. The real renderer insets
 * the table body by a chair's width on every side, so at 44px the body all but
 * disappears and the chairs read as loose blobs — the rail looked broken. These
 * are line-art at a fixed 40px: an outlined shape with four seat marks, legible
 * at rail size and still unmistakably a table with seats.
 */
const SEAT = 5;

const seatMarks = (points: [number, number][]) =>
    points.map(([x, y]) => <rect key={`${x}-${y}`} x={x - SEAT / 2} y={y - SEAT / 2} width={SEAT} height={SEAT} rx={1} fill="currentColor" />);

const glyphBox = { width: 44, height: 44, viewBox: "0 0 44 44" } as const;
const glyphStroke = { fill: "none", stroke: "currentColor", strokeWidth: 2 } as const;

const PaletteGlyph = ({ kind }: { kind: string }) => {
    const svg = (children: React.ReactNode) => (
        <Box component="svg" {...glyphBox} sx={{ color: floorColors.idle, display: "block" }}>
            {children}
        </Box>
    );

    switch (kind) {
        case "circle":
            return svg(
                <>
                    <circle cx={22} cy={22} r={10} {...glyphStroke} />
                    {seatMarks([
                        [22, 7],
                        [37, 22],
                        [22, 37],
                        [7, 22],
                    ])}
                </>,
            );
        case "square":
            return svg(
                <>
                    <rect x={12} y={12} width={20} height={20} rx={2} {...glyphStroke} />
                    {seatMarks([
                        [22, 6],
                        [38, 22],
                        [22, 38],
                        [6, 22],
                    ])}
                </>,
            );
        case "rectangle":
            return svg(
                <>
                    <rect x={7} y={15} width={30} height={14} rx={2} {...glyphStroke} />
                    {seatMarks([
                        [15, 9],
                        [29, 9],
                        [15, 35],
                        [29, 35],
                    ])}
                </>,
            );
        case "oval":
            return svg(
                <>
                    <ellipse cx={22} cy={22} rx={14} ry={8} {...glyphStroke} />
                    {seatMarks([
                        [16, 10],
                        [28, 10],
                        [16, 34],
                        [28, 34],
                    ])}
                </>,
            );
        case "diamond":
            return svg(
                <>
                    <rect x={13} y={13} width={18} height={18} rx={2} transform="rotate(45 22 22)" {...glyphStroke} />
                    {seatMarks([
                        [22, 5],
                        [39, 22],
                        [22, 39],
                        [5, 22],
                    ])}
                </>,
            );
        case "barrier":
            return <Box sx={{ width: 32, height: 4, bgcolor: floorColors.idle, borderRadius: "1px" }} />;
        case "box":
            return <Box sx={{ width: 32, height: 18, border: `2px solid ${floorColors.idle}`, borderRadius: "2px" }} />;
        default:
            return (
                <Box sx={{ px: 1, py: 0.25, border: "1px dashed rgba(0,0,0,0.45)", borderRadius: "2px", fontSize: 11 }}>Label</Box>
            );
    }
};

/** Section label with the hairline the rail uses to separate its two groups. */
const PaletteHeading = ({ children }: { children: React.ReactNode }) => (
    <Typography
        sx={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: appColors.textSecondary,
            textAlign: "center",
            pb: 1,
            mb: 0.5,
            mx: 1.5,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        {children}
    </Typography>
);

/** Selection accent. Blue so it never reads as part of the plan itself. */
const SELECT_BLUE = "#1A73E8";
/** Fixed so the toolbar can be centred on the selection before it renders. */
const TOOLBAR_W = 430;
const SELECT_BLUE_SOFT = "#E8F0FE";

const SHAPES: TableShape[] = ["circle", "square", "rectangle", "oval", "diamond"];

/** Small outline of each shape for the toolbar's shape switcher. */
const ShapeIcon = ({ shape }: { shape: TableShape }) => {
    const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2 } as const;
    return (
        <Box component="svg" width={22} height={22} viewBox="0 0 22 22" sx={{ display: "block" }}>
            {shape === "circle" && <circle cx={11} cy={11} r={8} {...stroke} />}
            {shape === "square" && <rect x={3} y={3} width={16} height={16} rx={2} {...stroke} />}
            {shape === "rectangle" && <rect x={2} y={6} width={18} height={10} rx={2} {...stroke} />}
            {shape === "oval" && <ellipse cx={11} cy={11} rx={9} ry={6} {...stroke} />}
            {shape === "diamond" && <rect x={4} y={4} width={14} height={14} rx={2} transform="rotate(45 11 11)" {...stroke} />}
        </Box>
    );
};

const ToolbarButton = ({
    label,
    active,
    danger,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    danger?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}) => (
    <ButtonBase
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 1,
            color: danger ? "#E53935" : active ? SELECT_BLUE : appColors.textPrimary,
            bgcolor: active ? SELECT_BLUE_SOFT : "transparent",
            "&:hover": { bgcolor: active ? SELECT_BLUE_SOFT : appColors.canvas },
        }}
    >
        {children}
    </ButtonBase>
);

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

    /** Duplicate lands offset so the copy is visibly a second object. */
    const duplicate = (el: FloorElement) => {
        const copy: FloorElement = {
            ...el,
            id: `${el.kind}-${Date.now().toString(36)}`,
            x: Math.min(CANVAS_W - el.w, el.x + GRID * 2),
            y: Math.min(CANVAS_H - el.h, el.y + GRID * 2),
            num: el.kind === "table" ? `${el.num ?? ""}·2` : el.num,
        };
        commit((prev) => [...prev, copy]);
        setSelectedId(copy.id);
    };

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
                        onClick={() => {
                            if (!dirty) return;
                            saveFloorPlan(room, elements);
                            // Saving hands off to the live floor — the locked view of
                            // the same plan. Staying in the editor after a save invites
                            // edits nobody meant to make.
                            navigate("/tables");
                        }}
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
                    <Stack
                        sx={{
                            width: 84,
                            flexShrink: 0,
                            bgcolor: "#fff",
                            borderRight: `1px solid ${appColors.divider}`,
                            py: 1.5,
                            overflowY: "auto",
                        }}
                    >
                        <PaletteHeading>TABLES</PaletteHeading>
                        {TABLES.map((item) => (
                            <ButtonBase
                                key={item.key}
                                aria-label={item.label}
                                onClick={() => addElement(item)}
                                // 52px keeps the row above the 48dp touch floor.
                                sx={{ height: 52, display: "grid", placeItems: "center", "&:hover": { bgcolor: appColors.canvas } }}
                            >
                                <PaletteGlyph kind={item.key} />
                            </ButtonBase>
                        ))}

                        <Box sx={{ mt: 1.5 }}>
                            <PaletteHeading>ITEMS</PaletteHeading>
                        </Box>
                        {ITEMS.map((item) => (
                            <ButtonBase
                                key={item.key}
                                aria-label={item.label}
                                onClick={() => addElement(item)}
                                sx={{ height: 52, display: "grid", placeItems: "center", "&:hover": { bgcolor: appColors.canvas } }}
                            >
                                <PaletteGlyph kind={item.key} />
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
                                        border: `1.5px solid ${SELECT_BLUE}`,
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
                                            left: selected.x + selected.w * hd.x - 6,
                                            top: selected.y + selected.h * hd.y - 6,
                                            width: 12,
                                            height: 12,
                                            bgcolor: SELECT_BLUE,
                                            // A white ring so a handle stays visible
                                            // sitting on a dark table body.
                                            boxShadow: "0 0 0 1.5px #fff",
                                            cursor: "nwse-resize",
                                            touchAction: "none",
                                        }}
                                    />
                                ))}

                                {/*
                                 * The toolbar rides above the selection rather than
                                 * living in a corner of the screen. On a tablet the
                                 * hand is already on the table it is editing, so a
                                 * panel at the bottom means looking one place and
                                 * reaching another.
                                 */}
                                <Stack
                                    direction="row"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    sx={{
                                        position: "absolute",
                                        left: Math.max(4, Math.min(CANVAS_W - TOOLBAR_W - 4, selected.x + selected.w / 2 - TOOLBAR_W / 2)),
                                        top: Math.max(4, selected.y - 68),
                                        alignItems: "center",
                                        // Never wrap — a toolbar that reflows onto a
                                        // second line covers the thing it is editing.
                                        flexWrap: "nowrap",
                                        whiteSpace: "nowrap",
                                        gap: 0.25,
                                        px: 1.5,
                                        height: 52,
                                        bgcolor: "#fff",
                                        borderRadius: 1.5,
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                                        zIndex: 30,
                                    }}
                                >
                                    {selected.kind === "table" ? (
                                        <>
                                            <Typography sx={{ fontSize: 15, flexShrink: 0, color: appColors.textSecondary }}>Table</Typography>
                                            <InputBase
                                                value={selected.num ?? ""}
                                                onChange={(e) => patch(selected.id, { num: e.target.value })}
                                                inputProps={{ "aria-label": "Table name" }}
                                                sx={{ width: 54, flexShrink: 0, "& input": { fontSize: 16, fontWeight: 600, p: 0 } }}
                                            />

                                            <PeopleOutlineIcon sx={{ fontSize: 20, flexShrink: 0, color: appColors.textSecondary, ml: 0.5 }} />
                                            <ButtonBase
                                                aria-label="Fewer seats"
                                                onClick={() => patch(selected.id, { seats: clampSeats((selected.seats ?? 4) - 1) })}
                                                sx={{ width: 26, height: 34, flexShrink: 0, fontSize: 18, color: appColors.textSecondary }}
                                            >
                                                −
                                            </ButtonBase>
                                            <Typography sx={{ fontSize: 16, minWidth: 20, flexShrink: 0, textAlign: "center" }}>
                                                {clampSeats(selected.seats)}
                                            </Typography>
                                            <ButtonBase
                                                aria-label="More seats"
                                                onClick={() => patch(selected.id, { seats: clampSeats((selected.seats ?? 4) + 1) })}
                                                sx={{ width: 26, height: 34, flexShrink: 0, fontSize: 18, color: appColors.textSecondary }}
                                            >
                                                +
                                            </ButtonBase>

                                            <Box sx={{ width: "1px", height: 26, flexShrink: 0, bgcolor: appColors.divider, mx: 0.75 }} />

                                            {SHAPES.map((sh) => (
                                                <ToolbarButton
                                                    key={sh}
                                                    label={sh}
                                                    active={selected.shape === sh}
                                                    onClick={() =>
                                                        patch(selected.id, {
                                                            shape: sh,
                                                            lockAR: sh === "circle" || sh === "diamond" ? true : selected.lockAR,
                                                        })
                                                    }
                                                >
                                                    <ShapeIcon shape={sh} />
                                                </ToolbarButton>
                                            ))}

                                            <Box sx={{ width: "1px", height: 26, flexShrink: 0, bgcolor: appColors.divider, mx: 0.75 }} />
                                        </>
                                    ) : (
                                        <>
                                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, textTransform: "capitalize" }}>
                                                {selected.kind}
                                            </Typography>
                                            {selected.kind === "label" && (
                                                <InputBase
                                                    value={selected.text ?? ""}
                                                    onChange={(e) => patch(selected.id, { text: e.target.value })}
                                                    inputProps={{ "aria-label": "Label text" }}
                                                    sx={{ width: 130, flexShrink: 0, "& input": { fontSize: 16, p: 0 } }}
                                                />
                                            )}
                                            <Box sx={{ width: "1px", height: 26, flexShrink: 0, bgcolor: appColors.divider, mx: 0.75 }} />
                                        </>
                                    )}

                                    {/* Locked means resizing keeps the proportions —
                                        a round table that stops being round stops
                                        reading as a table. */}
                                    <ToolbarButton
                                        label="Lock proportions"
                                        active={Boolean(selected.lockAR)}
                                        onClick={() => patch(selected.id, { lockAR: !selected.lockAR })}
                                    >
                                        {selected.lockAR ? <LockIcon sx={{ fontSize: 20 }} /> : <LockOpenIcon sx={{ fontSize: 20 }} />}
                                    </ToolbarButton>

                                    <ToolbarButton label="Duplicate" onClick={() => duplicate(selected)}>
                                        <ContentCopyIcon sx={{ fontSize: 19 }} />
                                    </ToolbarButton>

                                    <ToolbarButton label="Delete" danger onClick={() => remove(selected.id)}>
                                        <DeleteOutlineIcon sx={{ fontSize: 21 }} />
                                    </ToolbarButton>
                                </Stack>
                            </>
                        )}
                    </Box>

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

                </Box>
            </Stack>

            {/*
             * Room picker, from references/072926/7-tables/. A dark full-height
             * sheet centred over the canvas, not a Material dialog — eleven rooms
             * at 60px a row do not fit any other way, and only three of them have
             * a layout, so scrolling past the empty ones is the real experience.
             */}
            {roomsOpen && (
                <ClickAwayListener onClickAway={() => setRoomsOpen(false)}>
                    <Box
                        role="menu"
                        sx={{
                            position: "fixed",
                            left: "50%",
                            transform: "translateX(-50%)",
                            top: 120,
                            bottom: 96,
                            width: 366,
                            zIndex: 1300,
                            bgcolor: appColors.sheetFill,
                            boxShadow: 10,
                            overflowY: "auto",
                            py: 1,
                        }}
                    >
                        {floorRoomOrder.map((r) => {
                            const count = (state.floorPlans[r] ?? []).length;
                            return (
                                <ButtonBase
                                    key={r}
                                    role="menuitem"
                                    aria-current={r === room || undefined}
                                    onClick={() => {
                                        setFloorRoom(r);
                                        setRoomsOpen(false);
                                    }}
                                    sx={{
                                        display: "block",
                                        width: "100%",
                                        py: 2.5,
                                        px: 2,
                                        fontSize: 15,
                                        textAlign: "center",
                                        color: "#fff",
                                        // The current room is the only one weighted —
                                        // the sheet has no checkmarks or radios.
                                        fontWeight: r === room ? 600 : 400,
                                        opacity: count === 0 ? 0.6 : 1,
                                    }}
                                >
                                    {r}
                                </ButtonBase>
                            );
                        })}
                    </Box>
                </ClickAwayListener>
            )}
        </Shell>
    );
};
