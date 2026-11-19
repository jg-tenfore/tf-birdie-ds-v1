/**
 * A **busy** North Course day, for the phone stories.
 *
 * `tee-sheet-data.ts` is a transcription: every row in it is what the shipping
 * app rendered in the May 12 captures, and those captures were taken on a quiet
 * evening — the List view is mostly "4 open positions". That is the right
 * record for the tablet, and it stays untouched, because the tablet stories and
 * the raincheck concepts both read it.
 *
 * It is the wrong picture of the product, though. A tee sheet earns its keep on
 * the days it is full, and a phone screen showing three empty times in a row
 * reads as an app nobody uses. So this is the same course on the same Tuesday,
 * **invented** rather than transcribed, and built to look like a real
 * afternoon:
 *
 * - most times sold, as foursomes, threesomes and pairs, with a few open
 *   positions left so the "open" row still gets seen;
 * - the Tuesday **Women's League** taking three consecutive times, nine holes,
 *   the way the tablet's Grid capture shows it;
 * - a corporate **outing** (Sandhill Group) across two times;
 * - riders and walkers, paid and unpaid — times that have already teed off are
 *   paid, later ones mostly are not, and the online bookings are prepaid;
 * - the odd raincheck bolt, signed-out cart key and outstanding balance.
 *
 * Every person is a booking name from `customers.json`, so a name here is the
 * same person the customer search, the profile and the raincheck ledger show.
 * The two non-people — the league and the outing — are bookings without a
 * record behind them, as on the real sheet.
 *
 * The 5:58 PM foursome and the 6:54 PM pair are **lifted from the transcribed
 * rows rather than retyped**, so the detail screens (which are those two times)
 * still match the sheet they are opened from.
 *
 * Opt-in only: `MobileTeeSheet` takes it through its `day` prop and defaults to
 * the transcribed day, so nothing that already renders changes.
 */

import { backNineBack, backNineFront, listRows, multiCourseColumns, type SheetRow, type SheetSlot, type SlotTone } from "./tee-sheet-data";

/* ------------------------------------------------------------- pricing */

/** 18-hole green fees, as the edit-reservation screen names them. */
const RATE = {
    "Dunes Rack Prime": 62.0,
    "Course Level Fee": 58.0,
    "Online Discount": 52.0,
    "Birdie (25%)": 46.5,
    "Senior Weekday": 34.0,
    "Gold Fee (50%)": 31.0,
    "Group Pricing": 28.47,
    Cheapos: 19.0,
} as const;

/** Transportation, per rider. Walking is the one without a cart glyph. */
const RIDE = {
    cart: 26.82,
    cartPlus: 32.0,
    member: 0,
    walk: 8.58,
} as const;

type Rate = keyof typeof RATE;
type Ride = keyof typeof RIDE;

/** A position that differs from the rest of its booking. */
interface Player {
    name: string;
    /** Overrides the booking — one rider in a cart group who walks. */
    ride?: Ride;
    /** Overrides the booking — one player settled, the others not yet. */
    paid?: boolean;
    key?: boolean;
    bolt?: boolean;
    dollar?: boolean;
}

interface BookingOptions {
    rate: Rate;
    ride?: Ride;
    paid?: boolean;
    online?: boolean;
    /** Nine holes — half the green fee, and the `9H` tag. */
    nine?: boolean;
    /** The lighter purple / green. The app alternates it between reservations. */
    alt?: boolean;
    /** The "(n)" prefix, when the booking covers more than this one time. */
    party?: number;
    /** Multi and Back 9 draw reservations on navy rather than purple. */
    tone?: SlotTone;
    /** A flat league or outing rate that is not on the rate card. */
    flat?: number;
}

/**
 * One reservation: a set of positions that share a party size and a rate.
 *
 * The price is green fee plus ride, worked out here rather than typed, so the
 * Grid view's per-time totals add up to something a starter would believe.
 */
