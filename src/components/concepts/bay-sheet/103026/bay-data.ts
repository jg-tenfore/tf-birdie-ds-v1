/**
 * **Oct 30 — the bay sheet, per Weston's PRD.**
 *
 * > *"Staff need one screen to see every bay's schedule, book and edit
 * > reservations, and charge customers, the same way they run the tee sheet
 * > today."*
 *
 * The shipping bay sheet (`app/src/screens/bay-sheet.tsx`) draws six bays over
 * four hours and knows four things about a reservation: who, how long, how
 * many, and what it costs. The PRD asks it to know nine more — checked in,
 * paid, whether a tab is open, the note, whether it repeats, whether it was
 * cancelled or no-showed, which punch card paid for it, and whether booking it
 * puts the golfer over their daily limit.
 *
 * This file is that model. Everything in it is invented except the shape of
 * what ships: the bay names, the fee idea and the party/duration fields come
 * from the reference device.
 *
 * **Requirement numbers in the comments below refer to the PRD**, so a
 * developer reading a field can find the sentence that asked for it.
 */

/* --------------------------------------------------------------- the bays */

/**
 * Fifteen, where the shipping sheet draws six.
 *
 * Requirement 1: *"The bay sheet shows as many bays as possible without
 * scrolling."* Eight columns is what fits a 1280-wide landscape tablet while a
 * reservation chip still has room for a name, a duration and its status pills
 * — so **eight is what the sheet shows, and the other seven are a sideways
 * scroll away**. Nov 1: the list is fifteen because that is the size of house
 * the screen has to survive, and the honest way to survive it is to admit the
 * sheet scrolls rather than to shrink a chip until it says nothing. The filter
 * above the sheet is the other half of the answer — pick your six bays and
 * nothing scrolls at all.
 *
 * Colour names, not numbers, because that is what the reference device calls
 * them and what staff say out loud.
 */
export const bays = [
    { id: "red", name: "Red Bay", color: "#C62828" },
    { id: "orange", name: "Orange Bay", color: "#EF6C00" },
    { id: "green", name: "Green Bay", color: "#2E7D32" },
    { id: "blue", name: "Blue Bay", color: "#1565C0" },
    { id: "magenta", name: "Magenta Bay", color: "#AD1457" },
    { id: "white", name: "White Bay", color: "#546E7A" },
    { id: "teal", name: "Teal Bay", color: "#00838F" },
    { id: "amber", name: "Amber Bay", color: "#F9A825" },
    { id: "purple", name: "Purple Bay", color: "#6A1B9A" },
    { id: "indigo", name: "Indigo Bay", color: "#283593" },
    { id: "lime", name: "Lime Bay", color: "#558B2F" },
    { id: "pink", name: "Pink Bay", color: "#D81B60" },
    { id: "brown", name: "Brown Bay", color: "#6D4C41" },
    { id: "cyan", name: "Cyan Bay", color: "#00ACC1" },
    { id: "olive", name: "Olive Bay", color: "#827717" },
];

export type BayId = (typeof bays)[number]["id"];

export const bayById = (id: string) => bays.find((bay) => bay.id === id) ?? bays[0];

/** The sheet's day. Minutes from midnight, so arithmetic is plain. */
export const DAY_START = 8 * 60;
export const DAY_END = 22 * 60;

/** `1:30 PM`, the device's own format. */
export const fmtTime = (minutes: number): string => {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const h = h24 % 12 === 0 ? 12 : h24 % 12;

    return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};

/** `1h 30m`, which is how staff say a bay rental out loud. */
export const fmtDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/** Grouped, because a series total runs into the thousands: `$2,520.00`. */
export const usd = (value: number): string => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ------------------------------------------------------------- the people */

export interface BayCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    /** Decides which fee applies — requirement 7. */
    tier: "Member" | "Guest";
    /** Punches left on a membership card, requirement 8. Undefined: no card. */
    punchesLeft?: number;
    punchCardName?: string;
}

