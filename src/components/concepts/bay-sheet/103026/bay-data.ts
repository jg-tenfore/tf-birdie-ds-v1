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
 * **Nov 3 — the names are a mix on purpose, and the colour is not drawn.**
 *
 * A bay is an activity resource on the backend and a resource has no colour
 * field, so there is nothing for the sheet to read. Weston, on the names:
 * *"some people use colour names, others just use like the Jack Nicklaus Bay
 * and the Tiger Woods Bay"* — and his own course list carries an East and a
 * West Porch Sim alongside the colours. So this list is ten colours, three
 * sims named after where they are, and two named after people, which is the
 * spread the screen has to survive. **A bay is identified by its name.**
 *
 * `color` stays on the record because he wants it on resources eventually —
 * *"I wouldn't mind having that... we just don't have it right now"*. Nothing
 * reads it today, and grepping it is how you find every place that has to
 * change when it comes back.
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
    { id: "eastporch", name: "East Porch Sim", color: "#6A1B9A" },
    { id: "westporch", name: "West Porch Sim", color: "#283593" },
    { id: "nicklaus", name: "Nicklaus Bay", color: "#558B2F" },
    { id: "palmer", name: "Palmer Bay", color: "#D81B60" },
    { id: "brown", name: "Brown Bay", color: "#6D4C41" },
    { id: "cyan", name: "Cyan Bay", color: "#00ACC1" },
    { id: "patio", name: "Patio Sim", color: "#827717" },
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

/**
 * **Nov 3 — a membership is a record the course made, not a status we chose.**
 *
 * Yesterday this file had three statuses — simulator member, member, public —
 * because those were the three Weston named out loud in the review. Today he
 * showed where they actually come from, and there is no fixed set:
 *
 * > *"There could be an infinite number of memberships. So we don't have
 * > simulator memberships or public, like it's all just, you can create
 * > different membership types... And they all have a colour associated with
 * > them."*
 *
 * A course creates as many plans as it likes — his test course has a dozen —
 * and each one carries a colour picked on the plan itself. The tee sheet
 * already draws that colour as a bar under each cell, which is the pattern the
 * ribbon was borrowed from in the first place. So the colour is **data**, and
 * the only design decisions left are what to do with it.
 *
 * Two of those, and both have teeth:
 *
 * - **The colour is drawn exactly as the course chose it.** No clamping to
 *   make it legible, because the point of the ribbon is that it matches the
 *   tee sheet's bar and the membership form. `super` below is Weston's own
 *   yellow, kept in the sample day so the weak case is visible here rather
 *   than discovered at a course. See the Nov 3 page.
 * - **Holding no membership is a real case, not a third status.** A walk-up
 *   has no plan, so there is no colour to draw and none to invent. The edge
 *   falls back to a neutral grey that claims only *not a member*.
 */
export interface Membership {
    id: string;
    name: string;
    /**
     * Chosen by the course on the plan, and drawn as given. Any hex a colour
     * picker can produce can land here, including ones that barely read at
     * 4px — which is the deliberate consequence described above.
     */
    color: string;
    /** What a staff member learns from seeing it on the sheet. */
    hint: string;
}

/**
 * Four of Weston's, by name, so the screens show a real course's plans rather
 * than three invented tiers. There is nothing special about four.
 */
export const memberships: Membership[] = [
    {
        id: "gold",
        name: "Gold Punch Membership",
        color: "#C77700",
        hint: "Holds sim hours on a punch card, and has its own afternoon rate.",
    },
    {
        id: "super",
        name: "Super Membership",
        color: "#F2C200",
        hint: "The course picked yellow for this one: a 4px edge of it barely reads.",
    },
    { id: "silver", name: "Monthly Silver", color: "#5E7C8A", hint: "Billed monthly, no sim hours included." },
    { id: "par", name: "Par Membership", color: "#5E35B1", hint: "A club membership with no simulator entitlement." },
];

export const membershipById = (id?: string): Membership | undefined => memberships.find((plan) => plan.id === id);

