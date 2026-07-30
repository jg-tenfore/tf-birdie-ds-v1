/**
 * The customer database behind Customer Search.
 *
 * Lives in the design system, like the tee sheet fixtures, so a flow proven in
 * the prototype can be turned into a story without retyping its data.
 *
 * A hundred records rather than a handful, because the interesting problems in
 * this screen only appear at volume: several people sharing a phone number, the
 * same first name on six rows, a member and their guest account being nearly
 * indistinguishable, and names long enough to truncate. A six-row fixture makes
 * the search look easy when it is not.
 *
 * Everything is generated deterministically — the smoke tests assert against
 * these records, and a database that reshuffles on reload makes any screenshot
 * comparison worthless.
 */

export interface Membership {
    name: string;
    expires: string;
}

export interface CrmGiftCard {
    id: string;
    type: "Purchased" | "Winnings";
    expires: string;
    awarded: number;
    spent: number;
    balance: number;
    upc: string;
}

export interface CrmTeeTime {
    id: string;
    date: string;
    players: number;
}

export interface CrmPunchCard {
    name: string;
    remaining: number;
    total: number;
    expires: string;
}

export interface Customer {
    /** Internal id, printed as `Customer ID` in General Info. */
    id: string;
    /** The course's own id for the same person — they are not the same number. */
    courseId: string;
    firstName: string;
    lastName: string;
    /**
     * How the search results print them. Membership and customer-type suffixes
     * are part of the name on the device rather than a separate column, which is
     * why two records for one person can look like two different people.
     */
    displayName: string;
    /** A short code some records carry, shown bold-italic above the name. */
    tag?: string;
    email: string;
    phone?: string;
    birthday?: string;
    notes?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    memberships: Membership[];
    customerTypes: string[];
    giftCards: CrmGiftCard[];
    teeTimes: CrmTeeTime[];
    punchCards: CrmPunchCard[];
    rewardsBalance: number;
    /** Positive means they owe the course. */
    balance: number;
    cardOnFile?: string;
    cardExpires?: string;
}

/** Every type the course has configured. Records select a subset. */
export const CUSTOMER_TYPES = [
    "Senior",
    "Military",
    "Resident",
    "Private Cart",
    "Diamond",
    "New Deal",
    "Guest of Members",
    "Hero",
    "premium single",
    "Resident 22 Test",
    "Austin Test",
    "Test percent off",
    "Simp",
] as const;

const MEMBERSHIP_NAMES = [
    "30 Day booking window",
    "Full Golf",
    "Weekday Golf",
    "Social",
    "Junior",
    "Corporate — 4 seat",
    "Trial Month",
] as const;

const FIRST = [
    "Weston", "Tony", "Randy", "Tom", "Oda", "Ivar", "Rufus", "Igor", "Marissa", "Priya",
    "Chris", "Kelsey", "Dermot", "Ana", "Hugh", "Nadia", "Owen", "Simone", "Callum", "Ines",
    "Bao", "Grete", "Milo", "Rosa", "Teo", "Wren", "Amara", "Dov", "Fionn", "Suri",
] as const;

const LAST = [
    "Farnsworth", "Finau", "Orton", "Watson", "Brennevin", "Kuznetsov", "Chen", "Raman", "Moreno", "Sutton",
    "Doyle", "Hamlet", "Okafor", "Lindqvist", "Baptiste", "Nakamura", "Achebe", "Vasquez", "Delgado", "Halloran",
    "Petrov", "Ferreira", "Nguyen", "Mbeki", "Salvatore", "Kaur", "Bergstrom", "Ito", "Marchetti", "Osei",
] as const;

const CITIES = [
    ["Bethesda", "MD", "20814"],
    ["Rockville", "MD", "20850"],
    ["Silver Spring", "MD", "20901"],
    ["Potomac", "MD", "20854"],
    ["Arlington", "VA", "22201"],
    ["Alexandria", "VA", "22314"],
] as const;

const NOTE_POOL = [
    "free golf for life",
    "prefers the 7:40 time",
    "walks — never wants a cart",
    "left-handed rental clubs",
    "always pays on account",
    "do not seat near the bar",
    "wife's birthday in June — comp dessert",
    "has a standing Saturday foursome",
    "",
    "",
] as const;

const STREETS = ["N/A", "18 Fairway Ln", "402 Bunker Rd", "77 Greenside Ct", "1201 Tee Box Way", "9 Dogleg Dr"] as const;

/**
 * Deterministic pseudo-random. See the same note in `tee-sheet.ts` — the records
 * must be byte-identical on every run.
 */
const rng = (seed: number) => () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
};

const pad = (n: number, len = 2) => String(n).padStart(len, "0");

const dateString = (rand: () => number, yearFrom: number, yearTo: number) =>
    `${pad(1 + Math.floor(rand() * 12))}/${pad(1 + Math.floor(rand() * 28))}/${yearFrom + Math.floor(rand() * (yearTo - yearFrom + 1))}`;

