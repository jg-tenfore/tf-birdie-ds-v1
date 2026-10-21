import { camp, SESSION_PRICE } from "../102026/clinic-availability";

/**
 * **Oct 21 — twenty clinics, not one.**
 *
 * The reference device has a single clinic configured, so every screen so far
 * has been drawn against a list of one. Weston, asked how many a course really
 * runs:
 *
 * > *"Do like 20. That's not unrealistic — just so we can kind of see how do we
 * > interact with that here. And I'm assuming you just scroll and find the
 * > tile."* → *"A search would be great."*
 *
 * So this file is the catalogue that makes the list screen a real problem: a
 * season's worth of clinics, camps, leagues and schools at mixed prices, mixed
 * lengths and mixed availability.
 *
 * **Girls Summer Camp is the Oct 20 clinic, unchanged** — same ten dates, same
 * two full sessions, same $22.47 — so the new list can be read against the old
 * screens. The other nineteen are invented, like the counts underneath them.
 */

export interface CatalogSession {
    /** The device's own label, kept as the id: `10/6/26 2:00 PM`. */
    label: string;
    date: string;
    time: string;
    /** Places still open on this date. */
    spotsLeft: number;
    /** The roster size for one session. */
    capacity: number;
}

export interface CatalogClinic {
    id: string;
    name: string;
    /** Camp, Clinic, League, School — printed under the name. */
    category: string;
    /** What one session costs. */
    price: number;
    capacity: number;
    sessions: CatalogSession[];
}

/* ------------------------------------------------------ generated dates */

const TIMES = ["9:00 AM", "10:30 AM", "1:00 PM", "2:00 PM", "4:30 PM", "5:30 PM"];

/**
 * A fixed spread of remaining places, walked at a stride that differs per
 * clinic. It is arithmetic rather than random so the list is identical on every
 * reload — a screenshot of row 14 means the same thing tomorrow — while still
 * producing the states that matter: full dates, single-place dates, and dates
 * that comfortably hold a family.
 */
const SPREAD = [4, 0, 7, 2, 10, 1, 6, 0, 9, 3, 5, 8, 2, 1, 7, 4, 0, 6, 3, 10];

const spotsFor = (clinicIndex: number, sessionIndex: number, capacity: number) =>
    Math.min(capacity, SPREAD[(clinicIndex * 3 + sessionIndex * 5) % SPREAD.length]);

