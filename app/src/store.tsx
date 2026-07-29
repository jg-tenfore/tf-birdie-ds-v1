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

export interface TeeTimeBooking {
    time: string;
    players: { name: string; holes: 18 | 9; rate: string; price: number; checkedIn: boolean }[];
    status: "open" | "booked" | "checked-in" | "paid" | "blocked";
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
    teeTimes: TeeTimeBooking[];
    /** Rolling counter so new tickets get plausible sequential numbers. */
    nextNumber: number;
    /** Last completed sale, so the approved screen has something to show. */
    lastSale: { ticket: Ticket; total: number; tender: string } | null;
    shiftOpen: boolean;
    clockedIn: boolean;
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

const seedTeeTimes: TeeTimeBooking[] = [
    { time: "9:20 AM", status: "checked-in", players: [{ name: "Vale, M.", holes: 18, rate: "Member", price: 34, checkedIn: true }] },
    {
        time: "9:40 AM",
        status: "booked",
        players: [
            { name: "Ellis, J.", holes: 18, rate: "Member", price: 34, checkedIn: false },
            { name: "Guest of Ellis", holes: 18, rate: "Guest", price: 48, checkedIn: false },
        ],
    },
    { time: "9:50 AM", status: "open", players: [] },
    {
        time: "10:00 AM",
        status: "booked",
        players: [
            { name: "Sutton, K.", holes: 18, rate: "Member", price: 34, checkedIn: false },
            { name: "Ibarra, L.", holes: 18, rate: "Guest", price: 48, checkedIn: false },
            { name: "Doyle, F.", holes: 18, rate: "Rack", price: 62, checkedIn: false },
        ],
    },
    { time: "10:10 AM", status: "open", players: [] },
    { time: "10:20 AM", status: "blocked", players: [] },
    {
        time: "10:30 AM",
        status: "booked",
        players: [
            { name: "Whitfield, T.", holes: 9, rate: "Twilight", price: 44, checkedIn: false },
            { name: "Amos, R.", holes: 9, rate: "Twilight", price: 44, checkedIn: false },
        ],
    },
    { time: "10:40 AM", status: "open", players: [] },
];

const initial: State = {
    operator: null,
    tickets: seedTickets,
    activeTicketId: null,
    teeTimes: seedTeeTimes,
    nextNumber: 4140,
    lastSale: null,
    shiftOpen: true,
    clockedIn: false,
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
    | { type: "checkIn"; time: string }
    | { type: "chargeTeeTime"; time: string }
    | { type: "clockToggle" }
    | { type: "endShift" }
    | { type: "toast"; message: string | null };

function activeTicket(state: State) {
    return state.tickets.find((t) => t.id === state.activeTicketId) ?? null;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "signIn":
            return { ...state, operator: action.operator, toast: `Signed in as ${action.operator.name}` };

        case "signOut":
            return { ...initial, tickets: state.tickets, teeTimes: state.teeTimes, nextNumber: state.nextNumber };

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

        case "checkIn":
            return {
                ...state,
                teeTimes: state.teeTimes.map((t) =>
                    t.time !== action.time ? t : { ...t, status: "checked-in", players: t.players.map((p) => ({ ...p, checkedIn: true })) },
                ),
                toast: `${action.time} checked in`,
            };

        case "chargeTeeTime": {
            const slot = state.teeTimes.find((t) => t.time === action.time);
            if (!slot || slot.players.length === 0) return state;

            // Check-in creates a real ticket from the booking's rates — the
            // hand-off from tee sheet to register.
            const id = `t-${state.nextNumber}`;
            const ticket: Ticket = {
                id,
                number: `#${state.nextNumber}`,
                name: slot.players[0].name,
                lines: slot.players.map((p, i) => ({
                    id: `green-fee-${i}`,
                    name: `Green fee — ${p.holes} · ${p.rate}`,
                    qty: 1,
                    unitPrice: p.price,
                })),
                status: "open",
                opened: slot.time,
                server: state.operator?.name ?? "—",
                source: "Tee Sheet",
            };

            return {
                ...state,
                tickets: [...state.tickets, ticket],
                activeTicketId: id,
                nextNumber: state.nextNumber + 1,
                teeTimes: state.teeTimes.map((t) => (t.time === action.time ? { ...t, status: "checked-in" } : t)),
                toast: `Ticket ${ticket.number} opened from ${slot.time}`,
            };
        }

        case "clockToggle":
            return { ...state, clockedIn: !state.clockedIn, toast: state.clockedIn ? "Clocked out" : "Clocked in" };

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
            checkIn: (time: string) => dispatch({ type: "checkIn", time }),
            chargeTeeTime: (time: string) => dispatch({ type: "chargeTeeTime", time }),
            clockToggle: () => dispatch({ type: "clockToggle" }),
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
