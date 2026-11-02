import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RepeatIcon from "@mui/icons-material/Repeat";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { DAY_END, DAY_START, bayById, bays, fmtTime, holdsTime, statusLabel, usd, type BayBlock, type Reservation } from "./bay-data";
import { COL, type BaySheetProps } from "./bay-sheet-parts";

/**
 * **Option B — the bay sheet drawn the way the shipping tee sheet is.**
 *
 * Nov 2, at Justin's request: *"an alt version of the bay sheet with the look
 * and feel of the tee sheet."* Same data, same dialogs, same filter — a
 * different answer to the question *what is a sheet*.
 *
 * ## What changes
 *
 * **Time stops being a ruler and becomes a list.** Option A draws the day as a
 * calendar: minutes are pixels, a chip's height is its duration, and the eye
 * reads vertically. This draws the day as the tee sheet does — one white card
 * per half hour on a mid-grey canvas, the time in a cell on the left, and the
 * bays across it. The unit of reading is the row, so the question it answers
 * first is *what is happening at 10:30*, where Option A answers *what does
 * today look like*.
 *
 * **Colour moves from the bay to the booking.** On Option A a chip is white
 * with its bay's colour on the edge, because the column is already telling you
 * which bay it is. The tee sheet has no columns to spare, so its slots are
 * saturated fills that carry state: purple booked, green paid, grey blocked.
 * That is copied here, two purples alternating across adjacent bays exactly as
 * the device does it, and the bay's own colour survives only as the swatch in
 * the header.
 *
 * **Duration becomes shape rather than text.** A ninety-minute booking covers
 * three rows, so it does not have to say "1h 30m" — which is what buys the
 * room for the price and the marks on one line. The row a booking *starts* in
 * carries everything; the rows it continues through repeat the name at a lower
 * weight, because a row that showed an empty cell at 10:30 for a bay that is
 * plainly busy would be a lie, and a row that showed only a colour would make
 * staff count upwards to find out who.
 *
 * ## What is worse about it, honestly
 *
 * Fourteen hours is twenty-eight rows, so the day no longer fits on a screen
 * in either direction — Option A gets the whole morning in one look. And a
 * booking read as four stacked cells is weaker than a single tall chip: the
 * 8px gap between cards, which is the tee sheet's signature, cuts every
 * booking into slices. What it buys is a far better *now* view, which is the
 * thing a counter actually stands at.
 *
 * Everything else is deliberately identical to Option A — the filter row, the
 * legend, the peek, every dialog and every guard — so a comparison is about
 * the layout and nothing else.
 */

/** The grain of the sheet, and the slot a tap on blank time books. */
const SLOT = 30;

/** The clock cell. Narrower than the tee sheet's 200px — "10:30 AM" is shorter than a tee time plus its gear. */
const TIME_W = 116;

/** The tee sheet's row is 64px tall. Zoom moves it rather than scaling minutes, since minutes are no longer a distance here. */
const ROW_H = { compact: 48, normal: 64, tall: 84 } as const;

/**
 * The grey the canvas shows between row cards.
 *
 * The device puts the same gap down the sides as well. This does not: a
 * side gutter would scroll the first cell of every row into the strip the
 * pinned clock cannot cover, and a column leaking past the clock is a worse
 * fault than a missing 8px margin.
 */
const GUTTER = 8;

/**
 * Two purples alternating across adjacent bays, and green once it is paid.
 *
 * There is no rule behind which purple a slot gets on the device either — it
 * is assigned by position index, so that is what this does with bay index.
 */
const fillFor = (reservation: Reservation, index: number): string =>
    reservation.paid ? appColors.greenTee : index % 2 === 0 ? appColors.purple : appColors.purpleAlt;

const overlapping = (start: number, duration: number, slot: number) => start < slot + SLOT && slot < start + duration;

const startsIn = (start: number, slot: number) => start >= slot && start < slot + SLOT;

/* --------------------------------------------------------------- the cells */

/**
 * A booking, in one row of the bay it occupies.
 *
 * The footer is the tee sheet's, item for item: the marks on the left, the
 * oversized `$` watermark centred when money is still owed, and the amount
 * bold on the right. The duration is the one thing left out, because the
 * number of rows the fill covers already says it.
 */
