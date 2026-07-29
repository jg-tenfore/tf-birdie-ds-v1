/**
 * Mock data for the Birdie POS screens.
 *
 * Everything is set at a plausible mid-morning on a busy Saturday at Sagamore —
 * the state the POS is actually hardest to use in. Screens designed against an
 * empty tee sheet and a two-line ticket look fine and fall apart in production,
 * so the fixtures here are deliberately crowded.
 */

export interface CatalogItem {
    id: string;
    name: string;
    price: number;
    category: CatalogCategory;
    /** Shown when the item needs a qualifier the operator must not get wrong. */
    note?: string;
}

export type CatalogCategory = "Golf" | "Range" | "Rental" | "Pro shop" | "F & B";

export const catalogCategories: CatalogCategory[] = ["Golf", "Range", "Rental", "Pro shop", "F & B"];

export const catalog: CatalogItem[] = [
    // Golf
    { id: "gf-18", name: "Green fee — 18", price: 62, category: "Golf" },
    { id: "gf-9", name: "Green fee — 9", price: 38, category: "Golf" },
    { id: "gf-18-mem", name: "Green fee — 18", price: 34, category: "Golf", note: "Member" },
    { id: "gf-twi", name: "Twilight — 18", price: 44, category: "Golf", note: "After 3 PM" },
    { id: "gf-jr", name: "Junior — 18", price: 28, category: "Golf", note: "Under 17" },
    { id: "cart-18", name: "Cart — 18", price: 22, category: "Golf" },
    { id: "cart-9", name: "Cart — 9", price: 14, category: "Golf" },
    { id: "walk", name: "Walking fee", price: 0, category: "Golf" },

    // Range
    { id: "rng-s", name: "Range bucket — S", price: 8, category: "Range" },
    { id: "rng-m", name: "Range bucket — M", price: 11, category: "Range" },
    { id: "rng-l", name: "Range bucket — L", price: 14, category: "Range" },
    { id: "rng-pass", name: "Range pass — monthly", price: 89, category: "Range" },

    // Rental
    { id: "rent-clubs", name: "Club rental", price: 45, category: "Rental" },
    { id: "rent-clubs-prem", name: "Premium clubs", price: 75, category: "Rental" },
    { id: "rent-pull", name: "Pull cart", price: 10, category: "Rental" },
    { id: "rent-shoes", name: "Shoe rental", price: 12, category: "Rental" },

    // Pro shop
    { id: "ps-prov1", name: "Pro V1 — dozen", price: 54.99, category: "Pro shop" },
    { id: "ps-avx", name: "AVX — dozen", price: 49.99, category: "Pro shop" },
    { id: "ps-glove", name: "Glove", price: 24, category: "Pro shop" },
    { id: "ps-cap", name: "Sagamore cap", price: 32, category: "Pro shop" },
    { id: "ps-polo", name: "Sagamore polo", price: 78, category: "Pro shop" },
    { id: "ps-tees", name: "Tees — 50 ct", price: 6.5, category: "Pro shop" },
    { id: "ps-towel", name: "Towel", price: 18, category: "Pro shop" },
    { id: "ps-marker", name: "Ball marker", price: 9, category: "Pro shop" },

    // F & B
    { id: "fb-draft", name: "Draft beer", price: 8, category: "F & B" },
    { id: "fb-bottle", name: "Bottled beer", price: 7, category: "F & B" },
    { id: "fb-water", name: "Bottled water", price: 3, category: "F & B" },
    { id: "fb-soda", name: "Fountain soda", price: 3.5, category: "F & B" },
    { id: "fb-gatorade", name: "Gatorade", price: 4, category: "F & B" },
    { id: "fb-dog", name: "Hot dog", price: 6.5, category: "F & B" },
    { id: "fb-burger", name: "Cheeseburger", price: 13, category: "F & B" },
    { id: "fb-club", name: "Turkey club", price: 14, category: "F & B" },
    { id: "fb-chips", name: "Chips", price: 2.5, category: "F & B" },
    { id: "fb-candy", name: "Candy bar", price: 3, category: "F & B" },
    { id: "fb-coffee", name: "Coffee", price: 3.5, category: "F & B" },
    { id: "fb-wrap", name: "Chicken wrap", price: 12, category: "F & B" },
];

export interface OrderLine {
    id: string;
    name: string;
    qty: number;
    unitPrice: number;
    note?: string;
}

