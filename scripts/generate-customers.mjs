/**
 * Builds `src/data/customers.json` — the prototype's customer database.
 *
 * Run with `npm run generate:customers`. The output is committed, and the
 * committed file is what the app reads: this script exists so the database can
 * be regrown or extended, not so it can be rebuilt at boot. That matters because
 * the tee sheet, the raincheck ledger and the smoke tests all assert against
 * specific people, and a database that reshuffles makes every one of those
 * assertions meaningless.
 *
 * The first seventeen records are pinned. They are the people who already appear
 * on the tee sheet and in the reference screenshots, so a name on a booking
 * resolves to a real record rather than to a string that happens to look like
 * one. Everything after them is generated to fill the database out to a hundred,
 * because the interesting problems in Customer Search only appear at volume:
 * shared phone numbers, six people with the same first name, a member and their
 * guest account one character apart.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "customers.json");

/** Deterministic pseudo-random — the same LCG the tee sheet uses. */
const rng = (seed) => () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
};

const pad = (n, len = 2) => String(n).padStart(len, "0");

const dateString = (rand, from, to) =>
    `${pad(1 + Math.floor(rand() * 12))}/${pad(1 + Math.floor(rand() * 28))}/${from + Math.floor(rand() * (to - from + 1))}`;

/**
 * Every type the course has configured, in the order the new-customer form lays
 * them out: four columns, filled left to right.
 */
const CUSTOMER_TYPES = [
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
    "Employee",
    "Campaign Testers",
    "Wonderful Person",
    "Average Person",
];

const MEMBERSHIPS = ["30 Day booking window", "Full Golf", "Weekday Golf", "Social", "Junior", "Corporate — 4 seat", "Trial Month"];

/**
 * The people already on the tee sheet.
 *
 * `sheet` is how the booking prints them, which is not always their name — the
 * course abbreviates some regulars to "Sutton, K." and prefixes guest accounts
 * with "G-". Without this column a booking cannot be matched to a record, which
 * is exactly the state the prototype was in.
 */
const PINNED = [
    { first: "Oda", last: "Brennevin", membership: "Full Golf", phone: "8017084153", notes: "has a standing Saturday foursome" },
    { first: "Ivar", last: "Brennevin", membership: "Full Golf", phone: "8017084153", types: ["Senior"] },
    { first: "Rufus", last: "Brennevin", phone: "8017084153", types: ["Junior"], notes: "left-handed rental clubs" },
    {
        first: "Oda",
        last: "Brennevin",
        sheet: "G-Oda Brennevin",
        display: "G-Oda Brennevin - Guest of Members",
        types: ["Guest of Members"],
        phone: "8017084153",
    },
    { first: "Igor", last: "Kuznetsov", membership: "Weekday Golf", phone: "8015540982" },
    {
        first: "Igor",
        last: "Kuznetsov",
        sheet: "G-Igor Kuznetsov",
        display: "G-Igor Kuznetsov - Guest of Members",
        types: ["Guest of Members"],
        phone: "8015540982",
    },
    {
        first: "Weston",
        last: "Farnsworth",
        membership: "30 Day booking window",
        tag: "(tr456)",
        phone: "8017084153",
        email: "weston.farnsworth@tenfore.golf",
        notes: "free golf for life",
    },
    { first: "Tony", last: "Finau", types: ["Diamond"], phone: "8013758144" },
    { first: "Randy", last: "Orton", membership: "Social", phone: "8019457787", notes: "prefers the 7:40 time" },
    { first: "Tom", last: "Watson", types: ["Senior", "Hero"], phone: "8012630392" },
    { first: "Marissa", last: "Chen", membership: "Weekday Golf", phone: "8014402219" },
    { first: "Priya", last: "Raman", types: ["Resident"], phone: "8018871046" },
    { first: "Chris", last: "Moreno", types: ["Employee"], phone: "8013320765", notes: "always pays on account" },
    { first: "Kelsey", last: "Sutton", sheet: "Sutton, K.", membership: "Corporate — 4 seat", phone: "8016604417" },
    {
        first: "Fiona",
        last: "Doyle",
        sheet: "Doyle, F.",
        types: ["Resident", "Military"],
        phone: "8012248830",
        notes: "walks — never wants a cart",
    },
    { first: "Jonah", last: "Hamlet", sheet: "Hamlet, J.", membership: "Trial Month", phone: "8017719305" },
    // The account every reference screenshot runs through. A plus-addressed test
    // record rather than a person, which is why the name is a rate.
    {
        first: "Weston",
        last: "Senior",
        display: "Weston Senior",
        membership: "Full Golf",
        types: ["Senior"],
        email: "weston.farnsworth+senior@tenfore.golf",
        phone: "8015550142",
        notes: "prefers the 7:40 time",
    },
];

const FIRST = [
    "Amara",
    "Bao",
    "Callum",
    "Dermot",
    "Dov",
    "Elena",
    "Fionn",
    "Grete",
    "Hugh",
    "Ines",
    "Jonas",
    "Kelsey",
    "Lars",
    "Milo",
    "Nadia",
    "Owen",
    "Petra",
    "Quinn",
    "Rosa",
    "Simone",
    "Teo",
    "Ursula",
    "Viggo",
    "Wren",
    "Xiomara",
    "Yusuf",
    "Zara",
    "Anders",
    "Beatriz",
    "Caleb",
];

const LAST = [
    "Achebe",
    "Baptiste",
    "Bergstrom",
    "Delgado",
    "Ferreira",
    "Halloran",
    "Ito",
    "Kaur",
    "Lindqvist",
    "Marchetti",
    "Mbeki",
    "Nakamura",
    "Nguyen",
    "Okafor",
    "Osei",
    "Petrov",
    "Salvatore",
    "Vasquez",
    "Whitfield",
    "Zeller",
];

