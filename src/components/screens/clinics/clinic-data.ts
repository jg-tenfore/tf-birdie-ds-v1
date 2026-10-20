/**
 * The Clinics flow, as captured in `references/102026/`.
 *
 * One clinic is configured on the reference device — **Girls Summer Camp** —
 * and everything here is read off those screenshots rather than invented. Where
 * the device's own numbers do not reconcile, they are kept and noted; this file
 * is a record of what ships, not a correction of it.
 */

export interface ClinicSession {
    /** As printed on the chip: `10/6/26 2:00 PM`. */
    label: string;
    /** A full session is greyed out and cannot be chosen — the chip says so. */
    full?: boolean;
}

export interface Clinic {
    name: string;
    /** The clinic's type, printed under the name on the listing card. */
    category: string;
    /**
     * The number beside the category on the card. It is the clinic's capacity —
     * the device prints the figure with no label, so a counter has to know.
     */
    capacity: number;
    /** The line text every booked session carries into the order. */
    orderLineLabel: string;
    sessions: ClinicSession[];
}

/**
 * Ten sessions over five weeks, two of them already full.
 *
 * The 11/3 session starts at **1:00 PM** while every other one starts at 2:00 —
 * a real difference in the data, and the kind of thing a chip of plain text
 * makes easy to miss.
 */
export const girlsSummerCamp: Clinic = {
    name: "Girls Summer Camp",
    category: "Camp",
    capacity: 10,
    orderLineLabel: "Come learn the game!",
    sessions: [
        { label: "10/6/26 2:00 PM" },
        { label: "10/8/26 2:00 PM" },
        { label: "10/13/26 2:00 PM (FULL)", full: true },
        { label: "10/15/26 2:00 PM" },
        { label: "10/20/26 2:00 PM" },
        { label: "10/22/26 2:00 PM" },
        { label: "10/27/26 2:00 PM" },
        { label: "10/29/26 2:00 PM" },
        { label: "11/3/26 1:00 PM" },
        { label: "11/5/26 2:00 PM (FULL)", full: true },
    ],
};

/** The eight sessions SELECT ALL reaches — the two full ones stay out of it. */
export const selectableSessions = girlsSummerCamp.sessions.filter((session) => !session.full).map((session) => session.label);

/**
 * What the order holds after booking.
 *
 * Three lines, all reading `Come learn the game!`, at **$0.00**, **$22.47** and
 * **$44.94** — the clinic's blurb rather than its name, no session date on any
 * of them, and three lines where eight sessions were chosen. The prices are the
 * device's: $22.47 and $44.94 are one and two units of the same $22.47 fee, and
 * the $0.00 line has no explanation on screen.
 *
 * Worth settling before this screen is redesigned: a counter reading this order
 * cannot tell which sessions the guest is booked into, or why one line is free.
 */
export const clinicOrderLines = [
    { id: "clinic-1", name: "Come learn the game!", qty: 1, price: "$0.00" },
    { id: "clinic-2", name: "Come learn the game!", qty: 1, price: "$22.47" },
    { id: "clinic-3", name: "Come learn the game!", qty: 1, price: "$44.94" },
];

/** The ticket, as the payment screen prints it. */
export const clinicTotals = {
    subTotal: "$67.41",
    taxes: "$5.55",
    fees: "$2.01",
    grandTotal: "$74.97",
};

/**
 * The receipt on Order Complete, settled in cash.
 *
 * Note what the receipt carries that the order panel does not: the lines print
 * as **Girls Summer Camp x1**, the clinic's name, where the order panel printed
 * its blurb. Two screens in the same sale, two different names for the same
 * thing.
 */
export const clinicSale = {
    facility: "The Dunes of Delgado PROD",
    orderNumber: "6655771",
    lines: [
        { id: "clinic-1", name: "Girls Summer Camp", qty: 1, total: 0 },
        { id: "clinic-2", name: "Girls Summer Camp", qty: 1, total: 22.47 },
        { id: "clinic-3", name: "Girls Summer Camp", qty: 1, total: 44.94 },
    ],
    tender: "Cash",
    paid: 74.97,
    cash: 74.97,
    change: 0,
    subtotal: 67.41,
    tax: 7.56,
    total: 74.97,
};

/** The checkout ticket: the same three lines, priced as the tender pane shows them. */
export const clinicCheckoutLines = [
    { id: "clinic-1", name: "Come learn the game!", qty: 1, unitPrice: 0 },
    { id: "clinic-2", name: "Come learn the game!", qty: 1, unitPrice: 22.47 },
    { id: "clinic-3", name: "Come learn the game!", qty: 1, unitPrice: 44.94 },
];

/** Receipt email on the reference device. */
export const clinicReceiptEmail = "hello@girardjustin.com";

/**
 * The customer search under the session picker.
 *
 * Six fields, four of them with a search icon and two without — the device
 * treats Birthday and Customer ID as filters you type rather than search, and
 * nothing on screen says which combination is required to attach a guest.
 */
export const customerFields = [
    { label: "First Name", searchable: true },
    { label: "Last Name", searchable: true },
    { label: "Email", searchable: true },
    { label: "Phone", searchable: true },
    { label: "Customer Birthday", searchable: false },
    { label: "Golf Course Customer ID", searchable: false },
];