export const bayCustomers: BayCustomer[] = [
    {
        id: "c-1",
        name: "Justin Girard",
        email: "hello@girardjustin.com",
        phone: "(555) 215-8844",
        tier: "Member",
        punchesLeft: 6,
        punchCardName: "Sim 10-Pack",
    },
    {
        id: "c-2",
        name: "Avery Nguyen",
        email: "avery.nguyen@email.com",
        phone: "(801) 555-0148",
        tier: "Member",
        punchesLeft: 1,
        punchCardName: "Sim 10-Pack",
    },
    { id: "c-3", name: "Maya Okafor", email: "m.okafor@email.com", phone: "(801) 555-0192", tier: "Guest" },
    { id: "c-4", name: "Riley Hartman", email: "riley.hartman@email.com", phone: "(385) 555-0107", tier: "Guest" },
    {
        id: "c-5",
        name: "Sofia Reyes",
        email: "sofia.reyes@email.com",
        phone: "(385) 555-0163",
        tier: "Member",
        punchesLeft: 0,
        punchCardName: "Sim 10-Pack",
    },
    { id: "c-6", name: "Jordan Blake", email: "jordan.blake@email.com", phone: "(801) 555-0175", tier: "Guest" },
    /*
     * c-7 and up arrived with bays 9–15. They are a separate six on purpose:
     * the daily-limit stories lean on exactly how many bookings c-1 through
     * c-6 hold today, so filling seven more bays with the same people would
     * have quietly rewritten story 4.
     */
    {
        id: "c-7",
        name: "Dana Whitfield",
        email: "dana.whitfield@email.com",
        phone: "(801) 555-0221",
        tier: "Member",
        punchesLeft: 4,
        punchCardName: "Sim 10-Pack",
    },
    { id: "c-8", name: "Elliot Chen", email: "elliot.chen@email.com", phone: "(385) 555-0244", tier: "Guest" },
    {
        id: "c-9",
        name: "Priya Raman",
        email: "priya.raman@email.com",
        phone: "(801) 555-0268",
        tier: "Member",
        punchesLeft: 9,
        punchCardName: "Sim 20-Pack",
    },
    { id: "c-10", name: "Marcus Webb", email: "marcus.webb@email.com", phone: "(385) 555-0287", tier: "Guest" },
    {
        id: "c-11",
        name: "Tessa Lindqvist",
        email: "tessa.l@email.com",
        phone: "(801) 555-0303",
        tier: "Member",
        punchesLeft: 2,
        punchCardName: "Sim 10-Pack",
    },
    { id: "c-12", name: "Owen Castellano", email: "owen.c@email.com", phone: "(385) 555-0329", tier: "Guest" },
];

export const searchBayCustomers = (query: string): BayCustomer[] => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    return bayCustomers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(needle));
};

/* --------------------------------------------------------------- the fees */

/**
 * Requirement 7: *"When a customer is selected, the correct fee for that
 * customer is applied."* Two rates and a peak window, which is the smallest
 * arrangement that makes the rule visible.
 */
export const PEAK_FROM = 16 * 60;

export const feeFor = (tier: BayCustomer["tier"], start: number, duration: number) => {
    const peak = start >= PEAK_FROM;
    const hourly = tier === "Member" ? (peak ? 40 : 30) : peak ? 60 : 45;

    return {
        name: `Sim Hour — ${tier}${peak ? " · Peak" : ""}`,
        hourly,
        amount: Number(((hourly * duration) / 60).toFixed(2)),
    };
};

/** One punch buys one hour — requirement 23's "punch usage recalculates too". */
export const punchesNeeded = (duration: number): number => Math.ceil(duration / 60);

/* ------------------------------------------------------- the reservations */

export type ReservationStatus = "booked" | "checkedIn" | "cancelled" | "noShow";

/** Requirement 13's four cadences. */
export type RepeatFreq = "none" | "daily" | "weekly" | "biweekly" | "monthly";

export const repeatLabels: Record<RepeatFreq, string> = {
    none: "Does not repeat",
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Every 2 weeks",
    monthly: "Monthly",
};

/**
 * How far ahead a repeating booking is written into the sheet.
 *
 * A standing booking has to stop somewhere, and twelve weeks is the horizon
 * the four cadences all divide into cleanly — which is the only reason to
 * prefer it to a quarter or a season. It is the number the order summary
 * quotes a series total against, so it has to be stated rather than implied.
 */
export const SERIES_WEEKS = 12;

/** Bookings this cadence puts on the sheet over `SERIES_WEEKS`. */
export const occurrencesOf = (repeat: RepeatFreq): number =>
    ({ none: 1, daily: SERIES_WEEKS * 7, weekly: SERIES_WEEKS, biweekly: SERIES_WEEKS / 2, monthly: SERIES_WEEKS / 4 })[repeat];

/**
 * The cadence as a sentence.
 *
 * Time only, no weekday: the sheet is one day wide, so the data never knew
 * which day this is, and a dialog that guessed "Tuesdays" would be wrong one
 * booking in seven.
 */
