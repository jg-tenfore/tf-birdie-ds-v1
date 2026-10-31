import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
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
    DialogHeader,
    FeePanel,
    FieldLabel,
    LimitWarning,
    RepeatPicker,
    Stepper,
} from "./bay-form-parts";
import { StatusPill } from "./bay-sheet-parts";

/**
 * **The three dialogs the PRD asks for**: book one, open one, block one.
 *
 * They are dialogs rather than screens because the bay sheet behind them is
 * the context — requirement 17 says the warning shows *"on the bay sheet"*,
 * and moving a reservation to a different bay (22) is a decision you make
 * looking at the other bays.
 */

const Footer = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ display: "flex", gap: 1.5, px: 3, py: 2, bgcolor: appColors.canvasAlt }}>{children}</Box>
);

const Action = ({
    children,
    tone = "default",
    disabled,
    onClick,
    grow = 1,
}: {
    children: React.ReactNode;
    tone?: "default" | "primary" | "danger";
    disabled?: boolean;
    onClick?: () => void;
    grow?: number;
}) => (
    <Button
        onClick={onClick}
        disabled={disabled}
        disableElevation
        sx={{
            flex: grow,
            minHeight: touchTarget.comfortable,
            borderRadius: `${appRadius.button}px`,
            fontSize: 16,
            letterSpacing: "0.04em",
            color: "#fff",
            bgcolor: tone === "primary" ? appColors.green : tone === "danger" ? appColors.red : appColors.slate,
            "&:hover": { bgcolor: tone === "primary" ? appColors.greenDark : tone === "danger" ? appColors.red : appColors.slateDark },
            "&.Mui-disabled": { bgcolor: appColors.greyLight, color: "rgba(255,255,255,0.8)" },
        }}
    >
        {children}
    </Button>
);

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 2.5 }}>
        <FieldLabel>{label}</FieldLabel>
        {children}
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
 * The order is the order a counter asks it in: who, how long, how many, does
 * it repeat, anything to note. The fee follows the answers rather than being
 * asked for, and the two guards sit where they can still be acted on — the
 * overlap above the action bar because it cannot be overridden, the daily
 * limit beside its own switch because it can.
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
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{ paper: { sx: { width: 760, borderRadius: `${appRadius.card}px` } } }}
        >
            <DialogHeader
                title="New reservation"
                subtitle={`${bayById(draft.bayId).name} · ${fmtTime(draft.start)} – ${fmtTime(draft.start + draft.duration)}`}
            />

            <Box sx={{ px: 3, py: 2.5, bgcolor: appColors.canvas, maxHeight: 520, overflowY: "auto" }}>
                <Section label="WHO IS IT FOR">
                    <CustomerPicker
                        customer={draft.customer}
                        onPick={(customer) => onChange({ ...draft, customer, usePunch: (customer.punchesLeft ?? 0) > 0 })}
                        onClear={() => onChange({ ...draft, customer: undefined, usePunch: false, overrideLimit: false })}
                    />
                </Section>

                {/*
                 * Both guards sit here, above the controls that trigger
                 * them. They were below the fold in a 520px dialog, which
                 * made the primary action go dead with no visible reason —
                 * and side by side is also where the difference reads: one
                 * refuses, one warns and offers a way through.
                 */}
                {conflict && (
                    <Box sx={{ mb: 2.5 }}>
                        <ConflictWarning conflict={conflict} />
                    </Box>
                )}

                {draft.customer && atLimit && (
                    <Box sx={{ mb: 2.5 }}>
                        <LimitWarning
                            customer={draft.customer}
                            count={alreadyToday.length}
                            override={draft.overrideLimit}
                            onOverride={(value) => set("overrideLimit", value)}
                        />
                    </Box>
                )}

                <Box sx={{ display: "flex", gap: 4, mb: 2.5 }}>
                    <Box>
                        <FieldLabel>HOW LONG</FieldLabel>
                        <Stepper
                            value={draft.duration}
                            onChange={(value) => set("duration", value)}
                            step={30}
                            min={30}
                            max={300}
                            format={fmtDuration}
                            label="minutes"
                        />
                    </Box>
                    <Box>
                        <FieldLabel>PARTY SIZE</FieldLabel>
                        <Stepper value={draft.party} onChange={(value) => set("party", value)} min={1} max={12} label="players" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FieldLabel>BAY</FieldLabel>
                        <BayPicker value={draft.bayId} onChange={(bayId) => set("bayId", bayId)} />
                    </Box>
                </Box>

                <Section label="REPEATS">
                    <RepeatPicker value={draft.repeat} onChange={(value) => set("repeat", value)} />
                    {draft.repeat !== "none" && (
                        /* Weston's open question, surfaced rather than guessed:
                           "do they need an end date or a number of occurrences?" */
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 1 }}>
                            Repeats {repeatLabels[draft.repeat].toLowerCase()}. How far ahead is still to be decided — see the overview.
                        </Typography>
                    )}
                </Section>

                <Section label="NOTE">
                    <Box
                        component="textarea"
                        value={draft.note}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => set("note", event.target.value)}
                        placeholder="Anything the staff should know"
                        aria-label="Reservation note"
                        rows={2}
                        sx={{
                            width: "100%",
                            resize: "none",
                            p: 1.5,
                            fontFamily: "inherit",
                            fontSize: 16,
                            color: appColors.textPrimary,
                            bgcolor: appColors.fieldFill,
                            border: "none",
                            outline: "none",
                            borderBottom: "1px solid rgba(0,0,0,0.42)",
                            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
                        }}
                    />
                </Section>

                <Section label="FEE">
                    <FeePanel
                        fee={fee}
                        duration={draft.duration}
                        customer={draft.customer}
                        usePunch={draft.usePunch}
                        onUsePunch={(value) => set("usePunch", value)}
                    />
                </Section>

                <ConfirmationToggle skip={draft.skipConfirmation} onSkip={(value) => set("skipConfirmation", value)} />
            </Box>

            <Footer>
                <Action onClick={onClose}>CANCEL</Action>
                <Action tone="primary" grow={2} disabled={blocked} onClick={blocked ? undefined : () => onBook?.(draft)}>
                    {conflict ? "TIME UNAVAILABLE" : !draft.customer ? "PICK A CUSTOMER" : `BOOK · ${usd(fee.amount)}`}
                </Action>
            </Footer>
        </Dialog>
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
 * The three destructive actions sit together at the bottom, apart from SAVE:
 * cancel, no-show, and — for a repeating booking — clear the whole series.
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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{ paper: { sx: { width: 760, borderRadius: `${appRadius.card}px` } } }}
        >
            <DialogHeader
                title={reservation.customer.name}
                subtitle={`${bayById(reservation.bayId).name} · ${fmtTime(reservation.start)} – ${fmtTime(reservation.start + reservation.duration)}`}
            />

            <Box sx={{ px: 3, py: 2.5, bgcolor: appColors.canvas, maxHeight: 520, overflowY: "auto" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                    <StatusPill reservation={reservation} />
                    {reservation.tabOpen && (
                        <Typography sx={{ fontSize: 15, color: "#A9661F" }}>Tab open — closes at the end of the session</Typography>
                    )}
                    {reservation.repeat !== "none" && (
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                            {repeatLabels[reservation.repeat]} · {series.length} in this series
                        </Typography>
                    )}
                </Box>

                {conflict && (
                    <Box sx={{ mb: 2.5 }}>
                        <ConflictWarning conflict={conflict} />
                    </Box>
                )}

                {/* Requirement 14, said out loud, because it is the rule most
                    likely to surprise somebody editing a standing booking. */}
                {reservation.repeat !== "none" && (
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 2.5 }}>
                        Changes here apply to <strong>this occurrence only</strong>.
                    </Typography>
                )}

                <Box sx={{ display: "flex", gap: 4, mb: 2.5 }}>
                    <Box>
                        <FieldLabel>HOW LONG</FieldLabel>
                        <Stepper
                            value={reservation.duration}
                            onChange={(value) => set("duration", value)}
                            step={30}
                            min={30}
                            max={300}
                            format={fmtDuration}
                            label="minutes"
                        />
                    </Box>
                    <Box>
                        <FieldLabel>PARTY SIZE</FieldLabel>
                        <Stepper value={reservation.party} onChange={(value) => set("party", value)} min={1} max={12} label="players" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FieldLabel>BAY</FieldLabel>
                        <BayPicker value={reservation.bayId} onChange={(bayId) => set("bayId", bayId)} />
                    </Box>
                </Box>

                <Section label="NOTE">
                    <Box
                        component="textarea"
                        value={reservation.note ?? ""}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => set("note", event.target.value)}
                        placeholder="Anything the staff should know"
                        aria-label="Reservation note"
                        rows={2}
                        sx={{
                            width: "100%",
                            resize: "none",
                            p: 1.5,
                            fontFamily: "inherit",
                            fontSize: 16,
                            color: appColors.textPrimary,
                            bgcolor: appColors.fieldFill,
                            border: "none",
                            outline: "none",
                            borderBottom: "1px solid rgba(0,0,0,0.42)",
                            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
                        }}
                    />
                </Section>

                <Section label="FEE">
                    <FeePanel
                        fee={reservation.fee}
                        duration={reservation.duration}
                        customer={reservation.customer}
                        usePunch={reservation.punchesUsed !== undefined}
                        onUsePunch={(value) =>
                            onChange({ ...reservation, punchesUsed: value ? punchesNeeded(reservation.duration) : undefined })
                        }
                    />
                </Section>

                {/* Requirement 30 — the fee moves to a tab so food and drink can
                    join it and the whole thing closes at the end. */}
                {!reservation.tabOpen && !freed && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            bgcolor: appColors.surface,
                            borderRadius: `${appRadius.card}px`,
                            px: 2.5,
                            py: 2,
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>Open a tab</Typography>
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                                Moves the bay fee onto a tab so they can add food and drinks and settle at the end.
                            </Typography>
                        </Box>
                        <Action grow={0} onClick={onOpenTab}>
                            OPEN TAB
                        </Action>
                    </Box>
                )}
            </Box>

            <Footer>
                <Action onClick={onClose}>CLOSE</Action>
                {!freed && (
                    <>
                        <Action tone="danger" onClick={onNoShow}>
                            NO-SHOW
                        </Action>
                        <Action tone="danger" onClick={onCancelReservation}>
                            {reservation.repeat === "none" ? "CANCEL BOOKING" : "CANCEL THIS ONE"}
                        </Action>
                        {reservation.repeat !== "none" && (
                            <Action tone="danger" onClick={onClearSeries}>
                                CLEAR SERIES
                            </Action>
                        )}
                    </>
                )}
                <Action tone="primary" grow={2} disabled={Boolean(conflict)} onClick={conflict ? undefined : onSave}>
                    {conflict ? "TIME UNAVAILABLE" : "SAVE"}
                </Action>
            </Footer>
        </Dialog>
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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{ paper: { sx: { width: 640, borderRadius: `${appRadius.card}px` } } }}
        >
            <DialogHeader
                title={editing ? "Edit block" : "Block this time"}
                subtitle={`${bayById(draft.bayId).name} · ${fmtTime(draft.start)} – ${fmtTime(draft.start + draft.duration)}`}
            />

            <Box sx={{ px: 3, py: 2.5, bgcolor: appColors.canvas }}>
                <Section label="WHY">
                    <Box
                        component="input"
                        value={draft.label}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("label", event.target.value)}
                        placeholder="Maintenance, league night, lesson…"
                        aria-label="Block reason"
                        sx={{
                            width: "100%",
                            minHeight: touchTarget.comfortable,
                            px: 2,
                            fontFamily: "inherit",
                            fontSize: 18,
                            color: appColors.textPrimary,
                            bgcolor: appColors.fieldFill,
                            border: "none",
                            outline: "none",
                            borderBottom: "1px solid rgba(0,0,0,0.42)",
                            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
                        }}
                    />
                </Section>

                <Box sx={{ display: "flex", gap: 4, mb: 2.5 }}>
                    <Box>
                        <FieldLabel>HOW LONG</FieldLabel>
                        <Stepper
                            value={draft.duration}
                            onChange={(value) => set("duration", value)}
                            step={30}
                            min={30}
                            max={480}
                            format={fmtDuration}
                            label="minutes"
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <FieldLabel>BAY</FieldLabel>
                        <BayPicker value={draft.bayId} onChange={(bayId) => set("bayId", bayId)} />
                    </Box>
                </Box>

                {conflict && (
                    <Box sx={{ mb: 2.5 }}>
                        <ConflictWarning conflict={conflict} />
                    </Box>
                )}

                <Section label="REPEATS">
                    <RepeatPicker value={draft.repeat} onChange={(value) => set("repeat", value)} />
                </Section>
            </Box>

            <Footer>
                <Action onClick={onClose}>CANCEL</Action>
                {editing && (
                    <>
                        <Action tone="danger" onClick={onDelete}>
                            {editing.repeat === "none" ? "REMOVE" : "REMOVE THIS ONE"}
                        </Action>
                        {editing.repeat !== "none" && (
                            <Action tone="danger" onClick={onClearSeries}>
                                CLEAR SERIES
                            </Action>
                        )}
                    </>
                )}
                <Action
                    tone="primary"
                    grow={2}
                    disabled={Boolean(conflict) || !draft.label.trim()}
                    onClick={conflict || !draft.label.trim() ? undefined : onSave}
                >
                    {conflict ? "TIME UNAVAILABLE" : !draft.label.trim() ? "ADD A REASON" : editing ? "SAVE BLOCK" : "ADD BLOCK"}
                </Action>
            </Footer>
        </Dialog>
    );
};