export const currentOrder: OrderLine[] = [
    { id: "gf-18", name: "Green fee — 18", qty: 4, unitPrice: 62 },
    { id: "cart-18", name: "Cart — 18", qty: 2, unitPrice: 22 },
    { id: "rng-l", name: "Range bucket — L", qty: 1, unitPrice: 14 },
];

export const lineTotal = (line: OrderLine) => line.qty * line.unitPrice;
export const orderSubtotal = (lines: OrderLine[]) => lines.reduce((sum, line) => sum + lineTotal(line), 0);

export const TAX_RATE = 0.06;

export const money = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export type TicketStatus = "open" | "paid" | "partial" | "held" | "voided";

export interface Ticket {
    id: string;
    number: string;
    guest: string;
    guests: number;
    opened: string;
    total: number;
    status: TicketStatus;
    server: string;
    source: "Pro shop" | "Snack bar" | "Beverage cart" | "Tee sheet";
}

export const tickets: Ticket[] = [
    {
        id: "t-4127",
        number: "#4127",
        guest: "Jordan Ellis",
        guests: 4,
        opened: "9:40 AM",
        total: 324.36,
        status: "open",
        server: "Dana K.",
        source: "Tee sheet",
    },
    {
        id: "t-4128",
        number: "#4128",
        guest: "Walk-up",
        guests: 2,
        opened: "9:44 AM",
        total: 168.72,
        status: "open",
        server: "Dana K.",
        source: "Pro shop",
    },
    {
        id: "t-4129",
        number: "#4129",
        guest: "Riley Park",
        guests: 1,
        opened: "9:51 AM",
        total: 47.7,
        status: "partial",
        server: "Chris M.",
        source: "Snack bar",
    },
    {
        id: "t-4130",
        number: "#4130",
        guest: "Morgan Vale",
        guests: 4,
        opened: "9:58 AM",
        total: 412.0,
        status: "open",
        server: "Dana K.",
        source: "Tee sheet",
    },
    {
        id: "t-4131",
        number: "#4131",
        guest: "Sam Okafor",
        guests: 2,
        opened: "10:03 AM",
        total: 89.04,
        status: "held",
        server: "Chris M.",
        source: "Beverage cart",
    },
    {
        id: "t-4132",
        number: "#4132",
        guest: "Alex Reyes",
        guests: 3,
        opened: "10:07 AM",
        total: 231.48,
        status: "open",
        server: "Dana K.",
        source: "Tee sheet",
    },
    {
        id: "t-4133",
        number: "#4133",
        guest: "Casey Lin",
        guests: 2,
        opened: "10:12 AM",
        total: 22.26,
        status: "paid",
        server: "Chris M.",
        source: "Snack bar",
    },
    {
        id: "t-4134",
        number: "#4134",
        guest: "Drew Hollis",
        guests: 4,
        opened: "10:18 AM",
        total: 356.84,
        status: "open",
        server: "Dana K.",
        source: "Tee sheet",
    },
    {
        id: "t-4135",
        number: "#4135",
        guest: "Walk-up",
        guests: 1,
        opened: "10:22 AM",
        total: 14.84,
        status: "paid",
        server: "Dana K.",
        source: "Pro shop",
    },
    {
        id: "t-4136",
        number: "#4136",
        guest: "Pat Nguyen",
        guests: 2,
        opened: "10:26 AM",
        total: 132.68,
        status: "open",
        server: "Chris M.",
        source: "Tee sheet",
    },
];

export type MemberTier = "Founders" | "Eagle" | "Birdie" | "Par" | "Public";

export interface Member {
    id: string;
    name: string;
    initials: string;
    number: string;
    tier: MemberTier;
    balance: number;
    /** House-account credit still available this cycle. */
    credit: number;
    lastVisit: string;
    email: string;
    phone: string;
}

