import { seededFloorPlans, type FloorElement } from "@/components/screens/restaurant/floor-plan";
import { customers as seededCustomers, type Customer } from "@/data/crm";
import { modifierSurcharge } from "@/data/modifiers";
import { nextRaincheckId, raincheckValue, rainchecks as seededRainchecks, type Raincheck } from "@/data/rainchecks";
import {
    buildDaySheet,
    may12Sheet,
    todaySheet,
    type Position,
    type ReservationEvent,
    type SheetView,
    type TeeTimeBooking,
} from "@/data/tee-sheet";
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

/**
 * The prototype's single source of truth.
 *
 * In-memory only — a reload returns to seed data, which is what you want for a
 * demo: every run starts from the same believable Saturday morning.
 *
 * Modelled on how the shipping app actually behaves rather than on a clean
 * abstraction. Notably a *tab* and a *ticket* are the same object at different
 * stages: holding a ticket moves it to the tab list, and opening a tab moves it
 * back into the cart. That is why there is one `tickets` collection and a
 * `activeTicketId` pointer rather than separate carts and tabs.
 */

export interface Line {
    id: string;
    name: string;
    qty: number;
    unitPrice: number;
    /** Restaurant orders assign lines to a seat; retail lines have none. */
    seat?: number;
    image?: string;
    note?: string;
    /** Gift cards are stored value, not a sale — tax lands when they are spent. */
    taxable?: boolean;
    /**
     * Selected modifier names, in the order they were tapped.
     *
     * Names rather than ids because that is what the kitchen ticket prints, and
     * what the order line shows — the surcharge is looked up when needed.
     */
    modifiers?: string[];
    /** Sent to the kitchen. A fired line cannot be edited on the device. */
    fired?: boolean;
    /** Percentage off this line, applied before tax. */
    discountPct?: number;
    /** On-hand / available, as the line prints them. */
    stock?: [number, number];
}

export interface Punch {
    at: string;
    kind: "Clock In" | "Clock Out";
}

export type TicketStatus = "open" | "held" | "paid" | "voided";

export interface Ticket {
    id: string;
    number: string;
    /** Guest or table label shown on the tab list. */
    name: string;
    lines: Line[];
    status: TicketStatus;
    opened: string;
    server: string;
    source: "Pro Shop" | "Quick Order" | "Tab" | "Table" | "Tee Sheet";
    seats?: number;
    /** Set once tendered. */
    tender?: "Card" | "Cash" | "Member account" | "Gift card" | "Rain Check";
    customer?: string;
}

/**
 * One playing position on a tee time.
 *
 * The sheet is a grid of four positions per time, not a list of players — a
 * position holds a booking for a party ("(4) Oda Brennevin"), so four positions
 * can represent sixteen golfers. Modelling it as a player list, as an earlier
 * pass did, cannot reproduce the real layout.
 *
 * The model and the seeded day live in `src/data/tee-sheet.ts` so the stories can
 * use them too; this only re-exports.
 */
export type { Position, ReservationEvent, SheetView, TeeTimeBooking };

/**
 * One playing position on a tee time.
 *
 * The sheet is a grid of four positions per time, not a list of players — a
 * position holds a booking for a party ("(4) Oda Brennevin"), so four positions
 * can represent sixteen golfers. Modelling it as a player list, as an earlier
 * pass did, cannot reproduce the real layout.
 */

/**
 * The app's "today". Fixed rather than read from the clock so the prototype
 * behaves identically on every run — and so the orange "not today" date bar can
 * be demonstrated at all.
 */
export const TODAY = "2026-07-29";

/** A simulator-bay reservation. `start` is minutes from midnight. */
export interface BayBooking {
    /** Bay blocks print PAID or UNPAID; the amount is only in the ticket. */
    paid?: boolean;
    id: string;
    bay: string;
    start: number;
    duration: number;
    name: string;
    party: number;
    fee: string;
    price: number;
}

export interface Operator {
    name: string;
    initials: string;
    till: string;
}

interface State {
    operator: Operator | null;
    tickets: Ticket[];
    activeTicketId: string | null;
    /** Sheets keyed by ISO date. Unlisted dates generate an empty sheet. */
    teeSheets: Record<string, TeeTimeBooking[]>;
    /** The date currently on screen — not necessarily today. */
    sheetDate: string;
    course: string;
    facility: string;
    /** Rolling counter so new tickets get plausible sequential numbers. */
    nextNumber: number;
    /** Last completed sale, so the approved screen has something to show. */
    /** Everything the Order Complete receipt prints. */
    lastSale: {
        ticket: Ticket;
        subtotal: number;
        tax: number;
        total: number;
        tender: string;
        /** What the receipt's Payments line prints — the full amount settled. */
        paid: number;
        /**
         * Cash actually handed over.
         *
         * Separate from `paid` because Order Complete's headline is literally
         * "Cash Tendered" on every tender, not "<tender> Tendered" — a raincheck
         * sale reads "Cash Tendered $0.00" over a "Rain Check $53.48" payment
         * line. One number is the drawer, the other is the ticket.
         */
        cash: number;
        change: number;
        /** The receipt's own number, distinct from the ticket's. */
        orderNumber: string;
    } | null;
    bayBookings: BayBooking[];
    /**
     * Court and bay reservations, keyed `date|resource|time`.
     *
     * One flat map rather than a nested structure per resource type, because the
     * court sheet and the bay sheet book the same way — a named person against a
     * named resource at a named time — and a shared key means one reservation
     * screen serves both.
     */
    resourceBookings: Record<string, string>;
    /** The day the court sheet is showing. Independent of the tee sheet's. */
    courtDate: string;
    /**
     * The customer database, in state rather than imported directly, so a
     * customer created at the counter is findable a second later.
     */
    customers: Customer[];
    /**
     * The raincheck ledger, shared by both screens that touch one: the tee
     * sheet's Raincheck button appends here, and the register's RAIN tab spends
     * from here. Keeping it as one list is what makes a credit created in the
     * prototype findable at the till a moment later.
     */
    rainchecks: Raincheck[];
    shiftOpen: boolean;
    clockedIn: boolean;
    /** Time-clock punches, newest first — what the Time Clock log renders. */
    punches: Punch[];
    /**
     * Saved floor plans, keyed by room. The Table Chart editor writes here on
     * SAVE and the live Tables view reads from it, so the two screens are the
     * same data rather than two hard-coded layouts.
     */
    floorPlans: Record<string, FloorElement[]>;
    floorRoom: string;
    toast: string | null;
}