const RowBooking = ({
    reservation,
    index,
    isStart,
    onOpen,
}: {
    reservation: Reservation;
    index: number;
    isStart: boolean;
    onOpen?: (reservation: Reservation) => void;
}) => (
    <ButtonBase
        onClick={onOpen ? () => onOpen(reservation) : undefined}
        aria-label={`${reservation.customer.name}, ${fmtTime(reservation.start)}, ${bayById(reservation.bayId).name}`}
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: isStart ? "space-between" : "center",
            width: "100%",
            px: 1,
            py: 0.5,
            bgcolor: fillFor(reservation, index),
            color: "#fff",
            textAlign: "left",
        }}
    >
        <Typography noWrap sx={{ fontSize: 14, opacity: isStart ? 1 : 0.6 }}>
            ({reservation.party}) {reservation.customer.name}
        </Typography>

        {isStart && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, minWidth: 0 }}>
                {reservation.status === "checkedIn" && <CheckCircleIcon sx={{ fontSize: 15 }} />}
                {reservation.tabOpen && <ReceiptLongIcon sx={{ fontSize: 15 }} />}
                {reservation.repeat !== "none" && <RepeatIcon sx={{ fontSize: 15 }} />}
                {reservation.note && <StickyNote2Icon sx={{ fontSize: 15 }} />}

                <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    {!reservation.paid && <AttachMoneyIcon sx={{ fontSize: 22 }} />}
                </Box>

                <Typography sx={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{usd(reservation.fee.amount)}</Typography>
            </Box>
        )}
    </ButtonBase>
);

/** A block. Grey, labelled, and never bookable — the tee sheet's BLOCKED slot with a name on it. */
const RowBlock = ({ block, isStart, onOpen }: { block: BayBlock; isStart: boolean; onOpen?: (block: BayBlock) => void }) => (
    <ButtonBase
        onClick={onOpen ? () => onOpen(block) : undefined}
        aria-label={`${block.label}, ${fmtTime(block.start)}, ${bayById(block.bayId).name}`}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            width: "100%",
            px: 1,
            bgcolor: appColors.blocked,
            color: "rgba(255,255,255,0.95)",
            textAlign: "left",
        }}
    >
        {isStart && <BlockIcon sx={{ fontSize: 15, flexShrink: 0 }} />}
        <Typography noWrap sx={{ fontSize: 13, opacity: isStart ? 1 : 0.6 }}>
            {block.label}
        </Typography>
    </ButtonBase>
);

/**
 * A cancelled or no-show booking, in the row it would have started in.
 *
 * Requirement 27 — it has given its time back, so it gets an outline rather
 * than a fill and the slot underneath stays bookable in every other row. It is
 * drawn at all because the sheet is also a record of what the day did.
 */
const RowGhost = ({ reservation, onOpen }: { reservation: Reservation; onOpen?: (reservation: Reservation) => void }) => (
    <ButtonBase
        onClick={onOpen ? () => onOpen(reservation) : undefined}
        aria-label={`${reservation.customer.name}, ${statusLabel[reservation.status]}, ${fmtTime(reservation.start)}`}
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "center",
            width: "100%",
            px: 1,
            border: "1px dashed",
            borderColor: appColors.greyLight,
            color: appColors.textSecondary,
            textAlign: "left",
        }}
    >
        <Typography noWrap sx={{ fontSize: 13, textDecoration: reservation.status === "cancelled" ? "line-through" : "none" }}>
            ({reservation.party}) {reservation.customer.name}
        </Typography>
        <Typography sx={{ fontSize: 11 }}>{statusLabel[reservation.status]}</Typography>
    </ButtonBase>
);

/* -------------------------------------------------------------- the counts */

/**
 * The strip the tee sheet runs under its date bar, with the bay sheet's own
 * figures in it.
 *
 * The clock on the right is fixed rather than live, exactly as the device's
 * is — a prototype whose time changes between screenshots is harder to talk
 * about, and nothing on the sheet depends on it.
 */
export const BayCounts = ({ reservations, blocks, bayCount }: { reservations: Reservation[]; blocks: BayBlock[]; bayCount: number }) => {
    const live = reservations.filter(holdsTime);

    const figures: [string, number][] = [
        ["Bookings", reservations.length],
        ["Checked in", live.filter((r) => r.status === "checkedIn").length],
        ["Paid", live.filter((r) => r.paid).length],
        ["Open tabs", live.filter((r) => r.tabOpen).length],
        ["No shows", reservations.filter((r) => r.status === "noShow").length],
        ["Blocks", blocks.length],
    ];

    return (
        <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 3, px: 2, py: 0.75, bgcolor: appColors.sheetCanvas }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: appColors.textPrimary }}>
                {bayCount === bays.length ? "All bays" : `${bayCount} bays`}
            </Typography>

            {figures.map(([label, n]) => (
                <Typography key={label} sx={{ fontSize: 15, color: "#3a4046", whiteSpace: "nowrap" }}>
                    {label} <b>{n}</b>
                </Typography>
            ))}

            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: appColors.textPrimary }}>10:14 AM</Typography>
        </Box>
    );
};

/* ---------------------------------------------------------------- the sheet */