function booking(players: (string | Player)[], options: BookingOptions): SheetSlot[] {
    const { rate, ride = "cart", paid = false, online, nine, alt, party = players.length, tone, flat } = options;
    return players.map((entry) => {
        const p: Player = typeof entry === "string" ? { name: entry } : entry;
        const rides = p.ride ?? ride;
        const isPaid = p.paid ?? paid;
        const green = flat ?? (nine ? RATE[rate] / 2 : RATE[rate]);
        const price = flat ?? green + RIDE[rides];
        return {
            label: `(${party}) ${p.name}`,
            price: `$${price.toFixed(2)}`,
            tone: tone ?? (isPaid ? (alt ? "paidAlt" : "paid") : alt ? "bookedAlt" : "booked"),
            cart: rides !== "walk",
            online,
            key: p.key,
            bolt: p.bolt,
            dollar: p.dollar,
            tags: nine ? ["9H"] : undefined,
        };
    });
}

/** A tee time, padded out to four positions — the padding is what reads "open". */
function teeTime(time: string, ...bookings: SheetSlot[][]): SheetRow {
    const slots: (SheetSlot | null)[] = bookings.flat();
    while (slots.length < 4) slots.push(null);
    return { time, slots };
}

/** A transcribed row, reused as-is so the detail screens still agree with it. */
const transcribed = (time: string): SheetRow => listRows.find((r) => r.time === time) ?? teeTime(time);

/* ---------------------------------------------------------------- list */

const league = (n: number) =>
    booking(
        Array.from({ length: n }, () => "Women's League"),
        { rate: "Group Pricing", flat: 25.93, nine: true, party: 12 },
    );

const outing = (alt?: boolean) =>
    booking(
        Array.from({ length: 4 }, () => "Sandhill Group"),
        { rate: "Group Pricing", party: 8, alt },
    );

/**
 * North Course, 2:00 PM to 7:08 PM, every 14 minutes.
 *
 * The clock is just after two, so the sheet is caught mid-check-in: the 2:00 PM
 * foursome has paid and taken its carts (the key glyphs), the next few times
 * are part-paid as players reach the counter, and everything later is booked
 * and waiting — except the online bookings, which arrive prepaid. 73 of the 92
 * positions are sold.
 */
export const busyListRows: SheetRow[] = [
    teeTime(
        "2:00 PM",
        booking([{ name: "Marissa Chen", key: true }, "Priya Raman", { name: "Simone Okafor", key: true }, "Rosa Ito"], {
            rate: "Dunes Rack Prime",
            paid: true,
        }),
    ),
    teeTime(
        "2:14 PM",
        booking(["Tony Finau", { name: "Tom Watson", key: true }], { rate: "Course Level Fee", ride: "cartPlus", paid: true }),
        booking([{ name: "Weston Farnsworth", dollar: true }, "Chris Moreno"], { rate: "Senior Weekday", ride: "walk", alt: true }),
    ),
    teeTime(
        "2:28 PM",
        booking(["Quinn Zeller", "Teo Achebe", "Viggo Osei"], { rate: "Online Discount", paid: true, online: true, alt: true }),
    ),
    teeTime(
        "2:42 PM",
        booking(["Igor Kuznetsov", "G-Igor Kuznetsov"], { rate: "Dunes Rack Prime", paid: true, online: true }),
        booking([{ name: "Yusuf Petrov", paid: true }, "Anders Marchetti"], { rate: "Group Pricing", alt: true }),
    ),
    teeTime(
        "2:56 PM",
        booking([{ name: "Sutton, K.", bolt: true }, "Doyle, F."], { rate: "Birdie (25%)" }),
        booking(["Hamlet, J."], { rate: "Senior Weekday", ride: "walk", alt: true }),
    ),
    teeTime(
        "3:10 PM",
        booking(["Caleb Delgado", "Beatriz Salvatore", { name: "Zara Bergstrom", dollar: true }, "Wren Baptiste"], {
            rate: "Course Level Fee",
        }),
    ),
    teeTime(
        "3:24 PM",
        booking(["Amara Nakamura", "Bao Whitfield", "Callum Halloran", { name: "Dermot Nguyen", ride: "walk" }], {
            rate: "Dunes Rack Prime",
            alt: true,
        }),
    ),
    teeTime("3:38 PM", league(4)),
    teeTime("3:52 PM", league(4)),
    teeTime("4:06 PM", league(4)),
    teeTime(
        "4:20 PM",
        booking(["Elena Ito", "Fionn Okafor"], { rate: "Online Discount", paid: true, online: true }),
        booking(["Grete Achebe", "Hugh Kaur"], { rate: "Senior Weekday", alt: true }),
    ),
    teeTime("4:34 PM", booking(["Ines Osei", "Jonas Baptiste", { name: "Kelsey Lindqvist", dollar: true }], { rate: "Course Level Fee" })),
    teeTime("4:48 PM", outing()),
    teeTime("5:02 PM", outing(true)),
    teeTime("5:16 PM", booking(["Lars Petrov", "Milo Bergstrom"], { rate: "Gold Fee (50%)", ride: "walk", alt: true })),
    teeTime(
        "5:30 PM",
        booking(["Nadia Marchetti", "Owen Salvatore", "Petra Delgado", "Quinn Mbeki"], {
            rate: "Online Discount",
            paid: true,
            online: true,
        }),
    ),
    teeTime("5:44 PM", booking(["Rosa Vasquez"], { rate: "Cheapos", ride: "walk", alt: true })),
    transcribed("5:58 PM"),
    teeTime("6:12 PM", booking(["Simone Ferreira", { name: "Teo Nakamura", bolt: true }], { rate: "Birdie (25%)" })),
    teeTime("6:26 PM", booking(["Ursula Whitfield", "Viggo Halloran", "Wren Nguyen"], { rate: "Gold Fee (50%)", alt: true })),
    teeTime("6:40 PM"),
    transcribed("6:54 PM"),
    teeTime("7:08 PM", booking(["Zara Okafor", "Anders Achebe"], { rate: "Cheapos", online: true, paid: true })),
];

