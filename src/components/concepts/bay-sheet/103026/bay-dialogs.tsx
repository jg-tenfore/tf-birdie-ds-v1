import { useState } from "react";

import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import {
    SERIES_WEEKS,
    bayById,
    bookingsToday,
    conflictFor,
    feeFor,
    fmtDuration,
    fmtTime,
    occurrencesOf,
    punchesNeeded,
    repeatLabels,
    scheduleLabel,
    seriesOf,
    usd,
    type BayBlock,
    type BayCustomer,
    type RepeatFreq,
    type Reservation,
    type ReservationStatus,
} from "./bay-data";
import {
    BayMultiPicker,
    BayPicker,
    ConfirmationToggle,
    ConflictBand,
    ConflictWarning,
    CustomerPicker,
    DangerActions,
    DialogHeader,
    FIELD_BORDER,
    FIELD_RADIUS,
    FeePanel,
    LimitWarning,
    NoteField,
    OccasionRail,
    OrderLine,
    ROW_RULE,
    RemoveGroup,
    RepeatPicker,
    SectionTitle,
    StatusSegments,
    StepperField,
    TextInputField,
    useDirty,
} from "./bay-form-parts";

/**
 * **The three dialogs the PRD asks for**: book one, open one, block one.
 *
 * They are dialogs rather than screens because the bay sheet behind them is
 * the context — requirement 17 says the warning shows *"on the bay sheet"*,
 * and moving a reservation to a different bay (22) is a decision you make
 * looking at the other bays.
 *
 * ## Nov 1 — the rebuild
 *
 * Four things changed, all of them Justin's notes on the Oct 30 draft:
 *
 * 1. **The footer is cancel and save, and nothing else.** It was carrying up
 *    to five keys, four of them red, which made the irreversible actions the
 *    loudest thing on the screen and the footer unreadable at a glance.
 * 2. **The destructive actions moved into the body**, each its own button,
 *    flexed to fill the width, under a heading that says what they do.
 * 3. **Every question is a bordered field with its label inside it** — the
 *    layout from the reference Justin attached. Bay is a dropdown; how long,
 *    party size and repeat each take the full width.
 * 4. **The dialog is much taller** and the note is six rows, because
 *    requirement 4 puts notes on the sheet where everyone reads them all day.
 */

/* ---------------------------------------------------------- dialog chrome */

/**
 * The frame all three share: fixed header, scrolling body, fixed footer.
 *
 * `tall` holds the dialog open to most of the viewport rather than letting it
 * shrink to its content. The booking and details dialogs use it so the body
 * does not jump as fields appear; a block has four questions and is allowed to
 * be the size of four questions.
 */
export const DialogFrame = ({
    open,
    onClose,
    title,
    subtitle,
    width = 820,
    tall = true,
    padX = 3,
    padY = 3,
    closeKey = false,
    footer,
    children,
}: {
    open: boolean;
    onClose?: () => void;
    title: string;
    subtitle?: string;
    width?: number;
    tall?: boolean;
    /** Body padding, in theme units. The reservation dialog runs tighter. */
    padX?: number;
    padY?: number;
    /** Show the header's close key. Off for dialogs whose only way out is the footer. */
    closeKey?: boolean;
    footer: React.ReactNode;
    children: React.ReactNode;
}) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        slotProps={{
            paper: {
                sx: {
                    width,
                    maxWidth: "96vw",
                    height: tall ? "min(92vh, 980px)" : "auto",
                    maxHeight: "96vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: `${FIELD_RADIUS + 2}px`,
                },
            },
        }}
    >
        <DialogHeader title={title} subtitle={subtitle} onClose={closeKey ? onClose : undefined} />

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: padX, py: padY, bgcolor: appColors.canvas }}>{children}</Box>

        <Box
            sx={{
                flexShrink: 0,
                display: "flex",
                gap: 1.5,
                px: 3,
                py: 2,
                bgcolor: appColors.surface,
                borderTop: "1px solid",
                borderColor: appColors.divider,
            }}
        >
            {footer}
        </Box>
    </Dialog>
);

