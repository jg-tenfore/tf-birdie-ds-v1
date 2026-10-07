/**
 * The refund flow's fixtures, transcribed from `references/100626/`.
 *
 * Two orders carry the whole flow, and they were chosen on the device for a
 * reason:
 *
 * - **6516551** — one item, one tender. The simplest refund the app can do, and
 *   the one that exposes the tax question (see `chickenWingsOrder`).
 * - **6521260** — six items, paid Cash + Gift Card. The only way to see how the
 *   app splits a refund across tenders, which it does without showing its work.
 *
 * Amounts are verbatim, including the ones that do not reconcile. Where the
 * device's arithmetic is surprising it is noted rather than corrected — this
 * folder documents what ships.
 */

/** A row in Order Lookup Results. `amount` is pre-formatted, minus sign and all. */
export interface LookupRow {
    orderId: string;
    date: string;
    customerName: string;
    /** "Credit", "Cash", "Customer Charge", or "Multiple" when the order used more than one. */
    paymentType: string;
    /** Formatted dollars. A leading `-` marks a refund — the only marking there is. */
    amount: string;
}

/** A line on Transaction Details or Create a Refund. */
export interface OrderItem {
    name: string;
    quantity: number;
    /** Line price as the app prints it — tax-inclusive, unlike the Pro Shop tile. */
    price: number;
}

/** A tender on the order, and the unit a refund is allocated against. */
export interface OrderPayment {
    /** "Cash", "Credit", "Gift Card", "Customer Charge". */
    method: string;
    amount: number;
}

export interface TransactionOrder {
    orderId: string;
    total: number;
    date: string;
    customerName: string;
    email: string;
    phone: string;
    items: OrderItem[];
    payments: OrderPayment[];
    /**
     * Set on a refund order. Each item renders with an orange **Refunded** chip,
     * a negative quantity and a negative price — the app writes the refund as its
     * own order rather than amending the original.
     */
    isRefund?: boolean;
}

/**
 * The day's orders at The Dunes of Delgado PROD, 10/06/2026 — the result set a
 * bare SEARCH returns, newest first.
 *
 * Six of the ten rows are refunds. Nothing but the minus sign says so: same
 * weight, same color, same row height, and the pairs that belong together
 * (6520452 / 6520482, say) are related only by equal and opposite amounts a few
 * minutes apart.
 */
export const dayOrderRows: LookupRow[] = [
    { orderId: "6521287", date: "10/06/2026 4:10 PM", customerName: "Tony Finau", paymentType: "Multiple", amount: "-$42.34" },
    { orderId: "6521260", date: "10/06/2026 4:08 PM", customerName: "Tony Finau", paymentType: "Multiple", amount: "$50.58" },
    { orderId: "6520847", date: "10/06/2026 3:35 PM", customerName: "Sawyer Card", paymentType: "Credit", amount: "$414.28" },
    { orderId: "6520575", date: "10/06/2026 3:16 PM", customerName: "Cody Sanders", paymentType: "Credit", amount: "-$140.83" },
    { orderId: "6520532", date: "10/06/2026 3:12 PM", customerName: "Cody Sanders", paymentType: "Credit", amount: "-$115.32" },
    { orderId: "6520482", date: "10/06/2026 3:09 PM", customerName: "Jeremy Mehlman", paymentType: "Credit", amount: "-$207.14" },
    { orderId: "6520475", date: "10/06/2026 3:08 PM", customerName: "Sawyer Card", paymentType: "Credit", amount: "$414.28" },
    { orderId: "6520452", date: "10/06/2026 3:07 PM", customerName: "Jeremy Mehlman", paymentType: "Credit", amount: "$207.14" },
    { orderId: "6520431", date: "10/06/2026 3:05 PM", customerName: "Jeremy Mehlman", paymentType: "Credit", amount: "-$103.57" },
    { orderId: "6520411", date: "10/06/2026 3:04 PM", customerName: "Jeremy Mehlman", paymentType: "Credit", amount: "$103.57" },
];

/**
 * The same day searched by product, which is how the single-item example is
 * found. Note row 7 and 8: a search scoped to one customer's orders returns
 * Jack Black and Austin Zech as well, because the scope is the day, not the name.
 */
