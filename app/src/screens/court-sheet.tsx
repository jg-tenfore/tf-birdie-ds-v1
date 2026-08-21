import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReplayIcon from "@mui/icons-material/Replay";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { TODAY, useActions, useStore } from "../store";

/**
 * Court Sheet, from `references/072926/3-coursheet/`.
 *
 * A resource grid rather than a time grid: one column per bookable facility,
 * each an independent stack of 20-minute slots. Three things differ from the
 * tee sheet and are worth preserving —
 *
 *  - the app bar carries no account cluster and no overflow, just the title;
 *  - the date band has no facility selector, so the date takes the wide slot;
 *  - the bottom bar ends in a **pager** (‹ 1 ›) rather than view toggles,
 *    because courts page horizontally when there are more than six.
 */

const COURTS = ["Tennis Court 1", "Pickleball Court 1", "Basketball", "Tennis 2", "Basket Ball 2", "Swimming Pool #1"];

/** 20-minute intervals from 6:00 AM — the interval the reference device uses. */
const SLOTS = Array.from({ length: 12 }, (_, i) => {
    const minutes = 6 * 60 + i * 20;
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const h = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
});

const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const DOW = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const longDate = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
};

/**
 * The date band.
 *
 * Same rule as the tee sheet: orange means the sheet is showing a day other than
 * today. It is a warning that you are not looking at the live sheet, and it has
 * to mean the same thing on every sheet or it means nothing on any of them.
 */
const DateBar = () => {
    const { state } = useStore();
    const { setCourtDate, shiftCourtDate } = useActions();
    const isToday = state.courtDate === TODAY;

    return (
        <Stack direction="row" sx={{ gap: "6px", p: "6px", bgcolor: appColors.canvas }}>
            <ButtonBase
                aria-label="Previous day"
                onClick={() => shiftCourtDate(-1)}
                sx={{ bgcolor: appColors.green, width: 190, color: "#fff", fontSize: 26, lineHeight: 1, py: 1.75 }}
            >
                ‹
            </ButtonBase>
            <Box
                sx={{
                    flex: 3,
                    bgcolor: isToday ? appColors.slate : appColors.orange,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    letterSpacing: "0.08em",
                }}
            >
                {longDate(state.courtDate)}
            </Box>
            <ButtonBase
                disabled={isToday}
                onClick={() => setCourtDate(TODAY)}
                sx={{
                    flex: 2,
                    bgcolor: isToday ? appColors.grey : appColors.slate,
                    color: "#fff",
                    fontSize: 14,
                    letterSpacing: "0.08em",
                }}
            >
                GO TO TODAY
            </ButtonBase>
            <ButtonBase
                aria-label="Next day"
                onClick={() => shiftCourtDate(1)}
                sx={{ bgcolor: appColors.green, width: 190, color: "#fff", fontSize: 26, lineHeight: 1 }}
            >
                ›
            </ButtonBase>
        </Stack>
    );
};

export const CourtSheetScreen = () => {
    const navigate = useNavigate();
    const { state } = useStore();

    return (
        <Shell
            title="Court Sheet"
            active="courtsheet"
            // The reference app bar is bare here — title only.
            topBarRight={null}
            subBar={<DateBar />}
            actionBar={
                <>
                    <ActionButton icon={<StorefrontIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton icon={<CalendarMonthIcon />} onClick={() => navigate("/teesheet")}>
                        Tee Sheet
                    </ActionButton>
                    <ActionButton icon={<ReplayIcon />}>Refresh</ActionButton>
                    {/* Pager, not view toggles — both arrows are inert on page 1. */}
                    <ActionButton tone="disabled" grow={0.35}>
                        ‹
                    </ActionButton>
                    <ActionButton grow={0.5}>1</ActionButton>
                    <ActionButton tone="disabled" grow={0.35}>
                        ›
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%" }}>
                {/* Column headers sit on the canvas, outside the scrolling stacks. */}
                <Stack direction="row" sx={{ px: "6px" }}>
                    {COURTS.map((court) => (
                        <Typography key={court} sx={{ flex: 1, px: 1.5, py: 1.5, fontSize: 20 }} noWrap>
                            {court}
                        </Typography>
                    ))}
                </Stack>

                <Stack direction="row" sx={{ px: "6px", pb: "6px", gap: "2px" }}>
                    {COURTS.map((court) => (
                        <Stack key={court} sx={{ flex: 1, minWidth: 0, gap: "2px" }}>
                            {SLOTS.map((slot) => (
                                <ButtonBase
                                    key={slot}
                                    aria-label={`${court} ${slot}`}
                                    onClick={() => navigate(`/coursheet/${encodeURIComponent(court)}/${encodeURIComponent(slot)}`)}
                                    sx={{
                                        display: "block",
                                        textAlign: "left",
                                        bgcolor: "#fff",
                                        border: "1px solid",
                                        borderColor: "#E2E5E8",
                                        minHeight: 125,
                                        px: 2,
                                        pt: 1.5,
                                        alignItems: "flex-start",
                                        "&:hover": { borderColor: appColors.green },
                                    }}
                                >
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{slot}</Typography>
                                    {/* The reservation is just the customer's name —
                                        no time, no duration, no party size. */}
                                    {state.resourceBookings[`${state.courtDate}|${court}|${slot}`] && (
                                        <Typography sx={{ fontSize: 21, mt: 1.5 }} noWrap>
                                            {state.resourceBookings[`${state.courtDate}|${court}|${slot}`]}
                                        </Typography>
                                    )}
                                </ButtonBase>
                            ))}
                        </Stack>
                    ))}
                </Stack>
            </Box>
        </Shell>
    );
};