/** The footer's two keys. Nothing else belongs down there. */
export const FooterButton = ({
    children,
    tone = "default",
    disabled,
    onClick,
    grow = 1,
}: {
    children: React.ReactNode;
    tone?: "default" | "primary";
    disabled?: boolean;
    onClick?: () => void;
    grow?: number;
}) => (
    <ButtonBase
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        sx={{
            /* `flex: 0` would zero the basis as well and collapse the label,
               so a non-growing key is sized by its own content instead. */
            flex: grow === 0 ? "0 0 auto" : grow,
            minWidth: 0,
            minHeight: touchTarget.large,
            px: 4,
            borderRadius: `${FIELD_RADIUS}px`,
            fontSize: 17,
            letterSpacing: "0.04em",
            border: tone === "primary" ? "1px solid transparent" : "1px solid",
            borderColor: tone === "primary" ? "transparent" : appColors.divider,
            bgcolor: tone === "primary" ? appColors.green : appColors.surface,
            color: tone === "primary" ? "#fff" : appColors.textPrimary,
            "&:hover": { bgcolor: tone === "primary" ? appColors.greenDark : appColors.canvasAlt },
            "&.Mui-disabled": {
                bgcolor: tone === "primary" ? appColors.greyLight : appColors.surface,
                color: tone === "primary" ? "rgba(255,255,255,0.85)" : appColors.textDisabled,
            },
        }}
    >
        {children}
    </ButtonBase>
);

/**
 * Why the note is six rows and has a heading of its own.
 *
 * Requirement 4 puts notes on the sheet, which makes this the one field in the
 * dialog whose contents the whole shift reads.
 */
const NOTE_HINT = "Notes show on the bay sheet itself (requirement 4), so what goes here is read by everyone all day.";

/** One block of the body: a heading, an optional explanation, the fields. */
/**
 * One question, or a few related ones, under a heading.
 *
 * Nov 2: `aside` and `boxed` arrived when the details dialog was rebuilt on
 * this component. `aside` is the one number a heading is allowed to carry —
 * the order's total — and `boxed` wraps the children in a single bordered
 * card instead of giving each its own box, which is what an itemised list of
 * charges wants. Both came from `Section`, the component this replaced, so
 * nothing the details dialog could say before it can say now.
 */
const Group = ({
    title,
    hint,
    aside,
    boxed = false,
    children,
}: {
    title?: string;
    hint?: string;
    aside?: React.ReactNode;
    boxed?: boolean;
    children: React.ReactNode;
}) => (
    <Box sx={{ mb: 3 }}>
        {title && (
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <SectionTitle hint={hint}>{title}</SectionTitle>
                </Box>
                {aside}
            </Box>
        )}
        <Box
            sx={
                boxed
                    ? {
                          bgcolor: appColors.surface,
                          border: "1px solid",
                          borderColor: FIELD_BORDER,
                          borderRadius: `${FIELD_RADIUS}px`,
                          overflow: "hidden",
                      }
                    : { display: "flex", flexDirection: "column", gap: 2 }
            }
        >
            {children}
        </Box>
    </Box>
);

/**
 * The occasion rail, with its caption.
 *
 * Nov 2: it was on the details dialog and not the booking one, which meant a
 * birthday could only be recorded after the booking existed. Both dialogs now
 * render this, which is most of what *"align edit vs create"* meant.
 */
const OccasionPicker = ({ value, onChange }: { value?: string; onChange: (value: string | undefined) => void }) => (
    <Box>
        <Typography sx={{ fontSize: 12, letterSpacing: "0.08em", fontWeight: 600, color: appColors.textSecondary, mb: 0.75 }}>
            OCCASION — OPTIONAL
        </Typography>
        <OccasionRail value={value} onChange={onChange} />
    </Box>
);

/* ------------------------------------------------------------ 1. booking */

export interface BookingDraft {
    bayId: string;
    start: number;
    duration: number;
    party: number;
    customer?: BayCustomer;
    note: string;
    /** Nov 2 — the booking dialog can mark the occasion too, as edit always could. */
    occasion?: string;
    repeat: RepeatFreq;
    usePunch: boolean;
    skipConfirmation: boolean;
    overrideLimit: boolean;
}

