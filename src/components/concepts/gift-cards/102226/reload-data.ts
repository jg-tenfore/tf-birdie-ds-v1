import { demoCustomer, type DemoCustomer } from "@/components/screens/clinics/demo-customer";

/**
 * **Oct 22 — reloading a gift card.**
 *
 * New functionality. Weston:
 *
 * > *"I think we need another option… able to **reload** a gift card. It would
 * > be different than this page, because you would be searching for a customer
 * > name or UPC code, for the gift card or gift card ID. You would click on it,
 * > **because they could have multiple**. And then you would put the amount
 * > that you want to add to it."*
 *
 * And on what it is not:
 *
 * > *"So you're not adjusting the balance like a manual adjustment or doing
 * > anything like that? It's just, hey, I want to reload this."* → *"Correct…
 * > it'll just be another **incoming order** that adds value to that card."*
 *
 * So: find the card, add money, pay for it like anything else. The balance
 * moves because a sale happened, not because someone edited a number — which
 * is the difference between a till and a ledger, and the reason this cannot
 * just be an editable balance field.
 *
 * These cards are invented. The two things that are not: a customer can hold
 * **several**, and a card is found by **customer name or by code**.
 */

export interface GiftCardRecord {
    /** What the receipt and the lookup table print. */
    code: string;
    holder: DemoCustomer;
    balance: number;
    /** What the card was worth when it was sold. */
    issued: number;
    lastUsed: string;
    expires: string;
}

const justin = demoCustomer(0);
const avery = demoCustomer(1);
const maya = demoCustomer(2);

/**
 * Justin holds three, which is the case Weston named — *"because they could
 * have multiple"* — and the reason a search cannot just return one card and
 * open it.
 *
 * One of them is empty. A spent card is exactly what someone asks to reload:
 * *"oh, I'm at $25, can I make this to $100?"*
 */
export const giftCardRecords: GiftCardRecord[] = [
    { code: "7741 0032 8890", holder: justin, balance: 25.0, issued: 200.0, lastUsed: "10/14/26", expires: "AUGUST 20 2122" },
    { code: "7741 0044 1127", holder: justin, balance: 0.0, issued: 50.0, lastUsed: "9/28/26", expires: "AUGUST 20 2122" },
    { code: "7741 0051 6603", holder: justin, balance: 118.5, issued: 150.0, lastUsed: "10/19/26", expires: "AUGUST 20 2122" },
    { code: "7741 0063 2214", holder: avery, balance: 75.0, issued: 100.0, lastUsed: "10/2/26", expires: "AUGUST 20 2122" },
    { code: "7741 0078 9045", holder: maya, balance: 12.25, issued: 25.0, lastUsed: "10/20/26", expires: "AUGUST 20 2122" },
];

export const cardsFor = (customer: DemoCustomer): GiftCardRecord[] =>
    giftCardRecords.filter((card) => card.holder.customerId === customer.customerId);

/** Name, email, phone or code — the four ways Weston named, loosely matched. */
export const findCards = (query: string): GiftCardRecord[] => {
    const needle = query.trim().toLowerCase().replace(/\s+/g, "");
    if (!needle) return [];

    return giftCardRecords.filter((card) =>
        `${card.holder.first}${card.holder.last}${card.holder.email}${card.holder.phone}${card.code}`
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(needle),
    );
};

/** What a reload is worth, and the quick amounts a counter reaches for. */
export const reloadPresets = [25, 50, 100, 250];

export const reloadAmount = "100.00";

export const usd = (value: number): string => `$${value.toFixed(2)}`;
