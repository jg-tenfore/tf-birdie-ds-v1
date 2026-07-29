import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * Time Clock, as it ships.
 *
 * Transcribed from `references/072926/13-timeclock/`. Two large stacked buttons
 * sit low-left on the canvas; only one is ever live, and the dead one goes flat
 * grey rather than being hidden. Today's punches stack from the top of the right
 * half, newest first. Before the first punch of the day that list is absent
 * entirely — there is no empty state.
 */

export type TimeClockState = "clocked-out" | "clocked-in";

/** Flat MD2 block button. Grey is the app's disabled treatment, not a colour choice. */
const ClockButton = ({ label, tone }: { label: string; tone: "green" | "red" | "disabled" }) => {
    const bg = { green: appColors.green, red: "#EE3124", disabled: appColors.grey }[tone];

    return (
        <Box
            sx={{
                width: 300,
                minHeight: 65,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: bg,
                borderRadius: `${appRadius.button}px`,
                boxShadow: tone === "disabled" ? "none" : "0 2px 4px rgba(0,0,0,0.25)",
            }}
        >
            <Typography sx={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.08em", color: "#fff" }}>{label}</Typography>
        </Box>
    );
};

/** CLOCK IN over CLOCK OUT, inset from the left edge with a wide gap between. */
export const TimeClockButtons = ({ state }: { state: TimeClockState }) => (
    <Box sx={{ pl: "173px", pt: "239px" }}>
        <ClockButton label="CLOCK IN" tone={state === "clocked-out" ? "green" : "disabled"} />
        <Box sx={{ height: "79px" }} />
        <ClockButton label="CLOCK OUT" tone={state === "clocked-in" ? "red" : "disabled"} />
    </Box>
);

export interface TimeClockPunch {
    timestamp: string;
    /** "Clock In" or "Clock Out", exactly as the app labels it. */
    type: string;
}

/**
 * Today's punches. Each row is a white band across the right half; the timestamp
 * is right-aligned against the midline with the type sitting just after it.
 */
export const TimeClockLog = ({ punches }: { punches: TimeClockPunch[] }) => (
    <Box sx={{ width: "50%", ml: "auto", pr: 1.25 }}>
        {punches.map((punch) => (
            <Box
                key={`${punch.timestamp}-${punch.type}`}
                sx={{
                    display: "grid",
                    gridTemplateColumns: "53% 47%",
                    alignItems: "center",
                    minHeight: 50,
                    mb: "4px",
                    bgcolor: appColors.surface,
                }}
            >
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, textAlign: "right" }}>
                    {punch.timestamp}
                </Typography>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, pl: 2 }}>{punch.type}</Typography>
            </Box>
        ))}
    </Box>
);

/**
 * The whole canvas: log across the top-right, buttons down the left. The two do
 * not interact — the buttons hold their position whether or not punches exist.
 */
export const TimeClockPanel = ({ state, punches = [] }: { state: TimeClockState; punches?: TimeClockPunch[] }) => (
    <Box sx={{ position: "relative", minHeight: "100%" }}>
        {punches.length > 0 && (
            <Box sx={{ position: "absolute", top: 0, right: 0, left: 0 }}>
                <TimeClockLog punches={punches} />
            </Box>
        )}
        <TimeClockButtons state={state} />
    </Box>
);