export const emptyDraft = (bayId: string, start: number): BookingDraft => ({
    bayId,
    start,
    duration: 60,
    party: 1,
    note: "",
    repeat: "none",
    usePunch: false,
    skipConfirmation: false,
    overrideLimit: false,
});

/**
 * **Book a bay** — requirements 5 through 18, on one canvas.
 *
 * The order is the order a counter asks it in: who, where and how long, does
 * it repeat, anything to note, what it costs. The fee follows the answers
 * rather than being asked for, and the two guards sit directly under the
 * customer — where they can still be acted on, and where their deliberate
 * difference reads: the overlap refuses, the daily limit offers a switch.
 */
export const BookingDialog = ({
    open = true,
    draft,
    reservations,
    blocks,
    onChange,
    onBook,
    onClose,
}: {
    open?: boolean;
    draft: BookingDraft;
    reservations: Reservation[];
    blocks: BayBlock[];
    onChange: (draft: BookingDraft) => void;
    onBook?: (draft: BookingDraft) => void;
    onClose?: () => void;
}) => {
    const set = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => onChange({ ...draft, [key]: value });

    const conflict = conflictFor(reservations, blocks, draft);
    const alreadyToday = draft.customer ? bookingsToday(reservations, draft.customer.id) : [];
    const atLimit = alreadyToday.length >= 2;
    const fee = feeFor(draft.customer?.status ?? "public", draft.start, draft.duration);

    /* Requirement 10 has no override; requirement 18 does. */
    const blocked = Boolean(conflict) || !draft.customer || (atLimit && !draft.overrideLimit);

    return (
        <DialogFrame
            open={open}
            onClose={onClose}
            title="New reservation"
            subtitle={`${bayById(draft.bayId).name} · ${fmtTime(draft.start)} – ${fmtTime(draft.start + draft.duration)}`}
            footer={
                <>
                    <FooterButton grow={0} onClick={onClose}>
                        CANCEL
                    </FooterButton>
                    <FooterButton tone="primary" grow={1} disabled={blocked} onClick={() => onBook?.(draft)}>
                        {conflict ? "TIME UNAVAILABLE" : !draft.customer ? "PICK A CUSTOMER" : `BOOK · ${usd(fee.amount)}`}
                    </FooterButton>
                </>
            }
        >
            <Group title="Who it is for" hint="The fee, the punch card and the daily limit all follow from this.">
                <CustomerPicker
                    customer={draft.customer}
                    onPick={(customer) => onChange({ ...draft, customer, usePunch: (customer.punchesLeft ?? 0) > 0 })}
                    onClear={() => onChange({ ...draft, customer: undefined, usePunch: false, overrideLimit: false })}
                />

                {conflict && <ConflictWarning conflict={conflict} />}

                {draft.customer && atLimit && (
                    <LimitWarning
                        customer={draft.customer}
                        count={alreadyToday.length}
                        override={draft.overrideLimit}
                        onOverride={(value) => set("overrideLimit", value)}
                    />
                )}
            </Group>

            <Group title="Bay and time" hint="Moving the bay or the duration re-runs the overlap check and the fee.">
                <BayPicker value={draft.bayId} onChange={(bayId) => set("bayId", bayId)} />
                <StepperField
                    label="How long"
                    value={draft.duration}
                    onChange={(value) => set("duration", value)}
                    step={30}
                    min={30}
                    max={300}
                    format={fmtDuration}
                    ariaLabel="minutes"
                />
                <StepperField
                    label="Party size"
                    value={draft.party}
                    onChange={(value) => set("party", value)}
                    min={1}
                    max={12}
                    ariaLabel="players"
                />
            </Group>

            <Group title="Repeat">
                <RepeatPicker
                    value={draft.repeat}
                    onChange={(value) => set("repeat", value)}
                    hint={
                        draft.repeat === "none"
                            ? undefined
                            : /* Weston's open question, surfaced rather than guessed: "do they
                                 need an end date or a number of occurrences?" */
                              `Repeats ${repeatLabels[draft.repeat].toLowerCase()}. How far ahead is still to be decided — see the overview.`
                    }
                />
            </Group>

            <Group title="Notes" hint={NOTE_HINT}>
                <OccasionPicker value={draft.occasion} onChange={(value) => set("occasion", value)} />
                <NoteField value={draft.note} onChange={(value) => set("note", value)} />
            </Group>

            <Group title="Fee" hint="Never typed. It is derived from who it is for, when it starts and how long it runs.">
                <FeePanel
                    fee={fee}
                    duration={draft.duration}
                    customer={draft.customer}
                    usePunch={draft.usePunch}
                    onUsePunch={(value) => set("usePunch", value)}
                />
                <ConfirmationToggle skip={draft.skipConfirmation} onSkip={(value) => set("skipConfirmation", value)} />
            </Group>
        </DialogFrame>
    );
};

