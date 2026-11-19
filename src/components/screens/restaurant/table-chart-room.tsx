import { useLayoutEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { appColors } from "@/theme/app-replica-tokens";
import { type FloorElement, FloorElementView, type TableShape, floorColors, seededFloorPlans } from "./floor-plan";

/**
 * **Table Chart, laid out.** The editor drawn over a real room instead of the
 * two loose tokens the `[Detached Tables]` bucket holds.
 *
 * The replica story keeps the shipping app's flat square tokens, because that is
 * what the app draws. This one renders the room with the floor-plan system the
 * live Tables screen uses — real shapes, chairs, the bar as a barrier, labels —
 * because that is what the editor is *for*, and a screen built to make a room
 * match the floor should look like a room.
 *
 * Every table takes the editor's single idle fill: status is the live view's
 * business, not the layout's. The selected table carries the selection outline
 * and drives the side panel.
 *
 * ## The side panel
 *
 * The tablet has width the editor never used. The panel takes ~320px of it for
 * the three things an editor needs within reach: what this room adds up to, the
 * properties of the table in hand, and every table in the room as a list — the
 * same roster the phone shows, which is the point at which the two screens meet.
 */

const SHAPES: { key: TableShape; label: string }[] = [
    { key: "square", label: "Square" },
    { key: "circle", label: "Round" },
    { key: "rectangle", label: "Rectangle" },
    { key: "oval", label: "Oval" },
];

const shapeLabel = (shape?: TableShape) => SHAPES.find((s) => s.key === shape)?.label ?? "Diamond";

const PanelHeading = ({ children }: { children: string }) => (
    <Typography sx={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: appColors.textSecondary, mb: 1 }}>
        {children}
    </Typography>
);

const PropertyRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", minHeight: 40, gap: 1 }}>
        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
        {children}
    </Stack>
);

const SidePanel = ({ room, tables, selected }: { room: string; tables: FloorElement[]; selected?: FloorElement }) => {
    const seats = tables.reduce((n, t) => n + (t.seats ?? 0), 0);
    return (
        <Stack
            sx={{
                width: 320,
                flexShrink: 0,
                bgcolor: appColors.surface,
                borderLeft: `1px solid ${appColors.divider}`,
                overflow: "hidden",
            }}
        >
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${appColors.divider}` }}>
                <PanelHeading>Room</PanelHeading>
                <Typography sx={{ fontSize: 22, color: appColors.textPrimary }}>{room}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                    {tables.length} tables · {seats} seats
                </Typography>
            </Box>

            {selected && (
                <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${appColors.divider}` }}>
                    <PanelHeading>Selected</PanelHeading>
                    <Typography sx={{ fontSize: 20, color: appColors.textPrimary, mb: 1 }}>Table {selected.num}</Typography>

                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mb: 0.75 }}>Shape</Typography>
                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", mb: 1 }}>
                        {SHAPES.map((s) => {
                            const on = s.key === selected.shape;
                            return (
                                <Box
                                    key={s.key}
                                    sx={{
                                        px: 1.25,
                                        py: 0.5,
                                        borderRadius: 999,
                                        fontSize: 13,
                                        border: `1px solid ${on ? appColors.greenTee : appColors.divider}`,
                                        bgcolor: on ? appColors.greenTee : appColors.surface,
                                        color: on ? "#fff" : appColors.textPrimary,
                                    }}
                                >
                                    {s.label}
                                </Box>
                            );
                        })}
                    </Stack>

                    <PropertyRow label="Seats">
                        <Stack direction="row" sx={{ alignItems: "center", border: `1px solid ${appColors.divider}`, borderRadius: 1 }}>
                            <Box sx={{ width: 36, height: 32, display: "grid", placeItems: "center", color: appColors.textSecondary }}>
                                <RemoveIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Typography sx={{ width: 32, textAlign: "center", fontSize: 15 }}>{selected.seats}</Typography>
                            <Box sx={{ width: 36, height: 32, display: "grid", placeItems: "center", color: appColors.textSecondary }}>
                                <AddIcon sx={{ fontSize: 18 }} />
                            </Box>
                        </Stack>
                    </PropertyRow>
                    <PropertyRow label="Size">
                        <Typography sx={{ fontSize: 14 }}>
                            {selected.w} × {selected.h}
                        </Typography>
                    </PropertyRow>
                    <PropertyRow label="Position">
                        <Typography sx={{ fontSize: 14 }}>
                            x {selected.x} · y {selected.y}
                        </Typography>
                    </PropertyRow>
                </Box>
            )}

            <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
                <PanelHeading>Tables</PanelHeading>
            </Box>
            <Box sx={{ flex: 1, overflow: "hidden" }}>
                {tables.map((t) => {
                    const on = t.id === selected?.id;
                    return (
                        <Stack
                            key={t.id}
                            direction="row"
                            sx={{
                                alignItems: "center",
                                gap: 1.5,
                                px: 2.5,
                                py: 0.75,
                                bgcolor: on ? appColors.canvas : undefined,
                                borderLeft: `3px solid ${on ? appColors.greenTee : "transparent"}`,
                            }}
                        >
                            <Typography sx={{ width: 36, fontSize: 14, fontWeight: 500 }}>{t.num}</Typography>
                            <Typography sx={{ flex: 1, fontSize: 14, color: appColors.textSecondary }}>{shapeLabel(t.shape)}</Typography>
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{t.seats} seats</Typography>
                        </Stack>
                    );
                })}
            </Box>
        </Stack>
    );
};

/**
 * The room scaled into whatever canvas the shell leaves it, centred, on the
 * editor's faint grid — plus the side panel. Measured rather than assumed,
 * because the canvas height depends on the shell's bars.
 */
/**
 * `room` is the stored key the seeds are looked up by; `label` is what the screen
 * shows, so a presentation can read "Main Dining" without renaming the data.
 */
export const TableChartRoom = ({ room = "bigroom", label, selectedId }: { room?: string; label?: string; selectedId?: string }) => {
    const elements = seededFloorPlans[room] ?? [];
    const tables = elements.filter((e) => e.kind === "table" && !e.id.startsWith("stool-"));
    const selected = tables.find((t) => t.id === selectedId);

    const pad = 48;
    const roomW = Math.max(...elements.map((e) => e.x + e.w)) + pad;
    const roomH = Math.max(...elements.map((e) => e.y + e.h)) + pad;

    const ref = useRef<HTMLDivElement>(null);
    const [box, setBox] = useState({ w: 0, h: 0 });
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const scale = box.w && box.h ? Math.min(box.w / roomW, box.h / roomH) : 0;

    return (
        <Stack direction="row" sx={{ width: "100%", height: "100%", minHeight: 560 }}>
            <Box
                ref={ref}
                sx={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    bgcolor: floorColors.canvas,
                    backgroundImage: `linear-gradient(${floorColors.grid} 1px, transparent 1px), linear-gradient(90deg, ${floorColors.grid} 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                }}
            >
                {scale > 0 && (
                    <Box
                        sx={{
                            position: "absolute",
                            left: (box.w - roomW * scale) / 2,
                            top: (box.h - roomH * scale) / 2,
                            width: roomW,
                            height: roomH,
                            transform: `scale(${scale})`,
                            transformOrigin: "0 0",
                        }}
                    >
                        {elements.map((e) => (
                            <FloorElementView
                                key={e.id}
                                element={e}
                                fill={e.kind === "table" ? floorColors.idle : undefined}
                                selected={e.id === selectedId}
                            />
                        ))}
                    </Box>
                )}
            </Box>
            <SidePanel room={label ?? room} tables={tables} selected={selected} />
        </Stack>
    );
};
