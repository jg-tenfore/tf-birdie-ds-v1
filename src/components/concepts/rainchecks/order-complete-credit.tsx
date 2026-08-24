import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { THIS_COURSE, type Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { CreditOrigin } from "./credit-history";

/**
 * **Concept — Aug 24.** The payment result, carrying the credit's provenance.
 *
 * > *"This info should also be available in the raincheck payment result."*
 *
 * Step 5 was deliberately out of scope for this project — Order Complete was
 * unchanged. This feedback puts it back in, and for a good reason: **the receipt
 * is where next month's argument gets settled.**
 *
 * The shipping screen says "Cash Tendered" and an amount, whatever the tender
 * was. Nothing on it names the raincheck, where it came from, or what is left —
 * so the sale that empties a credit produces no record the customer can hold,
 * and the next conversation starts from nothing again. That is the same failure
 * as the search, one step later.
 *
 * What is added is small and all of it is fact the register already has: which
 * credit paid, the round it was cut from, **which course issued it**, what this
 * sale drew, and what remains.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export interface OrderCompleteCreditProps {
    credit: Raincheck;
    /** What this sale drew from the credit. */
    applied: number;
    orderNumber: string;
    /** Anything still owed after the credit, settled by another tender. */
    remainingTender?: { label: string; amount: number };
    total: number;
}

export const OrderCompleteCredit = ({ credit, applied, orderNumber, remainingTender, total }: OrderCompleteCreditProps) => {
    const left = +(credit.balance - applied).toFixed(2);
    const emptied = left <= 0.001;
    const elsewhere = credit.course && credit.course !== THIS_COURSE;

    return (
        <Stack sx={{ height: "100%", bgcolor: appColors.canvas, p: 2, gap: 2, overflowY: "auto" }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, bgcolor: "#E7F3EA", px: 2, py: 1.5 }}>
                <CheckCircleIcon sx={{ fontSize: 22, color: appColors.greenTee }} />
                <Typography sx={{ fontSize: 18, color: appColors.greenTee, flex: 1 }}>
                    Paid in full · {usd(total)} · order #{orderNumber}
                </Typography>
            </Stack>

            {/* The block the shipping receipt does not have. */}
            <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
                <Box sx={{ bgcolor: appColors.navy, px: 2, py: 1.25 }}>
                    <Typography sx={{ fontSize: 15, color: "#fff" }}>Raincheck {credit.id}</Typography>
                </Box>

                <Stack sx={{ px: 2, py: 1.5, gap: 1.25 }}>
                    <CreditOrigin credit={credit} />
                    {elsewhere && (
                        <Typography sx={{ fontSize: 13, color: appColors.orange }}>
                            Issued at another course and honoured here — worth printing, because it is the fact nobody can reconstruct
                            later.
                        </Typography>
                    )}

                    <Stack sx={{ gap: 0.5, pt: 0.5, borderTop: `1px solid ${appColors.divider}` }}>
                        <Stack direction="row" sx={{ gap: 2, pt: 1 }}>
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, flex: 1 }}>Balance before this sale</Typography>
                            <Typography sx={{ fontSize: 15 }}>{usd(credit.balance)}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ gap: 2 }}>
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, flex: 1 }}>Applied to this order</Typography>
                            <Typography sx={{ fontSize: 15 }}>−{usd(applied)}</Typography>
                        </Stack>
                        <Stack direction="row" sx={{ gap: 2, pt: 0.75, borderTop: `1px solid ${appColors.divider}` }}>
                            <Typography sx={{ fontSize: 16, flex: 1 }}>
                                {emptied ? "Nothing left on it" : "Left on this raincheck"}
                            </Typography>
                            <Typography sx={{ fontSize: 20, color: emptied ? appColors.textDisabled : appColors.greenTee }}>
                                {usd(Math.max(0, left))}
                            </Typography>
                        </Stack>
                    </Stack>

                    {emptied && (
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                            This is the sale that will be quoted back at a counter months from now. The customer&rsquo;s record keeps it,
                            and so does this receipt.
                        </Typography>
                    )}
                </Stack>
            </Box>

            {remainingTender && (
                <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, px: 2, py: 1.5 }}>
                    <Stack direction="row" sx={{ gap: 2 }}>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, flex: 1 }}>{remainingTender.label}</Typography>
                        <Typography sx={{ fontSize: 15 }}>{usd(remainingTender.amount)}</Typography>
                    </Stack>
                </Box>
            )}
        </Stack>
    );
};