/**
 * The edge for a golfer who holds no plan. Grey, and deliberately duller than
 * anything a colour picker is likely to produce, so it reads as the absence of
 * a membership rather than as one more membership.
 */
export const NO_MEMBERSHIP = { color: "#B0BEC5", name: "No membership", hint: "A walk-up. The course's general rate applies." };

/** What the chip's edge is painted, and what the legend calls it. */
export const membershipMark = (customer: BayCustomer): { color: string; name: string; hint: string } =>
    membershipById(customer.membershipId) ?? NO_MEMBERSHIP;

/**
 * Black or white, whichever reads on `color`.
 *
 * **The ribbon never needs this** — a 4px edge carries no text, which is why
 * it can afford to be exactly the colour the course picked. The full-card
 * variant does need it: it puts a name and a row of marks on top of the
 * colour, and white on Weston's yellow is unreadable. So the card keeps the
 * course's colour and moves the text instead of darkening the fill, which
 * would have shown one membership as two different colours on one screen.
 *
 * Rec. 709 luminance against the usual 0.6 cut.
 */
export const inkOn = (color: string): string => {
    const hex = color.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? "#1A1A1A" : "#FFFFFF";
};

/** The quieter second line, in whichever ink the card is using. */
export const mutedInk = (ink: string): string => (ink === "#FFFFFF" ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.6)");

/**
 * The memberships to put in the legend: the ones on this day's sheet, and
 * nothing else.
 *
 * A fixed legend was possible when there were three statuses. With an
 * unbounded list it is not — his test course alone would wrap the bar to
 * several rows of plans nobody booked. So the legend reports the day in front
 * of you, in the order the plans are declared above, and `No membership` joins
 * it only when somebody on the sheet is a walk-up.
 */
export const membershipsOnSheet = (reservations: Reservation[]): { color: string; name: string; hint: string }[] => {
    const held = new Set(reservations.map((r) => r.customer.membershipId));
    const shown: { color: string; name: string; hint: string }[] = memberships.filter((plan) => held.has(plan.id));

    return held.has(undefined) ? [...shown, NO_MEMBERSHIP] : shown;
};

export interface BayCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    /**
     * The plan the golfer holds, from `memberships`. **Undefined is a
     * walk-up**, which is the common case and so the absent one. It colours
     * the ribbon on the chip and it decides which fee applies —
     * requirement 7.
     */
    membershipId?: string;
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
        membershipId: "gold",
        punchesLeft: 6,
        punchCardName: "Sim 10-Pack",
    },
    {
        id: "c-2",
        name: "Avery Nguyen",
        email: "avery.nguyen@email.com",
        phone: "(801) 555-0148",
        membershipId: "gold",
        punchesLeft: 1,
        punchCardName: "Sim 10-Pack",
    },
    /*
     * Nov 3: Maya holds the yellow plan. She is here rather than on a quiet
     * chip because the point is to see the pale edge on the sheet — her 9am
     * booking is one of the first things the eye lands on.
     */
    { id: "c-3", name: "Maya Okafor", email: "m.okafor@email.com", phone: "(801) 555-0192", membershipId: "super" },
    { id: "c-4", name: "Riley Hartman", email: "riley.hartman@email.com", phone: "(385) 555-0107" },
    {
        id: "c-5",
        name: "Sofia Reyes",
        email: "sofia.reyes@email.com",
        phone: "(385) 555-0163",
        membershipId: "gold",
        punchesLeft: 0,
        punchCardName: "Sim 10-Pack",
    },
    { id: "c-6", name: "Jordan Blake", email: "jordan.blake@email.com", phone: "(801) 555-0175" },
    /*
     * c-7 and up arrived with bays 9-15. They are a separate six on purpose:
     * the daily-limit stories lean on exactly how many bookings c-1 through
     * c-6 hold today, so filling seven more bays with the same people would
     * have quietly rewritten story 4.
     */
    {
        id: "c-7",
        name: "Dana Whitfield",
        email: "dana.whitfield@email.com",
        phone: "(801) 555-0221",
        membershipId: "gold",
        punchesLeft: 4,
        punchCardName: "Sim 10-Pack",
    },
    { id: "c-8", name: "Elliot Chen", email: "elliot.chen@email.com", phone: "(385) 555-0244" },
    {
        id: "c-9",
        name: "Priya Raman",
        email: "priya.raman@email.com",
        phone: "(801) 555-0268",
        membershipId: "gold",
        punchesLeft: 9,
        punchCardName: "Sim 20-Pack",
    },
    { id: "c-10", name: "Marcus Webb", email: "marcus.webb@email.com", phone: "(385) 555-0287" },
    {
        id: "c-11",
        name: "Tessa Lindqvist",
        email: "tessa.l@email.com",
        phone: "(801) 555-0303",
        membershipId: "silver",
    },
    { id: "c-12", name: "Owen Castellano", email: "owen.c@email.com", phone: "(385) 555-0329", membershipId: "par" },
];

