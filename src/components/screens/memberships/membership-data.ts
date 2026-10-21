/**
 * **Selling a membership, as it ships.** Transcribed from
 * `references/102226/memberships/`.
 *
 * The same shape as Clinics and Gift Cards: a Pro Shop tile opens a list, the
 * list opens a form, SAVE drops a line in the order. What is different is the
 * list — a flat grid of every membership the course has ever configured, under
 * two unlabelled group tiles.
 *
 * What the captures record, kept rather than corrected:
 *
 * - **The two tiles at the top are group filters**, and nothing says so. They
 *   are drawn the same size as a membership, carry a logo instead of a price,
 *   and tapping one replaces the grid beneath it.
 * - **The catalogue is unmaintained.** `Beta Compare`, `July QA`,
 *   `a new membership`, `Cheapos`, `Jeremy Weekday Mem`, `testing` — test rows
 *   sitting beside the real ones, with no way to tell which is which.
 * - **The prices do not describe anything.** `$0.00` on four of them,
 *   `$611.25` on *Free Punches*, `$999.00` on *Limited Member*, and
 *   **`-$490.20`** on *Monthly Credit* — a negative line in a selling screen.
 * - **The form prices the membership twice.** The tile says $1.00; the form
 *   opens on `Enter price before tax $0.32`, and the tile's figure is never
 *   shown again.
 * - **`First month type / Prorated` is a read-only sentence** in a column of
 *   fields, with no control and no explanation of what prorating did to the
 *   $0.32.
 * - **`Enter quantity to pay for now`** asks a billing question in a text box,
 *   on the same screen as the customer's name.
 * - **Golf Course Customer ID fills itself in grey** once a customer is found,
 *   and stays greyed, so it reads as disabled rather than as an answer.
 */

export interface Membership {
    name: string;
    price: number;
    /** Which group tile it sits under. */
    group: string;
    /** The device draws the course logo when a membership has no photo. */
    photo: boolean;
}

/** The two group tiles above the grid. They are filters, drawn as products. */
export const membershipGroups = [
    { name: "Golf", logo: "cedar-rapids" },
    { name: "testing", logo: "antler" },
];

/**
 * The grid, read down the three columns as the device lays it out.
 *
 * Everything here is on the reference device. The names are not invented and
 * neither are the prices, including the negative one.
 */
export const memberships: Membership[] = [
    { name: "30 Day booking window", price: 30.0, group: "Golf", photo: true },
    { name: "a new membership", price: 25.0, group: "Golf", photo: true },
    { name: "Accounts Adjustment", price: 0.98, group: "Golf", photo: false },
    { name: "Beta Compare", price: 1.0, group: "Golf", photo: false },
    { name: "Birdie Membership", price: 1.0, group: "Golf", photo: true },
    { name: "Brennevin Discounts Membership", price: 200.0, group: "Golf", photo: true },
    { name: "Cheapos", price: 50.0, group: "Golf", photo: true },
    { name: "edgewater ultra membership", price: 449.44, group: "Golf", photo: true },
    { name: "Fox Meadows", price: 125.0, group: "Golf", photo: false },
    { name: "Free Punches", price: 611.25, group: "Golf", photo: true },
    { name: "Gold Punch Membership", price: 0.9, group: "Golf", photo: true },
    { name: "Guest Punch Card", price: 5.0, group: "Golf", photo: false },
    { name: "Jeremy Weekday Mem", price: 0.0, group: "Golf", photo: true },
    { name: "July QA", price: 0.0, group: "Golf", photo: true },
    { name: "Limited Member", price: 999.0, group: "Golf", photo: false },
    { name: "membership 3 guest pass", price: 23.31, group: "Golf", photo: true },
    { name: "Monthly Credit", price: -490.2, group: "Golf", photo: false },
    { name: "Non-resident", price: 0.0, group: "Golf", photo: true },
];

/** What the `testing` tile filters down to. Two rows, one of them free. */
export const testingMemberships: Membership[] = [
    { name: "20 Day Booking window", price: 0.0, group: "testing", photo: true },
    { name: "Austin Membership", price: 1.0, group: "testing", photo: false },
];

/** The membership the captures sell. Its tile says $1.00. */
export const soldMembership = testingMemberships[1];

/**
 * The form's own fields, in the order the device lays them out — two columns,
 * left then right, with the read-only sentence last.
 */
export const membershipFields = [
    { key: "first", label: "First Name", searchable: true },
    { key: "last", label: "Last Name", searchable: true },
    { key: "email", label: "Email", searchable: true, full: true },
    { key: "phone", label: "Phone", searchable: true },
    { key: "member", label: "Member Number", searchable: true },
    { key: "price", label: "Enter price before tax", searchable: false },
    { key: "customerId", label: "Golf Course Customer ID", searchable: false },
    { key: "quantity", label: "Enter quantity to pay for now", searchable: false },
];

/** The customer the captures attach, and what the search filled in. */
export const membershipCustomer = {
    first: "Justin",
    last: "Bednarz",
    email: "justin@tenfore.golf",
    phone: "7327429353",
    /** Left empty on the device even after the customer was found. */
    memberNumber: "",
    customerId: "165492",
};

/** The form's defaults. The price is not the tile's price. */
export const membershipDefaults = {
    price: "$0.32",
    quantity: "1",
    firstMonthType: "Prorated",
};

/** The ticket the membership produces: $0.32 plus tax and fees, to the cent. */
export const membershipTotals = { subtotal: 0.32, tax: 0.03, fees: 0.01, total: 0.36 };