export const members: Member[] = [
    {
        id: "m-1",
        name: "Jordan Ellis",
        initials: "JE",
        number: "TF-40912",
        tier: "Eagle",
        balance: 124,
        credit: 376,
        lastVisit: "Jul 22",
        email: "j.ellis@example.com",
        phone: "(317) 555-0142",
    },
    {
        id: "m-2",
        name: "Riley Park",
        initials: "RP",
        number: "TF-38220",
        tier: "Par",
        balance: 0,
        credit: 250,
        lastVisit: "Jul 26",
        email: "r.park@example.com",
        phone: "(317) 555-0198",
    },
    {
        id: "m-3",
        name: "Morgan Vale",
        initials: "MV",
        number: "TF-41077",
        tier: "Founders",
        balance: 512.4,
        credit: 1487.6,
        lastVisit: "Jul 28",
        email: "m.vale@example.com",
        phone: "(317) 555-0110",
    },
    {
        id: "m-4",
        name: "Sam Okafor",
        initials: "SO",
        number: "TF-39514",
        tier: "Birdie",
        balance: 62.5,
        credit: 187.5,
        lastVisit: "Jul 19",
        email: "s.okafor@example.com",
        phone: "(317) 555-0173",
    },
    {
        id: "m-5",
        name: "Alex Reyes",
        initials: "AR",
        number: "TF-40388",
        tier: "Eagle",
        balance: 0,
        credit: 500,
        lastVisit: "Jul 27",
        email: "a.reyes@example.com",
        phone: "(317) 555-0127",
    },
    {
        id: "m-6",
        name: "Casey Lin",
        initials: "CL",
        number: "TF-42001",
        tier: "Par",
        balance: 18.75,
        credit: 231.25,
        lastVisit: "Jul 12",
        email: "c.lin@example.com",
        phone: "(317) 555-0155",
    },
    {
        id: "m-7",
        name: "Drew Hollis",
        initials: "DH",
        number: "TF-37845",
        tier: "Birdie",
        balance: 240,
        credit: 10,
        lastVisit: "Jul 28",
        email: "d.hollis@example.com",
        phone: "(317) 555-0188",
    },
    {
        id: "m-8",
        name: "Pat Nguyen",
        initials: "PN",
        number: "TF-40655",
        tier: "Par",
        balance: 0,
        credit: 250,
        lastVisit: "Jul 24",
        email: "p.nguyen@example.com",
        phone: "(317) 555-0164",
    },
];

export interface TeeTime {
    time: string;
    players: string[];
    capacity: number;
    status: "checked-in" | "booked" | "open" | "no-show";
    holes: 9 | 18;
    cart: boolean;
}

export const teeSheet: TeeTime[] = [
    { time: "9:20", players: ["Vale, M.", "Okafor, S.", "Lin, C.", "Reyes, A."], capacity: 4, status: "checked-in", holes: 18, cart: true },
    { time: "9:30", players: ["Hollis, D.", "Nguyen, P."], capacity: 4, status: "checked-in", holes: 18, cart: true },
    { time: "9:40", players: ["Ellis, J.", "+3 guests"], capacity: 4, status: "checked-in", holes: 18, cart: true },
    { time: "9:50", players: ["Park, R."], capacity: 4, status: "booked", holes: 9, cart: false },
    { time: "10:00", players: ["Sutton, K.", "Ibarra, L.", "Doyle, F."], capacity: 4, status: "booked", holes: 18, cart: true },
    { time: "10:10", players: [], capacity: 4, status: "open", holes: 18, cart: false },
    { time: "10:20", players: ["Whitfield, T.", "Amos, R."], capacity: 4, status: "booked", holes: 18, cart: true },
    { time: "10:30", players: ["Corporate — Meridian Group"], capacity: 4, status: "booked", holes: 18, cart: true },
    { time: "10:40", players: [], capacity: 4, status: "open", holes: 18, cart: false },
    { time: "10:50", players: ["Barrett, J.", "Kwon, H."], capacity: 4, status: "no-show", holes: 18, cart: false },
    { time: "11:00", players: ["Fenwick, S.", "Ruiz, D.", "Tan, M.", "Boyle, C."], capacity: 4, status: "booked", holes: 18, cart: true },
    { time: "11:10", players: [], capacity: 4, status: "open", holes: 9, cart: false },
];

export const operators = [
    { id: "op-1", name: "Dana Kim", initials: "DK", role: "Shift lead", till: "Register 2" },
    { id: "op-2", name: "Chris Moreno", initials: "CM", role: "Pro shop", till: "Register 1" },
    { id: "op-3", name: "Ana Silva", initials: "AS", role: "Snack bar", till: "Register 3" },
    { id: "op-4", name: "Tom Wexler", initials: "TW", role: "Beverage cart", till: "Mobile 1" },
];