export const searchBayCustomers = (query: string): BayCustomer[] => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    return bayCustomers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(needle));
};

/* --------------------------------------------------------------- the fees */

/**
 * **Nov 3 — pricing is conditional, not peak and off-peak.**
 *
 * Requirement 7: *"When a customer is selected, the correct fee for that
 * customer is applied."* Yesterday that was a six-cell table — two rates, a
 * peak window at 4pm, three statuses — and the middle pair of numbers was
 * sitting in a Linear comment waiting for Weston to fill in. He answered by
 * showing the fee screen, and the shape is not a table at all:
 *
 * > *"It says from 12 to 9, I want my gold members... get this fee, $50. And
 * > then maybe I'd create a gold morning. Everything's the same except it's
 * > $75."*
 *
 * A fee is a record with a price, a length, a window inside the day, the
 * weekdays it runs, the memberships it is for, and a priority. Five of the six
 * below are his, copied off the screen with their prices and priorities; the
 * sixth is the Gold Morning he described creating, which is here because a
 * membership whose rate changes at midday is the whole point of the feature.
 *
 * The practical consequence for the design: **a fee has a name, so an order
 * line can say `Gold Afternoon` instead of a rate we made up.**
 */
export interface BayFee {
    id: string;
    name: string;
    /** The price for `minutes` of bay time. Every fee the device ships is 60. */
    price: number;
    minutes: number;
    /** The window inside the day it covers, in minutes from midnight. */
    from: number;
    to: number;
    /** The weekdays it runs, 0 = Sunday. */
    days: number[];
    /**
     * The memberships it is for. **Empty means anybody**, which is how his
     * general sim rates and his default rate are set up.
     */
    membershipIds: string[];
    /** The priority column on his fee screen. `feeFor` says how it is read. */
    priority: number;
}

const ALL_WEEK = [0, 1, 2, 3, 4, 5, 6];

export const bayFees: BayFee[] = [
    {
        id: "sim-sun-thu",
        name: "Sim Hour Sun–Thurs",
        price: 100,
        minutes: 60,
        from: DAY_START,
        to: DAY_END,
        days: [0, 1, 2, 3, 4],
        membershipIds: [],
        priority: 1,
    },
    {
        id: "sim-fri-sat-am",
        name: "Sim Hour Fri–Sat Morning",
        price: 150,
        minutes: 60,
        from: DAY_START,
        to: 12 * 60,
        days: [5, 6],
        membershipIds: [],
        priority: 2,
    },
    {
        id: "sim-fri-sat-pm",
        name: "Sim Hour Fri–Sat Evening",
        price: 200,
        minutes: 60,
        from: 12 * 60,
        to: DAY_END,
        days: [5, 6],
        membershipIds: [],
        priority: 3,
    },
    {
        id: "gold-afternoon",
        name: "Gold Afternoon",
        price: 50,
        minutes: 60,
        from: 12 * 60,
        to: 21 * 60 + 1,
        days: ALL_WEEK,
        membershipIds: ["gold"],
        priority: 4,
    },
    /* The one he described rather than one on the screen — see above. */
    {
        id: "gold-morning",
        name: "Gold Morning",
        price: 75,
        minutes: 60,
        from: DAY_START,
        to: 12 * 60,
        days: ALL_WEEK,
        membershipIds: ["gold"],
        priority: 5,
    },
    {
        id: "default",
        name: "Default Rate",
        price: 120,
        minutes: 60,
        from: DAY_START,
        to: DAY_END,
        days: ALL_WEEK,
        membershipIds: [],
        priority: 6,
    },
];

