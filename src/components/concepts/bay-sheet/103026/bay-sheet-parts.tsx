import { Fragment, type ReactNode } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RepeatIcon from "@mui/icons-material/Repeat";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import {
    DAY_END,
    DAY_START,
    bayById,
    bays,
    fmtDuration,
    fmtTime,
    holdsTime,
    statusLabel,
    usd,
    type BayBlock,
    type Reservation,
} from "./bay-data";

/**
 * **The sheet, and the chip that does the work.**
 *
 * Requirements 1–4 all land on this one screen, and three of them land on a
 * chip roughly 149 px wide:
 *
 * > 2. *"Each reservation shows: the player who booked, duration, party size,
 * >    checked-in status, and paid status."*
 * > 3. *"Each reservation shows an indicator when it has an open tab."*
 * > 4. *"Reservation notes show on the bay sheet."*
 *
 * That is seven things in a column narrow enough to fit eight bays. The answer
 * here is that **only the name and the time are words**; everything else is a
 * glyph or a colour, and the note is a corner fold rather than its text. A
 * chip tall enough to hold more shows more — a two-hour booking has the room,
 * a thirty-minute one does not — so the chip reads its own height and decides.
 */

/** Pixels per minute. The sheet's zoom, and the only scale in the file. */
export const PPM = { compact: 1.1, normal: 1.6, tall: 2.4 } as const;

export type Zoom = keyof typeof PPM;

export const GUTTER = 88;

/* -------------------------------------------------------------- the pills */

/**
 * The status glyphs.
 *
 * Green tick for checked in, a money mark for paid, a receipt for an open tab,
 * a repeat arrow for a series, a note corner for a note. All five can be true
 * at once, so they are a row of small marks rather than a badge.
 */
export const ChipMarks = ({ reservation, size = 15 }: { reservation: Reservation; size?: number }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {reservation.status === "checkedIn" && <CheckCircleIcon sx={{ fontSize: size, color: appColors.greenDark }} />}
        {reservation.paid && (
            <Typography sx={{ fontSize: size - 2, fontWeight: 700, color: appColors.greenDark, lineHeight: 1 }}>$</Typography>
        )}
        {/* Requirement 3 — the one mark the shipping chip has no room for. */}
        {reservation.tabOpen && <ReceiptLongIcon sx={{ fontSize: size, color: "#A9661F" }} />}
        {reservation.repeat !== "none" && <RepeatIcon sx={{ fontSize: size, color: appColors.textSecondary }} />}
        {reservation.note && <StickyNote2Icon sx={{ fontSize: size, color: appColors.textSecondary }} />}
    </Box>
);

/** A standalone pill, for the details modal where there is room for words. */
export const StatusPill = ({ reservation }: { reservation: Reservation }) => {
    const tone =
        reservation.status === "checkedIn"
            ? { bg: "#EAF3EC", fg: appColors.greenDark }
            : reservation.status === "cancelled"
              ? { bg: "#F1F3F5", fg: appColors.textSecondary }
              : reservation.status === "noShow"
                ? { bg: "#FDECEA", fg: appColors.red }
                : { bg: "#ECEFF1", fg: appColors.textPrimary };

    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", px: 1.25, py: 0.5, borderRadius: 999, bgcolor: tone.bg }}>
            <Typography sx={{ fontSize: 14, color: tone.fg }}>{statusLabel[reservation.status]}</Typography>
        </Box>
    );
};

/* --------------------------------------------------------------- the chip */

