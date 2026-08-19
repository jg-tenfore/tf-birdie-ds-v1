import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import { VOID_REASONS, isExpired, isSpentOut, isVoided, type Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Concept.** One raincheck, opened from the customer's record.
 *
 * The record's Rain Checks table answers *how much* in six columns. It cannot
 * answer the question a counter is actually being asked, which is almost always
 * about one credit: where did this come from, what has it paid for, why is it
 * worth nothing, and — when it was cut wrong — can you take it back.
 *
 * This is where voiding belongs as much as the issue screen does, and arguably
 * more. The argument happens at the counter with the customer standing there,
 * not on the tee sheet: somebody says "that was meant to be on my account", and
 * the person who can fix it is looking at this record. Sending them to find the
 * reservation first is a detour through a screen they do not need.
 *
 * The same rule applies as on the issue screen — spend any of it and the void is
 * gone, because at that point the money has left and it is a refund question.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** What state a credit is in, as one word and a colour. */
const statusOf = (credit: Raincheck) => {
    if (isVoided(credit)) return { label: "VOIDED", color: appColors.red };
    if (isSpentOut(credit)) return { label: "USED", color: appColors.textSecondary };
    if (isExpired(credit)) return { label: "EXPIRED", color: appColors.orange };
    if (credit.spent > 0) return { label: "PART SPENT", color: appColors.greenTee };
    return { label: "AVAILABLE", color: appColors.greenTee };
};

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
    <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.6, borderBottom: `1px solid ${appColors.divider}` }}>
        <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{label}</Typography>
        <Typography sx={{ fontSize: 16, fontWeight: strong ? 700 : 400 }}>{value}</Typography>
    </Stack>
);

export interface RaincheckDetailProps {
    credit: Raincheck | null;
    onClose: () => void;
    /** Cancels the credit. Omit to make the sheet read-only. */
    onVoid?: (id: string, reason: string) => void;
}

