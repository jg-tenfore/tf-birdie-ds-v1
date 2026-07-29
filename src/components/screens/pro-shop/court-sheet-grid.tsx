import { Fragment } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Court Sheet booking grid.
 *
 * One column per bookable facility, one white card per 20-minute slot. Each
 * card repeats its own start time — the sheet has no shared time gutter, so a
 * column read on its own is still legible. Reproduced from
 * `references/072926/3-coursheet/`.
 */

export interface CourtSlot {
    /** Slot label, e.g. "6:00 AM". Open slots show nothing else. */
    time: string;
    /** Booking name shown on a taken slot. */
    booking?: string;
    /** Fill for a taken slot; open slots stay white. */
    color?: string;
}

export interface CourtColumn {
    name: string;
    slots: CourtSlot[];
}

/** Facility names as they ship — including the inconsistent "Basket Ball 2". */
export const courtNames = ["Tennis Court 1", "Pickleball Court 1", "Basketball", "Tennis 2", "Basket Ball 2", "Swimming Pool #1"];

/** 20-minute increments from 6:00 AM, the sheet's first slot. */
export const courtTimes = (count: number) => {
    const times: string[] = [];
    for (let i = 0; i < count; i += 1) {
        const minutes = 6 * 60 + i * 20;
        const hour24 = Math.floor(minutes / 60);
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        times.push(`${hour12}:${String(minutes % 60).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`);
    }
    return times;
};

export const buildCourtColumns = (slotCount = 18): CourtColumn[] =>
    courtNames.map((name) => ({ name, slots: courtTimes(slotCount).map((time) => ({ time })) }));

const SlotCell = ({ slot }: { slot: CourtSlot }) => (
    <Box
        sx={{
            minHeight: 75,
            bgcolor: slot.color ?? appColors.surface,
            border: "1px solid",
            borderColor: appColors.divider,
            px: "19px",
            pt: "15px",
        }}
    >
        <Typography sx={{ fontSize: 13, color: slot.color ? "#fff" : appColors.textSecondary }}>{slot.time}</Typography>
        {slot.booking && <Typography sx={{ fontSize: 13, color: "#fff", mt: 0.5 }}>{slot.booking}</Typography>}
    </Box>
);

export const CourtSheetGrid = ({ columns }: { columns: CourtColumn[] }) => {
    const rowCount = columns[0]?.slots.length ?? 0;
    const template = `repeat(${columns.length}, 1fr)`;

    return (
        <Box sx={{ px: "14px", pb: "6px", bgcolor: appColors.canvas, minHeight: "100%" }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: template,
                    columnGap: "4px",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    bgcolor: appColors.canvas,
                    py: "10px",
                }}
            >
                {columns.map((column) => (
                    <Typography key={column.name} sx={{ fontSize: 16, color: appColors.textPrimary, pl: "6px" }} noWrap>
                        {column.name}
                    </Typography>
                ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: template, columnGap: "4px", rowGap: "5px" }}>
                {Array.from({ length: rowCount }, (_, rowIndex) => (
                    <Fragment key={rowIndex}>
                        {columns.map((column) => (
                            <SlotCell key={`${column.name}-${rowIndex}`} slot={column.slots[rowIndex]} />
                        ))}
                    </Fragment>
                ))}
            </Box>
        </Box>
    );
};

export default CourtSheetGrid;