export const scheduleLabel = (repeat: RepeatFreq, start: number): string =>
    repeat === "none"
        ? "One booking, does not repeat"
        : `${{ daily: "Every day", weekly: "Every week", biweekly: "Every 2 weeks", monthly: "Every month" }[repeat]} at ${fmtTime(start)}`;

export interface Reservation {
    id: string;
    bayId: string;
    /** Minutes from midnight. */
    start: number;
    duration: number;
    customer: BayCustomer;
    /** Requirement 2. */
    party: number;
    status: ReservationStatus;
    /** Requirement 2 — paid, or not yet. */
    paid: boolean;
    /** Requirement 3 — "an indicator when it has an open tab". */
    tabOpen: boolean;
    /** Requirement 4 — "reservation notes show on the bay sheet". */
    note?: string;
    /** An optional occasion tag that travels with the note. Id from `occasions`. */
    occasion?: string;
    fee: { name: string; hourly: number; amount: number };
    /** Requirement 8 — punches spent on this reservation, if a card was used. */
    punchesUsed?: number;
    /** Requirements 13–15. Occurrences of one series share a seriesId. */
    repeat: RepeatFreq;
    seriesId?: string;
}

/**
 * The occasions a booking can be tagged with, in the order staff meet them.
 *
 * Optional, and one at a time: a booking is a birthday *or* a corporate
 * outing, and a list that let it be both would mostly collect mistakes. The
 * order is roughly how often a sim bay sees them, so the two that matter most
 * are reachable without scrolling the rail.
 */
export const occasions = [
    { id: "birthday", label: "Birthday" },
    { id: "anniversary", label: "Anniversary" },
    { id: "date", label: "Date night" },
    { id: "business", label: "Business" },
    { id: "party", label: "Bachelor/ette" },
    { id: "league", label: "League night" },
    { id: "lesson", label: "Lesson" },
    { id: "fitting", label: "Club fitting" },
    { id: "first", label: "First visit" },
    { id: "holiday", label: "Holiday party" },
] as const;

export interface BayBlock {
    id: string;
    bayId: string;
    start: number;
    duration: number;
    /** Requirement 31. Weston's open question: "should blocks have a label?" */
    label: string;
    repeat: RepeatFreq;
    seriesId?: string;
}

const customer = (id: string) => bayCustomers.find((c) => c.id === id)!;

const reservation = (
    id: string,
    bayId: string,
    start: number,
    duration: number,
    customerId: string,
    party: number,
    extra: Partial<Reservation> = {},
): Reservation => {
    const who = customer(customerId);

    return {
        id,
        bayId,
        start,
        duration,
        customer: who,
        party,
        status: "booked",
        paid: false,
        tabOpen: false,
        fee: feeFor(who.tier, start, duration),
        repeat: "none",
        ...extra,
    };
};

/**
 * A day with every state on it, because a sheet that only shows healthy
 * reservations tells you nothing about the screen.
 *
 * Reading the day: two checked-in, one with an open tab, one paid, one with a
 * note long enough to crowd its chip, a weekly series, a cancellation and a
 * no-show that have freed their time (requirement 27), and a block.
 */
export const seedReservations: Reservation[] = [
    reservation("r-1", "red", 8 * 60 + 30, 60, "c-1", 2, { status: "checkedIn", paid: true, punchesUsed: 1 }),
    reservation("r-2", "orange", 9 * 60, 90, "c-3", 4, { note: "Birthday — needs the big screen and two extra chairs" }),
    reservation("r-3", "green", 10 * 60, 60, "c-2", 1, { status: "checkedIn", tabOpen: true }),
    reservation("r-4", "blue", 10 * 60 + 30, 120, "c-4", 6, { paid: true }),
    reservation("r-5", "magenta", 11 * 60, 60, "c-5", 2, { status: "noShow" }),
    reservation("r-6", "white", 12 * 60, 60, "c-6", 3, { status: "cancelled" }),
    reservation("r-7", "teal", 13 * 60, 60, "c-1", 2, { repeat: "weekly", seriesId: "s-1", note: "Standing Tuesday lesson" }),
    reservation("r-8", "amber", 14 * 60, 90, "c-3", 4, {}),
    reservation("r-9", "red", 16 * 60, 60, "c-4", 2, {}),
    reservation("r-10", "green", 17 * 60, 120, "c-6", 8, { note: "Corporate — invoice to Meridian" }),
    reservation("r-11", "blue", 18 * 60 + 30, 60, "c-2", 2, { repeat: "weekly", seriesId: "s-2" }),
    /* Bays 9–15, so the sideways scroll has something in it to find. */
    reservation("r-12", "purple", 8 * 60 + 30, 90, "c-7", 3, { status: "checkedIn", paid: true, punchesUsed: 2 }),
    reservation("r-13", "indigo", 9 * 60 + 30, 60, "c-8", 2, { status: "checkedIn", tabOpen: true }),
    reservation("r-14", "lime", 11 * 60, 120, "c-9", 6, { note: "League practice — wants the long tee mats", occasion: "league" }),
    reservation("r-15", "pink", 13 * 60 + 30, 60, "c-10", 2, { paid: true }),
    reservation("r-16", "brown", 15 * 60, 90, "c-11", 4, { repeat: "biweekly", seriesId: "s-4" }),
    reservation("r-17", "cyan", 16 * 60, 60, "c-12", 2, { status: "noShow" }),
    reservation("r-18", "olive", 18 * 60, 120, "c-7", 5, { note: "Fitting — email the Trackman numbers after", occasion: "fitting" }),
    reservation("r-19", "purple", 19 * 60 + 30, 60, "c-9", 2, {}),
];