export const RaincheckDetail = ({ credit, onClose, onVoid }: RaincheckDetailProps) => {
    const [reason, setReason] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);

    const reset = () => {
        setReason(null);
        setConfirming(false);
    };

    if (!credit) return <Dialog open={false} onClose={onClose} />;

    const status = statusOf(credit);
    // Nothing spent, not already voided. Expiry does not block it — a lapsed
    // credit cut for the wrong player is still a mistake worth correcting.
    const canVoid = Boolean(onVoid) && !isVoided(credit) && credit.spent <= 0;

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ transition: { onExited: reset } }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, bgcolor: appColors.slate, color: "#fff", px: 2, py: 1.25 }}>
                <Stack sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 20 }}>Raincheck {credit.id}</Typography>
                    <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{credit.customerName}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 13, color: status.color, bgcolor: "#fff", px: 1, py: 0.25, borderRadius: 0.5 }}>
                    {status.label}
                </Typography>
                <IconButton aria-label="Close raincheck details" onClick={onClose} sx={{ color: "#fff", width: 44, height: 44 }}>
                    <CloseIcon />
                </IconButton>
            </Stack>

            <Box sx={{ px: 3, py: 2.5 }}>
                {/* The round. A credit whose origin cannot be named settles
                    nothing with the person standing at the counter. */}
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 0.5 }}>Where it came from</Typography>
                <Row label="Tee time" value={credit.teeTime ?? "—"} />
                <Row label="Reservation" value={credit.reservation} />
                <Row label="Round paid" value={usd(credit.roundPrice)} />
                <Row label="Holes played" value={`${credit.holesPlayed} of ${credit.totalHoles}`} />
                <Row label="Issued" value={credit.issued} />
                <Row label="Expires" value={credit.expires} />

                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mt: 2.5, mb: 0.5 }}>The money</Typography>
                <Row label="Awarded" value={usd(credit.awarded)} />
                <Row label="Spent" value={usd(credit.spent)} />
                <Row label="Balance" value={isVoided(credit) ? "voided" : usd(credit.balance)} strong />

                {credit.redemptions?.length ? (
                    <>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mt: 2.5, mb: 0.5 }}>What it paid for</Typography>
                        {credit.redemptions.map((r) => (
                            <Stack key={r.order} direction="row" sx={{ gap: 1.5, py: 0.5, alignItems: "baseline" }}>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, minWidth: 78 }}>{r.at}</Typography>
                                <Typography sx={{ fontSize: 14, minWidth: 66 }}>−{usd(r.amount)}</Typography>
                                <Typography sx={{ fontSize: 14, flex: 1 }}>{r.what}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textDisabled }}>#{r.order}</Typography>
                            </Stack>
                        ))}
                    </>
                ) : null}

                {credit.voided && (
                    <Box sx={{ mt: 2.5, p: 2, bgcolor: "#FDEDEE", border: `1px solid ${appColors.red}` }}>
                        <Typography sx={{ fontSize: 16, color: appColors.red }}>Voided</Typography>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                            {credit.voided.reason} — by {credit.voided.by}, {credit.voided.at}
                        </Typography>
                    </Box>
                )}

                {!canVoid && !isVoided(credit) && credit.spent > 0 && (
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 2.5 }}>
                        {usd(credit.spent)} of this has been spent, so it can no longer be voided. Taking the money back is a refund.
                    </Typography>
                )}

                {/* Void, behind a confirmation. Two taps, because the record is a
                    browsing screen and this is the one thing on it that destroys
                    value. */}
                {canVoid && !confirming && (
                    <ButtonBase
                        onClick={() => setConfirming(true)}
                        sx={{
                            mt: 2.5,
                            width: "100%",
                            py: 1.5,
                            fontSize: 16,
                            border: `1px solid ${appColors.red}`,
                            color: appColors.red,
                            borderRadius: 0.5,
                        }}
                    >
                        VOID THIS RAINCHECK
                    </ButtonBase>
                )}

                {canVoid && confirming && (
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${appColors.divider}` }}>
                        <Typography sx={{ fontSize: 16 }}>Void {usd(credit.balance)} and release the round?</Typography>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.5 }}>
                            The credit stays on this record marked voided, and reservation {credit.reservation} can be rainchecked again.
                        </Typography>

                        <Typography sx={{ fontSize: 15, mt: 2, mb: 1 }}>Why?</Typography>
                        <Stack sx={{ gap: 0.75 }}>
                            {VOID_REASONS.map((r) => (
                                <ButtonBase
                                    key={r}
                                    onClick={() => setReason(r)}
                                    sx={{
                                        justifyContent: "flex-start",
                                        px: 2,
                                        py: 1.25,
                                        fontSize: 16,
                                        border: "1px solid",
                                        borderColor: reason === r ? appColors.greenTee : appColors.divider,
                                        bgcolor: reason === r ? "#EAF3EC" : appColors.surface,
                                        borderRadius: 0.5,
                                    }}
                                >
                                    {r}
                                </ButtonBase>
                            ))}
                        </Stack>

                        <Stack direction="row" sx={{ gap: 1, mt: 2.5 }}>
                            <ButtonBase onClick={reset} sx={{ flex: 1, py: 1.75, fontSize: 16, bgcolor: appColors.slate, color: "#fff" }}>
                                Keep it
                            </ButtonBase>
                            <ButtonBase
                                onClick={() => reason && onVoid?.(credit.id, reason)}
                                disabled={!reason}
                                sx={{
                                    flex: 1.4,
                                    py: 1.75,
                                    fontSize: 16,
                                    letterSpacing: "0.06em",
                                    bgcolor: reason ? appColors.red : "#DCDEE0",
                                    color: reason ? "#fff" : "#8A9096",
                                }}
                            >
                                VOID RAINCHECK
                            </ButtonBase>
                        </Stack>
                    </Box>
                )}
            </Box>
        </Dialog>
    );
};