/* --------------------------------------------------------------- back 9 */

const navy = { tone: "navy" as const };

/**
 * Back 9 — the morning on both nines.
 *
 * Front-nine starts are full; the back nine carries the nine-hole players who
 * went off number 10, so it is busy but not solid — which is the read a starter
 * wants from this view.
 */
export const busyBackNineFront: SheetRow[] = [
    teeTime(
        "7:00 AM",
        booking(["Fionn Ferreira", "Grete Nakamura", "Hugh Whitfield", "Ines Halloran"], {
            rate: "Dunes Rack Prime",
            paid: true,
            ...navy,
        }),
    ),
    teeTime(
        "7:14 AM",
        booking(["Igor Kuznetsov", "G-Igor Kuznetsov"], { rate: "Dunes Rack Prime", online: true, paid: true, ...navy }),
        booking(["Jonas Nguyen", "Kelsey Zeller"], { rate: "Course Level Fee", paid: true, ...navy }),
    ),
    teeTime(
        "7:28 AM",
        booking(["Lars Ito", "Milo Okafor", "Nadia Achebe", "Owen Kaur"], { rate: "Senior Weekday", ride: "walk", paid: true, ...navy }),
    ),
    teeTime("7:42 AM", booking(["Petra Osei", "Quinn Baptiste", "Rosa Lindqvist"], { rate: "Online Discount", online: true, ...navy })),
    teeTime(
        "7:56 AM",
        booking(["Simone Petrov", "Teo Bergstrom", "Ursula Marchetti", "Viggo Salvatore"], { rate: "Course Level Fee", ...navy }),
    ),
    teeTime("8:10 AM", booking(["Wren Delgado", "Xiomara Mbeki"], { rate: "Birdie (25%)", ...navy })),
    teeTime(
        "8:24 AM",
        booking(["Yusuf Vasquez", "Zara Ferreira", "Anders Nakamura", "Beatriz Whitfield"], { rate: "Dunes Rack Prime", ...navy }),
    ),
    teeTime("8:38 AM", booking(["Caleb Halloran", "Amara Okafor", "Bao Achebe"], { rate: "Gold Fee (50%)", ...navy })),
    teeTime(
        "8:52 AM",
        booking(["Callum Kaur", "Dermot Osei", "Dov Baptiste", "Elena Lindqvist"], { rate: "Online Discount", online: true, ...navy }),
    ),
    teeTime("9:06 AM", booking(["Fionn Petrov", "Grete Bergstrom"], { rate: "Senior Weekday", ride: "walk", ...navy })),
    teeTime("9:20 AM", booking(["Hugh Marchetti", "Ines Salvatore", "Weston Senior", "Dov Zeller"], { rate: "Course Level Fee", ...navy })),
];

