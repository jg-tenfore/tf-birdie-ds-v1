import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RepeatIcon from "@mui/icons-material/Repeat";
import SearchIcon from "@mui/icons-material/Search";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import {
    DAY_END,
    DAY_START,
    inkOn,
    membershipMark,
    membershipsOnSheet,
    mutedInk,
    bays,
    filterIsOn,
    fmtDuration,
    fmtTime,
    holdsTime,
    sheetMarks,
    statusLabel,
    usd,
    type BayBlock,
    type Reservation,
    type SheetFilter,
    type SheetMark,
} from "./bay-data";
import { FIELD_BORDER, FIELD_RADIUS } from "./bay-form-parts";

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

/**
 * **How much of the chip the customer's status colours.**
 *
 * `ribbon` is the Nov 2 decision — a 4px edge, which Cody picked for having
 * *"less visual noise"* than a tile of solid colour. `card` fills the whole
 * chip instead, and exists because he expects the complaint and asked for the
 * answer to be in the spec rather than in a conversation: *"we will probably
 * get some courses that say, I can barely tell which colour is which because
 * it's this thin little ribbon… I want the full card to be a colour instead
 * of just the edge."*
 *
 * It is written as a course-level preference, not a user toggle: everyone
 * standing at one counter should be reading the same sheet.
 */
export type SheetTint = "ribbon" | "card";

export const GUTTER = 88;

/**
 * **Nov 3 — what replaced the bay's colour.**
 *
 * The column heading used to carry a 28px bar of the bay's colour, and it was
 * the thing that let your eye find a column and track straight down it at
 * fifteen bays wide. The colour had to go — a resource has no colour field,
 * so the sheet was asserting something the backend does not know — but the
 * tracking problem it was solving is real.
 *
 * So every other column gets a wash of this instead: neutral, barely there,
 * and carrying no information at all, which is the point. It cannot be
 * mistaken for a fact about the bay, and it works at any number of columns.
 */
const COLUMN_TINT = "#FAFBFC";

/* -------------------------------------------------------------- the pills */

/**
 * The status glyphs.
 *
 * Green tick for checked in, a money mark for paid, a receipt for an open tab,
 * a repeat arrow for a series, a note corner for a note. All five can be true
 * at once, so they are a row of small marks rather than a badge.
 */
