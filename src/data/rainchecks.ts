/**
 * Rainchecks — issued against a round, redeemed at the register.
 *
 * From `references/072926/2-teesheet/` (the create screen) and
 * `references/072926/checkoutScreens/` (the RAIN tender).
 *
 * Two screens, one object, and they are usually built as if they were unrelated.
 * A raincheck starts life on a booking the weather cut short: the counter opens
 * the round, says how many holes were actually played, and the terminal credits
 * the rest. Days later someone walks up to the register, the operator finds that
 * credit by name, and it pays for something else entirely. Modelling it as one
 * record with a balance — rather than a "raincheck flag" on the round plus a
 * discount at checkout — is what makes the second screen able to find the first
 * one's work.
 *
 * The pricing rule is the interesting part, and it is proportional rather than
 * pro-rata-with-a-floor: an 18-hole round abandoned after 5 holes is worth
 * 13/18 of what was paid, printed `$72.22 (72%)`. Note what that means at the
 * edges — 0 holes played returns the whole round, and 17 played still returns
 * 1/18. There is no option to say 18, because a completed round has nothing to
 * give back.
 */

import { customers as defaultCustomers, type Customer } from "./crm";

export interface Raincheck {
    /** The TenFore Raincheck ID, as the register's lookup prints it. */
    id: string;
    customerId: string;
    /** Denormalised so the register can list results without joining. */
    customerName: string;
    email?: string;
    /** The reservation it was cut from — the only link back to the round. */
    reservation: string;
    /**
     * The round itself: date and tee time, as `5/12/2026 7:10 AM`.
     *
     * Carried on the credit rather than looked up, because the sheet for that
     * day will not be loaded when the register goes looking — and a credit whose
     * origin cannot be named is one nobody can check. "Raincheck 51381, $72.22"
     * settles nothing with a customer; "the 7:00 PM on July 20th" settles it.
     */
    teeTime?: string;
    /** When the credit was cut, which is not when the round was. */
    issued: string;
    expires: string;
    /** What the round cost, before any of this. */
    roundPrice: number;
    totalHoles: number;
    holesPlayed: number;
    /** Face value at issue. */
    awarded: number;
    spent: number;
    balance: number;
}

/**
 * The share of the round being returned.
 *
 * Holes *played* are the ones already consumed, so the credit is what is left.
 */
export const raincheckFraction = (totalHoles: number, holesPlayed: number) =>
    totalHoles <= 0 ? 0 : Math.max(0, totalHoles - holesPlayed) / totalHoles;

export const raincheckValue = (roundPrice: number, totalHoles: number, holesPlayed: number) =>
    +(roundPrice * raincheckFraction(totalHoles, holesPlayed)).toFixed(2);

/**
 * The `(72%)` after the amount.
 *
 * Rounded to a whole number even though the amount behind it is not — 13/18 is
 * 72.22%, shown as 72%, against $72.22. The two look like the same number here
 * only because the round cost exactly $100.
 */
export const raincheckPercentLabel = (totalHoles: number, holesPlayed: number) =>
    `${Math.round(raincheckFraction(totalHoles, holesPlayed) * 100)}%`;

/**
 * The radio options on the create screen: every hole count *except* the last.
 *
 * 18 holes offers 0–17. Playing all 18 is not a raincheck.
 */
export const holesPlayedOptions = (totalHoles: number) => Array.from({ length: Math.max(1, totalHoles) }, (_, i) => i);

/** Deterministic pseudo-random. Same generator as the tee sheet and the CRM. */
const rng = (seed: number) => () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
};

const pad = (n: number, len = 2) => String(n).padStart(len, "0");

const dateString = (rand: () => number, yearFrom: number, yearTo: number) =>
    `${pad(1 + Math.floor(rand() * 12))}/${pad(1 + Math.floor(rand() * 28))}/${yearFrom + Math.floor(rand() * (yearTo - yearFrom + 1))}`;

/** A round's date and tee time, as the sheet and the profile both print it. */
const teeTimeString = (rand: () => number) => {
    const hour = 6 + Math.floor(rand() * 13);
    const minute = Math.floor(rand() * 4) * 15;
    return `${1 + Math.floor(rand() * 12)}/${1 + Math.floor(rand() * 28)}/2026 ${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"}`;
};