/**
 * The weekday the sheet's day is.
 *
 * Fees depend on the weekday and **the sheet is one day wide with no date on
 * it** — the same gap `scheduleLabel` has to work around below. So the sample
 * day is a Tuesday, which is what makes `Sim Hour Sun–Thurs` the general rate
 * on these screens rather than one of the Friday ones. The shipping screen
 * knows its own date and would read the weekday from there.
 */
export const SHEET_WEEKDAY = 2;

/**
 * **Which fee wins, and the assumption inside that.**
 *
 * Among the fees whose window, weekday and membership all match, the most
 * specific one wins: a fee that names a membership beats one that applies to
 * everybody. Ties go to the lower priority number.
 *
 * **The specificity rule is an assumption and it is WJ-238's open
 * question for Weston.** Reading the priority column at face value — lowest number wins
 * outright — would mean `Gold Afternoon` never applies on a Tuesday, because
 * `Sim Hour Sun–Thurs` is priority 1 and matches the same hours. He described
 * Gold Afternoon as the fee his gold members get, so specificity has to
 * outrank the number somewhere; whether the backend does it here, or by
 * expecting the operator to order the list correctly, is his to confirm. It is
 * four lines either way.
 */
export const feeFor = (customer: BayCustomer | undefined, start: number, duration: number) => {
    const held = customer?.membershipId;

    const matched = bayFees
        .filter((fee) => fee.days.includes(SHEET_WEEKDAY) && start >= fee.from && start < fee.to)
        .filter((fee) => fee.membershipIds.length === 0 || (held !== undefined && fee.membershipIds.includes(held)))
        /* Membership-specific first, then the priority column. */
        .sort((a, b) => Number(b.membershipIds.length > 0) - Number(a.membershipIds.length > 0) || a.priority - b.priority);

    /* The default rate is the floor: a day with no matching fee still has to
       quote a number, which is what the device's `Default Rate` is for. */
    const fee = matched[0] ?? bayFees[bayFees.length - 1];
    const hourly = (fee.price * 60) / fee.minutes;

    return { name: fee.name, hourly, amount: Number(((hourly * duration) / 60).toFixed(2)) };
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
        fee: feeFor(who, start, duration),
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
    reservation("r-12", "eastporch", 8 * 60 + 30, 90, "c-7", 3, { status: "checkedIn", paid: true, punchesUsed: 2 }),
    reservation("r-13", "westporch", 9 * 60 + 30, 60, "c-8", 2, { status: "checkedIn", tabOpen: true }),
    reservation("r-14", "nicklaus", 11 * 60, 120, "c-9", 6, { note: "League practice — wants the long tee mats", occasion: "league" }),
    reservation("r-15", "palmer", 13 * 60 + 30, 60, "c-10", 2, { paid: true }),
    reservation("r-16", "brown", 15 * 60, 90, "c-11", 4, { repeat: "biweekly", seriesId: "s-4" }),
    reservation("r-17", "cyan", 16 * 60, 60, "c-12", 2, { status: "noShow" }),
    reservation("r-18", "patio", 18 * 60, 120, "c-7", 5, { note: "Fitting — email the Trackman numbers after", occasion: "fitting" }),
    reservation("r-19", "eastporch", 19 * 60 + 30, 60, "c-9", 2, {}),
];

export const seedBlocks: BayBlock[] = [
    { id: "bl-1", bayId: "white", start: 15 * 60, duration: 120, label: "League night setup", repeat: "weekly", seriesId: "s-3" },
    { id: "bl-2", bayId: "amber", start: 9 * 60 + 30, duration: 60, label: "Projector repair", repeat: "none" },
    { id: "bl-3", bayId: "westporch", start: 13 * 60, duration: 60, label: "Net repair", repeat: "none" },
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