export const ChipMarks = ({
    reservation,
    size = 15,
    ink,
}: {
    reservation: Reservation;
    size?: number;
    /**
     * Set on a filled card, where the marks' own colours would disappear.
     * Nov 3: a colour rather than a flag, because a card filled with the
     * course's own colour can need black marks as easily as white ones.
     */
    ink?: string;
}) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {reservation.status === "checkedIn" && <CheckCircleIcon sx={{ fontSize: size, color: ink ?? appColors.greenDark }} />}
        {reservation.paid && (
            <Typography sx={{ fontSize: size - 2, fontWeight: 700, color: ink ?? appColors.greenDark, lineHeight: 1 }}>$</Typography>
        )}
        {/* Requirement 3 — the one mark the shipping chip has no room for. */}
        {reservation.tabOpen && <ReceiptLongIcon sx={{ fontSize: size, color: ink ?? "#A9661F" }} />}
        {reservation.repeat !== "none" && <RepeatIcon sx={{ fontSize: size, color: ink ? mutedInk(ink) : appColors.textSecondary }} />}
        {reservation.note && <StickyNote2Icon sx={{ fontSize: size, color: ink ? mutedInk(ink) : appColors.textSecondary }} />}
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
    tint = "ribbon",
    onOpen,
}: {
    reservation: Reservation;
    ppm: number;
    /** See `SheetTint`. Defaults to the ribbon, which is the chosen design. */
    tint?: SheetTint;
    onOpen?: (reservation: Reservation) => void;
}) => {
    const height = reservation.duration * ppm;
    const freed = !holdsTime(reservation);
    /*
     * Nov 2: the colour reports who the golfer is, not which bay they are in.
     * Nov 3: it is the colour the course chose for that membership, drawn as
     * chosen — so a pale plan gets a pale edge, which is Weston's yellow and
     * a known consequence rather than a bug. A freed slot has no colour at
     * all, because it is not a booking any more.
     *
     * `solid` is the course-level preference Cody raised, so the two modes
     * differ in exactly one decision — whether the colour is an edge or a
     * fill — and everything below reads `solid` rather than branching again.
     */
    const mark = membershipMark(reservation.customer);
    const solid = tint === "card" && !freed;
    /* The filled card has to carry text on the course's colour; the ribbon
       does not, and so never moves off the normal ink. */
    const ink = solid ? inkOn(mark.color) : undefined;

    /*
     * The chip decides what it can afford to say. Below ~56px there is room
     * for one line, so the name wins; above ~96px the note earns its place as
     * text rather than a glyph.
     */
    const roomForDetail = height >= 56;
    const roomForNote = height >= 96 && Boolean(reservation.note);
    /** Everything under the name is quieter than it, in either mode. */
    const detail = ink ? mutedInk(ink) : appColors.textSecondary;

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
                borderLeft: solid ? "none" : "4px solid",
                borderColor: freed ? appColors.divider : mark.color,
                /* A freed slot is drawn as paper, not as a booking: it is time
                   the sheet is offering back (requirement 27). */
                bgcolor: solid ? mark.color : freed ? "#F7F8F9" : appColors.surface,
                color: ink ?? "inherit",
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
                        color: ink ?? (freed ? appColors.textSecondary : appColors.textPrimary),
                        textDecoration: reservation.status === "cancelled" ? "line-through" : "none",
                    }}
                >
                    {reservation.customer.name}
                </Typography>
                {!freed && <ChipMarks reservation={reservation} ink={ink} />}
            </Box>

            {roomForDetail && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25, color: detail }}>
                    <Typography sx={{ fontSize: 13, color: "inherit" }}>{fmtDuration(reservation.duration)}</Typography>
                    <GroupIcon sx={{ fontSize: 13, color: "inherit" }} />
                    <Typography sx={{ fontSize: 13, color: "inherit" }}>{reservation.party}</Typography>
                    {freed && <Typography sx={{ fontSize: 13, color: "inherit" }}>· {statusLabel[reservation.status]}</Typography>}
                </Box>
            )}

            {roomForNote && (
                <Typography
                    sx={{
                        fontSize: 12,
                        color: detail,
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
    /** The bays to draw, in sheet order. Omitted or empty means every bay. */
    bayIds?: string[];
    /** Requirement 19 — a chip opens its details. */
    onOpenReservation?: (reservation: Reservation) => void;
    onOpenBlock?: (block: BayBlock) => void;
    /** Requirement 5 — "clicking a blank time opens the booking flow". */
    onBookSlot?: (bayId: string, start: number) => void;
    /** Anything the sheet should draw above itself, such as a legend. */
    header?: ReactNode;
    /** See `SheetTint`. A course sets this once; it is not a per-user switch. */
    tint?: SheetTint;
}

/** The slot a tap on blank canvas books. Half an hour, like the rules. */
const SLOT = 30;

/**
 * **The narrowest a bay column gets before the sheet scrolls sideways.**
 *
 * 150px is where a chip still reads: a first name, a duration and the marks.
 * Below it the name starts to ellipse, which is the point at which another
 * column stops being worth having — so instead of shrinking past it, the sheet
 * gets wider than the screen and scrolls. Eight columns and the clock gutter
 * come to 1288, which is why eight is what a 1280 tablet shows.
 */
export const COL = 150;

export const BaySheet = ({
    reservations,
    blocks,
    zoom = "normal",
    bayIds,
    onOpenReservation,
    onOpenBlock,
    onBookSlot,
    header,
    tint = "ribbon",
}: BaySheetProps) => {
    const ppm = PPM[zoom];
    const minutes = DAY_END - DAY_START;
    const height = minutes * ppm;
    const rules = Array.from({ length: minutes / SLOT + 1 }, (_, i) => i * SLOT);
    const slots = Array.from({ length: minutes / SLOT }, (_, i) => DAY_START + i * SLOT);

    const columns = bayIds?.length ? bays.filter((bay) => bayIds.includes(bay.id)) : bays;

    /*
     * One width, used by the header row, the hour rules and the columns, so
     * nothing can drift out of line as the sheet scrolls. `max()` is doing the
     * whole job: with few enough bays it resolves to 100% and the columns
     * share the screen as they always did; with fifteen it resolves to pixels
     * and the sheet overflows its scroller instead of squeezing the chips.
     */
    const width = `max(100%, ${GUTTER + columns.length * COL}px)`;

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            {header}

            {/*
             * One scroller, both axes. The bay names ride `position: sticky`
             * at the top and the clock rides it on the left, which is how they
             * stay put without a second scroll container to keep in step — the
             * version of this that syncs two scrollbars by hand always ends up
             * a frame behind on a tablet.
             */}
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", overscrollBehaviorX: "contain" }}>
                <Box sx={{ width, position: "relative" }}>
                    <Box
                        sx={{
                            position: "sticky",
                            top: 0,
                            zIndex: 3,
                            display: "flex",
                            bgcolor: appColors.surface,
                            borderBottom: "1px solid",
                            borderColor: appColors.divider,
                        }}
                    >
                        {/* The corner: sticky in both directions, so it covers
                            the clock as the names scroll under it. */}
                        <Box sx={{ position: "sticky", left: 0, zIndex: 1, flexShrink: 0, width: GUTTER, bgcolor: appColors.surface }} />

                        {columns.map((bay, index) => (
                            <Box
                                key={bay.id}
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    py: 1,
                                    textAlign: "center",
                                    borderLeft: "1px solid",
                                    borderColor: appColors.divider,
                                    bgcolor: index % 2 === 1 ? COLUMN_TINT : "transparent",
                                }}
                            >
                                {/* Nov 3: the name is the whole identity of a bay. */}
                                <Typography noWrap sx={{ px: 0.5, fontSize: 14, fontWeight: 500, color: appColors.textPrimary }}>
                                    {bay.name}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: "flex", height }}>
                        {/* The clock, pinned left. */}
                        <Box
                            sx={{
                                position: "sticky",
                                left: 0,
                                zIndex: 2,
                                flexShrink: 0,
                                width: GUTTER,
                                bgcolor: appColors.canvas,
                                borderRight: "1px solid",
                                borderColor: appColors.divider,
                            }}
                        >
                            {rules.map((offset) => {
                                const mins = DAY_START + offset;
                                const onHour = mins % 60 === 0;

                                return (
                                    <Typography
                                        key={offset}
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
                                );
                            })}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
                            {/* Beneath the hour rules on purpose: a tint that
                                covered them would trade one kind of tracking
                                for another. */}
                            <Box aria-hidden sx={{ position: "absolute", inset: 0, display: "flex" }}>
                                {columns.map((bay, index) => (
                                    <Box
                                        key={bay.id}
                                        sx={{ flex: 1, minWidth: 0, bgcolor: index % 2 === 1 ? COLUMN_TINT : "transparent" }}
                                    />
                                ))}
                            </Box>

                            {rules.map((offset) => (
                                <Box
                                    key={offset}
                                    sx={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        top: offset * ppm,
                                        borderTop: "1px solid",
                                        borderColor: (DAY_START + offset) % 60 === 0 ? "#C7CCD1" : appColors.divider,
                                    }}
                                />
                            ))}

                            <Box sx={{ position: "absolute", inset: 0, display: "flex" }}>
                                {columns.map((bay) => (
                                    <Box
                                        key={bay.id}
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            position: "relative",
                                            borderLeft: "1px solid",
                                            borderColor: appColors.divider,
                                        }}
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
                                                <ReservationChip
                                                    key={r.id}
                                                    reservation={r}
                                                    ppm={ppm}
                                                    tint={tint}
                                                    onOpen={onOpenReservation}
                                                />
                                            ))}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