export const busyBackNineBack: SheetRow[] = [
    teeTime(
        "7:00 AM",
        booking(["Ursula Kaur", "Xiomara Lindqvist"], { rate: "Senior Weekday", nine: true, paid: true, ...navy }),
        booking(["Bao Marchetti"], { rate: "Cheapos", nine: true, ride: "walk", paid: true, ...navy }),
    ),
    teeTime(
        "7:14 AM",
        booking(["Callum Salvatore", "Dermot Delgado", "Dov Mbeki", "Elena Vasquez"], {
            rate: "Group Pricing",
            nine: true,
            paid: true,
            ...navy,
        }),
    ),
    teeTime("7:28 AM"),
    teeTime("7:42 AM", booking(["Rosa Ito", "Simone Okafor"], { rate: "Birdie (25%)", nine: true, ...navy })),
    teeTime(
        "7:56 AM",
        booking(["Teo Achebe", "Viggo Osei", "Wren Baptiste"], { rate: "Online Discount", nine: true, online: true, ...navy }),
    ),
    teeTime("8:10 AM", booking(["Quinn Zeller"], { rate: "Cheapos", nine: true, ride: "walk", ...navy })),
    teeTime("8:24 AM"),
    teeTime("8:38 AM", booking(["Sutton, K.", "Doyle, F."], { rate: "Senior Weekday", nine: true, ...navy })),
    teeTime(
        "8:52 AM",
        booking(["Chris Moreno", "Priya Raman", "Marissa Chen", "Hamlet, J."], { rate: "Group Pricing", nine: true, ...navy }),
    ),
    teeTime("9:06 AM"),
    teeTime("9:20 AM", booking(["Tony Finau", "Tom Watson"], { rate: "Course Level Fee", nine: true, ...navy })),
];

/* ---------------------------------------------------------------- multi */

/**
 * Multi — the three courses' mornings.
 *
 * North is the Back 9 view's front nine, because it is the same course on the
 * same morning and the two views should not disagree. East and West run on their
 * own intervals (10 and 9 minutes) and are a little quieter, as sister courses
 * usually are.
 */
export const busyMultiCourse: Record<string, SheetRow[]> = {
    "North Course": busyBackNineFront,
    "East Course": [
        teeTime(
            "7:00 AM",
            booking(["Owen Salvatore", "Petra Delgado", "Quinn Mbeki", "Rosa Vasquez"], { rate: "Course Level Fee", paid: true, ...navy }),
        ),
        teeTime("7:10 AM", booking(["Simone Ferreira", "Teo Nakamura"], { rate: "Online Discount", online: true, paid: true, ...navy })),
        teeTime(
            "7:20 AM",
            booking(["Ursula Whitfield", "Viggo Halloran", "Wren Nguyen"], { rate: "Senior Weekday", ride: "walk", ...navy }),
        ),
        teeTime("7:30 AM"),
        teeTime("7:40 AM", booking(["Xiomara Zeller", "Yusuf Ito", "Zara Okafor", "Anders Achebe"], { rate: "Dunes Rack Prime", ...navy })),
        teeTime("7:50 AM", booking(["Beatriz Kaur", "Caleb Osei"], { rate: "Birdie (25%)", ...navy })),
        teeTime("8:00 AM", booking(["Amara Bergstrom", "Bao Marchetti", "Callum Salvatore"], { rate: "Gold Fee (50%)", ...navy })),
        teeTime(
            "8:10 AM",
            booking(["Dermot Delgado", "Dov Mbeki", "Elena Vasquez", "Fionn Ferreira"], { rate: "Online Discount", online: true, ...navy }),
        ),
    ],
    "West Course": [
        teeTime("7:03 AM", booking(["Grete Nakamura", "Hugh Whitfield"], { rate: "Senior Weekday", paid: true, ...navy })),
        teeTime(
            "7:12 AM",
            booking(["Ines Halloran", "Jonas Nguyen", "Kelsey Zeller", "Lars Ito"], { rate: "Group Pricing", paid: true, ...navy }),
        ),
        teeTime("7:21 AM", booking(["Milo Okafor", "Nadia Achebe", "Owen Kaur"], { rate: "Cheapos", ride: "walk", ...navy })),
        teeTime("7:30 AM", booking(["Petra Osei", "Quinn Baptiste"], { rate: "Online Discount", online: true, ...navy })),
        teeTime("7:39 AM"),
        teeTime(
            "7:48 AM",
            booking(["Rosa Lindqvist", "Simone Petrov", "Teo Bergstrom", "Ursula Marchetti"], { rate: "Course Level Fee", ...navy }),
        ),
        teeTime("7:57 AM", booking(["Viggo Salvatore", "Wren Delgado"], { rate: "Gold Fee (50%)", ...navy })),
        teeTime("8:06 AM", booking(["Xiomara Mbeki", "Yusuf Vasquez", "Zara Ferreira"], { rate: "Birdie (25%)", ...navy })),
    ],
};