const CITIES = [
    ["Bethesda", "MD", "20814"],
    ["Rockville", "MD", "20850"],
    ["Silver Spring", "MD", "20901"],
    ["Potomac", "MD", "20854"],
    ["Arlington", "VA", "22201"],
    ["Alexandria", "VA", "22314"],
];

const STREETS = ["18 Fairway Ln", "402 Bunker Rd", "77 Greenside Ct", "1201 Tee Box Way", "9 Dogleg Dr", "N/A"];

const NOTES = [
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
    "",
    "",
];

const DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "aol.com", "sbcglobal.net", "att.net"];

const rand = rng(13);

let customerId = 458336;
let courseId = 313489;
let giftCardId = 261900;
let teeTimeId = 9024700;

const build = (spec, index) => {
    const first = spec.first;
    const last = spec.last;
    const memberships = spec.membership ? [{ name: spec.membership, expires: dateString(rand, 2026, 2028) }] : [];
    const types = spec.types ?? [];
    const suffix = spec.membership ?? types[0] ?? "";
    const plain = `${first} ${last}`;

    const [city, state, zip] = CITIES[Math.floor(rand() * CITIES.length)];

    // Stored value. Sparse — most golfers have never had a gift card, and a
    // database where everyone holds one makes the till look easier than it is.
    const giftCards = Array.from({ length: rand() > 0.78 ? 1 + Math.floor(rand() * 2) : 0 }, () => {
        const awarded = [25, 50, 100, 175, 200, 800][Math.floor(rand() * 6)];
        const spent = rand() > 0.6 ? +(awarded * rand()).toFixed(2) : 0;
        return {
            id: String(giftCardId++),
            type: rand() > 0.5 ? "Purchased" : "Winnings",
            expires: dateString(rand, 2027, 2032),
            awarded,
            spent,
            balance: +(awarded - spent).toFixed(2),
            upc: rand() > 0.4 ? `${Math.floor(rand() * 900000 + 100000)}807261` : "",
        };
    });

    // Rounds already played. Live bookings come from the tee sheets instead —
    // this is the archive, and it is what makes a long-standing member look
    // different from a walk-up.
    const teeTimes = Array.from({ length: Math.floor(rand() * 14) }, () => {
        const hour = 6 + Math.floor(rand() * 12);
        return {
            id: String(teeTimeId++),
            date: `${dateString(rand, 2025, 2026)} ${hour % 12 || 12}:${pad(Math.floor(rand() * 4) * 15)} ${hour < 12 ? "AM" : "PM"}`,
            players: 1 + Math.floor(rand() * 4),
        };
    });

    const punchCards = Array.from({ length: rand() > 0.78 ? 1 : 0 }, () => {
        const total = [5, 10, 20][Math.floor(rand() * 3)];
        return {
            name: `${total}-Round Punch Card`,
            remaining: Math.floor(rand() * (total + 1)),
            total,
            expires: dateString(rand, 2026, 2027),
        };
    });

    const hasCard = rand() > 0.35;
    const testAccount = rand() > 0.75;

    return {
        id: String(customerId++),
        courseId: String(courseId++),
        firstName: first,
        lastName: last,
        displayName: spec.display ?? (suffix ? `${plain} - ${suffix}` : plain),
        ...(spec.sheet ? { sheetName: spec.sheet } : {}),
        ...(spec.tag ? { tag: spec.tag } : {}),
        email:
            spec.email ??
            (testAccount
                ? `${first.toLowerCase()}.${last.toLowerCase()}+${index}@tenfore.golf`
                : `${first.toLowerCase()}.${last.toLowerCase()}@${DOMAINS[Math.floor(rand() * DOMAINS.length)]}`),
        ...((spec.phone ?? (rand() > 0.1 ? `801${pad(Math.floor(rand() * 10000000), 7)}` : null))
            ? { phone: spec.phone ?? `801${pad(Math.floor(rand() * 10000000), 7)}` }
            : {}),
        birthday: dateString(rand, 1948, 2006),
        notes: spec.notes ?? (NOTES[Math.floor(rand() * NOTES.length)] || undefined),
        street: STREETS[Math.floor(rand() * STREETS.length)],
        city: rand() > 0.12 ? city : "N/A",
        state,
        zip: rand() > 0.2 ? zip : undefined,
        memberships,
        customerTypes: types,
        giftCards,
        teeTimes,
        punchCards,
        rewardsBalance: Math.floor(rand() * 3000),
        balance: rand() > 0.78 ? +(rand() * 2500).toFixed(2) : 0,
        ...(hasCard
            ? {
                  cardOnFile: String(Math.floor(rand() * 9000 + 1000)),
                  cardExpires: `${pad(1 + Math.floor(rand() * 12))}/${2027 + Math.floor(rand() * 15)}`,
              }
            : {}),
    };
};

const records = PINNED.map(build);

// Fill out to a hundred. Names cycle through both pools at different rates so
// first names repeat across different surnames — six Kelseys is the case that
// makes a search result list genuinely hard to read.
for (let i = records.length; i < 100; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7 + Math.floor(i / FIRST.length)) % LAST.length];
    const membership = rand() > 0.6 ? MEMBERSHIPS[Math.floor(rand() * MEMBERSHIPS.length)] : undefined;
    const types = CUSTOMER_TYPES.filter(() => rand() > 0.88);
    records.push(build({ first, last, membership, types }, i));
}

const strip = (o) => JSON.parse(JSON.stringify(o, (_, v) => (v === undefined ? undefined : v)));

writeFileSync(OUT, `${JSON.stringify(strip(records), null, 2)}\n`);
console.log(`Wrote ${records.length} customers to ${OUT}`);
