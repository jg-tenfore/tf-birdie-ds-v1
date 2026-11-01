import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import {
    bayById,
    bookingsToday,
    conflictFor,
    feeFor,
    fmtDuration,
    fmtTime,
    punchesNeeded,
    repeatLabels,
    seriesOf,
    usd,
    type BayBlock,
    type BayCustomer,
    type RepeatFreq,
    type Reservation,
} from "./bay-data";
import {
    BayPicker,
    ConfirmationToggle,
    ConflictWarning,
    CustomerPicker,
    DangerActions,
    DialogHeader,
    FIELD_RADIUS,
    FeePanel,
    InlineActionCard,
    LimitWarning,
    NoteField,
    RepeatPicker,
    SectionTitle,
    StepperField,
    TextInputField,
} from "./bay-form-parts";
import { StatusPill } from "./bay-sheet-parts";

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
    footer,
    children,
}: {
    open: boolean;
    onClose?: () => void;
    title: string;
    subtitle?: string;
    width?: number;
    tall?: boolean;
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
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: `${FIELD_RADIUS + 2}px`,
                },
            },
        }}
    >
        <DialogHeader title={title} subtitle={subtitle} />

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 3, bgcolor: appColors.canvas }}>{children}</Box>

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
const Group = ({ title, hint, children }: { title?: string; hint?: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 3 }}>
        {title && <SectionTitle hint={hint}>{title}</SectionTitle>}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{children}</Box>
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
    const fee = feeFor(draft.customer?.tier ?? "Guest", draft.start, draft.duration);

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
 * **The reservation**, requirements 19 through 30.
 *
 * Everything on it is editable in place, because requirement 21 asks for that
 * and because a modal that shows you a wrong duration and makes you cancel to
 * fix it is the thing the PRD is replacing.
 *
 * The three destructive actions sit together near the bottom of the body under
 * their own heading — no-show, cancel, and, for a repeating booking, clear the
 * whole series. They are not in the footer: a footer of five keys, four of
 * them red, taught staff to read none of them.
 */
