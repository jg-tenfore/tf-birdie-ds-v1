import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import GridViewIcon from "@mui/icons-material/GridView";
import PauseIcon from "@mui/icons-material/Pause";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ViewListIcon from "@mui/icons-material/ViewList";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type SheetView, type TeeTimeBooking } from "../store";
import { SlotSettingsMenu } from "@/components/screens/tee-sheet/tee-sheet-chrome";
import { SheetBody } from "./tee-sheet-views";

/**
 * The tee sheet, reproduced from `references/072926/2-teesheet/`.
 *
 * The layout that matters: each row is one tee time — the time in a white cell
 * on the left, **four playing positions** across the middle, and a gear at the
 * right that operates on the whole time. A position holds a whole party, which
 * is why a slot reads "(4) Oda Brennevin" rather than one name per golfer.
 *
 * Colour carries the state: purple booked, green paid, white open, grey
 * blocked. Two purple shades alternate across a row with no rule behind it, so
 * they are assigned by position index, as the app appears to do.
 */


const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const parseDate = (iso: string) => new Date(`${iso}T12:00:00`);
const longDate = (iso: string) => {
    const d = parseDate(iso);
    return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()].toUpperCase()} ${d.getDate()} ${d.getFullYear()}`;
};

/**
 * The Material date picker the orange date button opens.
 *
 * The left pane is the app's own: a slate block with an "END DATE" eyebrow over
 * "Selected date", and a pencil that would switch to keyboard entry. OK stays
 * disabled until a day is chosen, which is why it renders grey on open.
 */
const DatePickerDialog = ({ value, open, onClose, onPick }: { value: string; open: boolean; onClose: () => void; onPick: (iso: string) => void }) => {
    const [cursor, setCursor] = useState(parseDate(value));
    const [picked, setPicked] = useState<number | null>(null);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const shift = (n: number) => setCursor(new Date(year, month + n, 1));

    return (
        <Dialog open={open} onClose={onClose} slotProps={{ paper: { sx: { borderRadius: 0, maxWidth: "none" } } }}>
            <Stack direction="row">
                <Stack sx={{ width: 268, bgcolor: "#4A5560", color: "#fff", p: 3, justifyContent: "space-between" }}>
                    <Stack>
                        <Typography sx={{ fontSize: 13, letterSpacing: "0.09em" }}>END DATE</Typography>
                        <Typography sx={{ fontSize: 30, mt: 2 }}>{picked ? `${MONTHS[month].slice(0, 3)} ${picked}` : "Selected date"}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 22 }}>✎</Typography>
                </Stack>

                <Stack sx={{ width: 520, p: 2.5 }}>
                    <Stack direction="row" sx={{ alignItems: "center", mb: 1.5 }}>
                        <Typography sx={{ fontSize: 18, letterSpacing: "0.04em", flex: 1 }}>
                            {MONTHS[month].toUpperCase()} {year} ▾
                        </Typography>
                        <ButtonBase onClick={() => shift(-1)} sx={{ px: 2, fontSize: 22 }} aria-label="Previous month">
                            ‹
                        </ButtonBase>
                        <ButtonBase onClick={() => shift(1)} sx={{ px: 2, fontSize: 22 }} aria-label="Next month">
                            ›
                        </ButtonBase>
                    </Stack>

                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 0.5 }}>
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <Typography key={i} sx={{ textAlign: "center", fontSize: 16, py: 1 }}>
                                {d}
                            </Typography>
                        ))}
                        {Array.from({ length: first }).map((_, i) => (
                            <Box key={`pad-${i}`} />
                        ))}
                        {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                            <ButtonBase
                                key={day}
                                onClick={() => setPicked(day)}
                                sx={{
                                    height: 48,
                                    borderRadius: "50%",
                                    fontSize: 20,
                                    bgcolor: picked === day ? appColors.green : "transparent",
                                    color: picked === day ? "#fff" : appColors.textPrimary,
                                }}
                            >
                                {day}
                            </ButtonBase>
                        ))}
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end", mt: 2 }}>
                        <ButtonBase onClick={onClose} sx={{ px: 2, py: 1, fontSize: 16, letterSpacing: "0.06em" }}>
                            CANCEL
                        </ButtonBase>
                        <ButtonBase
                            disabled={picked === null}
                            onClick={() => {
                                if (picked === null) return;
                                onPick(`${year}-${String(month + 1).padStart(2, "0")}-${String(picked).padStart(2, "0")}`);
                                onClose();
                            }}
                            sx={{ px: 2, py: 1, fontSize: 16, letterSpacing: "0.06em", color: picked === null ? appColors.textDisabled : appColors.textPrimary }}
                        >
                            OK
                        </ButtonBase>
                    </Stack>
                </Stack>
            </Stack>
        </Dialog>
    );
};

/**
 * The date navigation band.
 *
 * The date button is **orange only when the sheet is showing a day other than
 * today** — it is a warning that you are not looking at the live sheet, not
 * decoration. On today it is slate and GO TO TODAY greys out.
 */
const SubBar = () => {
    const { state, isToday } = useStore();
    const { shiftSheetDate, setSheetDate, goToToday } = useActions();
    const [facilityOpen, setFacilityOpen] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <Box sx={{ position: "relative" }}>
            <Stack direction="row" sx={{ gap: "6px", p: "6px", bgcolor: appColors.sheetCanvas }}>
                <ButtonBase
                    onClick={() => shiftSheetDate(-1)}
                    aria-label="Previous day"
                    sx={{ bgcolor: appColors.green, width: 116, color: "#fff", fontSize: 26, lineHeight: 1 }}
                >
                    ‹
                </ButtonBase>

                <ButtonBase
                    onClick={() => setFacilityOpen((o) => !o)}
                    sx={{ flex: 1.4, bgcolor: appColors.slate, color: "#fff", py: 1.75, fontSize: 15 }}
                >
                    {state.facility}
                </ButtonBase>

                <ButtonBase
                    onClick={() => setPickerOpen(true)}
                    sx={{
                        flex: 2.4,
                        bgcolor: isToday ? appColors.slate : appColors.orange,
                        color: "#fff",
                        fontSize: 14,
                        letterSpacing: "0.08em",
                    }}
                >
                    {longDate(state.sheetDate)}
                </ButtonBase>

                <ButtonBase
                    onClick={goToToday}
                    disabled={isToday}
                    sx={{
                        flex: 1.6,
                        bgcolor: isToday ? appColors.grey : appColors.slate,
                        color: "#fff",
                        fontSize: 14,
                        letterSpacing: "0.08em",
                    }}
                >
                    GO TO TODAY
                </ButtonBase>

                <ButtonBase
                    onClick={() => shiftSheetDate(1)}
                    aria-label="Next day"
                    sx={{ bgcolor: appColors.green, width: 116, color: "#fff", fontSize: 26, lineHeight: 1 }}
                >
                    ›
                </ButtonBase>
            </Stack>

            {/* Facility list opens downward, left-aligned under its button. */}
            {facilityOpen && (
                <ClickAwayListener onClickAway={() => setFacilityOpen(false)}>
                    <Box sx={{ position: "absolute", top: "100%", left: 128, zIndex: 20, width: 434, bgcolor: appColors.slate, boxShadow: 6 }}>
                        {[state.facility].map((f) => (
                            <ButtonBase
                                key={f}
                                onClick={() => setFacilityOpen(false)}
                                sx={{ display: "block", width: "100%", py: 2.75, fontSize: 15, color: "#fff" }}
                            >
                                {f}
                            </ButtonBase>
                        ))}
                    </Box>
                </ClickAwayListener>
            )}

            {/*
             * Mounted only while open, and keyed by the date it was opened on.
             * The month cursor is seeded from `value` in `useState`, so a
             * long-lived instance would keep showing whatever month the sheet
             * happened to be on when the screen first rendered.
             */}
            {pickerOpen && (
                <DatePickerDialog
                    key={state.sheetDate}
                    value={state.sheetDate}
                    open
                    onClose={() => setPickerOpen(false)}
                    onPick={setSheetDate}
                />
            )}
        </Box>
    );
};

const Counts = ({ times }: { times: TeeTimeBooking[] }) => {
    const all = times.flatMap((t) => t.positions);
    const booked = all.filter(Boolean).length;
    const paid = all.filter((p) => p?.paid).length;

    return (
        <Stack direction="row" spacing={3} sx={{ px: 2, py: 0.75, bgcolor: appColors.sheetCanvas, alignItems: "center" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>Main Course</Typography>
            {[
                ["Total", all.length],
                ["Booked", booked],
                ["Paid", paid],
                ["No Shows", 0],
                ["Available", all.length - booked],
            ].map(([label, n]) => (
                <Typography key={label as string} sx={{ fontSize: 15, color: "#3a4046" }}>
                    {label} <b>{n}</b>
                </Typography>
            ))}
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>10:14 AM</Typography>
        </Stack>
    );
};

/** One of the four playing positions. */
export const TeeSheetScreen = () => {
    const { state, teeTimes, lines, total } = useStore();
    const { setCourse, squeezeTime, cloneTime, clearTime, movePlayers } = useActions();
    const navigate = useNavigate();
    const [view, setView] = useState<SheetView>("list");
    const [courseOpen, setCourseOpen] = useState(false);
    const [menuFor, setMenuFor] = useState<string | null>(null);
    const [moveFrom, setMoveFrom] = useState<string | null>(null);

    /**
     * The gear menu's six commands.
     *
     * Move Player(s) is the only one that needs a second step, so it opens a
     * target list rather than acting immediately — moving a group to an unnamed
     * "next" time is how a foursome ends up on the wrong tee.
     */
    const runSlotAction = (item: string, time: string) => {
        setMenuFor(null);
        switch (item) {
            case "Squeeze Before":
                return squeezeTime(time, "before");
            case "Squeeze After":
                return squeezeTime(time, "after");
            case "Clone Before":
                return cloneTime(time, "before");
            case "Clone After":
                return cloneTime(time, "after");
            case "Clear Time":
                return clearTime(time);
            case "Move Player(s)":
                return setMoveFrom(time);
        }
    };
    const courseMenu = courseOpen ? (
        <ClickAwayListener onClickAway={() => setCourseOpen(false)}>
            {/* Opens upward from the bottom bar, as the device does. */}
            <Box sx={{ position: "fixed", bottom: 78, left: 340, zIndex: 1300, width: 310, bgcolor: appColors.sheetFill, boxShadow: 8, py: 1 }}>
                {["North Course", "East Course", "West Course"].map((c) => (
                    <ButtonBase
                        key={c}
                        onClick={() => {
                            setCourse(c);
                            setCourseOpen(false);
                        }}
                        sx={{ display: "block", width: "100%", py: 2.25, fontSize: 15, color: "#fff" }}
                    >
                        {c}
                    </ButtonBase>
                ))}
            </Box>
        </ClickAwayListener>
    ) : undefined;

    return (
        <Shell
            title="Tee Sheet"
            active="teesheet"
            topActions={["HIDE BACK"]}
            showCart
            subBar={<SubBar />}
            actionBarBg={appColors.sheetCanvas}
            overlay={
                <>
                    {courseMenu}
                    {moveFrom && (
                        <ClickAwayListener onClickAway={() => setMoveFrom(null)}>
                            <Box
                                sx={{
                                    position: "fixed",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    top: 140,
                                    bottom: 100,
                                    width: 420,
                                    zIndex: 1300,
                                    bgcolor: appColors.surface,
                                    boxShadow: 10,
                                    overflowY: "auto",
                                }}
                            >
                                <Typography sx={{ fontSize: 20, px: 2.5, py: 2 }}>Move {moveFrom} to…</Typography>
                                {teeTimes
                                    .filter((t) => t.time !== moveFrom && !t.blocked && t.positions.some((p) => !p))
                                    .map((t) => {
                                        const room = t.positions.filter((p) => !p).length;
                                        return (
                                            <ButtonBase
                                                key={t.time}
                                                onClick={() => {
                                                    movePlayers(moveFrom, t.time);
                                                    setMoveFrom(null);
                                                }}
                                                sx={{
                                                    display: "flex",
                                                    width: "100%",
                                                    justifyContent: "space-between",
                                                    px: 2.5,
                                                    py: 1.75,
                                                    borderTop: `1px solid ${appColors.divider}`,
                                                }}
                                            >
                                                <Typography sx={{ fontSize: 17 }}>{t.time}</Typography>
                                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                                                    {room} open
                                                </Typography>
                                            </ButtonBase>
                                        );
                                    })}
                            </Box>
                        </ClickAwayListener>
                    )}
                </>
            }
            actionBar={
                <>
                    <ActionButton onClick={() => navigate("/proshop")}>Pro Shop</ActionButton>
                    {/* The course picker is dropped in Multi view — it is showing
                        three courses at once, so picking one makes no sense. */}
                    {view !== "multi" && (
                        <ActionButton preserveCase onClick={() => setCourseOpen((o) => !o)}>
                            {state.course}
                        </ActionButton>
                    )}
                    <ActionButton icon={<GridViewIcon />} tone={view === "grid" ? "active" : "default"} onClick={() => setView("grid")}>
                        Grid
                    </ActionButton>
                    <ActionButton icon={<ViewListIcon />} tone={view === "list" ? "active" : "default"} onClick={() => setView("list")}>
                        List
                    </ActionButton>
                    <ActionButton icon={<PauseIcon />} tone={view === "multi" ? "active" : "default"} onClick={() => setView("multi")}>
                        Multi
                    </ActionButton>
                    <ActionButton icon={<SettingsIcon />} tone={view === "back9" ? "active" : "default"} onClick={() => setView("back9")}>
                        Back 9
                    </ActionButton>
                    <ActionButton icon={<RefreshIcon />} grow={0.4} onClick={() => setView(view)}>
                        {""}
                    </ActionButton>
                    <ActionButton
                        icon={<ShoppingCartIcon />}
                        tone={lines.length ? "primary" : "disabled"}
                        grow={1.4}
                        onClick={() => lines.length && navigate("/pay")}
                    >
                        {lines.length ? `Pay ${money(total)}` : "Pay"}
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.sheetCanvas, minHeight: "100%" }}>
                <Counts times={teeTimes} />

                {/*
                 * All four renderings come from the same components the
                 * Storybook stories use; this screen only supplies live data and
                 * the tap target. See app/src/screens/tee-sheet-views.tsx for the
                 * adapters, including why a reservation is purple here and navy
                 * in the other three.
                 */}
                <SheetBody
                    view={view}
                    times={teeTimes}
                    course={state.course}
                    menuFor={menuFor ?? ""}
                    slotMenu={menuFor ? <SlotSettingsMenu onSelect={(item) => runSlotAction(item, menuFor)} /> : undefined}
                    onOpenTime={(time) => navigate(`/teesheet/${encodeURIComponent(time)}`)}
                    onOpenMenu={(time) => setMenuFor((open) => (open === time ? null : time))}
                />
            </Box>
        </Shell>
    );
};
