import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EditIcon from "@mui/icons-material/EditOutlined";
import EmailIcon from "@mui/icons-material/MailOutlined";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import {
    SERIES_WEEKS,
    bayById,
    fmtDuration,
    fmtTime,
    occasions,
    occurrencesOf,
    punchesNeeded,
    repeatLabels,
    scheduleLabel,
    seriesOf,
    usd,
    type Reservation,
    type ReservationStatus,
} from "./bay-data";
import { FIELD_BORDER, FIELD_RADIUS, ROW_RULE, SectionRule, StatusSegments } from "./bay-form-parts";

/**
 * **The peek panel** — what a tap on a chip opens, before any editing.
 *
 * Most taps on a booking are not edits. They are *who is this, have they
 * shown up, what do they owe, is there a note* — questions the old flow
 * answered by opening a form with eleven controls in it and making staff read
 * around them. This answers them in one read and offers the four things
 * anyone actually does next.
 *
 * ## Why it docks to the side rather than sitting in the middle
 *
 * Requirement 22 is *move this booking to another bay*, and that is a
 * decision made by looking at the other bays. A centred dialog covers the
 * sheet it is about; a panel down the right edge leaves it legible, so the
 * answer to "can I move them to Green?" is on screen beside the question.
 *
 * ## What it does not do
 *
 * It does not edit. Every value here is read-only and **EDIT DETAILS** opens
 * the full dialog, which keeps this panel honest: nothing in it can be half
 * -changed, so it needs no save, no dirty state and no guard. The one
 * exception is status, because checking a golfer in is the single most common
 * thing staff do at this panel and sending them through a form to do it would
 * be the whole problem again.
 */

/** One fact: a quiet label above the value, which reads faster than a row of pairs. */
const PeekRow = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: typeof PhoneIcon }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, px: 2, py: 1.25, borderBottom: "1px solid", borderColor: ROW_RULE }}>
        {Icon && <Icon sx={{ flexShrink: 0, fontSize: 19, mt: 0.25, color: appColors.textSecondary }} />}
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, letterSpacing: "0.06em", color: appColors.textSecondary }}>{label.toUpperCase()}</Typography>
            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{value}</Typography>
        </Box>
    </Box>
);

/** The card each group of facts sits in. */
const PeekCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
        <SectionRule>{label}</SectionRule>
        <Box
            sx={{
                bgcolor: appColors.surface,
                border: "1px solid",
                borderColor: FIELD_BORDER,
                borderRadius: `${FIELD_RADIUS}px`,
                overflow: "hidden",
                "& > *:last-child": { borderBottom: "none" },
            }}
        >
            {children}
        </Box>
    </Box>
);

/** One of the panel's four actions. */
const PeekAction = ({
    children,
    icon: Icon,
    tone = "default",
    onClick,
}: {
    children: React.ReactNode;
    icon?: typeof EditIcon;
    tone?: "default" | "primary" | "danger";
    onClick?: () => void;
}) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            width: "100%",
            gap: 1.25,
            minHeight: touchTarget.comfortable,
            borderRadius: `${FIELD_RADIUS}px`,
            border: "1px solid",
            borderColor: tone === "primary" ? "transparent" : tone === "danger" ? appColors.red : appColors.divider,
            bgcolor: tone === "primary" ? appColors.green : appColors.surface,
            color: tone === "primary" ? "#fff" : tone === "danger" ? appColors.red : appColors.textPrimary,
            fontSize: 15.5,
            letterSpacing: "0.04em",
            "&:hover": {
                bgcolor: tone === "primary" ? appColors.greenDark : tone === "danger" ? "#FDECEA" : appColors.canvasAlt,
            },
        }}
    >
        {Icon && <Icon sx={{ fontSize: 20 }} />}
        {children}
    </ButtonBase>
);

export interface ReservationPeekProps {
    open?: boolean;
    reservation: Reservation;
    reservations: Reservation[];
    onStatus?: (status: ReservationStatus) => void;
    onEdit?: () => void;
    onOpenTab?: () => void;
    onCancelReservation?: () => void;
    onClose?: () => void;
}