export const ReservationChip = ({
    reservation,
    ppm,
    onOpen,
}: {
    reservation: Reservation;
    ppm: number;
    onOpen?: (reservation: Reservation) => void;
}) => {
    const height = reservation.duration * ppm;
    const bay = bayById(reservation.bayId);
    const freed = !holdsTime(reservation);

    /*
     * The chip decides what it can afford to say. Below ~56px there is room
     * for one line, so the name wins; above ~96px the note earns its place as
     * text rather than a glyph.
     */
    const roomForDetail = height >= 56;
    const roomForNote = height >= 96 && Boolean(reservation.note);

    return (
        <ButtonBase
            onClick={onOpen ? () => onOpen(reservation) : undefined}
            aria-label={`${reservation.customer.name}, ${fmtTime(reservation.start)}, ${fmtDuration(reservation.duration)}, ${statusLabel[reservation.status]}`}
            sx={{
                position: "absolute",
                top: (reservation.start - DAY_START) * ppm,
                left: 3,
                right: 3,
                height: Math.max(height - 2, 22),
                display: "block",
                textAlign: "left",
                px: 1,
                py: 0.5,
                overflow: "hidden",
                borderRadius: `${appRadius.button}px`,
                borderLeft: "4px solid",
                borderColor: freed ? appColors.divider : bay.color,
                /* A freed slot is drawn as paper, not as a booking: it is time
                   the sheet is offering back (requirement 27). */
                bgcolor: freed ? "#F7F8F9" : appColors.surface,
                boxShadow: freed ? "none" : "0 1px 2px rgba(0,0,0,0.22)",
                opacity: freed ? 0.75 : 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                    noWrap
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 14,
                        fontWeight: 500,
                        color: freed ? appColors.textSecondary : appColors.textPrimary,
                        textDecoration: reservation.status === "cancelled" ? "line-through" : "none",
                    }}
                >
                    {reservation.customer.name}
                </Typography>
                {!freed && <ChipMarks reservation={reservation} />}
            </Box>

            {roomForDetail && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{fmtDuration(reservation.duration)}</Typography>
                    <GroupIcon sx={{ fontSize: 13, color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{reservation.party}</Typography>
                    {freed && (
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>· {statusLabel[reservation.status]}</Typography>
                    )}
                </Box>
            )}

            {roomForNote && (
                <Typography
                    sx={{
                        fontSize: 12,
                        color: appColors.textSecondary,
                        mt: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {reservation.note}
                </Typography>
            )}
        </ButtonBase>
    );
};

/** A block: hatched, unnamed by anyone it belongs to, and never bookable. */
export const BlockChip = ({ block, ppm, onOpen }: { block: BayBlock; ppm: number; onOpen?: (block: BayBlock) => void }) => (
    <ButtonBase
        onClick={onOpen ? () => onOpen(block) : undefined}
        aria-label={`Block: ${block.label}, ${fmtTime(block.start)}`}
        sx={{
            position: "absolute",
            top: (block.start - DAY_START) * ppm,
            left: 3,
            right: 3,
            height: Math.max(block.duration * ppm - 2, 22),
            display: "block",
            textAlign: "left",
            px: 1,
            py: 0.5,
            overflow: "hidden",
            borderRadius: `${appRadius.button}px`,
            border: "1px solid",
            borderColor: appColors.textSecondary,
            backgroundImage: "repeating-linear-gradient(45deg, #E3E6E8 0 6px, #EDEFF1 6px 12px)",
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <BlockIcon sx={{ fontSize: 14, color: appColors.textSecondary }} />
            <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 13, color: appColors.textPrimary }}>
                {block.label}
            </Typography>
            {block.repeat !== "none" && <RepeatIcon sx={{ fontSize: 13, color: appColors.textSecondary }} />}
        </Box>
    </ButtonBase>
);

/* -------------------------------------------------------------- the sheet */

export interface BaySheetProps {
    reservations: Reservation[];
    blocks: BayBlock[];
    zoom?: Zoom;
    /** Requirement 19 — a chip opens its details. */
    onOpenReservation?: (reservation: Reservation) => void;
    onOpenBlock?: (block: BayBlock) => void;
    /** Requirement 5 — "clicking a blank time opens the booking flow". */
    onBookSlot?: (bayId: string, start: number) => void;
    /** Anything the sheet should draw above itself, such as a legend. */
    header?: ReactNode;
}

/** The slot a tap on blank canvas books. Half an hour, like the rules. */
const SLOT = 30;

export const BaySheet = ({ reservations, blocks, zoom = "normal", onOpenReservation, onOpenBlock, onBookSlot, header }: BaySheetProps) => {
    const ppm = PPM[zoom];
    const minutes = DAY_END - DAY_START;
    const height = minutes * ppm;
    const rules = Array.from({ length: minutes / SLOT + 1 }, (_, i) => i * SLOT);
    const slots = Array.from({ length: minutes / SLOT }, (_, i) => DAY_START + i * SLOT);

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            {header}

            {/* Eight columns fit, so the bay names never scroll away. */}
            <Box
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    pl: `${GUTTER}px`,
                    bgcolor: appColors.surface,
                    borderBottom: "1px solid",
                    borderColor: appColors.divider,
                }}
            >
                {bays.map((bay) => (
                    <Box
                        key={bay.id}
                        sx={{ flex: 1, minWidth: 0, py: 1, textAlign: "center", borderLeft: "1px solid", borderColor: appColors.divider }}
                    >
                        <Box sx={{ width: 28, height: 4, borderRadius: 2, bgcolor: bay.color, mx: "auto", mb: 0.5 }} />
                        <Typography noWrap sx={{ fontSize: 14, fontWeight: 500, color: appColors.textPrimary }}>
                            {bay.name}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <Box sx={{ position: "relative", height, pl: `${GUTTER}px` }}>
                    {/* The time axis and its rules, drawn once across every bay. */}
                    {rules.map((offset) => {
                        const mins = DAY_START + offset;
                        const onHour = mins % 60 === 0;

                        return (
                            <Fragment key={offset}>
                                <Typography
                                    sx={{
                                        position: "absolute",
                                        left: 8,
                                        top: offset * ppm - 8,
                                        fontSize: onHour ? 14 : 12,
                                        color: onHour ? appColors.textPrimary : appColors.textSecondary,
                                    }}
                                >
                                    {fmtTime(mins)}
                                </Typography>
                                <Box
                                    sx={{
                                        position: "absolute",
                                        left: GUTTER,
                                        right: 0,
                                        top: offset * ppm,
                                        borderTop: "1px solid",
                                        borderColor: onHour ? "#C7CCD1" : appColors.divider,
                                    }}
                                />
                            </Fragment>
                        );
                    })}

                    <Box sx={{ position: "absolute", inset: 0, left: GUTTER, display: "flex" }}>
                        {bays.map((bay) => (
                            <Box
                                key={bay.id}
                                sx={{ flex: 1, minWidth: 0, position: "relative", borderLeft: "1px solid", borderColor: appColors.divider }}
                            >
                                {/* Blank time is a target, not a gap. */}
                                {onBookSlot &&
                                    slots.map((start) => (
                                        <ButtonBase
                                            key={start}
                                            onClick={() => onBookSlot(bay.id, start)}
                                            aria-label={`Book ${bay.name} at ${fmtTime(start)}`}
                                            sx={{
                                                position: "absolute",
                                                top: (start - DAY_START) * ppm,
                                                left: 0,
                                                right: 0,
                                                height: SLOT * ppm,
                                                "&:hover": { bgcolor: "rgba(92,175,110,0.10)" },
                                            }}
                                        />
                                    ))}

                                {blocks
                                    .filter((block) => block.bayId === bay.id)
                                    .map((block) => (
                                        <BlockChip key={block.id} block={block} ppm={ppm} onOpen={onOpenBlock} />
                                    ))}

                                {reservations
                                    .filter((r) => r.bayId === bay.id)
                                    .map((r) => (
                                        <ReservationChip key={r.id} reservation={r} ppm={ppm} onOpen={onOpenReservation} />
                                    ))}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

/** What the marks on a chip mean, for the one screen that has to teach them. */
export const SheetLegend = () => (
    <Box
        sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            px: 3,
            py: 1,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        {(
            [
                [<CheckCircleIcon key="c" sx={{ fontSize: 15, color: appColors.greenDark }} />, "Checked in"],
                [
                    <Typography key="p" sx={{ fontSize: 13, fontWeight: 700, color: appColors.greenDark, lineHeight: 1 }}>
                        $
                    </Typography>,
                    "Paid",
                ],
                [<ReceiptLongIcon key="t" sx={{ fontSize: 15, color: "#A9661F" }} />, "Open tab"],
                [<RepeatIcon key="r" sx={{ fontSize: 15, color: appColors.textSecondary }} />, "Repeats"],
                [<StickyNote2Icon key="n" sx={{ fontSize: 15, color: appColors.textSecondary }} />, "Has a note"],
            ] as [ReactNode, string][]
        ).map(([icon, label]) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {icon}
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
            </Box>
        ))}
    </Box>
);

export { usd };
