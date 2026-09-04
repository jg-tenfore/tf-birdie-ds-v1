import { useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

import { MobileActionArea, MobileBottomSheet, MobilePrimary } from "@/components/mobile/mobile-shell";
import { MobileEmpty, MobileRow, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { clampSeats, floorRoomOrder, type FloorElement } from "@/components/screens/restaurant/floor-plan";
import { appColors } from "@/theme/app-replica-tokens";
import { useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Table Chart, on a phone — the roster, not the editor.
 *
 * ## The phone does not get the editor, and this is stated rather than faked
 *
 * `mobile-table-chart.tsx` in Storybook makes the argument in full; this screen
 * is that argument built against the live store. In short, the terminal's
 * editor (`app/src/screens/table-chart.tsx`) needs three things at once that a
 * 402×797 canvas cannot give:
 *
 * 1. **Enough canvas to be a room.** It places tokens on 1280×760 with a 20px
 *    grid. 402px of width is 31% of that; a 100px table becomes 31px, below the
 *    48dp touch floor.
 * 2. **A drag that is not also a scroll.** The phone body scrolls vertically.
 *    Drag-to-position inside it is the classic gesture conflict and costs a
 *    long-press before every move.
 * 3. **Two hands and a fixed device.** Laying out twenty tables is a sit-down
 *    task on a counter terminal.
 *
 * So the eight resize handles, the 526px floating toolbar, the shape switcher,
 * the seat-orientation toggle, the 84px palette rail and undo/redo are all
 * **terminal-only**, and the phone keeps the half of the screen that was never
 * spatial: which rooms exist, which tables are in the room you picked, adding
 * one, changing its seat count, deleting it, and SAVE.
 *
 * | Terminal | Phone |
 * | :-- | :-- |
 * | Tokens dragged on a 1280×760 canvas | One row per table in the room |
 * | FLOOR PLAN raising a 366px room panel | A `Room` row raising the same list as a sheet |
 * | NEW TABLE in the app bar | The same text action, opening a two-field screen |
 * | Toolbar `− 4 +` seat stepper | Two rows in the line's own bottom sheet |
 * | SAVE in the bottom bar, orange dot when dirty | The full-width primary, disabled until dirty |
 * | Undo / Redo | Gone — nothing here is a gesture that can go wrong by a pixel |
 *
 * ## One thing the list does better
 *
 * The terminal's token clips its label at both ends — `Detached 27699` renders
 * as `ached 276`, which is why chart tables are normally numbered. A row gives
 * the label its full width. Worth keeping when the editor is revisited.
 *
 * ## Two saves, as on the terminal
 *
 * Creating a table adds it to the working copy; SAVE commits the room. That is
 * confusing on the terminal and no less so here, but it is what the app does
 * and this is a replica.
 */

const GRID = 20;
const CANVAS_W = 1280;
const CANVAS_H = 760;
const snap = (n: number) => Math.round(n / GRID) * GRID;

export const MobileTableChartScreen = () => {
    const { state } = useStore();
    const { setFloorRoom, saveFloorPlan } = useActions();
    const navigate = useNavigate();

    const room = state.floorRoom;
    // Memoised because `?? []` makes a fresh array every render for a room with
    // nothing saved, which would make `dirty` recompute forever.
    const saved = useMemo(() => state.floorPlans[room] ?? [], [state.floorPlans, room]);

    const [elements, setElements] = useState<FloorElement[]>(saved);
    const [roomSheet, setRoomSheet] = useState(false);
    const [kebabFor, setKebabFor] = useState<FloorElement | null>(null);
    const [creating, setCreating] = useState(false);
    const [newNum, setNewNum] = useState("");
    const [newSeats, setNewSeats] = useState("4");

    // Switching rooms loads that room's working copy — each room saves
    // independently, exactly as the terminal's editor does.
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        setElements(state.floorPlans[room] ?? []);
        setKebabFor(null);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [room, state.floorPlans]);

    const dirty = useMemo(() => JSON.stringify(elements) !== JSON.stringify(saved), [elements, saved]);
    const tables = elements.filter((el) => el.kind === "table");

    const patch = (id: string, changes: Partial<FloorElement>) =>
        setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...changes } : el)));

    /**
     * A new table still lands at a position, it is just not one you chose.
     *
     * The same staircase the terminal's `addElement` uses, so a table created
     * here is somewhere sane when the room is next opened on the counter rather
     * than stacked at 0,0 under the palette.
     */
    const create = () => {
        const n = tables.length + 1;
        const el: FloorElement = {
            id: `square-${Date.now().toString(36)}`,
            kind: "table",
            shape: "square",
            x: Math.min(CANVAS_W - 100, snap(120 + ((n * 40) % 400))),
            y: Math.min(CANVAS_H - 100, snap(160 + ((n * 30) % 300))),
            w: 100,
            h: 100,
            seats: clampSeats(Number(newSeats)),
            status: "empty",
            num: newNum.trim() || String(n),
        };
        setElements((prev) => [...prev, el]);
        setCreating(false);
        setNewNum("");
        setNewSeats("4");
    };

    /* ------------------------------------------------------ create screen */

    if (creating) {
        return (
            <MobileShell
                title="Create Table"
                subtitle={room}
                active="tablechart"
                leading="close"
                onLeading={() => setCreating(false)}
                showOverflow={false}
                actions={
                    <MobileActionArea>
                        <MobilePrimary tone="default" onClick={create}>
                            Save
                        </MobilePrimary>
                    </MobileActionArea>
                }
            >
                {/* The terminal draws this as a 550px dialog. A dialog that wide
                    does not fit in 402px, so the category's rule turns it into a
                    screen and the dialog's SAVE into the full-width primary. The
                    underlined MD2 fields are the shipping app's own. */}
                <Stack sx={{ px: 2, pt: 2, gap: 3 }}>
                    {[
                        { label: "Enter table number…", value: newNum, set: setNewNum },
                        { label: "How many guests can sit here?", value: newSeats, set: setNewSeats },
                    ].map((f) => (
                        <Box key={f.label} sx={{ borderBottom: "1px solid", borderColor: appColors.textSecondary, pb: 1 }}>
                            <Box
                                component="input"
                                value={f.value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => f.set(e.target.value)}
                                placeholder={f.label}
                                aria-label={f.label}
                                sx={{
                                    width: "100%",
                                    minHeight: 44,
                                    border: "none",
                                    outline: "none",
                                    bgcolor: "transparent",
                                    fontFamily: "inherit",
                                    fontSize: 16,
                                    color: appColors.textPrimary,
                                }}
                            />
                        </Box>
                    ))}
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                        The table lands in the room unsaved. Save the chart to commit it — the same two-step the terminal has.
                    </Typography>
                </Stack>
            </MobileShell>
        );
    }

    /* ------------------------------------------------------------- screen */

    return (
        <MobileShell
            title="Table Chart"
            subtitle={room}
            active="tablechart"
            leading="back"
            showOverflow={false}
            action="New Table"
            onAction={() => setCreating(true)}
            actions={
                <MobileActionArea>
                    <MobilePrimary
                        disabled={!dirty}
                        onClick={() => {
                            if (!dirty) return;
                            saveFloorPlan(room, elements);
                            // Saving hands off to the live floor, as the terminal
                            // does — staying in the editor invites edits nobody
                            // meant to make.
                            navigate("/tables");
                        }}
                    >
                        {dirty ? "Save •" : "Saved"}
                    </MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                roomSheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setRoomSheet(false)}
                        items={floorRoomOrder.map((r) => ({
                            label: `${r}${(state.floorPlans[r] ?? []).length === 0 ? " — empty" : ""}`,
                            onClick: () => {
                                setFloorRoom(r);
                                setRoomSheet(false);
                            },
                        }))}
                    />
                ) : kebabFor ? (
                    <MobileBottomSheet
                        onDismiss={() => setKebabFor(null)}
                        items={[
                            {
                                label: "Add a seat",
                                icon: <AddIcon sx={{ fontSize: 20 }} />,
                                onClick: () => {
                                    patch(kebabFor.id, { seats: clampSeats((kebabFor.seats ?? 4) + 1) });
                                    setKebabFor(null);
                                },
                            },
                            {
                                label: "Remove a seat",
                                icon: <RemoveIcon sx={{ fontSize: 20 }} />,
                                onClick: () => {
                                    patch(kebabFor.id, { seats: clampSeats((kebabFor.seats ?? 4) - 1) });
                                    setKebabFor(null);
                                },
                            },
                            {
                                label: "Delete table",
                                icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,
                                destructive: true,
                                onClick: () => {
                                    setElements((prev) => prev.filter((el) => el.id !== kebabFor.id));
                                    setKebabFor(null);
                                },
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            <MobileRow title="Room" trailing={room} drills onClick={() => setRoomSheet(true)} />

            <MobileSectionHeading>
                {tables.length === 0 ? "Tables" : `${tables.length} ${tables.length === 1 ? "table" : "tables"}`}
            </MobileSectionHeading>

            {tables.length === 0 ? (
                <MobileEmpty message="No active tables. Use New Table to add one." />
            ) : (
                tables.map((el) => (
                    <MobileRow
                        key={el.id}
                        title={`Table ${el.num ?? "—"}`}
                        subtitle={`${clampSeats(el.seats)} ${clampSeats(el.seats) === 1 ? "seat" : "seats"} · ${el.shape ?? "square"}`}
                        overflow
                        onOverflow={() => setKebabFor(el)}
                    />
                ))
            )}

            {/* Said on the screen, as the Storybook version does — an operator
                who came looking for the floor plan should be told where it is. */}
            <Box sx={{ px: 1.5, py: 2 }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                    Positions are set on the terminal. This device lists the tables in a room and can add one; it does not place them.
                </Typography>
            </Box>
        </MobileShell>
    );
};