/** Builds the customer database. */
export function buildCustomers(count = 100, seed = 13): Customer[] {
    const rand = rng(seed);
    let customerId = 458336;
    let courseId = 313489;
    let giftCardId = 261900;
    let teeTimeId = 9024700;

    return Array.from({ length: count }, (_, index) => {
        const firstName = FIRST[index % FIRST.length];
        const lastName = LAST[Math.floor(index / FIRST.length + index * 7) % LAST.length];

        const memberships: Membership[] =
            rand() > 0.55
                ? [
                      {
                          name: MEMBERSHIP_NAMES[Math.floor(rand() * MEMBERSHIP_NAMES.length)],
                          expires: dateString(rand, 2026, 2028),
                      },
                  ]
                : [];

        const types = CUSTOMER_TYPES.filter(() => rand() > 0.86);

        // The suffix is part of the printed name, not a separate field. A member
        // and their guest account differ only by a "G-" prefix on the device,
        // which is exactly how staff pick the wrong one.
        const suffix = memberships[0]?.name ?? types[0] ?? "";
        const displayName = suffix ? `${firstName} ${lastName} - ${suffix}` : `${firstName} ${lastName}`;

        const [city, state, zip] = CITIES[Math.floor(rand() * CITIES.length)];
        // Shared phone numbers are common — a household books under one number.
        const phone = rand() > 0.12 ? `801${pad(Math.floor(rand() * 10000000), 7)}` : undefined;

        const giftCards: CrmGiftCard[] = Array.from({ length: Math.floor(rand() * 3) }, () => {
            const awarded = [25, 50, 100, 175, 200, 800][Math.floor(rand() * 6)];
            const spent = rand() > 0.6 ? +(awarded * rand()).toFixed(2) : 0;
            const id = String(giftCardId++);
            return {
                id,
                type: rand() > 0.5 ? "Purchased" : "Winnings",
                expires: dateString(rand, 2027, 2032),
                awarded,
                spent,
                balance: +(awarded - spent).toFixed(2),
                upc: rand() > 0.4 ? `${Math.floor(rand() * 900000 + 100000)}807261` : "",
            };
        });

        const teeTimes: CrmTeeTime[] = Array.from({ length: Math.floor(rand() * 12) }, () => {
            const hour = 6 + Math.floor(rand() * 12);
            return {
                id: String(teeTimeId++),
                date: `${dateString(rand, 2026, 2026)} ${hour % 12 || 12}:${pad(Math.floor(rand() * 4) * 15)} ${hour < 12 ? "AM" : "PM"}`,
                players: 1 + Math.floor(rand() * 4),
            };
        });

        const punchCards: CrmPunchCard[] = Array.from({ length: rand() > 0.75 ? 1 : 0 }, () => {
            const total = [5, 10, 20][Math.floor(rand() * 3)];
            return {
                name: `${total}-Round Punch Card`,
                remaining: Math.floor(rand() * (total + 1)),
                total,
                expires: dateString(rand, 2026, 2027),
            };
        });

        const hasCard = rand() > 0.35;

        return {
            id: String(customerId++),
            courseId: String(courseId++),
            firstName,
            lastName,
            displayName,
            tag: rand() > 0.92 ? `(tr${Math.floor(rand() * 900 + 100)})` : undefined,
            // The device's own records use plus-addressing heavily because they
            // are test accounts; keeping that makes search behave realistically.
            email:
                rand() > 0.7
                    ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}+${index}@tenfore.golf`
                    : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            phone,
            birthday: rand() > 0.6 ? dateString(rand, 1948, 2004) : undefined,
            notes: NOTE_POOL[Math.floor(rand() * NOTE_POOL.length)] || undefined,
            street: STREETS[Math.floor(rand() * STREETS.length)],
            city: rand() > 0.15 ? city : "N/A",
            state,
            zip: rand() > 0.25 ? zip : undefined,
            memberships,
            customerTypes: [...types],
            giftCards,
            teeTimes,
            punchCards,
            rewardsBalance: Math.floor(rand() * 3000),
            balance: rand() > 0.7 ? +(rand() * 2500).toFixed(2) : 0,
            cardOnFile: hasCard ? String(Math.floor(rand() * 9000 + 1000)) : undefined,
            cardExpires: hasCard ? `${pad(1 + Math.floor(rand() * 12))}/${2027 + Math.floor(rand() * 15)}` : undefined,
        };
    });
}

export const customers = buildCustomers();

/**
 * The lookup the search field runs.
 *
 * Matches name, email and phone, because that is what the placeholder promises.
 * Results are capped — the device returns everything and the list just keeps
 * going, which is fine on a real CRM but makes a demo look broken when a
 * two-letter query returns ninety rows.
 */
export function searchCustomers(query: string, limit = 8): Customer[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return customers
        .filter(
            (c) =>
                c.displayName.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone ?? "").includes(q) ||
                c.id.includes(q),
        )
        .slice(0, limit);
}

export const customerById = (id: string) => customers.find((c) => c.id === id) ?? null;