export const ReservationDialog = ({
    open = true,
    reservation,
    reservations,
    blocks,
    onChange,
    onSave,
    onCancelReservation,
    onNoShow,
    onClearSeries,
    onOpenTab,
    onClose,
}: {
    open?: boolean;
    reservation: Reservation;
    reservations: Reservation[];
    blocks: BayBlock[];
    onChange: (reservation: Reservation) => void;
    onSave?: () => void;
    onCancelReservation?: () => void;
    onNoShow?: () => void;
    onClearSeries?: () => void;
    onOpenTab?: () => void;
    onClose?: () => void;
}) => {
    const set = <K extends keyof Reservation>(key: K, value: Reservation[K]) => {
        const next = { ...reservation, [key]: value };

        /* Requirement 23: the fee recalculates when duration, customer or bay
           changes, and so does the punch usage. */
        next.fee = feeFor(next.customer.tier, next.start, next.duration);
        if (next.punchesUsed !== undefined) next.punchesUsed = punchesNeeded(next.duration);

        onChange(next);
    };

    const conflict = conflictFor(reservations, blocks, reservation);
    const series = seriesOf(reservations, reservation.seriesId);
    const freed = reservation.status === "cancelled" || reservation.status === "noShow";
    const repeating = reservation.repeat !== "none";

    return (
        <DialogFrame
            open={open}
            onClose={onClose}
            title={reservation.customer.name}
            subtitle={`${bayById(reservation.bayId).name} · ${fmtTime(reservation.start)} – ${fmtTime(reservation.start + reservation.duration)}`}
            footer={
                <>
                    <FooterButton grow={0} onClick={onClose}>
                        CANCEL
                    </FooterButton>
                    <FooterButton tone="primary" grow={1} disabled={Boolean(conflict)} onClick={onSave}>
                        {conflict ? "TIME UNAVAILABLE" : "SAVE"}
                    </FooterButton>
                </>
            }
        >
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
                <StatusPill reservation={reservation} />
                {reservation.tabOpen && (
                    <Typography sx={{ fontSize: 15, color: "#A9661F" }}>Tab open — closes at the end of the session</Typography>
                )}
                {repeating && (
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                        {repeatLabels[reservation.repeat]} · {series.length} in this series
                    </Typography>
                )}
            </Box>

            {conflict && (
                <Box sx={{ mb: 3 }}>
                    <ConflictWarning conflict={conflict} />
                </Box>
            )}

            <Group
                title="Bay and time"
                hint={
                    repeating
                        ? /* Requirement 14, said out loud, because it is the rule most
                             likely to surprise somebody editing a standing booking. */
                          "Changes here apply to this occurrence only — the rest of the series is untouched."
                        : "Changing the bay or the duration re-runs the overlap check, the fee and the punch count."
                }
            >
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

            <Group title="Notes" hint={NOTE_HINT}>
                <NoteField value={reservation.note ?? ""} onChange={(value) => set("note", value)} />
            </Group>

            <Group title="Fee">
                <FeePanel
                    fee={reservation.fee}
                    duration={reservation.duration}
                    customer={reservation.customer}
                    usePunch={reservation.punchesUsed !== undefined}
                    onUsePunch={(value) =>
                        onChange({ ...reservation, punchesUsed: value ? punchesNeeded(reservation.duration) : undefined })
                    }
                />

                {/* Requirement 30 — the fee moves to a tab so food and drink can
                    join it and the whole thing closes at the end. */}
                {!reservation.tabOpen && !freed && (
                    <InlineActionCard
                        title="Open a tab"
                        description="Moves the bay fee onto a tab so they can add food and drinks and settle at the end."
                        actionLabel="OPEN TAB"
                        onAction={onOpenTab}
                    />
                )}
            </Group>

            {!freed && (
                <Group
                    title="Remove this reservation"
                    hint={
                        repeating
                            ? "A no-show still counts toward the daily limit; a cancellation does not. Clearing the series cancels every occurrence."
                            : "A no-show still counts toward the daily limit; a cancellation does not. Either one gives the bay time back."
                    }
                >
                    <DangerActions
                        actions={[
                            { label: "MARK NO-SHOW", onClick: onNoShow },
                            { label: repeating ? "CANCEL THIS ONE" : "CANCEL BOOKING", onClick: onCancelReservation },
                            ...(repeating ? [{ label: "CLEAR SERIES", onClick: onClearSeries }] : []),
                        ]}
                    />
                </Group>
            )}
        </DialogFrame>
    );
};

/* -------------------------------------------------------------- 3. blocks */

export interface BlockDraft {
    bayId: string;
    start: number;
    duration: number;
    label: string;
    repeat: RepeatFreq;
}

export const emptyBlock = (bayId: string, start: number): BlockDraft => ({
    bayId,
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
    const conflict = conflictFor(
        reservations,
        blocks.filter((b) => b.id !== editing?.id),
        draft,
    );
    const named = Boolean(draft.label.trim());
    const repeating = (editing?.repeat ?? "none") !== "none";

    return (
        <DialogFrame
            open={open}
            onClose={onClose}
            tall={false}
            width={720}
            title={editing ? "Edit block" : "Block this time"}
            subtitle={`${bayById(draft.bayId).name} · ${fmtTime(draft.start)} – ${fmtTime(draft.start + draft.duration)}`}
            footer={
                <>
                    <FooterButton grow={0} onClick={onClose}>
                        CANCEL
                    </FooterButton>
                    <FooterButton tone="primary" grow={1} disabled={Boolean(conflict) || !named} onClick={onSave}>
                        {conflict ? "TIME UNAVAILABLE" : !named ? "ADD A REASON" : editing ? "SAVE BLOCK" : "ADD BLOCK"}
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
                <BayPicker value={draft.bayId} onChange={(bayId) => set("bayId", bayId)} />
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

                {conflict && <ConflictWarning conflict={conflict} />}

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
