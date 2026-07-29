import { seededFloorPlans, type FloorElement } from "@/components/screens/restaurant/floor-plan";
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
    tender?: "Card" | "Cash" | "Member account" | "Gift card";
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
    lastSale: { ticket: Ticket; total: number; tender: string } | null;
    bayBookings: BayBooking[];
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

export const lineTotal = (l: Line) => l.qty * l.unitPrice;
export const subtotalOf = (lines: Line[]) => lines.reduce((s, l) => s + lineTotal(l), 0);
export const taxOf = (lines: Line[]) => subtotalOf(lines) * TAX_RATE;
export const totalOf = (lines: Line[]) => subtotalOf(lines) * (1 + TAX_RATE);
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
    floorPlans: seededFloorPlans,
    floorRoom: "bigroom",
    toast: null,
};

/* ------------------------------------------------------------------ */

type Action =
    | { type: "signIn"; operator: Operator }
    | { type: "signOut" }
    | { type: "addItem"; item: { id: string; name: string; price: number; image?: string }; seat?: number; source: Ticket["source"] }
    | { type: "changeQty"; lineId: string; delta: number; seat?: number }
    | { type: "removeLine"; lineId: string; seat?: number }
    | { type: "clearCart" }
    | { type: "holdTicket" }
    | { type: "openTicket"; ticketId: string }
    | { type: "attachCustomer"; name: string }
    | { type: "pay"; tender: NonNullable<Ticket["tender"]> }
    | { type: "setSheetDate"; date: string }
    | { type: "shiftSheetDate"; days: number }
    | { type: "setCourse"; course: string }
    | { type: "checkIn"; time: string }
    | { type: "chargeTeeTime"; time: string; only?: number }
    | { type: "clockToggle"; at: string }
    | { type: "setFloorRoom"; room: string }
    | { type: "saveFloorPlan"; room: string; elements: FloorElement[] }
    | { type: "addBayBooking"; booking: Omit<BayBooking, "id"> }
    | { type: "endShift" }
    | { type: "toast"; message: string | null };

/** The sheet for the date on screen. Unknown dates render as an empty day. */
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
                              seat: action.seat,
                          },
                      ];
                return { ...t, lines };
            });

            return { ...state, tickets, activeTicketId: id, nextNumber, toast: `${action.item.name} added` };
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
            return {
                ...state,
                tickets: state.tickets.map((t) => (t.id === current.id ? { ...t, status: "paid", tender: action.tender } : t)),
                activeTicketId: null,
                lastSale: { ticket: { ...current, status: "paid", tender: action.tender }, total, tender: action.tender },
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
                item: { id: string; name: string; price: number; image?: string },
                source: Ticket["source"] = "Pro Shop",
                seat?: number,
            ) => dispatch({ type: "addItem", item, source, seat }),
            changeQty: (lineId: string, delta: number, seat?: number) => dispatch({ type: "changeQty", lineId, delta, seat }),
            removeLine: (lineId: string, seat?: number) => dispatch({ type: "removeLine", lineId, seat }),
            clearCart: () => dispatch({ type: "clearCart" }),
            holdTicket: () => dispatch({ type: "holdTicket" }),
            openTicket: (ticketId: string) => dispatch({ type: "openTicket", ticketId }),
            attachCustomer: (name: string) => dispatch({ type: "attachCustomer", name }),
            pay: (tender: NonNullable<Ticket["tender"]>) => dispatch({ type: "pay", tender }),
            setSheetDate: (date: string) => dispatch({ type: "setSheetDate", date }),
            shiftSheetDate: (days: number) => dispatch({ type: "shiftSheetDate", days }),
            goToToday: () => dispatch({ type: "setSheetDate", date: TODAY }),
            setCourse: (course: string) => dispatch({ type: "setCourse", course }),
            checkIn: (time: string) => dispatch({ type: "checkIn", time }),
            chargeTeeTime: (time: string, only?: number) => dispatch({ type: "chargeTeeTime", time, only }),
            clockToggle: (at: string) => dispatch({ type: "clockToggle", at }),
            setFloorRoom: (room: string) => dispatch({ type: "setFloorRoom", room }),
            saveFloorPlan: (room: string, elements: FloorElement[]) => dispatch({ type: "saveFloorPlan", room, elements }),
            addBayBooking: (booking: Omit<BayBooking, "id">) => dispatch({ type: "addBayBooking", booking }),
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