/**
 * The two rainchecks the reference screenshots show on the register.
 *
 * Pinned rather than generated so the demo path in the prototype is the same one
 * in the screenshots: search "Weston", get exactly these two chips, and the
 * $72.22 one is the round cut after 5 holes on the create screen.
 */
const PINNED: Omit<Raincheck, "customerId" | "customerName" | "email">[] = [
    {
        id: "41331",
        reservation: "10298114",
        teeTime: "6/14/2026 8:20 AM",
        issued: "06/14/2026",
        expires: "06/14/2027",
        roundPrice: 103.9,
        totalHoles: 18,
        holesPlayed: 0,
        awarded: 103.9,
        spent: 0,
        balance: 103.9,
    },
    {
        id: "51381",
        reservation: "10314910",
        // The round in the reference screenshots: Monday, July 20 2026, 7:00 PM.
        teeTime: "7/20/2026 7:00 PM",
        issued: "07/20/2026",
        expires: "07/20/2027",
        roundPrice: 100,
        totalHoles: 18,
        holesPlayed: 5,
        awarded: 72.22,
        spent: 0,
        balance: 72.22,
    },
];

/**
 * Builds the raincheck ledger.
 *
 * Sparse on purpose — most golfers have never had one, so a database where every
 * customer carries a credit would make the register's lookup look far easier
 * than it is. The interesting cases are the customer holding two at once (which
 * forces the chip picker to exist at all) and the partly-spent one.
 */
export function buildRainchecks(list: Customer[] = defaultCustomers, seed = 41): Raincheck[] {
    const rand = rng(seed);
    let id = 51400;

    const owner = list.find((c) => c.email.includes("+senior@")) ?? list[0];
    const pinned = PINNED.map((r) => ({
        ...r,
        customerId: owner.id,
        customerName: owner.displayName,
        email: owner.email,
    }));

    const generated = list.flatMap((c) => {
        if (c.id === owner.id || rand() > 0.14) return [];
        const roundPrice = +(28 + rand() * 90).toFixed(2);
        const totalHoles = rand() > 0.8 ? 9 : 18;
        const holesPlayed = Math.floor(rand() * totalHoles);
        const awarded = raincheckValue(roundPrice, totalHoles, holesPlayed);
        // A third have already been partly spent — a raincheck is not all-or-
        // nothing, and a lookup that only ever shows full balances hides that.
        const spent = rand() > 0.66 ? +(awarded * rand() * 0.8).toFixed(2) : 0;
        return [
            {
                id: String(id++),
                customerId: c.id,
                customerName: c.displayName,
                email: c.email,
                reservation: String(10290000 + Math.floor(rand() * 40000)),
                teeTime: teeTimeString(rand),
                issued: dateString(rand, 2026, 2026),
                expires: dateString(rand, 2027, 2027),
                roundPrice,
                totalHoles,
                holesPlayed,
                awarded,
                spent,
                balance: +(awarded - spent).toFixed(2),
            },
        ];
    });

    return [...pinned, ...generated];
}

export const rainchecks = buildRainchecks();

/**
 * The register's RAIN lookup.
 *
 * Matches the raincheck id, the customer's name and their email, because that is
 * exactly what the field promises: "Enter Raincheck id, customer name, or email".
 * Spent-out rainchecks are filtered rather than shown greyed — a zero balance
 * tenders nothing, and offering it as a chip only invites the tap.
 */
export function searchRainchecks(query: string, list: Raincheck[] = rainchecks, limit = 6): Raincheck[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return list
        .filter((r) => r.balance > 0)
        .filter((r) => r.id.includes(q) || r.customerName.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q))
        .slice(0, limit);
}

export const raincheckById = (id: string, list: Raincheck[] = rainchecks) => list.find((r) => r.id === id) ?? null;

/** Next id in sequence, so a raincheck created in the prototype gets a plausible one. */
export const nextRaincheckId = (list: Raincheck[]) =>
    String(list.reduce((max, r) => Math.max(max, Number(r.id) || 0), 51400) + 1);
