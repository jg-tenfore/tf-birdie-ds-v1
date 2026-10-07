import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { formatMoney, type OrderItem, type OrderPayment, type TransactionOrder } from "./refund-data";

/**
 * Transaction Details — the screen that owns the REFUND button.
 *
 * Transcribed from `references/100626/`. The left half is the receipt (Order
 * Items, then Payments, each under a grey band); the right half is six facts in
 * a centred grid. The left column is ~550px wide on a 1280 screen and the right
 * two-thirds of the canvas sits empty, which is why a six-line order and a
 * one-line order look equally sparse.
 *
 * Two things this screen does not say, and both of them matter at the counter:
 *
 * - **Whether the order has already been refunded.** The red REFUND button is
 *   present and enabled on an order that has been refunded in full, and on a
 *   refund order itself — 6521287 below is a refund, and it offers to refund it
 *   again.
 * - **Which order a refund reverses.** A refund is a new order with its own id;
 *   the only thread back to the original is the customer and the clock.
 */

/** Grey section band — "Order Items" and "Payments" share it. */
const SectionBand = ({ children }: { children: string }) => (
    <Box sx={{ height: 36, bgcolor: "#F0F1F3", display: "flex", alignItems: "center", px: 1.25 }}>
        <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{children}</Typography>
    </Box>
);

/** The orange chip the app stamps on every line of a refund order. */
export const RefundedChip = () => (
    <Box sx={{ bgcolor: appColors.orange, px: 1.5, py: 0.75, display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontSize: 15, color: "#fff" }}>Refunded</Typography>
    </Box>
);

const ItemRow = ({ item, refunded }: { item: OrderItem; refunded?: boolean }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            minHeight: 53,
            px: 1.25,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: appColors.textPrimary }} noWrap>
            {item.name}
        </Typography>
        {refunded && <RefundedChip />}
        <Typography sx={{ width: 64, textAlign: "center", fontSize: 15, color: appColors.textPrimary }}>{item.quantity}</Typography>
        <Typography sx={{ width: 96, textAlign: "right", fontSize: 15, color: appColors.textPrimary }}>
            {formatMoney(item.price)}
        </Typography>
    </Box>
);

const PaymentRow = ({ payment }: { payment: OrderPayment }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            minHeight: 53,
            px: 1.25,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: appColors.textPrimary }}>{payment.method}</Typography>
        <Typography sx={{ width: 96, textAlign: "right", fontSize: 15, color: appColors.textPrimary }}>
            {formatMoney(payment.amount)}
        </Typography>
    </Box>
);

/** One centred caption-over-value pair from the right-hand grid. */
const Fact = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ textAlign: "center", px: 2 }}>
        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{value}</Typography>
    </Box>
);

export const TransactionDetails = ({ order }: { order: TransactionOrder }) => (
    <Box sx={{ display: "flex", minHeight: "100%", bgcolor: appColors.surface }}>
        {/* Receipt. Items sit at the top, payments are pushed to the bottom of
            the column — on a one-line order that leaves a field of white between
            them with nothing in it. */}
        <Box sx={{ width: 550, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <SectionBand>Order Items</SectionBand>
            {order.items.map((item) => (
                <ItemRow key={item.name} item={item} refunded={order.isRefund} />
            ))}

            <Box sx={{ flex: 1 }} />

            <SectionBand>Payments</SectionBand>
            {order.payments.map((payment) => (
                <PaymentRow key={payment.method} payment={payment} />
            ))}
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
);

export default TransactionDetails;