export const seedBlocks: BayBlock[] = [
    { id: "bl-1", bayId: "white", start: 15 * 60, duration: 120, label: "League night setup", repeat: "weekly", seriesId: "s-3" },
    { id: "bl-2", bayId: "amber", start: 9 * 60 + 30, duration: 60, label: "Projector repair", repeat: "none" },
    { id: "bl-3", bayId: "indigo", start: 13 * 60, duration: 60, label: "Net repair", repeat: "none" },
];

/* ----------------------------------------------------------- the guards */

/** A reservation that still holds its time. Cancelled and no-show do not. */
export const holdsTime = (reservation: Reservation): boolean => reservation.status === "booked" || reservation.status === "checkedIn";

const overlaps = (aStart: number, aDuration: number, bStart: number, bDuration: number) =>
    aStart < bStart + bDuration && bStart < aStart + aDuration;

/**
 * Requirement 10: *"The system checks for double bookings and overlaps and
 * prevents them."*
 *
 * Requirement 27 is the other half: a cancelled or no-show reservation frees
 * its time, so it is not a conflict.
 */
export const conflictFor = (
    reservations: Reservation[],
    blocks: BayBlock[],
    draft: { bayId: string; start: number; duration: number; id?: string },
): { kind: "reservation"; with: Reservation } | { kind: "block"; with: BayBlock } | undefined => {
    const clash = reservations.find(
        (r) => r.id !== draft.id && r.bayId === draft.bayId && holdsTime(r) && overlaps(draft.start, draft.duration, r.start, r.duration),
    );
    if (clash) return { kind: "reservation", with: clash };

    const blocked = blocks.find((b) => b.bayId === draft.bayId && overlaps(draft.start, draft.duration, b.start, b.duration));

    return blocked ? { kind: "block", with: blocked } : undefined;
};

/**
 * Requirements 16–18, and 29.
 *
 * > *"Operators can set a limit on the number of simulator bookings a golfer
 * > can have in a day… when a booking would put a golfer over the limit, the
 * > bay sheet shows a warning… staff can override the limit."*
 *
 * **Weston's open question — "does it count reservations or minutes?" — is
 * unanswered.** This counts reservations, which is the reading his own wording
 * supports, and requirement 29 is honoured: a no-show still counts.
 */
export const DAILY_LIMIT = 2;

export const bookingsToday = (reservations: Reservation[], customerId: string, exceptId?: string): Reservation[] =>
    reservations.filter((r) => r.customer.id === customerId && r.id !== exceptId && r.status !== "cancelled");

export const overLimit = (reservations: Reservation[], customerId: string, exceptId?: string): boolean =>
    bookingsToday(reservations, customerId, exceptId).length >= DAILY_LIMIT;

/* ------------------------------------------------------------ the series */

/**
 * Requirement 14: *"Editing a repeating reservation changes only that one
 * occurrence."* So an edit never walks the series, and this is only used to
 * answer requirement 15 — cancel one, or clear them all.
 */
export const seriesOf = (reservations: Reservation[], seriesId?: string): Reservation[] =>
    seriesId ? reservations.filter((r) => r.seriesId === seriesId) : [];

/** What the status pill says, and the colour it says it in. */
export const statusLabel: Record<ReservationStatus, string> = {
    booked: "Booked",
    checkedIn: "Checked in",
    cancelled: "Cancelled",
    noShow: "No-show",
};

/* ------------------------------------------------------------- the filter */

