import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { formatMoney, type TransactionOrder } from "../refund-data";
import { isFullyRefunded, isPartlyRefunded, remainingOnTender, remainingQuantity, type RefundLedger } from "./refund-ledger";

/**
 * **Transaction Details, once the order has given something back.**
 *
 * Weston, on returning to an order you have already refunded once: *"Does it
 * look like now that these two items have been refunded?"* Today it does not —
 * the sale is untouched by its reversal, and the only trace is a separate
 * negative order elsewhere in the day's list. So the operator's own memory is
 * the control preventing a double refund.
 *
 * This is the same screen as the as-is one, with three additions and nothing
 * removed:
 *
 * 1. a **status band** under the app bar — *Partially refunded* or *Fully
 *    refunded*, with what has gone back and what is left;
 * 2. **per-line state** — an orange `Refunded` chip on a line that is spent,
 *    `1 of 2 refunded` on one that is half back;
 * 3. **per-tender state** in Payments — what each tender has returned, which is
 *    what decides where a second refund can go.
 *
 * It deliberately does not hide anything. The order still shows what was sold
 * and what was taken; refunds are reported against it rather than editing it,
 * which keeps faith with the reversal-order model Weston wants kept.
 */
export const RefundedTransactionDetails = ({ order, ledger }: { order: TransactionOrder; ledger: RefundLedger }) => {
    const fully = isFullyRefunded(order, ledger);
    const partly = isPartlyRefunded(order, ledger);
    const returned = Object.values(ledger.byMethod).reduce((sum, amount) => sum + amount, 0);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%", bgcolor: appColors.surface }}>
            {(fully || partly) && (
                <Box
                    sx={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        minHeight: 44,
                        px: 2,
                        bgcolor: fully ? "#F4E3D2" : "#FBF0E2",
                        borderBottom: "1px solid",
                        borderColor: appColors.divider,
                    }}
                >
                    <Typography sx={{ fontSize: 15, fontWeight: 500, color: "#8A4B12" }}>
                        {fully ? "Fully refunded" : "Partially refunded"}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "#8A4B12" }}>
                        {formatMoney(returned)} returned
                        {!fully && ` · ${formatMoney(order.total - returned)} still on this order`}
                    </Typography>
                </Box>
            )}

            <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
                <Box sx={{ width: 550, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                    <Band>Order Items</Band>
                    {order.items.map((item) => {
                        const left = remainingQuantity(ledger, item.name, item.quantity);
                        const refunded = item.quantity - left;
                        const spent = left === 0 && refunded > 0;

                        return (
                            <Box
                                key={item.name}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    minHeight: 53,
                                    px: 1.25,
                                    borderBottom: "1px solid",
                                    borderColor: appColors.divider,
                                    bgcolor: spent ? appColors.canvas : appColors.surface,
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 15, color: spent ? appColors.textDisabled : appColors.textPrimary }} noWrap>
                                        {item.name}
                                    </Typography>
                                    {!spent && refunded > 0 && (
                                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                            {refunded} of {item.quantity} refunded
                                        </Typography>
                                    )}
                                </Box>

                                {spent && (
                                    <Box sx={{ bgcolor: appColors.orange, px: 1.5, py: 0.75, mr: 1 }}>
                                        <Typography sx={{ fontSize: 14, color: "#fff" }}>Refunded</Typography>
                                    </Box>
                                )}

                                <Typography
                                    sx={{
                                        width: 64,
                                        textAlign: "center",
                                        fontSize: 15,
                                        color: spent ? appColors.textDisabled : appColors.textPrimary,
                                    }}
                                >
                                    {item.quantity}
                                </Typography>
                                <Typography
                                    sx={{
                                        width: 96,
                                        textAlign: "right",
                                        fontSize: 15,
                                        color: spent ? appColors.textDisabled : appColors.textPrimary,
                                    }}
                                >
                                    {formatMoney(item.price)}
                                </Typography>
                            </Box>
                        );
                    })}

                    <Box sx={{ flex: 1 }} />

                    <Band>Payments</Band>
                    {order.payments.map((payment) => {
                        const left = remainingOnTender(ledger, payment);
                        const given = payment.amount - left;

                        return (
                            <Box
                                key={payment.method}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    minHeight: 53,
                                    px: 1.25,
                                    borderBottom: "1px solid",
                                    borderColor: appColors.divider,
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{payment.method}</Typography>
                                    {given > 0 && (
                                        <Typography sx={{ fontSize: 13, color: "#8A4B12" }}>
                                            {formatMoney(given)} refunded{left === 0 ? " — nothing left on this tender" : ""}
                                        </Typography>
                                    )}
                                </Box>
                                <Typography sx={{ width: 96, textAlign: "right", fontSize: 15, color: appColors.textPrimary }}>
                                    {formatMoney(payment.amount)}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ flex: 1, pt: 3.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-around", mb: 5 }}>
                        <Fact label="Order ID" value={order.orderId} />
                        <Fact label="Order Total" value={formatMoney(order.total)} />
                        <Fact label="Date" value={order.date} />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                        <Fact label="Customer Name" value={order.customerName} />
                        <Fact label="Email" value={order.email} />
                        <Fact label="Phone" value={order.phone} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

/** The grey section band the app uses over Order Items and Payments. */
const Band = ({ children }: { children: string }) => (
    <Box sx={{ height: 36, bgcolor: "#F0F1F3", display: "flex", alignItems: "center", px: 1.25, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{children}</Typography>
    </Box>
);

/** One centred caption-over-value pair from the right-hand grid. */
const Fact = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ textAlign: "center", px: 2 }}>
        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{value}</Typography>
    </Box>
);

export default RefundedTransactionDetails;