/** `10/6/26` — the device's own date format, two-digit year and no padding. */
const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)}`;

const buildSessions = (clinicIndex: number, count: number, startsOn: string, everyDays: number, capacity: number): CatalogSession[] => {
    const start = new Date(`${startsOn}T12:00:00`);
    const time = TIMES[clinicIndex % TIMES.length];

    return Array.from({ length: count }, (_, sessionIndex) => {
        const day = new Date(start);
        day.setDate(day.getDate() + sessionIndex * everyDays);
        const date = formatDate(day);

        return { label: `${date} ${time}`, date, time, spotsLeft: spotsFor(clinicIndex, sessionIndex, capacity), capacity };
    });
};

/* ---------------------------------------------------------- the catalogue */

interface ClinicSeed {
    name: string;
    category: string;
    price: number;
    capacity: number;
    sessions: number;
    startsOn: string;
    /** Weekly, twice a week, or a run of consecutive days for a camp. */
    everyDays: number;
}

const SEEDS: ClinicSeed[] = [
    { name: "Junior Golf Academy", category: "Academy", price: 35.0, capacity: 12, sessions: 8, startsOn: "2026-10-07", everyDays: 7 },
    { name: "Ladies League Clinic", category: "League", price: 18.0, capacity: 16, sessions: 10, startsOn: "2026-10-06", everyDays: 7 },
    { name: "Short Game School", category: "School", price: 45.0, capacity: 8, sessions: 6, startsOn: "2026-10-09", everyDays: 7 },
    { name: "Putting Lab", category: "Clinic", price: 25.0, capacity: 6, sessions: 12, startsOn: "2026-10-05", everyDays: 3 },
    { name: "Bunker Play Workshop", category: "Workshop", price: 40.0, capacity: 8, sessions: 4, startsOn: "2026-10-10", everyDays: 14 },
    { name: "Senior Swing Series", category: "Series", price: 20.0, capacity: 14, sessions: 9, startsOn: "2026-10-06", everyDays: 7 },
    { name: "Beginner Basics", category: "Clinic", price: 22.47, capacity: 10, sessions: 6, startsOn: "2026-10-12", everyDays: 7 },
    { name: "Driver Distance Clinic", category: "Clinic", price: 50.0, capacity: 8, sessions: 5, startsOn: "2026-10-14", everyDays: 7 },
    { name: "Wedge Control", category: "School", price: 45.0, capacity: 6, sessions: 4, startsOn: "2026-10-08", everyDays: 7 },
    { name: "Course Management", category: "Clinic", price: 55.0, capacity: 10, sessions: 3, startsOn: "2026-10-17", everyDays: 14 },
    {
        name: "Play Nine with a Pro",
        category: "Playing lesson",
        price: 85.0,
        capacity: 4,
        sessions: 7,
        startsOn: "2026-10-11",
        everyDays: 7,
    },
    { name: "Junior Fall Camp", category: "Camp", price: 30.0, capacity: 12, sessions: 5, startsOn: "2026-10-26", everyDays: 1 },
    { name: "Women on Course", category: "Series", price: 28.0, capacity: 12, sessions: 8, startsOn: "2026-10-13", everyDays: 7 },
    { name: "Rules & Etiquette", category: "Clinic", price: 15.0, capacity: 20, sessions: 3, startsOn: "2026-10-20", everyDays: 7 },
    { name: "Swing Analysis Tune-Up", category: "Lesson", price: 75.0, capacity: 2, sessions: 10, startsOn: "2026-10-05", everyDays: 2 },
    { name: "Chipping Clinic", category: "Clinic", price: 25.0, capacity: 8, sessions: 6, startsOn: "2026-10-15", everyDays: 7 },
    { name: "Tee to Green", category: "School", price: 60.0, capacity: 10, sessions: 4, startsOn: "2026-10-18", everyDays: 7 },
    { name: "Winter Indoor Series", category: "Series", price: 32.0, capacity: 10, sessions: 12, startsOn: "2026-11-02", everyDays: 7 },
    { name: "Family Golf Night", category: "Clinic", price: 40.0, capacity: 16, sessions: 6, startsOn: "2026-10-16", everyDays: 7 },
];

/** The Oct 20 clinic, carried over whole so the two folders describe one course. */
const girls: CatalogClinic = {
    id: "girls-summer-camp",
    name: camp.name,
    category: camp.category,
    price: SESSION_PRICE,
    capacity: camp.capacity,
    sessions: camp.sessions.map((session) => {
        const label = session.label.replace(" (FULL)", "");
        const [date, ...time] = label.split(" ");

        return { label, date, time: time.join(" "), spotsLeft: session.spotsLeft, capacity: session.capacity };
    }),
};

export const clinicCatalog: CatalogClinic[] = [
    girls,
    ...SEEDS.map((seed, index) => ({
        id: seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: seed.name,
        category: seed.category,
        price: seed.price,
        capacity: seed.capacity,
        sessions: buildSessions(index + 1, seed.sessions, seed.startsOn, seed.everyDays, seed.capacity),
    })),
];

export const clinicById = (id: string): CatalogClinic => clinicCatalog.find((clinic) => clinic.id === id) ?? clinicCatalog[0];

/* -------------------------------------------------------------- readings */

export const usd = (value: number): string => `$${value.toFixed(2)}`;

/** Sessions that can still take at least one person. */
export const openSessions = (clinic: CatalogClinic): CatalogSession[] => clinic.sessions.filter((session) => session.spotsLeft > 0);

/**
 * **The one number the list screen prints.**
 *
 * The Oct 20 card carried a roster bar — *64 of 100 places taken* — and Weston
 * threw it out:
 *
 * > *"That doesn't tell me anything. Like, maybe they're all spread equally, or
 * > one session is full. Where are the openings? If you just said that 8 dates
 * > are still open, then I know that they're open. That tells me a lot."*
 *
 * So the aggregate is gone and this is what replaces it. The per-date meters
 * stay — those he liked, because a column of bars is scanned rather than read.
 */
export const datesOpenLabel = (clinic: CatalogClinic): string => {
    const open = openSessions(clinic).length;

    return open === 0 ? "No dates open" : open === 1 ? "1 date still open" : `${open} dates still open`;
};

/** `3 spots left`, `1 spot left`, `Full`. */
export const spotsLabel = (spotsLeft: number): string =>
    spotsLeft === 0 ? "Full" : spotsLeft === 1 ? "1 spot left" : `${spotsLeft} spots left`;

/** Nearly gone, which earns the amber. */
export const isNearlyFull = (spotsLeft: number): boolean => spotsLeft > 0 && spotsLeft <= 2;

/**
 * Whether a date can seat the whole party.
 *
 * Weston, on booking more than one person at a time: *"This one spot left — you
 * could put one spot left, but this won't work for 2 participants, so it's
 * greyed out."* That sentence is this function.
 */
export const fitsParty = (session: CatalogSession, party: number): boolean => session.spotsLeft >= party;

/** Name and category, matched loosely — what a search box over 20 rows needs. */
export const searchClinics = (clinics: CatalogClinic[], query: string): CatalogClinic[] => {
    const needle = query.trim().toLowerCase();
    if (!needle) return clinics;

    return clinics.filter((clinic) => `${clinic.name} ${clinic.category}`.toLowerCase().includes(needle));
};