/**
 * **What a filtered sheet is for.**
 *
 * Fifteen bays is more than a 1280 tablet can draw, and a sideways scroll is
 * only half an answer: it lets you reach a bay, but it does not help with the
 * question staff actually ask the sheet — *who is here, who owes us money,
 * which bays am I running tonight*. The filter answers those, and in doing so
 * it usually removes the scroll: pick your six bays and the sheet fits again.
 *
 * Two deliberate choices:
 *
 * - **The marks narrow.** Each one you add is ANDed with the rest, so *Checked
 *   in* plus *Open tab* is "who is in the building with a bill running" rather
 *   than a longer list. A filter that grew its results as you added conditions
 *   would be a worse tool than no filter.
 * - **A block is not a booking.** No mark and no search hides one, because a
 *   blocked bay is a fact about the bay rather than a reservation to be found;
 *   narrowing the bays is the only thing that takes a block off the sheet.
 */
export type SheetMark = "checkedIn" | "tab" | "unpaid" | "note";

export const sheetMarks: { id: SheetMark; label: string; hint: string }[] = [
    { id: "checkedIn", label: "Checked in", hint: "Golfers who have arrived" },
    { id: "tab", label: "Open tab", hint: "A bill is still running" },
    { id: "unpaid", label: "Unpaid", hint: "Live bookings with nothing collected" },
    { id: "note", label: "Has a note", hint: "A note or an occasion tag" },
];

export interface SheetFilter {
    /** Matched against the guest's name, email and phone. */
    query: string;
    /** Marks a booking has to carry. Every one narrows — they are ANDed. */
    marks: SheetMark[];
    /** The bays to draw. Empty means all of them. */
    bayIds: string[];
    /** Drop cancellations and no-shows, which have given their time back. */
    liveOnly: boolean;
}

export const noFilter: SheetFilter = { query: "", marks: [], bayIds: [], liveOnly: false };

export const filterIsOn = (filter: SheetFilter): boolean =>
    filter.query.trim() !== "" || filter.marks.length > 0 || filter.bayIds.length > 0 || filter.liveOnly;

/** Does this booking carry that mark? `unpaid` only counts live bookings. */
const carries = (reservation: Reservation, mark: SheetMark): boolean =>
    ({
        checkedIn: reservation.status === "checkedIn",
        tab: reservation.tabOpen,
        unpaid: !reservation.paid && !reservation.tabOpen && holdsTime(reservation),
        note: Boolean(reservation.note) || Boolean(reservation.occasion),
    })[mark];

export const matchesFilter = (reservation: Reservation, filter: SheetFilter): boolean => {
    if (filter.bayIds.length > 0 && !filter.bayIds.includes(reservation.bayId)) return false;
    if (filter.liveOnly && !holdsTime(reservation)) return false;
    if (!filter.marks.every((mark) => carries(reservation, mark))) return false;

    const needle = filter.query.trim().toLowerCase();
    if (!needle) return true;

    const who = reservation.customer;

    return `${who.name} ${who.email} ${who.phone}`.toLowerCase().includes(needle);
};

/** The columns a filter leaves standing. No bays chosen means every bay. */
export const filteredBays = (filter: SheetFilter) =>
    filter.bayIds.length > 0 ? bays.filter((bay) => filter.bayIds.includes(bay.id)) : bays;

/**
 * **Which columns a filtered sheet draws.** Empty means all of them.
 *
 * Searching a golfer who is in bay 11 used to leave the eight visible columns
 * blank with the answer off the right-hand edge — the count said *2 of 19* and
 * then made you go looking, which is the opposite of what a search is for. So
 * a search folds the empty bays away and puts its matches side by side.
 *
 * Only a **search** does this: a name or a mark is a question about particular
 * bookings, and the columns that cannot answer it are noise. *Hide cancelled*
 * is housekeeping rather than a question, so it leaves the sheet's shape
 * alone, and a bay you picked by hand always wins over both.
 */
export const columnsFor = (reservations: Reservation[], filter: SheetFilter): string[] => {
    if (filter.bayIds.length > 0) return filter.bayIds;
    if (filter.query.trim() === "" && filter.marks.length === 0) return [];

    const hit = new Set(reservations.filter((reservation) => matchesFilter(reservation, filter)).map((r) => r.bayId));

    /* Nothing matched: fold nothing away, or the screen would claim the filter
       was never applied. */
    return hit.size > 0 ? bays.filter((bay) => hit.has(bay.id)).map((bay) => bay.id) : [];
};