/* -------------------------------------------------- 2. reservation details */

/**
 * The guard, for a close with unsaved edits behind it.
 *
 * Three ways out, in the order a tablet thumb should meet them: save and go,
 * go without saving, or stay. *Keep editing* is the safe one and so it is the
 * one the escape key and a backdrop tap land on — dismissing a warning about
 * losing work must never be the thing that loses it.
 */
export const UnsavedPrompt = ({
    open,
    onSave,
    onDiscard,
    onKeepEditing,
}: {
    open: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onKeepEditing: () => void;
}) => (
    <Dialog
        open={open}
        onClose={onKeepEditing}
        maxWidth={false}
        slotProps={{ paper: { sx: { width: 420, maxWidth: "92vw", borderRadius: `${FIELD_RADIUS + 2}px`, p: 3 } } }}
    >
        <Typography sx={{ fontSize: 20, color: appColors.textPrimary, mb: 0.75 }}>Save your changes?</Typography>
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.45, color: appColors.textSecondary, mb: 2.5 }}>
            This booking has edits that have not been saved. Closing now loses them.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <FooterButton tone="primary" onClick={onSave}>
                SAVE CHANGES
            </FooterButton>
            <Box sx={{ display: "flex", gap: 1.25 }}>
                <FooterButton onClick={onKeepEditing}>KEEP EDITING</FooterButton>
                <ButtonBase
                    onClick={onDiscard}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 52,
                        px: 2,
                        borderRadius: `${FIELD_RADIUS}px`,
                        border: "1px solid",
                        borderColor: appColors.red,
                        bgcolor: appColors.surface,
                        color: appColors.red,
                        fontSize: 16,
                        letterSpacing: "0.04em",
                        "&:hover": { bgcolor: "#FDECEA" },
                    }}
                >
                    DISCARD
                </ButtonBase>
            </Box>
        </Box>
    </Dialog>
);

/** A change to the bay, the duration or the customer re-prices the booking. */
const useReservationEdits = (reservation: Reservation, onChange: (reservation: Reservation) => void) => {
    const set = <K extends keyof Reservation>(key: K, value: Reservation[K]) => {
        const next = { ...reservation, [key]: value };

        /* Requirement 23 — the fee and the punch count follow the booking. */
        next.fee = feeFor(next.customer.status, next.start, next.duration);
        if (next.punchesUsed !== undefined) next.punchesUsed = punchesNeeded(next.duration);

        onChange(next);
    };

    const setPunch = (value: boolean) => onChange({ ...reservation, punchesUsed: value ? punchesNeeded(reservation.duration) : undefined });

    return { set, setPunch };
};

/**
 * **The reservation dialog** — what opens when staff tap a booking on the
 * sheet. Picked out of the Nov 1 round as "version D".
 *
 * Everything is one divided list under headings that sit *outside* their
 * card, which is how the body came down from 1,430px to something a tablet
 * can hold. Reading down it: the status as a labelled three-way toggle; the
 * booking itself; the order, with the arithmetic shown and a series total
 * when it repeats; a standalone key to start a tab; the note with its
 * occasion rail; and the removal keys at the foot.
 *
 * Every way out — the header's close key, the footer's CANCEL, escape and a
 * backdrop tap — runs through one guard, so an edit cannot be dropped
 * silently.
 */