/* ---------------------------------------------------------------- stats */

/**
 * The stat strip for the whole day, not just the afternoon block above.
 *
 * Total is the transcribed day's 236 positions (59 times × 4) so the two days
 * are the same course; booked plus open adds back up to it.
 */
export const busyStats = { total: "236", booked: "211", paid: "128", noShows: "2", available: "25" } as const;

/* ------------------------------------------------------------- the day */

/** Everything a phone tee sheet needs to render one day. */
export interface TeeSheetDay {
    stats: { total: string; booked: string; paid: string; noShows: string; available: string };
    list: SheetRow[];
    backNineFront: SheetRow[];
    backNineBack: SheetRow[];
    /** Per course name, already position-shaped. */
    multiCourse: Record<string, SheetRow[]>;
}

/**
 * The transcribed May 12 evening, shaped as a `TeeSheetDay`.
 *
 * Multi view's tablet data carries only the filled slots of each card, so each
 * card is padded back out to four here — the padding becomes the phone's
 * "open positions" row.
 */
export const transcribedDay: TeeSheetDay = {
    stats: { total: "236", booked: "50", paid: "5", noShows: "0", available: "186" },
    list: listRows,
    backNineFront,
    backNineBack,
    multiCourse: Object.fromEntries(
        multiCourseColumns.map((column) => [
            column.course,
            column.cards.map((card) => ({ time: card.time, slots: Array.from({ length: 4 }, (_, i) => card.slots[i] ?? null) })),
        ]),
    ),
};

/** The busy day, for the phone's marketing-grade stories. */
export const busyDay: TeeSheetDay = {
    stats: busyStats,
    list: busyListRows,
    backNineFront: busyBackNineFront,
    backNineBack: busyBackNineBack,
    multiCourse: busyMultiCourse,
};

/* -------------------------------------------------------- detail extras */

/**
 * Reservation 10390147's history, filled in.
 *
 * The transcribed dialog has one line — the capture was of a booking edited once.
 * A real reservation two days old has more: who made it, where, and what changed
 * since. The 1:36 PM edit is the transcribed line, kept word for word.
 */
export const busyReservationHistory = {
    id: "10390147",
    entries: [
        { when: "5/10/2026 8:12 PM", who: "Online Booking", what: "Reservation Created : (4) players · 18 holes" },
        { when: "5/10/2026 8:12 PM", who: "Online Booking", what: "Confirmation Emailed : oda.brennevin@att.net" },
        { when: "5/11/2026 9:47 AM", who: "Chris Moreno", what: "Player Added : Rufus Brennevin" },
        { when: "5/11/2026 9:48 AM", who: "Chris Moreno", what: "Rate Changed : Online Discount -> Group Pricing" },
        { when: "5/12/2026 1:36 PM", who: "John Admin", what: "Reservation Edited : $26.33 -> $26.33" },
        { when: "5/12/2026 5:21 PM", who: "Starter Kiosk", what: "Cart Assigned : Dunes Cart Old #42" },
        { when: "5/12/2026 5:22 PM", who: "Starter Kiosk", what: "Reminder Text Sent : 801-708-4153" },
    ],
};

/**
 * Text for the three notes screens, so a notes story shows a note rather than a
 * placeholder. The customer note is Oda Brennevin's own, from her record.
 */
export const busyNotes = {
    "Customer Notes": "Has a standing Saturday foursome. Prefers an early cart and a pull-forward if the starter has room.",
    "Group Notes": "Brennevin family — four on one booking. Ivar is on a punch card; settle his round separately.",
    "Tee Time Notes": "Women's League overflow may join at 5:58. Hold one cart at the starter until 5:45.",
} as const;