/* ------------------------------------------------------------- the filter */

/** A toggle in the filter row. Colour is the only state, so nothing reflows. */
const FilterChip = ({ label, active, hint, onClick }: { label: string; active: boolean; hint?: string; onClick: () => void }) => (
    <ButtonBase
        onClick={onClick}
        aria-pressed={active}
        title={hint}
        sx={{
            flexShrink: 0,
            minHeight: 40,
            px: 1.75,
            borderRadius: 999,
            fontSize: 14,
            whiteSpace: "nowrap",
            bgcolor: active ? appColors.slate : appColors.surface,
            color: active ? "#fff" : appColors.textSecondary,
            border: "1px solid",
            borderColor: active ? appColors.slate : FIELD_BORDER,
            "&:hover": { bgcolor: active ? appColors.slate : "rgba(0,0,0,0.04)" },
        }}
    >
        {label}
    </ButtonBase>
);

/**
 * **The filter row — Nov 1, at Justin's request.**
 *
 * It sits above the legend and carries four things, left to right: a guest
 * search, the four marks as toggles, *Hide cancelled*, and the bay picker.
 * The count on the right is the honest part — a filtered sheet looks exactly
 * like a quiet day, so the row has to say out loud how much of the day it is
 * currently hiding.
 *
 * **The bay picker earns its place more than any of the others.** Fifteen bays
 * do not fit a 1280 tablet, so the sheet scrolls sideways; choosing the six
 * you are running tonight is the one control that makes the scroll go away.
 */
