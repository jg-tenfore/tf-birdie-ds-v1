/**
 * Tee Sheet fixtures, transcribed verbatim from `references/072926/2-teesheet/`.
 *
 * Every name, price, time, ID and count below is what the shipping app rendered
 * in those captures — including the "9 roudns" typo on the tee-time detail
 * screen. Nothing here is invented; where a value was cut off by the viewport
 * it is simply omitted rather than filled in.
 *
 * All captures are the same booking day: **The Dunes of Delgado PROD, North
 * Course, Tuesday May 12 2026**.
 */

/** Slot fill, read off the screenshots rather than derived from a status enum. */
export type SlotTone =
    | "booked"
    | "bookedAlt"
    | "paid"
    | "paidAlt"
    | "blocked"
    /** Grid / Multi / Back-9 render reservations on dark navy instead of purple. */
    | "navy";

export interface SheetSlot {
    /** e.g. "(4) Oda Brennevin" — the leading number is the party size. */
    label: string;
    /** Right-aligned amount, already formatted by the app. */
    price?: string;
    tone: SlotTone;
    /** Small cart glyph at the bottom-left of a booked slot. */
    cart?: boolean;
    /** A large "$" watermark — reservations carrying a balance flag. */
    dollar?: boolean;
    /** Bolt — the raincheck marker. */
    bolt?: boolean;
    /** Key — the cart has been signed out. */
    key?: boolean;
    /** Globe — booked online rather than at the counter. */
    online?: boolean;
    /** Extra inline tags shown between the cart glyph and the price, e.g. "9H D35". */
    tags?: string[];
}

export interface SheetRow {
    time: string;
    /** Four playing positions per tee time. `null` is an open position. */
    slots: (SheetSlot | null)[];
}

/** Header numbers in the strip under the date nav. */
export const sheetStats = {
    courseLabel: "Main Course",
    total: "236",
    booked: "50",
    paid: "5",
    noShows: "0",
    available: "186",
    clock: "9:45 AM",
} as const;

export const sheetHeader = {
    facility: "The Dunes of Delgado PROD",
    date: "TUESDAY, MAY 12 2026",
    course: "North Course",
    /** The course picker's menu, in the order the app lists them. */
    courses: ["North Course", "East Course", "West Course"],
} as const;

/** The gear menu that opens from the right-hand column of a list row. */
export const slotSettingsMenu = ["Squeeze Before", "Squeeze After", "Clear Time", "Clone Before", "Clone After", "Move Player(s)"];

const empty4: (SheetSlot | null)[] = [null, null, null, null];

/**
 * List view — the evening block of the North Course sheet.
 *
 * Two purple values alternate across slots in the same row; the app uses the
 * darker shade for some reservations and the lighter for others, which is
 * reproduced position-for-position here rather than guessed at.
 */
export const listRows: SheetRow[] = [
    { time: "5:30 PM", slots: empty4 },
    { time: "5:44 PM", slots: empty4 },
    {
        time: "5:58 PM",
        slots: [
            { label: "(4) Oda Brennevin", price: "$24.61", tone: "booked", cart: true },
            { label: "(4) Ivar Brennevin", price: "$0.93", tone: "bookedAlt", cart: true, dollar: true },
            { label: "(4) Rufus Brennevin", price: "$34.99", tone: "bookedAlt", cart: true },
            { label: "(4) Women's League", price: "$24.61", tone: "booked", cart: true },
        ],
    },
    { time: "6:12 PM", slots: empty4 },
    {
        time: "6:26 PM",
        slots: [
            { label: "(4) Ivar Brennevin", price: "$0.00", tone: "bookedAlt", cart: true, dollar: true },
            { label: "(4) Ivar Brennevin", price: "$0.00", tone: "bookedAlt", cart: true, dollar: true },
            { label: "(4) Ivar Brennevin", price: "$0.00", tone: "bookedAlt", cart: true, dollar: true },
            { label: "(4) Women's League", price: "$24.61", tone: "booked", cart: true },
        ],
    },
    { time: "6:40 PM", slots: empty4 },
    {
        time: "6:54 PM",
        slots: [
            { label: "(2) Oda Brennevin", price: "$125.00", tone: "paid", cart: true, bolt: true, dollar: false },
            { label: "(2) G-Oda Brennevin", price: "$95.42", tone: "paidAlt", cart: true },
            null,
            null,
        ],
    },
    { time: "7:08 PM", slots: empty4 },
];

