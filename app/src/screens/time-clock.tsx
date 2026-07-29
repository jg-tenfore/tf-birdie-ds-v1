import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { useActions, useStore } from "../store";

/**
 * Time Clock, from `references/072926/13-timeclock/`.
 *
 * Two columns that split action from record. The left holds the two punch
 * buttons, stacked with a lot of air between them so the wrong one is hard to
 * hit by accident. The right holds the punch log, newest on top.
 *
 * Only one button is ever live: CLOCK IN is green while you are out and grey
 * while you are in; CLOCK OUT is the inverse, and its live state is the brighter
 * red the app reserves for ending something. The dead one stays full size rather
 * than disappearing, so the pair never shifts under your thumb.
 */

const PUNCH_WIDTH = 357;
const PUNCH_HEIGHT = 80;

const PunchButton = ({ label, live, color, onClick }: { label: string; live: boolean; color: string; onClick: () => void }) => (
    <ButtonBase
        disabled={!live}
        onClick={onClick}
        sx={{
            width: PUNCH_WIDTH,
            height: PUNCH_HEIGHT,
            borderRadius: `${appRadius.button}px`,
            // The dead state is a flat grey rather than a faded version of the
            // live colour, so "unavailable" never reads as "pressed".
            bgcolor: live ? color : appColors.grey,
            color: "#fff",
            fontSize: 16,
            letterSpacing: "0.09em",
            boxShadow: live ? 2 : 0,
            transition: "background-color 100ms linear",
        }}
    >
        {label}
    </ButtonBase>
);

/** `M/D/YYYY h:MM AM` — the format the log uses, zero-padded month and day. */
const stamp = (d: Date) => {
    const hh = d.getHours() % 12 || 12;
    const mm = String(d.getMinutes()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mo}/${dd}/${d.getFullYear()} ${hh}:${mm} ${d.getHours() < 12 ? "AM" : "PM"}`;
};

export const TimeClockScreen = () => {
    const { state } = useStore();
    const { clockToggle } = useActions();
    const navigate = useNavigate();

    return (
        <Shell
            title="Time Clock"
            active="timeclock"
            showCart={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<BoltIcon />} onClick={() => navigate("/quickorder")}>
                        Quick Order
                    </ActionButton>
                    <ActionButton icon={<StorefrontIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton icon={<CalendarMonthIcon />} onClick={() => navigate("/teesheet")}>
                        Tee Sheet
                    </ActionButton>
                </>
            }
        >
            <Stack direction="row" sx={{ height: "100%", minHeight: 0, bgcolor: appColors.canvas }}>
                {/* Punch pane. The buttons sit high-centre, not top-aligned. */}
                <Stack sx={{ width: "60%", flexShrink: 0, pl: "205px", justifyContent: "center", gap: "101px" }}>
                    <PunchButton
                        label="CLOCK IN"
                        live={!state.clockedIn}
                        color={appColors.green}
                        onClick={() => clockToggle(stamp(new Date()))}
                    />
                    <PunchButton
                        label="CLOCK OUT"
                        live={state.clockedIn}
                        color={appColors.clockOutRed}
                        onClick={() => clockToggle(stamp(new Date()))}
                    />
                </Stack>

                {/* Punch log. White rows on the canvas, flush to the right edge. */}
                <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
                    {state.punches.map((p, i) => (
                        <Stack
                            key={`${p.at}-${p.kind}-${i}`}
                            direction="row"
                            sx={{
                                bgcolor: "#fff",
                                minHeight: 58,
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 3,
                                // A hairline between punches, nothing around the block.
                                borderBottom: i === state.punches.length - 1 ? "none" : `1px solid ${appColors.divider}`,
                            }}
                        >
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{p.at}</Typography>
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{p.kind}</Typography>
                        </Stack>
                    ))}
                </Box>
            </Stack>
        </Shell>
    );
};