export const ReservationPeek = ({
    open = true,
    reservation,
    reservations,
    onStatus,
    onEdit,
    onOpenTab,
    onCancelReservation,
    onClose,
}: ReservationPeekProps) => {
    const { customer } = reservation;
    const repeating = reservation.repeat !== "none";
    const freed = reservation.status === "cancelled" || reservation.status === "noShow";
    const series = seriesOf(reservations, reservation.seriesId);

    const needed = punchesNeeded(reservation.duration);
    const available = customer.punchesLeft ?? 0;
    const usePunch = reservation.punchesUsed !== undefined;
    const covered = usePunch ? Math.min(needed, available) : 0;
    const owed = Number((reservation.fee.amount * ((needed - covered) / needed)).toFixed(2));
    const occasion = occasions.find((o) => o.id === reservation.occasion);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            /* Docked right, full height, square against the edge — a panel, not
               a card that happens to be over there. The backdrop stays light so
               the sheet behind it is still readable. */
            slotProps={{
                backdrop: { sx: { bgcolor: "rgba(15,20,30,0.28)" } },
                paper: {
                    sx: {
                        position: "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        m: 0,
                        width: 420,
                        maxWidth: "92vw",
                        maxHeight: "100vh",
                        borderRadius: 0,
                        display: "flex",
                        flexDirection: "column",
                    },
                },
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    bgcolor: appColors.navy,
                    color: "#fff",
                    pl: 2.5,
                    pr: 1.25,
                    py: 1.75,
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 21 }}>{customer.name}</Typography>
                    <Typography sx={{ fontSize: 14.5, color: "rgba(255,255,255,0.78)" }}>
                        {bayById(reservation.bayId).name} · {fmtTime(reservation.start)} –{" "}
                        {fmtTime(reservation.start + reservation.duration)}
                    </Typography>
                </Box>
                <ButtonBase
                    onClick={onClose}
                    aria-label="Close"
                    sx={{
                        flexShrink: 0,
                        width: touchTarget.min,
                        height: touchTarget.min,
                        borderRadius: "50%",
                        color: "rgba(255,255,255,0.85)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#fff" },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 24 }} />
                </ButtonBase>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 2.5, py: 2, bgcolor: appColors.canvas }}>
                {/* The one editable thing here, because checking a golfer in is
                    what most of these taps are for. */}
                <Box sx={{ mb: 2 }}>
                    <SectionRule>Reservation status</SectionRule>
                    <StatusSegments status={reservation.status} onStatus={onStatus} size="sm" fill />
                </Box>

                <PeekCard label="Reservation">
                    <PeekRow label="Bay" value={bayById(reservation.bayId).name} />
                    <PeekRow label="How long" value={`${fmtDuration(reservation.duration)} · ${reservation.party} players`} />
                    <PeekRow
                        label="Repeats"
                        icon={repeating ? EventRepeatIcon : undefined}
                        value={
                            repeating
                                ? `${repeatLabels[reservation.repeat]} — ${scheduleLabel(reservation.repeat, reservation.start)}, ${occurrencesOf(
                                      reservation.repeat,
                                  )} visits over ${SERIES_WEEKS} weeks${series.length > 1 ? ` · ${series.length} on the sheet` : ""}`
                                : "Does not repeat"
                        }
                    />
                </PeekCard>

                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 0.375 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <SectionRule>Order</SectionRule>
                        </Box>
                        <Typography sx={{ flexShrink: 0, fontSize: 18, fontWeight: 600, color: appColors.textPrimary }}>
                            <Box component="span" sx={{ fontSize: 13, fontWeight: 400, color: appColors.textSecondary, mr: 0.75 }}>
                                {reservation.paid ? "Paid" : repeating ? "Due today" : "Due"}
                            </Box>
                            {usd(owed)}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            bgcolor: appColors.surface,
                            border: "1px solid",
                            borderColor: FIELD_BORDER,
                            borderRadius: `${FIELD_RADIUS}px`,
                            overflow: "hidden",
                            "& > *:last-child": { borderBottom: "none" },
                        }}
                    >
                        <PeekRow
                            label={reservation.fee.name}
                            value={`${usd(reservation.fee.hourly)}/hr × ${fmtDuration(reservation.duration)}`}
                        />
                        {reservation.tabOpen && (
                            <PeekRow label="Tab" value="Open — food and drinks go on this booking" icon={ReceiptLongIcon} />
                        )}
                    </Box>
                </Box>
                {/* Requirement 7 and 8 both live on the guest, and neither was
                    visible anywhere once the booking was made. */}
                <PeekCard label="Guest">
                    <PeekRow label="Pricing tier" value={customer.tier} />
                    <PeekRow label="Phone" value={customer.phone} icon={PhoneIcon} />
                    <PeekRow label="Email" value={customer.email} icon={EmailIcon} />
                    {customer.punchCardName && (
                        <PeekRow
                            label="Punch card"
                            icon={ConfirmationNumberIcon}
                            value={`${customer.punchCardName} — ${available} left${usePunch ? `, ${covered} on this booking` : ""}`}
                        />
                    )}
                </PeekCard>

                {(reservation.note || occasion) && (
                    <PeekCard label="Note">
                        {occasion && <PeekRow label="Occasion" value={occasion.label} />}
                        {reservation.note && <PeekRow label="Shows on the bay sheet" value={reservation.note} />}
                    </PeekCard>
                )}
            </Box>

            <Box
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                    px: 2.5,
                    py: 1.75,
                    bgcolor: appColors.surface,
                    borderTop: "1px solid",
                    borderColor: appColors.divider,
                }}
            >
                <PeekAction icon={EditIcon} tone="primary" onClick={onEdit}>
                    EDIT DETAILS
                </PeekAction>

                {/* The secondary pair shares a line, so the panel's body keeps
                    the room it needs to show the money without scrolling. */}
                {(!freed || !reservation.tabOpen) && (
                    <Box sx={{ display: "flex", gap: 1.25 }}>
                        {!reservation.tabOpen && !freed && (
                            <PeekAction icon={ReceiptLongIcon} onClick={onOpenTab}>
                                START A TAB
                            </PeekAction>
                        )}
                        {!freed && (
                            <PeekAction tone="danger" onClick={onCancelReservation}>
                                {repeating ? "CANCEL THIS ONE" : "CANCEL BOOKING"}
                            </PeekAction>
                        )}
                    </Box>
                )}
            </Box>
        </Dialog>
    );
};