/** The same 5:58 PM row after a cart signout — the slot picks up a key glyph. */
export const listRowsWithCartKey: SheetRow[] = listRows.map((row) =>
    row.time === "5:58 PM" ? { ...row, slots: row.slots.map((slot, index) => (index === 0 && slot ? { ...slot, key: true } : slot)) } : row,
);

export interface GridCard {
    time: string;
    tone: "open" | "navy" | "paid" | "blocked";
    lines: SheetSlot[];
}

/**
 * Grid view — one card per tee time, six across.
 *
 * The same reservations that read purple in List view read dark navy here, and
 * the paid 6:54 PM time reads a lighter slate-blue rather than green.
 */
export const gridCards: GridCard[] = [
    { time: "2:00 PM", tone: "open", lines: [] },
    { time: "2:14 PM", tone: "open", lines: [] },
    { time: "2:28 PM", tone: "open", lines: [] },
    { time: "2:42 PM", tone: "open", lines: [] },
    { time: "2:56 PM", tone: "open", lines: [] },
    {
        time: "3:10 PM",
        tone: "blocked",
        lines: Array.from({ length: 4 }, () => ({ label: "Pre-Sunset Block", tone: "blocked" as const })),
    },
    {
        time: "3:24 PM",
        tone: "blocked",
        lines: Array.from({ length: 4 }, () => ({ label: "Pre-Sunset Block", tone: "blocked" as const })),
    },
    {
        time: "3:38 PM",
        tone: "navy",
        lines: Array.from({ length: 4 }, () => ({ label: "(12) Women's League", tone: "navy" as const, cart: true })),
    },
    {
        time: "3:52 PM",
        tone: "navy",
        lines: Array.from({ length: 3 }, () => ({ label: "(12) Women's League", tone: "navy" as const, cart: true })),
    },
    {
        time: "4:06 PM",
        tone: "navy",
        lines: Array.from({ length: 3 }, () => ({ label: "(12) Women's League", tone: "navy" as const, cart: true })),
    },
    { time: "4:20 PM", tone: "open", lines: [] },
    { time: "4:34 PM", tone: "open", lines: [] },
    { time: "4:48 PM", tone: "open", lines: [] },
    { time: "5:02 PM", tone: "open", lines: [] },
    { time: "5:16 PM", tone: "open", lines: [] },
    { time: "5:30 PM", tone: "open", lines: [] },
    { time: "5:44 PM", tone: "open", lines: [] },
    {
        time: "5:58 PM",
        tone: "navy",
        lines: [
            { label: "(4) Oda Brennevin", tone: "navy", cart: true },
            { label: "(4) Ivar Brennevin", tone: "navy", cart: true, dollar: true },
            { label: "(4) Rufus Brennevin", tone: "navy", cart: true },
            { label: "(4) Women's League", tone: "navy", cart: true },
        ],
    },
    { time: "6:12 PM", tone: "open", lines: [] },
    {
        time: "6:26 PM",
        tone: "navy",
        lines: [
            { label: "(4) Ivar Brennevin", tone: "navy", cart: true, dollar: true },
            { label: "(4) Ivar Brennevin", tone: "navy", cart: true, dollar: true },
            { label: "(4) Ivar Brennevin", tone: "navy", cart: true, dollar: true },
            { label: "(4) Women's League", tone: "navy", cart: true },
        ],
    },
    { time: "6:40 PM", tone: "open", lines: [] },
    {
        time: "6:54 PM",
        tone: "paid",
        lines: [
            { label: "(2) Oda Brennevin", tone: "paid", cart: true, dollar: true, bolt: true },
            { label: "(2) G-Oda Brennevin", tone: "paid", cart: true },
        ],
    },
    { time: "7:08 PM", tone: "open", lines: [] },
];

export interface MultiCourseColumn {
    course: string;
    cards: { time: string; slots: SheetSlot[] }[];
}

/**
 * Multi view — three courses side by side, morning block.
 *
 * Only the course that has activity shows filled bars; East and West are all
 * open times, and their intervals differ from North's (10 and 9 minutes against
 * North's 14).
 */