export const SheetFilterBar = ({
    filter,
    onFilter,
    shown,
    total,
    bayCount = bays.length,
}: {
    filter: SheetFilter;
    onFilter: (filter: SheetFilter) => void;
    /** Bookings the filter leaves on the sheet, and how many there are in all. */
    shown: number;
    total: number;
    /** Columns the sheet is actually drawing, which a search can narrow. */
    bayCount?: number;
}) => {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const on = filterIsOn(filter);

    const toggleMark = (mark: SheetMark) =>
        onFilter({
            ...filter,
            marks: filter.marks.includes(mark) ? filter.marks.filter((value) => value !== mark) : [...filter.marks, mark],
        });

    const toggleBay = (bayId: string) =>
        onFilter({
            ...filter,
            bayIds: filter.bayIds.includes(bayId) ? filter.bayIds.filter((value) => value !== bayId) : [...filter.bayIds, bayId],
        });

    const bayLabel = filter.bayIds.length === 0 ? `All ${bays.length} bays` : `${filter.bayIds.length} of ${bays.length} bays`;

    return (
        <Box
            sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                bgcolor: appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
            }}
        >
            {/* The guest search. Name, email or phone, like every other
                customer field in the feature. */}
            <Box
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: 232,
                    minHeight: 40,
                    px: 1.25,
                    bgcolor: appColors.surface,
                    border: "1px solid",
                    borderColor: filter.query ? appColors.green : FIELD_BORDER,
                    borderRadius: `${FIELD_RADIUS}px`,
                }}
            >
                <SearchIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
                <Box
                    component="input"
                    value={filter.query}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onFilter({ ...filter, query: event.target.value })}
                    placeholder="Find a golfer"
                    aria-label="Find a golfer on the sheet"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        p: 0,
                        border: "none",
                        outline: "none",
                        bgcolor: "transparent",
                        fontFamily: "inherit",
                        fontSize: 15,
                        color: appColors.textPrimary,
                        "&::placeholder": { color: appColors.textSecondary },
                    }}
                />
                {filter.query && (
                    <ButtonBase
                        onClick={() => onFilter({ ...filter, query: "" })}
                        aria-label="Clear the search"
                        sx={{ flexShrink: 0, width: 24, height: 24, borderRadius: 999 }}
                    >
                        <CloseIcon sx={{ fontSize: 18, color: appColors.textSecondary }} />
                    </ButtonBase>
                )}
            </Box>

            {/* The marks. Each one narrows, so two of them is a smaller list. */}
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1, overflowX: "auto", py: 0.25 }}>
                {sheetMarks.map((mark) => (
                    <FilterChip
                        key={mark.id}
                        label={mark.label}
                        hint={mark.hint}
                        active={filter.marks.includes(mark.id)}
                        onClick={() => toggleMark(mark.id)}
                    />
                ))}

                <FilterChip
                    label="Hide cancelled"
                    hint="Leave cancellations and no-shows off the sheet"
                    active={filter.liveOnly}
                    onClick={() => onFilter({ ...filter, liveOnly: !filter.liveOnly })}
                />
            </Box>

            <ButtonBase
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-label="Choose which bays to show"
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    minHeight: 40,
                    pl: 1.75,
                    pr: 1,
                    borderRadius: `${FIELD_RADIUS}px`,
                    border: "1px solid",
                    borderColor: filter.bayIds.length ? appColors.green : FIELD_BORDER,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    color: appColors.textPrimary,
                }}
            >
                {bayLabel}
                <ExpandMoreIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
            </ButtonBase>

            <Menu
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                /* Fifteen rows at a touch height is taller than the tablet, so
                   the list scrolls rather than the page. */
                slotProps={{ paper: { sx: { maxHeight: 420, minWidth: 232 } } }}
            >
                <MenuItem
                    onClick={() => {
                        onFilter({ ...filter, bayIds: [] });
                        setAnchor(null);
                    }}
                    sx={{ minHeight: 48, gap: 1.5 }}
                >
                    <Box sx={{ flex: 1, fontSize: 15 }}>All bays</Box>
                    {filter.bayIds.length === 0 && <CheckIcon sx={{ fontSize: 20, color: appColors.greenDark }} />}
                </MenuItem>

                {bays.map((bay) => {
                    const picked = filter.bayIds.includes(bay.id);

                    return (
                        <MenuItem key={bay.id} onClick={() => toggleBay(bay.id)} sx={{ minHeight: 48, gap: 1.5 }}>
                            <Box sx={{ flex: 1, fontSize: 15 }}>{bay.name}</Box>
                            {picked && <CheckIcon sx={{ fontSize: 20, color: appColors.greenDark }} />}
                        </MenuItem>
                    );
                })}
            </Menu>

            {/*
             * How much of the day is hidden. A filtered sheet and a quiet day
             * look identical without this, and the bay count is here rather
             * than on the button because the button says what you *asked*
             * for — this says what you got.
             */}
            <Typography sx={{ flexShrink: 0, fontSize: 14, color: appColors.textSecondary }}>
                {on ? `${shown} of ${total}${bayCount < bays.length ? ` · ${bayCount} bays` : ""}` : `${total} bookings`}
            </Typography>

            {on && (
                <ButtonBase
                    onClick={() => onFilter({ query: "", marks: [], bayIds: [], liveOnly: false })}
                    sx={{
                        flexShrink: 0,
                        minHeight: 40,
                        px: 1.5,
                        borderRadius: `${FIELD_RADIUS}px`,
                        fontSize: 14,
                        letterSpacing: "0.04em",
                        color: appColors.greenDark,
                    }}
                >
                    CLEAR
                </ButtonBase>
            )}
        </Box>
    );
};

/**
 * What a chip means, for the one screen that has to teach it.
 *
 * Nov 2: the colours joined the marks here. They had to — a ribbon that
 * reports a membership is only readable if something on the screen says which
 * membership is which, and the chip itself has no room to.
 *
 * **Nov 3: it names the memberships on this day's sheet, not a fixed set.** A
 * course can create as many plans as it likes, so there is no list to print;
 * printing the course's whole catalogue would wrap the bar to several rows of
 * plans nobody booked. Pass the day's reservations and the legend reports the
 * day. `No membership` appears only when somebody on the sheet is a walk-up.
 */
export const SheetLegend = ({ reservations = [] }: { reservations?: Reservation[] }) => (
    <Box
        sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: 0.5,
            columnGap: 2.5,
            px: 3,
            py: 1,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        {membershipsOnSheet(reservations).map((plan) => (
            <Box key={plan.name} sx={{ display: "flex", alignItems: "center", gap: 0.75 }} title={plan.hint}>
                <Box sx={{ width: 4, height: 15, borderRadius: 1, bgcolor: plan.color }} />
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{plan.name}</Typography>
            </Box>
        ))}

        {reservations.length > 0 && <Box sx={{ width: "1px", height: 15, bgcolor: appColors.divider }} />}

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