export const westonOrderRows: LookupRow[] = [
    { orderId: "6518042", date: "10/06/2026 12:07 PM", customerName: "Weston Farnsworth", paymentType: "Credit", amount: "$18.44" },
    { orderId: "6516884", date: "10/06/2026 10:49 AM", customerName: "Weston Farnsworth", paymentType: "Credit", amount: "-$71.66" },
    { orderId: "6516880", date: "10/06/2026 10:48 AM", customerName: "Weston Farnsworth", paymentType: "Credit", amount: "$71.66" },
    { orderId: "6516551", date: "10/06/2026 10:27 AM", customerName: "Weston Farnsworth", paymentType: "Credit", amount: "$18.44" },
    { orderId: "6516491", date: "10/06/2026 10:23 AM", customerName: "Weston Farnsworth", paymentType: "Credit", amount: "$5.56" },
    { orderId: "6516270", date: "10/06/2026 10:08 AM", customerName: "Weston Farnsworth", paymentType: "Credit", amount: "$5.56" },
    { orderId: "6515557", date: "10/06/2026 9:14 AM", customerName: "Jack Black", paymentType: "Credit", amount: "$5.56" },
    { orderId: "6513605", date: "10/06/2026 2:00 AM", customerName: "Austin Zech", paymentType: "Customer Charge", amount: "$32.18" },
];

/**
 * The single-item order.
 *
 * The number to look at is the gap: the order totalled **$18.44** and the credit
 * card was charged $18.44, but the only line on it prices at **$15.44**. Refund
 * the line and the app offers $15.44 — the $3.00 difference, whatever it is, has
 * no row of its own to return. Worth settling before this screen is redesigned.
 */
export const chickenWingsOrder: TransactionOrder = {
    orderId: "6516551",
    total: 18.44,
    date: "10/06/2026 10:27 AM",
    customerName: "Weston Farnsworth",
    email: "weston.farnsworth@tenfore.golf",
    phone: "8017084153",
    items: [{ name: "Chicken Wings", quantity: 1, price: 15.44 }],
    payments: [{ method: "Credit", amount: 18.44 }],
};

/** The multi-tender order: a Pro Shop basket settled $25.00 cash, $25.58 gift card. */
export const proShopOrder: TransactionOrder = {
    orderId: "6521260",
    total: 50.58,
    date: "10/06/2026 4:08 PM",
    customerName: "Tony Finau",
    email: "weston+tony@tenfore.golf",
    phone: "8017084153",
    items: [
        { name: "Callaway Supersoft (Dozen)", quantity: 1, price: 23.4 },
        { name: "Callaway Supersoft Sleeve", quantity: 1, price: 5.56 },
        { name: "Coffee", quantity: 1, price: 1.86 },
        { name: "Bubly Lime", quantity: 2, price: 8.24 },
        { name: "Gatorade", quantity: 1, price: 3.73 },
        { name: "Meatball Sub", quantity: 1, price: 7.79 },
    ],
    payments: [
        { method: "Cash", amount: 25.0 },
        { method: "Gift Card", amount: 25.58 },
    ],
};

/**
 * What the refund of `proShopOrder` becomes: a new order, 6521287, two minutes
 * later, holding the five refunded lines at −1 each.
 *
 * The Bubly Lime is simply absent — it was zeroed on the refund screen, and a
 * zeroed line leaves no trace here. The payments show the split the operator
 * never saw: Cash took its full $25.00 and the Gift Card absorbed the remaining
 * $17.34 of the $42.34.
 */
export const refundOrder: TransactionOrder = {
    orderId: "6521287",
    total: -42.34,
    date: "10/06/2026 4:10 PM",
    customerName: "Tony Finau",
    email: "weston+tony@tenfore.golf",
    phone: "8017084153",
    isRefund: true,
    items: [
        { name: "Callaway Supersoft Sleeve", quantity: -1, price: -5.56 },
        { name: "Callaway Supersoft (Dozen)", quantity: -1, price: -23.4 },
        { name: "Meatball Sub", quantity: -1, price: -7.79 },
        { name: "Gatorade", quantity: -1, price: -3.73 },
        { name: "Coffee", quantity: -1, price: -1.86 },
    ],
    payments: [
        { method: "Cash", amount: -25.0 },
        { method: "Gift Card", amount: -17.34 },
    ],
};

/** `$1,234.56`, or `-$42.34` — sign outside the dollar, as the app prints it. */
export const formatMoney = (value: number): string =>
    `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
