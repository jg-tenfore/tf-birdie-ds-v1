/**
 * **Selling a gift card, as it ships.** Transcribed from
 * `references/102226/giftCards/`.
 *
 * One screen does the whole job: an amount, an optional barcode, a type, an
 * expiry, two four-field customer searches, and four category switches. Then
 * SAVE drops a single line in the order and the ordinary tender screen takes
 * the money.
 *
 * What the captures record, kept rather than corrected:
 *
 * - **The amount field has no label.** It is the largest control on the screen
 *   and the only way to learn what it is for is to tap it and watch a number
 *   keypad come up.
 * - **The expiry defaults to `AUGUST 19 2122`** — ninety-six years out. Nothing
 *   says whether that is a house policy, a sentinel for "never", or a bug.
 * - **Eight search fields, none of them marked required.** The TO block shows
 *   red error icons on Email and Phone *while a customer is being chosen*, and
 *   they clear only once the record is picked.
 * - **The search results are the database, unfiltered**: `Fake Name`,
 *   `buster douglas`, `pee@poo.com`, `BLOCK Tournament`, and four Weston
 *   Farnsworth records that differ only by a `+tag` on the same address. No
 *   member number, no last visit, nothing to tell them apart by.
 * - **Four category checkboxes, all on, never explained.** Unchecking Alcohol
 *   presumably stops the card paying for it; the screen does not say so.
 * - **`Same as From` is a dark button** sitting where a secondary action goes,
 *   doing a copy rather than a navigation.
 * - **SAVE opens a dialog about UPC codes** that explains a server behaviour,
 *   with CANCEL in red and OK in green.
 * - **No tax.** The ticket reads SubTotal $200.00, Grand Total $200.00.
 */

export interface GiftCardParty {
    first: string;
    last: string;
    email: string;
    phone: string;
    /** The device prints `0` until a record is attached. */
    customerId: string;
    /** The name the header prints once the record is attached. */
    accountName: string;
}

/**
 * **The three types in the dropdown**, from the Oct 22 capture.
 *
 * Weston, asked whether the three behave differently:
 *
 * > *"No, it's just the type… it doesn't add anything… it's mostly for
 * > reporting purposes. **They act the same.**"*
 *
 * So this control changes one thing: which bucket the sale lands in on a
 * report. All three take money, all three use the same amount box, the same
 * two customer searches and the same green SAVE.
 *
 * Which is worth stating plainly, because it reads like a behaviour switch and
 * is not one. A counter looking at this screen has no way to know that picking
 * `Winnings` instead of `Purchased Gift Card` changes nothing they can see —
 * and no way to know it matters to someone in the back office who will never
 * stand here.
 */
export const giftCardTypes = ["Purchased Gift Card", "Customer Credit", "Winnings"] as const;

export type GiftCardType = (typeof giftCardTypes)[number];

/**
 * **The expiry is computed, not fixed.**
 *
 * The Oct 21 captures read `AUGUST 19 2122`; the Oct 22 one reads
 * `AUGUST 20 2122`. It moves a day when the clock does, so it is derived from
 * today rather than being a stored sentinel — roughly ninety-six years out, by
 * a formula nothing on screen explains.
 *
 * Either way it is nobody's intent, and it is already filled in before the
 * operator has entered an amount.
 */
export const defaultExpiration = "AUGUST 20 2122";

/** All four on, every capture, with nothing on screen about what they gate. */
export const spendCategories = ["Merchandise", "Food and Beverage", "Tee Fees", "Alcohol"];

/** The buyer, as the device filled it from a phone-number search. */
export const giftCardFrom: GiftCardParty = {
    first: "Justin",
    last: "Girard",
    email: "hello@girardjustin.com",
    phone: "6174707879",
    customerId: "1499612",
    accountName: "Justin Girard",
};

/** The recipient, chosen from the Weston search. */
export const giftCardTo: GiftCardParty = {
    first: "Weston",
    last: "Farnsworth",
    email: "weston.farnsworth+senior@tenfore.golf",
    phone: "8017084153",
    customerId: "423505",
    accountName: "Weston Senior",
};

export interface CustomerResult {
    name: string;
    email?: string;
    phone?: string;
    /** The device prints a bare code above the first row. Nothing explains it. */
    tag?: string;
}

/** Typing a phone number into the FROM block. One hit. */
export const fromSearchResults: CustomerResult[] = [{ name: "Justin Girard", email: "hello@girardjustin.com", phone: "6174707879" }];

/**
 * Typing `Weston` into the TO block.
 *
 * Six records, four of them the same person with a different `+tag`, one of
 * them named for a booking-window setting rather than a human.
 */
export const toSearchResults: CustomerResult[] = [
    { tag: "(tr456)", name: "Weston Farnsworth - 30 Day booking window", email: "weston.farnsworth@tenfore.golf", phone: "8017084153" },
    { name: "Weston Senior - Senior", email: "weston.farnsworth+senior@tenfore.golf" },
    { name: "Randy Orton", email: "weston.farnsworth+randy@tenfore.golf" },
    { name: "Weston TenForeTest", email: "weston.farnsworth+MCGGOLF@tenfore.golf" },
    { name: "Tom Watson", email: "weston.farnsworth+tomwatson@tenfore.golf", phone: "8015962658" },
    { name: "Weston Farnsworth Golf Buddy", email: "wfarnsworth4@gmail.com", phone: "8017084153" },
];

/** Typing a phone number into the TO block. The database, unedited. */
export const phoneSearchResults: CustomerResult[] = [
    { name: "BLOCK Tournament", phone: "8888888899" },
    { name: "Fake Name", email: "ajahshdndnaj@gmail.com", phone: "8888888888" },
    { name: "Clark Finad", email: "mcgd@gmail.com", phone: "8888888888" },
    { name: "buster douglas", email: "pee@poo.com", phone: "8888888888" },
];

/** The dialog SAVE opens when the UPC box was left empty. */
export const upcDialog = {
    title: "UPC was not provided",
    body: "UPC was not provided, if you continue the server will assign a unique generated UPC code that will be printed on the customer receipt.",
    cancel: "CANCEL",
    confirm: "OK",
};

/** What the sale is worth in the captures. */
export const giftCardAmount = "200.00";

/** The order line SAVE produces: the words `Gift Card`, and the face value. */
export const giftCardOrderLine = { id: "gift-card", name: "Gift Card", qty: 1, price: "$200.00" };

/** The ticket. A gift card is not taxed, so the two figures match. */
export const giftCardTotals = { subtotal: 200, tax: 0, total: 200 };