export const BayRows = ({
    reservations,
    blocks,
    zoom = "normal",
    bayIds,
    onOpenReservation,
    onOpenBlock,
    onBookSlot,
    header,
}: BaySheetProps) => {
    const columns = bayIds?.length ? bays.filter((bay) => bayIds.includes(bay.id)) : bays;
    const rowH = ROW_H[zoom];
    const slots = Array.from({ length: (DAY_END - DAY_START) / SLOT }, (_, i) => DAY_START + i * SLOT);

    /*
     * Same trick as Option A, and for the same reason: `max()` resolves to
     * 100% while the bays fit and to pixels once they do not, so a narrowed
     * sheet stretches and a full one scrolls. The gutter is inside the number
     * because the cards are inset by it and the columns still have to line up
     * with the header.
     */
    const width = `max(100%, ${TIME_W + columns.length * COL}px)`;

    /* A narrowed sheet draws no blocks for the bays it dropped, so its counts
       must not claim them either. */
    const shownBlocks = blocks.filter((block) => columns.some((bay) => bay.id === block.bayId));

    /** Every cell in a row is the same shape, so the row only has to ask what is in it. */
    const cellFor = (bayId: string, index: number, slot: number) => {
        const block = blocks.find((b) => b.bayId === bayId && overlapping(b.start, b.duration, slot));
        if (block) return <RowBlock block={block} isStart={startsIn(block.start, slot)} onOpen={onOpenBlock} />;

        const live = reservations.find((r) => r.bayId === bayId && holdsTime(r) && overlapping(r.start, r.duration, slot));
        if (live) return <RowBooking reservation={live} index={index} isStart={startsIn(live.start, slot)} onOpen={onOpenReservation} />;

        const ghost = reservations.find((r) => r.bayId === bayId && !holdsTime(r) && startsIn(r.start, slot));
        if (ghost) return <RowGhost reservation={ghost} onOpen={onOpenReservation} />;

        /* Blank time is a target here too (requirement 5). */
        return onBookSlot ? (
            <ButtonBase
                onClick={() => onBookSlot(bayId, slot)}
                aria-label={`Book ${bayById(bayId).name} at ${fmtTime(slot)}`}
                sx={{ width: "100%", "&:hover": { bgcolor: "rgba(92,175,110,0.12)" } }}
            />
        ) : null;
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.sheetCanvas }}>
            {header}

            <BayCounts reservations={reservations} blocks={shownBlocks} bayCount={columns.length} />

            {/* One scroller, both axes — the clock sticks left and the bay names stick top, as in Option A. */}
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", overscrollBehaviorX: "contain" }}>
                <Box sx={{ width, pb: `${GUTTER}px` }}>
                    <Paper
                        elevation={1}
                        sx={{
                            position: "sticky",
                            top: 0,
                            zIndex: 4,
                            display: "flex",
                            mb: `${GUTTER}px`,
                            borderRadius: `${appRadius.card}px`,
                        }}
                    >
                        {/* The corner, sticky both ways, so the names pass under it. */}
                        <Box
                            sx={{
                                position: "sticky",
                                left: 0,
                                zIndex: 1,
                                flexShrink: 0,
                                width: TIME_W,
                                bgcolor: appColors.surface,
                                borderRight: `1px solid ${appColors.divider}`,
                            }}
                        />

                        {columns.map((bay) => (
                            <Box
                                key={bay.id}
                                sx={{
                                    flex: `1 0 ${COL}px`,
                                    minWidth: 0,
                                    py: 1,
                                    textAlign: "center",
                                    borderRight: `1px solid ${appColors.divider}`,
                                }}
                            >
                                <Box sx={{ width: 28, height: 4, borderRadius: 2, bgcolor: bay.color, mx: "auto", mb: 0.5 }} />
                                <Typography noWrap sx={{ px: 0.5, fontSize: 14, fontWeight: 500, color: appColors.textPrimary }}>
                                    {bay.name}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>

                    {slots.map((slot) => {
                        const onHour = slot % 60 === 0;

                        return (
                            <Paper
                                key={slot}
                                elevation={1}
                                sx={{
                                    display: "flex",
                                    minHeight: rowH,
                                    mb: `${GUTTER}px`,
                                    borderRadius: `${appRadius.card}px`,
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 2,
                                        flexShrink: 0,
                                        width: TIME_W,
                                        display: "flex",
                                        alignItems: "center",
                                        pl: 2,
                                        bgcolor: appColors.surface,
                                        borderRight: `1px solid ${appColors.divider}`,
                                    }}
                                >
                                    {/* The hour is the landmark; the half hour is a step between two of them. */}
                                    <Typography
                                        sx={{
                                            fontSize: onHour ? 19 : 15,
                                            color: onHour ? appColors.textPrimary : appColors.textSecondary,
                                        }}
                                    >
                                        {fmtTime(slot)}
                                    </Typography>
                                </Box>

                                {columns.map((bay, index) => (
                                    <Box
                                        key={bay.id}
                                        sx={{
                                            /* Grow into a narrowed sheet, hold COL in a full one —
                                               the row's half of what `max()` does to the width. */
                                            flex: `1 0 ${COL}px`,
                                            minWidth: 0,
                                            display: "flex",
                                            alignItems: "stretch",
                                            borderRight: `1px solid ${appColors.divider}`,
                                        }}
                                    >
                                        {cellFor(bay.id, index, slot)}
                                    </Box>
                                ))}
                            </Paper>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};