export const TAX_RATE = 0.06;

/**
 * What a line costs.
 *
 * Unit price plus whatever its modifiers add, times quantity, less any line
 * discount. Modifiers are priced per unit — two burgers with bacon are two bacons
 * — which is the only reading that survives changing the quantity afterwards.
 */
export const lineUnitPrice = (l: Line) => l.unitPrice + modifierSurcharge(l.modifiers ?? []);
export const lineTotal = (l: Line) => {
    const gross = l.qty * lineUnitPrice(l);
    return l.discountPct ? +(gross * (1 - l.discountPct / 100)).toFixed(2) : gross;
};
export const subtotalOf = (lines: Line[]) => lines.reduce((s, l) => s + lineTotal(l), 0);

/**
 * Tax is charged on the taxable lines only.
 *
 * A gift card is not a sale, it is stored value — the tax lands when the card is
 * spent. The reference receipt makes this visible: a $20 gift card prints
 * `Taxes and Fees $0.00`, which a flat rate on the subtotal cannot reproduce.
 */
export const taxOf = (lines: Line[]) => lines.filter((l) => l.taxable !== false).reduce((s, l) => s + lineTotal(l), 0) * TAX_RATE;
export const totalOf = (lines: Line[]) => subtotalOf(lines) + taxOf(lines);
export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/* ------------------------------------------------------------------ *
 * Seed data — a busy Saturday mid-morning.
 * ------------------------------------------------------------------ */

const seedTickets: Ticket[] = [
    {
        id: "t-4128",
        number: "#4128",
        name: "Detached Table - 4 seats",
        lines: [
            { id: "fb-draft", name: "Draft beer", qty: 2, unitPrice: 8, seat: 1 },
            { id: "fb-dog", name: "Hot dog", qty: 1, unitPrice: 6.5, seat: 2 },
        ],
        status: "held",
        opened: "9:44 AM",
        server: "Avery Robertson",
        source: "Table",
        seats: 4,
    },
    {
        id: "t-4131",
        number: "#4131",
        name: "Kyler Brooksby",
        lines: [{ id: "fb-burger", name: "Cheeseburger", qty: 1, unitPrice: 13 }],
        status: "held",
        opened: "10:03 AM",
        server: "Kyler Brooksby",
        source: "Tab",
    },
    {
        id: "t-4133",
        number: "#4133",
        name: "partial giftcards",
        lines: [{ id: "ps-glove", name: "Glove", qty: 1, unitPrice: 24 }],
        status: "held",
        opened: "10:12 AM",
        server: "John Admin",
        source: "Tab",
    },
];

const initial: State = {
    operator: null,
    tickets: seedTickets,
    activeTicketId: null,
    teeSheets: { "2026-05-12": may12Sheet, [TODAY]: todaySheet },
    sheetDate: "2026-05-12",
    course: "North Course",
    facility: "The Dunes of Delgado PROD",
    nextNumber: 4140,
    lastSale: null,
    bayBookings: [
        { id: "b1", bay: "Red Bay", start: 10 * 60 + 30, duration: 60, name: "Sutton, K.", party: 2, fee: "Sim Hour", price: 45 },
        { id: "b2", bay: "Green Bay", start: 11 * 60, duration: 90, name: "Ellis, J.", party: 4, fee: "Sim Hour — Peak", price: 90 },
        {
            id: "b3",
            bay: "White Bay",
            start: 12 * 60 + 30,
            duration: 60,
            name: "Corporate — Meridian",
            party: 6,
            fee: "Sim Hour",
            price: 45,
        },
    ],
    shiftOpen: true,
    clockedIn: false,
    punches: [],
    resourceBookings: {},
    courtDate: "2026-07-21",
    customers: seededCustomers,
    rainchecks: seededRainchecks,
    floorPlans: seededFloorPlans,
    floorRoom: "bigroom",
    toast: null,
};

/* ------------------------------------------------------------------ */