export interface ReservationDialogProps {
    open?: boolean;
    reservation: Reservation;
    reservations: Reservation[];
    blocks: BayBlock[];
    onChange: (reservation: Reservation) => void;
    onSave?: () => void;
    /** Booked, checked in or a no-show — the segmented control at the top. */
    onStatus?: (status: ReservationStatus) => void;
    onCancelReservation?: () => void;
    onClearSeries?: () => void;
    onOpenTab?: () => void;
    onClose?: () => void;
}

export const ReservationDialog = ({
    open = true,
    reservation,
    reservations,
    blocks,
    onChange,
    onSave,
    onStatus,
    onCancelReservation,
    onClearSeries,
    onOpenTab,
    onClose,
}: ReservationDialogProps) => {
    const { set, setPunch } = useReservationEdits(reservation, onChange);
    const conflict = conflictFor(reservations, blocks, reservation);
    const series = seriesOf(reservations, reservation.seriesId);
    const repeating = reservation.repeat !== "none";
    const freed = reservation.status === "cancelled" || reservation.status === "noShow";

    const usePunch = reservation.punchesUsed !== undefined;
    const needed = punchesNeeded(reservation.duration);
    const available = reservation.customer.punchesLeft ?? 0;
    const covered = Math.min(needed, available);
    const credit = usePunch ? Number((reservation.fee.amount * (covered / needed)).toFixed(2)) : 0;
    const owed = Number((reservation.fee.amount - credit).toFixed(2));

    /* Requirement 23 reaches the order too: change the cadence and the series
       re-prices, because what staff quote for a standing booking is the run of
       it, not the one visit in front of them. */
    const visits = occurrencesOf(reservation.repeat);
    const visitsCovered = usePunch ? Math.min(visits, Math.floor(available / needed)) : 0;
    const seriesOwed = Number((reservation.fee.amount * (visits - visitsCovered)).toFixed(2));

    /* Every way out of the dialog goes through here, so none of them can drop
       an edit silently: the X, the footer's CANCEL, escape, and the backdrop. */
    const { pristine, dirty } = useDirty(reservation);
    const [confirming, setConfirming] = useState(false);
    const attemptClose = () => (dirty ? setConfirming(true) : onClose?.());

    return (
        <DialogFrame
            open={open}
            onClose={attemptClose}
            closeKey
            /* Nov 2: no width, no padding overrides. It used to run narrower
               and tighter than the booking dialog because it was a list of
               rows; now that it asks its questions in the same boxes, the
               same frame is the rest of the alignment. */
            title={reservation.customer.name}
            /* Nov 2: just bay and time, the same subtitle the booking dialog
               has. The series clause moved into the Repeat group, where it can
               say the cadence as well as the count — and where it stops
               reading as "1 in the series" on a series with one visit on the
               sheet. */
            subtitle={`${bayById(reservation.bayId).name} · ${fmtTime(reservation.start)} – ${fmtTime(
                reservation.start + reservation.duration,
            )}`}
            footer={
                <>
                    <FooterButton grow={0} onClick={attemptClose}>
                        CANCEL
                    </FooterButton>
                    <FooterButton tone="primary" grow={1} disabled={Boolean(conflict)} onClick={onSave}>
                        {conflict ? "TIME UNAVAILABLE" : "SAVE"}
                    </FooterButton>
                </>
            }
        >
            {conflict && <ConflictBand conflict={conflict} />}

            {/* Status is the one question the dialog answers at a glance, so it
                goes first and stays legible without being opened. It is the
                only group the booking dialog has no counterpart for — nothing
                is checked in before it exists. */}
            <Group title="Status" hint="Checking in, no-showing or cancelling takes effect on the sheet as soon as you pick it.">
                <StatusSegments status={reservation.status} onStatus={onStatus} fill />
            </Group>

            {/* Requirement 7: the status decides the fee, so who the booking is
                for is a priced field, not a caption. Nov 2 — this was a row
                that opened a second dialog on top of this one; it is now the
                same inline picker the booking dialog uses, which is one fewer
                layer and one fewer way for the two screens to disagree. */}
            <Group title="Who it is for" hint="The fee, the punch card and the daily limit all follow from this.">
                <CustomerPicker customer={reservation.customer} onPick={(picked) => set("customer", picked)} />
            </Group>

            <Group title="Bay and time" hint="Moving the bay or the duration re-runs the overlap check and the fee.">
                <BayPicker value={reservation.bayId} onChange={(bayId) => set("bayId", bayId)} />
                <StepperField
                    label="How long"
                    value={reservation.duration}
                    onChange={(value) => set("duration", value)}
                    step={30}
                    min={30}
                    max={300}
                    format={fmtDuration}
                    ariaLabel="minutes"
                />
                <StepperField
                    label="Party size"
                    value={reservation.party}
                    onChange={(value) => set("party", value)}
                    min={1}
                    max={12}
                    ariaLabel="players"
                />
            </Group>

            <Group title="Repeat">
                <RepeatPicker
                    value={reservation.repeat}
                    onChange={(value) => set("repeat", value)}
                    hint={
                        repeating
                            ? `${scheduleLabel(reservation.repeat, reservation.start)} · ${visits} visits booked out ${SERIES_WEEKS} weeks${
                                  series.length > 1 ? `, ${series.length} of them on today's sheet` : ""
                              }. Edits here hit this visit; use CLEAR SERIES below for all of them.`
                            : undefined
                    }
                />
            </Group>

            <Group title="Notes" hint={NOTE_HINT}>
                <OccasionPicker value={reservation.occasion} onChange={(value) => set("occasion", value)} />
                <NoteField value={reservation.note ?? ""} onChange={(value) => set("note", value)} />
            </Group>

            <Group
                title="Order"
                hint="Never typed. It is derived from who it is for, when it starts and how long it runs."
                boxed
                aside={
                    <Typography sx={{ flexShrink: 0, fontSize: 18, fontWeight: 600, color: appColors.textPrimary }}>
                        <Box component="span" sx={{ fontSize: 13, fontWeight: 400, color: appColors.textSecondary, mr: 0.75 }}>
                            {reservation.paid ? "Paid" : repeating ? "Due today" : "Due"}
                        </Box>
                        {usd(owed)}
                    </Typography>
                }
            >
                {/* The cadence, spelled out where the money is. A repeat is a
                    schedule and a bill at the same time, and the dropdown
                    three rows up only ever showed the first half of that. */}
                {repeating && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            px: 2,
                            py: 1,
                            bgcolor: appColors.canvasAlt,
                            borderBottom: "1px solid",
                            borderColor: ROW_RULE,
                        }}
                    >
                        <EventRepeatIcon sx={{ fontSize: 18, color: appColors.textSecondary }} />
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                            {scheduleLabel(reservation.repeat, reservation.start)} · {visits} visits booked out {SERIES_WEEKS} weeks
                        </Typography>
                    </Box>
                )}

                <OrderLine
                    name={reservation.fee.name}
                    detail={`${usd(reservation.fee.hourly)}/hr × ${fmtDuration(reservation.duration)} · ${reservation.party} ${
                        reservation.party === 1 ? "player" : "players"
                    }${repeating ? " · per visit" : ""}`}
                    amount={usd(reservation.fee.amount)}
                    last={!reservation.customer.punchCardName && !repeating}
                />

                {reservation.customer.punchCardName && (
                    <OrderLine
                        name={reservation.customer.punchCardName}
                        detail={
                            available === 0
                                ? "No punches left on this card"
                                : repeating
                                  ? `${available} left · covers ${Math.min(visits, Math.floor(available / needed))} of ${visits} visits`
                                  : `${available} left · covers ${covered} of ${needed} ${needed === 1 ? "punch" : "punches"}`
                        }
                        amount={usePunch && credit > 0 ? `−${usd(credit)}` : undefined}
                        credit
                        last={!repeating}
                    >
                        <Switch
                            checked={usePunch && available > 0}
                            disabled={available === 0}
                            onChange={(event) => setPunch(event.target.checked)}
                            slotProps={{ input: { "aria-label": "Apply punch card" } }}
                        />
                    </OrderLine>
                )}

                {/* What the standing booking actually costs, over a horizon the
                    line states rather than assumes. */}
                {repeating && (
                    <OrderLine
                        name="Series total"
                        detail={
                            visitsCovered > 0
                                ? `${visits} visits × ${usd(reservation.fee.amount)}, less ${visitsCovered} on the card`
                                : `${visits} visits × ${usd(reservation.fee.amount)} over ${SERIES_WEEKS} weeks`
                        }
                        amount={usd(seriesOwed)}
                        last
                    />
                )}
            </Group>

            {/* Requirement 30, standing on its own — a second act, not a field. */}
            {!freed &&
                (reservation.tabOpen ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            minHeight: touchTarget.comfortable,
                            px: 2,
                            mb: 2,
                            borderRadius: `${FIELD_RADIUS}px`,
                            border: "1px solid",
                            borderColor: FIELD_BORDER,
                            bgcolor: appColors.surface,
                        }}
                    >
                        <ReceiptLongIcon sx={{ fontSize: 20, color: appColors.greenDark }} />
                        <Typography sx={{ fontSize: 15.5, color: appColors.textPrimary }}>
                            Tab open — food and drinks go on this booking
                        </Typography>
                    </Box>
                ) : (
                    <ButtonBase
                        onClick={onOpenTab}
                        sx={{
                            width: "100%",
                            minHeight: touchTarget.comfortable,
                            gap: 1.25,
                            mb: 2,
                            borderRadius: `${FIELD_RADIUS}px`,
                            border: "1px solid",
                            borderColor: appColors.slate,
                            bgcolor: appColors.surface,
                            color: appColors.slate,
                            fontSize: 14.5,
                            letterSpacing: "0.04em",
                            "&:hover": { bgcolor: appColors.canvasAlt },
                        }}
                    >
                        <ReceiptLongIcon sx={{ fontSize: 20 }} />
                        START A TAB
                    </ButtonBase>
                ))}

            {!freed && <RemoveGroup repeating={repeating} onCancelReservation={onCancelReservation} onClearSeries={onClearSeries} />}

            <UnsavedPrompt
                open={confirming}
                onKeepEditing={() => setConfirming(false)}
                onSave={() => {
                    setConfirming(false);
                    onSave?.();
                    onClose?.();
                }}
                onDiscard={() => {
                    setConfirming(false);
                    onChange(pristine);
                    onClose?.();
                }}
            />
        </DialogFrame>
    );
};

/* -------------------------------------------------------------- 3. blocks */

export interface BlockDraft {
    /**
     * **Nov 2 — bays, plural.**
     *
     * Weston: *"being able to block like multiple bays at the same time,
     * because if not, you have to do it one by one."* Cody will take an array
     * at the endpoint, so the draft carries one.
     *
     * Tapping a blank slot still seeds exactly one, which is the common case;
     * the checkboxes are there for the morning somebody has to close half the
     * house for a league.
     */
    bayIds: string[];
    start: number;
    duration: number;
    label: string;
    repeat: RepeatFreq;
}

export const emptyBlock = (bayId: string, start: number): BlockDraft => ({
    bayIds: [bayId],
    start,
    duration: 60,
    label: "",
    repeat: "none",
});

/**
 * **A block**, requirements 31 to 33.
 *
 * The same repeat rules as a reservation, deliberately — requirement 33 says
 * so — which is why the picker is the same component.
 *
 * **Weston's open question is unanswered**: *"can a block be placed over
 * existing reservations?"* This says no, by running the same overlap check a
 * booking runs; it is the cautious reading, and the easy one to reverse.
 *
 * ## Nov 2 — several bays at once
 *
 * The bay field is now checkboxes, and the overlap check runs once per ticked
 * bay. A bay that is busy fails the whole dialog rather than being quietly
 * dropped: blocking four of five bays when staff asked for five is the kind
 * of half-success that gets found out at 7pm.
 *
 * Editing works the same way, and that is deliberate. An existing block owns
 * one bay; ticking more while editing it moves that one and creates the rest,
 * because *"also block these"* is the thing staff will be trying to do.
 */
export const BlockDialog = ({
    open = true,
    draft,
    reservations,
    blocks,
    editing,
    onChange,
    onSave,
    onDelete,
    onClearSeries,
    onClose,
}: {
    open?: boolean;
    draft: BlockDraft;
    reservations: Reservation[];
    blocks: BayBlock[];
    /** The block being edited, if this is not a new one. */
    editing?: BayBlock;
    onChange: (draft: BlockDraft) => void;
    onSave?: () => void;
    onDelete?: () => void;
    onClearSeries?: () => void;
    onClose?: () => void;
}) => {
    const set = <K extends keyof BlockDraft>(key: K, value: BlockDraft[K]) => onChange({ ...draft, [key]: value });

    /* One check per ticked bay, against everything except the block being
       edited. `clashes` keeps the bay with its reason so the warning can name
       both rather than saying "that time is taken" and leaving staff to find
       out where. */
    const standing = blocks.filter((b) => b.id !== editing?.id);
    const clashes = draft.bayIds
        .map((bayId) => ({ bayId, conflict: conflictFor(reservations, standing, { bayId, start: draft.start, duration: draft.duration }) }))
        .filter((entry) => entry.conflict !== undefined);

    const named = Boolean(draft.label.trim());
    const repeating = (editing?.repeat ?? "none") !== "none";
    const count = draft.bayIds.length;
    const none = count === 0;
    /* Which bays, in words. One is its name — what the field said before today
       — and several is a count, because five names do not fit a subtitle. */
    const which = count === 1 ? bayById(draft.bayIds[0]).name : `${count} bays`;

    return (
        <DialogFrame
            open={open}
            onClose={onClose}
            tall={false}
            width={720}
            title={editing ? "Edit block" : "Block this time"}
            subtitle={`${none ? "No bay chosen" : which} · ${fmtTime(draft.start)} – ${fmtTime(draft.start + draft.duration)}`}
            footer={
                <>
                    <FooterButton grow={0} onClick={onClose}>
                        CANCEL
                    </FooterButton>
                    <FooterButton tone="primary" grow={1} disabled={clashes.length > 0 || !named || none} onClick={onSave}>
                        {none
                            ? "PICK A BAY"
                            : clashes.length > 0
                              ? clashes.length === 1
                                  ? "TIME UNAVAILABLE"
                                  : `${clashes.length} BAYS UNAVAILABLE`
                              : !named
                                ? "ADD A REASON"
                                : editing
                                  ? "SAVE BLOCK"
                                  : count === 1
                                    ? "ADD BLOCK"
                                    : `BLOCK ${count} BAYS`}
                    </FooterButton>
                </>
            }
        >
            <Group title="What this time is for" hint="A block belongs to nobody, so the reason is the only thing that explains it.">
                <TextInputField
                    label="Why"
                    value={draft.label}
                    onChange={(value) => set("label", value)}
                    placeholder="Maintenance, league night, lesson…"
                />
                <BayMultiPicker
                    values={draft.bayIds}
                    onChange={(bayIds) => set("bayIds", bayIds)}
                    hint="Tick every bay this applies to. They all get the same reason, time and repeat."
                />
                <StepperField
                    label="How long"
                    value={draft.duration}
                    onChange={(value) => set("duration", value)}
                    step={30}
                    min={30}
                    max={480}
                    format={fmtDuration}
                    ariaLabel="minutes"
                />

                {clashes[0]?.conflict && (
                    <>
                        {/* The first reason in full, because it is the same
                            warning a single-bay block has always shown. */}
                        <ConflictWarning conflict={clashes[0].conflict} />
                        {clashes.length > 1 && (
                            <Typography sx={{ fontSize: 15, color: appColors.red }}>
                                {clashes.length} of the {count} bays are busy then:{" "}
                                {clashes.map((entry) => bayById(entry.bayId).name).join(", ")}. Untick those, or move the time.
                            </Typography>
                        )}
                    </>
                )}

                <RepeatPicker value={draft.repeat} onChange={(value) => set("repeat", value)} />
            </Group>

            {editing && (
                <Group title="Remove this block" hint={repeating ? "Clearing the series removes every occurrence of it." : undefined}>
                    <DangerActions
                        actions={[
                            { label: repeating ? "REMOVE THIS ONE" : "REMOVE BLOCK", onClick: onDelete },
                            ...(repeating ? [{ label: "CLEAR SERIES", onClick: onClearSeries }] : []),
                        ]}
                    />
                </Group>
            )}
        </DialogFrame>
    );
};