export const multiCourseColumns: MultiCourseColumn[] = [
    {
        course: "North Course",
        cards: [
            { time: "5:36 AM", slots: Array.from({ length: 4 }, () => ({ label: "BLOCKED", tone: "blocked" as const })) },
            { time: "5:50 AM", slots: [] },
            {
                time: "6:04 AM",
                slots: [
                    { label: "(2) I. Kuznetsov", price: "$120.00", tone: "navy", cart: true, online: true },
                    { label: "(2) G-I. Kuznetsov", price: "$120.00", tone: "navy", cart: true, online: true },
                ],
            },
            { time: "6:18 AM", slots: [] },
        ],
    },
    {
        course: "East Course",
        cards: ["5:40 AM", "5:50 AM", "6:00 AM", "6:10 AM", "6:20 AM", "6:30 AM", "6:40 AM", "6:50 AM"].map((time) => ({
            time,
            slots: [],
        })),
    },
    {
        course: "West Course",
        cards: ["6:00 AM", "6:09 AM", "6:18 AM", "6:27 AM", "6:36 AM", "6:45 AM", "6:54 AM", "7:03 AM"].map((time) => ({
            time,
            slots: [],
        })),
    },
];

/** Back-9 view — the Front and Back nines of the same course, side by side. */
export const backNineFront: SheetRow[] = [
    { time: "5:36 AM", slots: Array.from({ length: 4 }, () => ({ label: "(4) BLOCKED", tone: "blocked" as const })) },
    { time: "5:50 AM", slots: empty4 },
    {
        time: "6:04 AM",
        slots: [
            { label: "(2) Igor Kuznetsov", price: "$120.00", tone: "navy", cart: true, online: true },
            { label: "(2) G-Igor Kuznetsov", price: "$120.00", tone: "navy", cart: true, online: true },
            null,
            null,
        ],
    },
    { time: "6:18 AM", slots: empty4 },
    { time: "6:32 AM", slots: empty4 },
    {
        time: "6:46 AM",
        slots: [
            { label: "(2) Igor Kuznetsov", price: "$120.00", tone: "navy", cart: true },
            { label: "(2) G-Igor Kuznetsov", price: "$120.00", tone: "navy", cart: true },
            null,
            null,
        ],
    },
    {
        time: "7:00 AM",
        slots: Array.from({ length: 4 }, () => ({
            label: "(4) Women's League",
            price: "$25.93",
            tone: "booked" as const,
            cart: true,
            tags: ["9H", "D35"],
        })),
    },
];

export const backNineBack: SheetRow[] = [
    { time: "5:36 AM", slots: Array.from({ length: 4 }, () => ({ label: "(4) BLOCKED", tone: "blocked" as const })) },
    { time: "5:50 AM", slots: empty4 },
    { time: "6:04 AM", slots: empty4 },
    { time: "6:18 AM", slots: empty4 },
    { time: "6:32 AM", slots: empty4 },
    { time: "6:46 AM", slots: empty4 },
    { time: "7:00 AM", slots: empty4 },
];

/** Shown centred above the Front/Back headers when no weather data exists. */
export const forecastNotice = "No forecast available for this date";

/* ---------------------------------------------------------------------- */
/* Tee time detail                                                         */
/* ---------------------------------------------------------------------- */

export type PlayerAction =
    | "Cancel"
    | "No Show"
    | "Raincheck"
    | "Clone"
    | "History"
    | "Edit"
    | "Cart Signout"
    | "Print Starter"
    | "Print Receipt"
    | "Cart Key"
    | "Add to Cart";

export interface DetailPlayer {
    name: string;
    /** Shown to the right of the name when present. */
    email?: string;
    amount: string;
    /** Small glyphs printed immediately after the name. */
    flags?: ("dollar" | "bolt")[];
    /** The single grey meta line: holes, fee names, reservation ID, points. */
    meta: string;
    actions: PlayerAction[];
    /** The two right-aligned note buttons only appear on some reservations. */
    showNotes?: boolean;
}

export interface TeeTimeDetail {
    /** The full app-bar breadcrumb, exactly as the app composes it. */
    title: string;
    players: DetailPlayer[];
}