type Action =
    | { type: "signIn"; operator: Operator }
    | { type: "signOut" }
    | { type: "addItem"; item: { id: string; name: string; price: number; image?: string; taxable?: boolean }; seat?: number; source: Ticket["source"] }
    | { type: "changeQty"; lineId: string; delta: number; seat?: number }
    | { type: "setLineModifiers"; lineId: string; seat?: number; modifiers: string[] }
    | { type: "setLineNote"; lineId: string; seat?: number; note: string }
    | { type: "setLineQty"; lineId: string; seat?: number; qty: number }
    | { type: "fireLine"; lineId: string; seat?: number }
    | { type: "moveLine"; lineId: string; from?: number; to: number }
    | { type: "splitLine"; lineId: string; seat?: number; to: number }
    | { type: "discountLine"; lineId: string; seat?: number; pct: number }
    | { type: "removeLine"; lineId: string; seat?: number }
    | { type: "clearCart" }
    | { type: "popDrawer" }
    | { type: "holdTicket" }
    | { type: "openTicket"; ticketId: string }
    | { type: "attachCustomer"; name: string }
    | { type: "pay"; tender: NonNullable<Ticket["tender"]>; tendered?: number; raincheckId?: string }
    | { type: "setSheetDate"; date: string }
    | { type: "shiftSheetDate"; days: number }
    | { type: "setCourse"; course: string }
    | { type: "checkIn"; time: string }
    | { type: "cancelPosition"; time: string; index: number }
    | { type: "markNoShow"; time: string; index: number }
    | { type: "signOutCart"; time: string; index: number }
    | { type: "issueRaincheck"; time: string; index: number; holesPlayed: number }
    | { type: "setPositionNotes"; time: string; index: number; field: "customerNotes" | "groupNotes"; value: string }
    | { type: "setTeeTimeNotes"; time: string; value: string }
    | { type: "squeezeTime"; time: string; side: "before" | "after" }
    | { type: "cloneTime"; time: string; side: "before" | "after" }
    | { type: "clearTime"; time: string }
    | { type: "movePlayers"; from: string; to: string }
    | { type: "editPositionFees"; time: string; index: number; rateName: string; cartLabel: string; price: number }
    | { type: "chargeTeeTime"; time: string; only?: number }
    | { type: "clockToggle"; at: string }
    | { type: "openTable"; label: string; seats: number; server: string }
    | { type: "setFloorRoom"; room: string }
    | { type: "saveFloorPlan"; room: string; elements: FloorElement[] }
    | { type: "addBayBooking"; booking: Omit<BayBooking, "id"> }
    | { type: "reserveResource"; date: string; resource: string; time: string; customer: string }
    | { type: "cancelResource"; date: string; resource: string; time: string }
    | { type: "setCourtDate"; date: string }
    | { type: "shiftCourtDate"; days: number }
    | { type: "addCustomer"; customer: Customer }
    | { type: "endShift" }
    | { type: "toast"; message: string | null };

/** The sheet for the date on screen. Unknown dates render as an empty day. */
/** `6:14 AM` → minutes past midnight. The sheet stores times as display text. */
export function minutesOf(time: string): number {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
    if (!m) return 0;
    const h = Number(m[1]) % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0);
    return h * 60 + Number(m[2]);
}

