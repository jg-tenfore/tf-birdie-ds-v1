import { Fragment } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Bay Sheet calendar.
 *
 * Unlike the Court Sheet, this one is a true timeline: a single left gutter of
 * half-hour labels, six bay columns, and a heavy rule at every half hour. Bays
 * are named by color, which is how the staff refer to them on the floor.
 * Reproduced from `references/072926/4-baysheet/`.
 */

const GUTTER_WIDTH = 72;
const ROW_HEIGHT = 64;

export interface BayBooking {
    bay: string;
    /** Row index the booking starts on, counting from the first label. */
    startRow: number;
    /** Height in half-hour rows. */
    rows: number;
    name: string;
    detail?: string;
    color?: string;
}

export const bayNames = ["Red Bay", "Orange Bay", "Green Bay", "Blue Bay", "Magenta Bay", "White Bay"];

/** Half-hour labels running from a given start hour. */
export const bayTimes = (count: number, startHour = 10) => {
    const times: string[] = [];
    for (let i = 0; i < count; i += 1) {
        const minutes = startHour * 60 + i * 30;
        const hour24 = Math.floor(minutes / 60);
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        times.push(`${hour12}:${String(minutes % 60).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`);
    }
    return times;
};

export const BaySheetGrid = ({
    bays = bayNames,
    times = bayTimes(8),
    bookings = [],
}: {
    bays?: string[];
    times?: string[];
    bookings?: BayBooking[];
}) => {
    const template = `${GUTTER_WIDTH}px repeat(${bays.length}, 1fr)`;

    return (
        <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: template, position: "sticky", top: 0, zIndex: 2, bgcolor: appColors.canvas }}>
                <Box />
                {bays.map((bay) => (
                    <Typography
                        key={bay}
                        sx={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: appColors.textPrimary,
                            textAlign: "center",
                            py: "8px",
                            borderBottom: "1px solid",
                            borderColor: appColors.textPrimary,
                        }}
                    >
                        {bay}
                    </Typography>
                ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: template, position: "relative" }}>
                {times.map((time, rowIndex) => (
                    <Fragment key={time}>
                        <Box
                            sx={{
                                height: ROW_HEIGHT,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                pl: "8px",
                            }}
                        >
                            <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{time}</Typography>
                        </Box>

                        {bays.map((bay) => (
                            <Box
                                key={`${bay}-${rowIndex}`}
                                sx={{
                                    height: ROW_HEIGHT,
                                    borderLeft: "1px solid",
                                    borderBottom: "1px solid",
                                    borderLeftColor: appColors.divider,
                                    borderBottomColor: appColors.textPrimary,
                                    position: "relative",
                                }}
                            >
                                {bookings
                                    .filter((booking) => booking.bay === bay && booking.startRow === rowIndex)
                                    .map((booking) => (
                                        <Box
                                            key={booking.name}
                                            sx={{
                                                position: "absolute",
                                                inset: "2px 4px auto 4px",
                                                height: booking.rows * ROW_HEIGHT - 6,
                                                bgcolor: booking.color ?? appColors.purple,
                                                color: "#fff",
                                                px: 1.5,
                                                py: 1,
                                                zIndex: 1,
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{booking.name}</Typography>
                                            {booking.detail && <Typography sx={{ fontSize: 13 }}>{booking.detail}</Typography>}
                                        </Box>
                                    ))}
                            </Box>
                        ))}
                    </Fragment>
                ))}
            </Box>
        </Box>
    );
};

export default BaySheetGrid;