/** 5:58 PM — a foursome, mixed paid/unpaid, one carrying a raincheck. */
export const detailFoursome: TeeTimeDetail = {
    title: "The Dunes of Delgado PROD - North Course -  Tuesday, May 12 2026 5:58 PM - 6078027 - FRONT",
    players: [
        {
            name: "Oda Brennevin",
            amount: "$27.82",
            meta: "18 holes   Group Pricing : $1.00   Dunes Cart Old : $26.82   ID:10390147   +125   -1250",
            actions: ["Cancel", "No Show", "History", "Edit", "Cart Signout", "Cart Key", "Add to Cart"],
        },
        {
            name: "Ivar Brennevin",
            flags: ["dollar"],
            amount: "$1.00",
            // "roudns" is the app's own typo and is reproduced as-is.
            meta: "18 holes   Group Pricing : $1.00   Free Punch Cart : $0.00   ID:10390148   +100   -1000      9 roudns",
            actions: ["Raincheck", "History", "Edit", "Cart Signout", "Print Starter", "Print Receipt", "Cart Key"],
        },
        {
            name: "Rufus Brennevin",
            amount: "$37.05",
            meta: "18 holes   Group Pricing : $28.47   Dunes Walking : $8.58   ID:10390149   +27   -350",
            actions: ["Cancel", "No Show", "History", "Edit", "Cart Signout", "Cart Key", "Add to Cart"],
        },
        {
            name: "Women's League",
            amount: "$27.82",
            meta: "",
            actions: [],
        },
    ],
};

/** 6:54 PM — a paid twosome; both rows carry Customer / Group note buttons. */
export const detailPaidPair: TeeTimeDetail = {
    title: "The Dunes of Delgado PROD - North Course -  Tuesday, May 12 2026 6:54 PM - 6078031 - FRONT",
    players: [
        {
            name: "Oda Brennevin",
            flags: ["dollar", "bolt"],
            email: "matt.jensen+testoda@gmail.com",
            amount: "$126.82",
            meta: "18 holes   Dunes Rack Prime : $100.00   Dunes Cart : $26.82   ID:10390493   +70   -116",
            actions: ["Clone", "History", "Edit", "Cart Signout", "Print Starter", "Print Receipt", "Cart Key"],
            showNotes: true,
        },
        {
            name: "G-Oda Brennevin",
            email: "matt.jensen+testoda@gmail.com",
            amount: "$101.82",
            meta: "18 holes   Dunes Rack Non-Prime : $75.00   Dunes Cart : $26.82   ID:10390494   +52   -450",
            actions: ["Cancel", "No Show", "Clone", "History", "Edit", "Cart Signout", "Cart Key", "Add to Cart"],
            showNotes: true,
        },
    ],
};

/** 5:44 PM — nobody booked. The screen keeps its full chrome and shows nothing. */
export const detailEmpty: TeeTimeDetail = {
    title: "The Dunes of Delgado PROD - North Course -  Tuesday, May 12 2026 5:44 PM - 6078026 - FRONT",
    players: [],
};

/** The single audit line shown by History for reservation 10390147. */
export const reservationHistory = {
    id: "10390147",
    entries: [{ when: "5/12/2026 1:36 PM", who: "John Admin", what: "Reservation Edited : $26.33 -> $26.33" }],
};

/* ---------------------------------------------------------------------- */
/* Edit reservation (fees)                                                 */
/* ---------------------------------------------------------------------- */

export const editReservation = {
    guest: { name: "Oda Brennevin", when: "5/12/2026 5:58 PM", email: "matt.jensen+testoda@gmail.com" },
    /** Booker fields render as dashed placeholders when the booker is unknown. */
    bookerPlaceholders: ["--------", "--------", "--------", "--------"],
    holesLabel: "18 holes",
    greenFees: {
        options: [
            "Birdie (25%)",
            "Cheapos",
            "Course Level Fee",
            "Dunes Rack Prime",
            "Gold Fee (50%)",
            "Hamlet's Super Fee",
            "Online Discount",
            "Senior Weekday",
        ],
        selected: "Birdie (25%)",
        subTotal: "$0.93",
        grandTotal: "$1.00",
    },
    transportFees: {
        options: ["Dune Cart Plus", "Dunes Cart", "Dunes Member Cart", "Dunes Walking", "Jeremy Week Day Mem Trans"],
        subTotal: "$23.68",
        grandTotal: "$26.82",
    },
} as const;

/** Cart Sign Out — the liability copy the guest signs against. */
export const cartSignOut = {
    reservation: "Reservation #10390147",
    customer: "Oda Brennevin",
    consent:
        "I understand that I am responsible to any loss or damage done to the property of this golf course. I agree to return the cart undamaged and am fully responsible for any damage done. I also acknowledge that I may be charged for any damage done to course property or any property that is missing.",
    signHere: "Sign Here",
} as const;