/** `2026-05-12` → `5/12/2026`, the form every dated row in the app prints. */
export const slashDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${Number(m)}/${Number(d)}/${y}`;
};

export function formatTime(mins: number): string {
    const wrapped = ((mins % 1440) + 1440) % 1440;
    const h24 = Math.floor(wrapped / 60);
    return `${h24 % 12 || 12}:${String(wrapped % 60).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

/** The day's own spacing, read off the first two times rather than assumed. */
function intervalOf(sheet: TeeTimeBooking[]): number {
    if (sheet.length < 2) return 10;
    return Math.max(1, minutesOf(sheet[1].time) - minutesOf(sheet[0].time));
}

function sheetFor(state: State): TeeTimeBooking[] {
    return state.teeSheets[state.sheetDate] ?? emptySheet();
}

/**
 * A blank sheet for any date with no configured times.
 *
 * Times are still laid out — an unconfigured day looks like a bookable day with
 * nothing sold, which is the truth: the course has hours, it just has no
 * reservations.
 */
function emptySheet(): TeeTimeBooking[] {
    return buildDaySheet({ density: 0, seed: 1 }).map((t) => ({ ...t, positions: [null, null, null, null] as (Position | null)[] }));
}

/**
 * The ticket holding a given line.
 *
 * Prefers the active ticket when it has the line, so two tickets carrying the same
 * product id cannot cross-edit; otherwise falls back to whichever ticket owns it.
 */
function ticketHolding(state: State, lineId: string, seat?: number) {
    const matches = (t: Ticket) => t.lines.some((l) => l.id === lineId && (seat === undefined || l.seat === seat));
    const active = activeTicket(state);
    if (active && matches(active)) return active;
    return state.tickets.find(matches) ?? null;
}

function activeTicket(state: State) {
    return state.tickets.find((t) => t.id === state.activeTicketId) ?? null;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "signIn":
            return { ...state, operator: action.operator, toast: `Signed in as ${action.operator.name}` };

        case "signOut":
            return { ...initial, tickets: state.tickets, teeSheets: state.teeSheets, nextNumber: state.nextNumber };

        case "addItem": {
            let tickets = state.tickets;
            let id = state.activeTicketId;
            let nextNumber = state.nextNumber;

            // Ringing an item with no open ticket starts one, which is how the
            // shipping app behaves — there is no explicit "new ticket" step.
            if (!id) {
                id = `t-${nextNumber}`;
                tickets = [
                    ...tickets,
                    {
                        id,
                        number: `#${nextNumber}`,
                        name: action.source === "Pro Shop" ? "Walk-up" : "New order",
                        lines: [],
                        status: "open",
                        opened: "now",
                        server: state.operator?.name ?? "—",
                        source: action.source,
                    },
                ];
                nextNumber += 1;
            }

            tickets = tickets.map((t) => {
                if (t.id !== id) return t;
                const match = t.lines.find((l) => l.id === action.item.id && l.seat === action.seat);
                const lines = match
                    ? t.lines.map((l) => (l === match ? { ...l, qty: l.qty + 1 } : l))
                    : [
                          ...t.lines,
                          {
                              id: action.item.id,
                              name: action.item.name,
                              qty: 1,
                              unitPrice: action.item.price,
                              image: action.item.image,
                              taxable: action.item.taxable,
                              seat: action.seat,
                          },
                      ];
                return { ...t, lines };
            });

            return { ...state, tickets, activeTicketId: id, nextNumber, toast: `${action.item.name} added` };
        }

        /**
         * Everything the order line's kebab menu does.
         *
         * They share a branch because they all rewrite one line inside one ticket,
         * and doing that by hand in six places is how updates get lost.
         *
         * The ticket is the one that *owns the line*, not the active one: a tab
         * reached by URL is not necessarily active, and keying off `activeTicketId`
         * made every one of these silently do nothing.
         */
        case "setLineModifiers":
        case "setLineNote":
        case "setLineQty":
        case "fireLine":
        case "discountLine": {
            const current = ticketHolding(state, action.lineId, action.seat);
            if (!current) return state;

            const lines = current.lines.map((l) => {
                if (l.id !== action.lineId || (action.seat !== undefined && l.seat !== action.seat)) return l;
                switch (action.type) {
                    case "setLineModifiers":
                        return { ...l, modifiers: action.modifiers };
                    case "setLineNote":
                        return { ...l, note: action.note || undefined };
                    case "setLineQty":
                        return { ...l, qty: Math.max(1, action.qty) };
                    case "fireLine":
                        return { ...l, fired: true };
                    case "discountLine":
                        return { ...l, discountPct: action.pct || undefined };
                }
            });

            const toast =
                action.type === "fireLine"
                    ? "Fired to the kitchen"
                    : action.type === "discountLine"
                      ? action.pct
                          ? `${action.pct}% off applied`
                          : "Discount removed"
                      : null;

            return {
                ...state,
                tickets: state.tickets.map((t) => (t.id === current.id ? { ...t, lines } : t)),
                ...(toast ? { toast } : {}),
            };
        }

        case "moveLine": {
            const current = ticketHolding(state, action.lineId, action.from);
            if (!current) return state;
            return {
                ...state,
                tickets: state.tickets.map((t) =>
                    t.id !== current.id
                        ? t
                        : {
                              ...t,
                              lines: t.lines.map((l) =>
                                  l.id === action.lineId && (action.from === undefined || l.seat === action.from)
                                      ? { ...l, seat: action.to }
                                      : l,
                              ),
                          },
                ),
                toast: `Moved to seat ${action.to}`,
            };
        }

        /**
         * Split one unit off onto another seat.
         *
         * Two people sharing a plate is the case this exists for, so it peels a
         * single unit rather than halving — and it refuses on a single-unit line,
         * because splitting one plate into two lines of one is not a split.
         */
        case "splitLine": {
            const current = ticketHolding(state, action.lineId, action.seat);
            if (!current) return state;
            const source = current.lines.find((l) => l.id === action.lineId && (action.seat === undefined || l.seat === action.seat));
            if (!source || source.qty < 2) return { ...state, toast: "Nothing to split — the line is a single item" };

            const lines = current.lines
                .map((l) => (l === source ? { ...l, qty: l.qty - 1 } : l))
                .concat([{ ...source, qty: 1, seat: action.to, note: `Split from seat ${source.seat ?? 1}` }]);

            return {
                ...state,
                tickets: state.tickets.map((t) => (t.id === current.id ? { ...t, lines } : t)),
                toast: `Split one to seat ${action.to}`,
            };
        }

        case "changeQty":
            return {
                ...state,
                tickets: state.tickets.map((t) =>
                    t.id !== state.activeTicketId
                        ? t
                        : {
                              ...t,
                              lines: t.lines.flatMap((l) => {
                                  if (l.id !== action.lineId || l.seat !== action.seat) return [l];
                                  const qty = l.qty + action.delta;
                                  return qty <= 0 ? [] : [{ ...l, qty }];
                              }),
                          },
                ),
            };

        case "removeLine":
            return {
                ...state,
                tickets: state.tickets.map((t) =>
                    t.id !== state.activeTicketId
                        ? t
                        : { ...t, lines: t.lines.filter((l) => !(l.id === action.lineId && l.seat === action.seat)) },
                ),
            };

        /**
         * POP opens the cash drawer. Nothing else.
         *
         * An earlier pass read it as "hold this ticket" and wired it to
         * holdTicket, which meant the button on four screens did something it had
         * never claimed to do. The device confirms with a toast and no state
         * changes at all — holding a ticket is Quick Tab, in the overflow menu.
         */
        case "popDrawer":
            return { ...state, toast: "Drawer Popping!" };

        case "clearCart": {
            const current = activeTicket(state);
            if (!current) return state;
            // Discard the ticket entirely if it was never named or held.
            return {
                ...state,
                tickets: state.tickets.filter((t) => t.id !== current.id),
                activeTicketId: null,
                toast: "Order reset",
            };
        }

        case "holdTicket": {
            const current = activeTicket(state);
            if (!current || current.lines.length === 0) return { ...state, toast: "Nothing to hold" };
            return {
                ...state,
                tickets: state.tickets.map((t) => (t.id === current.id ? { ...t, status: "held" } : t)),
                activeTicketId: null,
                toast: `Ticket ${current.number} held`,
            };
        }

        case "openTicket":
            return { ...state, activeTicketId: action.ticketId, toast: null };

        case "attachCustomer":
            return {
                ...state,
                tickets: state.tickets.map((t) => (t.id === state.activeTicketId ? { ...t, customer: action.name, name: action.name } : t)),
                toast: `${action.name} attached`,
            };

        case "pay": {
            const current = activeTicket(state);
            if (!current || current.lines.length === 0) return state;
            const total = totalOf(current.lines);

            // A raincheck has to cover the whole ticket here. The device can take
            // a short one as a part payment and leave a balance — this store has
            // no split-tender model, so rather than silently swallow the credit,
            // refuse and say by how much it falls short.
            const credit = action.raincheckId ? state.rainchecks.find((r) => r.id === action.raincheckId) : undefined;
            if (action.raincheckId && !credit) return { ...state, toast: "That raincheck no longer exists" };
            if (credit && credit.balance + 0.001 < total) {
                return { ...state, toast: `Raincheck ${credit.id} is ${money(total - credit.balance)} short of the total` };
            }

            const cash = action.tender === "Cash" ? (action.tendered ?? total) : 0;

            return {
                ...state,
                tickets: state.tickets.map((t) => (t.id === current.id ? { ...t, status: "paid", tender: action.tender } : t)),
                activeTicketId: null,
                // Spending a raincheck draws its balance down rather than closing
                // it — a $72.22 credit against a $53.48 ticket leaves $18.74 that
                // the same customer can spend again next week.
                rainchecks: credit
                    ? state.rainchecks.map((r) =>
                          r.id === credit.id ? { ...r, spent: +(r.spent + total).toFixed(2), balance: +(r.balance - total).toFixed(2) } : r,
                      )
                    : state.rainchecks,
                lastSale: {
                    ticket: { ...current, status: "paid", tender: action.tender },
                    subtotal: subtotalOf(current.lines),
                    tax: taxOf(current.lines),
                    total,
                    tender: action.tender,
                    paid: total,
                    cash,
                    change: Math.max(0, cash - total),
                    orderNumber: String(5593000 + state.tickets.length * 7 + 62),
                },
                toast: null,
            };
        }

        case "setSheetDate":
            return { ...state, sheetDate: action.date };

        case "shiftSheetDate": {
            const d = new Date(`${state.sheetDate}T12:00:00`);
            d.setDate(d.getDate() + action.days);
            return { ...state, sheetDate: d.toISOString().slice(0, 10) };
        }

        case "setCourse":
            return { ...state, course: action.course, toast: `${action.course} loaded` };

        case "checkIn":
            return {
                ...state,
                teeSheets: {
                    ...state.teeSheets,
                    [state.sheetDate]: sheetFor(state).map((t) =>
                        t.time !== action.time ? t : { ...t, positions: t.positions.map((p) => (p ? { ...p, checkedIn: true } : p)) },
                    ),
                },
                toast: `${action.time} checked in`,
            };

        /**
         * Everything the detail screen's per-position buttons do.
         *
         * They all write to the same sheet slot, so they share one helper rather
         * than each rebuilding the nested state by hand — that was where an
         * earlier pass lost updates.
         */
        /**
         * Cut a raincheck from a round.
         *
         * Two writes, which is why this is not folded in with the other
         * per-position buttons below: the position gains the bolt glyph so the
         * sheet shows what happened, and a credit lands in the ledger so the
         * register can find it. Doing only the first — which is what an earlier
         * pass did — produces a marked booking and no money anywhere.
         */
        case "issueRaincheck": {
            const sheet = sheetFor(state);
            const booking = sheet.find((t) => t.time === action.time);
            const position = booking?.positions[action.index];
            if (!booking || !position) return state;

            const id = nextRaincheckId(state.rainchecks);
            const awarded = raincheckValue(position.price, position.holes, action.holesPlayed);
            // Straight off the booking. Matching on the printed name would fail
            // for exactly the people it matters for — "Sutton, K." and the "G-"
            // guest accounts are not what their records are called.
            const owner = position.customerId ? state.customers.find((c) => c.id === position.customerId) : undefined;

            return {
                ...state,
                teeSheets: {
                    ...state.teeSheets,
                    [state.sheetDate]: sheet.map((t) =>
                        t.time !== action.time
                            ? t
                            : { ...t, positions: t.positions.map((p, i) => (i === action.index && p ? { ...p, raincheck: true } : p)) },
                    ),
                },
                rainchecks: [
                    {
                        id,
                        customerId: owner?.id ?? "",
                        // The record's name, falling back to the booking's. A
                        // credit found at the till should read the way the
                        // customer's own record does.
                        customerName: owner?.displayName ?? position.name,
                        email: position.email ?? owner?.email,
                        reservation: position.id,
                        // The round this came off, stamped now — the sheet for
                        // that day will not be loaded when the register or the
                        // customer's record goes looking for it.
                        teeTime: `${slashDate(state.sheetDate)} ${booking.time}`,
                        issued: state.sheetDate,
                        expires: `${Number(state.sheetDate.slice(0, 4)) + 1}${state.sheetDate.slice(4)}`,
                        roundPrice: position.price,
                        totalHoles: position.holes,
                        holesPlayed: action.holesPlayed,
                        awarded,
                        spent: 0,
                        balance: awarded,
                    },
                    ...state.rainchecks,
                ],
                toast: `Raincheck ${id} created for ${money(awarded)}`,
            };
        }

        case "cancelPosition":
        case "markNoShow":
        case "signOutCart":
        case "setPositionNotes":
        case "editPositionFees": {
            const sheet = sheetFor(state);
            const next = sheet.map((t) => {
                if (t.time !== action.time) return t;
                return {
                    ...t,
                    positions: t.positions.map((p, i) => {
                        if (i !== action.index || !p) return p;
                        switch (action.type) {
                            // Cancelling frees the position outright — the app does
                            // not keep a cancelled booking on the sheet.
                            case "cancelPosition":
                                return null;
                            case "markNoShow":
                                return { ...p, noShow: true };
                            case "signOutCart":
                                return { ...p, keyed: true };
                            case "setPositionNotes":
                                return { ...p, [action.field]: action.value };
                            case "editPositionFees":
                                return { ...p, rateName: action.rateName, cartLabel: action.cartLabel, price: action.price };
                        }
                    }),
                };
            });

            const toast =
                action.type === "cancelPosition"
                    ? "Reservation cancelled"
                    : action.type === "markNoShow"
                      ? "Marked no show"
                      : action.type === "signOutCart"
                        ? "Cart signed out"
                        : action.type === "editPositionFees"
                          ? "Fees saved"
                          : "Notes saved";

            return { ...state, teeSheets: { ...state.teeSheets, [state.sheetDate]: next }, toast };
        }

        /**
         * The per-time operations behind the gear menu.
         *
         * All four rewrite the day's *shape* rather than a single booking, which
         * is why they live together: squeezing and cloning insert a time, so any
         * index-based reference into the sheet is invalid afterwards. Everything
         * downstream keys off `time`, not position, for exactly this reason.
         */
        case "squeezeTime":
        case "cloneTime": {
            const sheet = sheetFor(state);
            const at = sheet.findIndex((t) => t.time === action.time);
            if (at === -1) return state;

            const source = sheet[at];
            // Squeeze lands halfway to the neighbour on that side; with no
            // neighbour it falls back to half the day's own interval.
            const neighbour = action.side === "before" ? sheet[at - 1] : sheet[at + 1];
            const gap = neighbour ? Math.abs(minutesOf(neighbour.time) - minutesOf(source.time)) : intervalOf(sheet);
            const offset = Math.max(1, Math.round(gap / 2)) * (action.side === "before" ? -1 : 1);
            const time = formatTime(minutesOf(source.time) + offset);

            // A squeeze that lands on an existing time would create a duplicate
            // key and two rows claiming the same slot.
            if (sheet.some((t) => t.time === time)) return { ...state, toast: `${time} already exists` };

            const inserted: TeeTimeBooking =
                action.type === "squeezeTime"
                    ? { time, positions: [null, null, null, null], confirmation: String(6079000 + at), nine: "FRONT" }
                    : {
                          ...source,
                          time,
                          confirmation: String(6079500 + at),
                          // Cloned bookings are new reservations, so they get new
                          // ids and an empty history rather than sharing the
                          // original's audit trail.
                          positions: source.positions.map((pos) =>
                              pos ? { ...pos, id: `${pos.id}-c`, paid: false, keyed: false, history: [] } : null,
                          ),
                      };

            const next = [...sheet.slice(0, action.side === "before" ? at : at + 1), inserted, ...sheet.slice(action.side === "before" ? at : at + 1)];
            return {
                ...state,
                teeSheets: { ...state.teeSheets, [state.sheetDate]: next },
                toast: `${action.type === "cloneTime" ? "Cloned to" : "Squeezed in"} ${time}`,
            };
        }

        case "clearTime":
            return {
                ...state,
                teeSheets: {
                    ...state.teeSheets,
                    [state.sheetDate]: sheetFor(state).map((t) =>
                        t.time === action.time ? { ...t, positions: [null, null, null, null], blocked: false, blockLabel: undefined } : t,
                    ),
                },
                toast: `${action.time} cleared`,
            };

        case "movePlayers": {
            const sheet = sheetFor(state);
            const from = sheet.find((t) => t.time === action.from);
            const to = sheet.find((t) => t.time === action.to);
            if (!from || !to) return state;

            const moving = from.positions.filter(Boolean).length;
            const room = to.positions.filter((p) => !p).length;
            // Refuse rather than silently dropping golfers, which is what an
            // unchecked move would do.
            if (moving > room) return { ...state, toast: `${action.to} only has room for ${room}` };

            let slot = 0;
            const merged = to.positions.map((p) => {
                if (p) return p;
                const nextPos = from.positions.filter(Boolean)[slot];
                slot += 1;
                return nextPos ?? null;
            });

            return {
                ...state,
                teeSheets: {
                    ...state.teeSheets,
                    [state.sheetDate]: sheet.map((t) => {
                        if (t.time === action.from) return { ...t, positions: [null, null, null, null] };
                        if (t.time === action.to) return { ...t, positions: merged };
                        return t;
                    }),
                },
                toast: `Moved ${moving} to ${action.to}`,
            };
        }

        case "setTeeTimeNotes":
            return {
                ...state,
                teeSheets: {
                    ...state.teeSheets,
                    [state.sheetDate]: sheetFor(state).map((t) => (t.time === action.time ? { ...t, teeTimeNotes: action.value } : t)),
                },
                toast: "Tee time notes saved",
            };

        case "chargeTeeTime": {
            const slot = sheetFor(state).find((t) => t.time === action.time);
            const booked = slot?.positions.filter((p): p is Position => Boolean(p)) ?? [];
            // `only` lets a single position be added, which is what the
            // per-player "Add to Cart" on the detail screen does.
            const taking = action.only !== undefined ? booked.filter((_, i) => i === action.only) : booked;
            if (taking.length === 0) return state;

            const existingId = state.activeTicketId;
            const id = existingId ?? `t-${state.nextNumber}`;
            const newLines: Line[] = taking.map((p, i) => ({
                id: `${action.time}-${action.only ?? i}`,
                name: `${p.name} — ${p.holes} holes · ${p.rate}`,
                qty: 1,
                unitPrice: p.price,
            }));

            const tickets = existingId
                ? state.tickets.map((t) => (t.id === existingId ? { ...t, lines: [...t.lines, ...newLines] } : t))
                : [
                      ...state.tickets,
                      {
                          id,
                          number: `#${state.nextNumber}`,
                          name: taking[0].name,
                          lines: newLines,
                          status: "open" as const,
                          opened: slot!.time,
                          server: state.operator?.name ?? "—",
                          source: "Tee Sheet" as const,
                      },
                  ];

            return {
                ...state,
                tickets,
                activeTicketId: id,
                nextNumber: existingId ? state.nextNumber : state.nextNumber + 1,
                teeSheets: {
                    ...state.teeSheets,
                    [state.sheetDate]: sheetFor(state).map((t) =>
                        t.time === action.time ? { ...t, positions: t.positions.map((p) => (p ? { ...p, checkedIn: true } : p)) } : t,
                    ),
                },
                toast: `${taking.length} added to ticket`,
            };
        }

        /**
         * Tapping a table on the floor either reopens its check or starts one.
         *
         * A table's check is an ordinary ticket with `source: "Table"` — the
         * seat editor at /tabs/:id is the same screen either way, which is what
         * the app does: there is no separate "table order" screen, only a ticket
         * that happens to belong to a table.
         */
        case "openTable": {
            const existing = state.tickets.find((t) => t.name === action.label && t.status !== "paid" && t.status !== "voided");
            if (existing) return { ...state, activeTicketId: existing.id, tickets: state.tickets.map((t) => (t.id === existing.id ? { ...t, status: "open" } : t)) };

            const id = `t-${state.nextNumber}`;
            return {
                ...state,
                nextNumber: state.nextNumber + 1,
                activeTicketId: id,
                tickets: [
                    ...state.tickets,
                    {
                        id,
                        number: `#${4252110 + state.tickets.length}`,
                        name: action.label,
                        lines: [],
                        status: "open",
                        opened: "now",
                        server: action.server,
                        source: "Table",
                        seats: action.seats,
                    },
                ],
                toast: `${action.label} opened`,
            };
        }

        case "setFloorRoom":
            return { ...state, floorRoom: action.room };

        case "saveFloorPlan":
            return {
                ...state,
                floorPlans: { ...state.floorPlans, [action.room]: action.elements },
                toast: `${action.room} layout saved`,
            };

        case "clockToggle": {
            const kind = state.clockedIn ? "Clock Out" : "Clock In";
            return {
                ...state,
                clockedIn: !state.clockedIn,
                // Newest punch on top, which is how the device stacks them.
                punches: [{ at: action.at, kind }, ...state.punches],
                toast: state.clockedIn ? "Clocked out" : "Clocked in",
            };
        }

        case "reserveResource":
            return {
                ...state,
                resourceBookings: {
                    ...state.resourceBookings,
                    [`${action.date}|${action.resource}|${action.time}`]: action.customer,
                },
                toast: `${action.resource} ${action.time} reserved for ${action.customer}`,
            };

        case "cancelResource": {
            const next = { ...state.resourceBookings };
            delete next[`${action.date}|${action.resource}|${action.time}`];
            return { ...state, resourceBookings: next, toast: `${action.resource} ${action.time} released` };
        }

        case "setCourtDate":
            return { ...state, courtDate: action.date };

        case "shiftCourtDate": {
            const d = new Date(`${state.courtDate}T12:00:00`);
            d.setDate(d.getDate() + action.days);
            return { ...state, courtDate: d.toISOString().slice(0, 10) };
        }

        // Newest first, so a customer created at the counter is the top hit when
        // the operator searches the name they just typed.
        case "addCustomer":
            return { ...state, customers: [action.customer, ...state.customers], toast: `${action.customer.displayName} added` };

        case "addBayBooking":
            return {
                ...state,
                bayBookings: [...state.bayBookings, { ...action.booking, id: `b-${state.bayBookings.length + 1}-${action.booking.start}` }],
                toast: `${action.booking.bay} booked for ${action.booking.name || "guest"}`,
            };

        case "endShift":
            return { ...state, shiftOpen: false, toast: "Shift ended" };

        case "toast":
            return { ...state, toast: action.message };

        default:
            return state;
    }
}

const StoreContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
    ticket: Ticket | null;
    lines: Line[];
    teeTimes: TeeTimeBooking[];
    isToday: boolean;
    subtotal: number;
    tax: number;
    total: number;
    heldTickets: Ticket[];
    paidTickets: Ticket[];
} | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initial);

    const value = useMemo(() => {
        const ticket = state.tickets.find((t) => t.id === state.activeTicketId) ?? null;
        const lines = ticket?.lines ?? [];
        return {
            state,
            dispatch,
            ticket,
            lines,
            subtotal: subtotalOf(lines),
            tax: taxOf(lines),
            total: totalOf(lines),
            teeTimes: sheetFor(state),
            isToday: state.sheetDate === TODAY,
            heldTickets: state.tickets.filter((t) => t.status === "held"),
            paidTickets: state.tickets.filter((t) => t.status === "paid"),
        };
    }, [state]);

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
    return ctx;
}

/** Convenience wrappers so screens read as intent rather than dispatch calls. */
export function useActions() {
    const { dispatch } = useStore();
    return useMemo(
        () => ({
            signIn: (operator: Operator) => dispatch({ type: "signIn", operator }),
            signOut: () => dispatch({ type: "signOut" }),
            addItem: (
                item: { id: string; name: string; price: number; image?: string; taxable?: boolean },
                source: Ticket["source"] = "Pro Shop",
                seat?: number,
            ) => dispatch({ type: "addItem", item, source, seat }),
            changeQty: (lineId: string, delta: number, seat?: number) => dispatch({ type: "changeQty", lineId, delta, seat }),
            setLineModifiers: (lineId: string, modifiers: string[], seat?: number) =>
                dispatch({ type: "setLineModifiers", lineId, modifiers, seat }),
            setLineNote: (lineId: string, note: string, seat?: number) => dispatch({ type: "setLineNote", lineId, note, seat }),
            setLineQty: (lineId: string, qty: number, seat?: number) => dispatch({ type: "setLineQty", lineId, qty, seat }),
            fireLine: (lineId: string, seat?: number) => dispatch({ type: "fireLine", lineId, seat }),
            moveLine: (lineId: string, to: number, from?: number) => dispatch({ type: "moveLine", lineId, to, from }),
            splitLine: (lineId: string, to: number, seat?: number) => dispatch({ type: "splitLine", lineId, to, seat }),
            discountLine: (lineId: string, pct: number, seat?: number) => dispatch({ type: "discountLine", lineId, pct, seat }),
            removeLine: (lineId: string, seat?: number) => dispatch({ type: "removeLine", lineId, seat }),
            clearCart: () => dispatch({ type: "clearCart" }),
            popDrawer: () => dispatch({ type: "popDrawer" }),
            holdTicket: () => dispatch({ type: "holdTicket" }),
            openTicket: (ticketId: string) => dispatch({ type: "openTicket", ticketId }),
            attachCustomer: (name: string) => dispatch({ type: "attachCustomer", name }),
            pay: (tender: NonNullable<Ticket["tender"]>, tendered?: number, raincheckId?: string) =>
                dispatch({ type: "pay", tender, tendered, raincheckId }),
            setSheetDate: (date: string) => dispatch({ type: "setSheetDate", date }),
            shiftSheetDate: (days: number) => dispatch({ type: "shiftSheetDate", days }),
            goToToday: () => dispatch({ type: "setSheetDate", date: TODAY }),
            setCourse: (course: string) => dispatch({ type: "setCourse", course }),
            checkIn: (time: string) => dispatch({ type: "checkIn", time }),
            cancelPosition: (time: string, index: number) => dispatch({ type: "cancelPosition", time, index }),
            markNoShow: (time: string, index: number) => dispatch({ type: "markNoShow", time, index }),
            signOutCart: (time: string, index: number) => dispatch({ type: "signOutCart", time, index }),
            issueRaincheck: (time: string, index: number, holesPlayed: number) =>
                dispatch({ type: "issueRaincheck", time, index, holesPlayed }),
            setPositionNotes: (time: string, index: number, field: "customerNotes" | "groupNotes", value: string) =>
                dispatch({ type: "setPositionNotes", time, index, field, value }),
            setTeeTimeNotes: (time: string, value: string) => dispatch({ type: "setTeeTimeNotes", time, value }),
            squeezeTime: (time: string, side: "before" | "after") => dispatch({ type: "squeezeTime", time, side }),
            cloneTime: (time: string, side: "before" | "after") => dispatch({ type: "cloneTime", time, side }),
            clearTime: (time: string) => dispatch({ type: "clearTime", time }),
            movePlayers: (from: string, to: string) => dispatch({ type: "movePlayers", from, to }),
            editPositionFees: (time: string, index: number, rateName: string, cartLabel: string, price: number) =>
                dispatch({ type: "editPositionFees", time, index, rateName, cartLabel, price }),
            chargeTeeTime: (time: string, only?: number) => dispatch({ type: "chargeTeeTime", time, only }),
            clockToggle: (at: string) => dispatch({ type: "clockToggle", at }),
            openTable: (label: string, seats: number, server: string) => dispatch({ type: "openTable", label, seats, server }),
            setFloorRoom: (room: string) => dispatch({ type: "setFloorRoom", room }),
            saveFloorPlan: (room: string, elements: FloorElement[]) => dispatch({ type: "saveFloorPlan", room, elements }),
            addBayBooking: (booking: Omit<BayBooking, "id">) => dispatch({ type: "addBayBooking", booking }),
            reserveResource: (date: string, resource: string, time: string, customer: string) =>
                dispatch({ type: "reserveResource", date, resource, time, customer }),
            cancelResource: (date: string, resource: string, time: string) => dispatch({ type: "cancelResource", date, resource, time }),
            setCourtDate: (date: string) => dispatch({ type: "setCourtDate", date }),
            shiftCourtDate: (days: number) => dispatch({ type: "shiftCourtDate", days }),
            addCustomer: (customer: Customer) => dispatch({ type: "addCustomer", customer }),
            endShift: () => dispatch({ type: "endShift" }),
            toast: (message: string | null) => dispatch({ type: "toast", message }),
        }),
        [dispatch],
    );
}

export const useCartCount = () => {
    const { lines } = useStore();
    return lines.reduce((n, l) => n + l.qty, 0);
};
