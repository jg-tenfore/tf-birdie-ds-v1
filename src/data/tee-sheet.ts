/**
 * The tee sheet's domain model and its seeded day.
 *
 * This lives in the design system rather than the prototype on purpose. The
 * prototype is where flows get discovered; the design system is where they get
 * documented. If the data only existed in `app/`, every story would need its own
 * hand-written fixture and the two would drift — a flow proven in the prototype
 * could not be turned into a story without retyping it.
 *
 * So: types and fixtures here, the store imports them, and the stories can too.
 *
 * The day below is invented rather than transcribed. It is built to exercise
 * every state the sheet can render — paid, part-paid, carrying a balance, on a
 * raincheck, cart signed out, booked online, nine holes, leagues, no-shows,
 * checked in, manually blocked, and blocked by the sunset cutoff — because a
 * prototype whose sheet is mostly empty cannot answer questions about a busy
 * one.
 */

export interface ReservationEvent {
    at: string;
    by: string;
    what: string;
}

export interface Position {
    name: string;
    /** The "(4)" prefix — how many golfers this one booking covers. */
    party: number;
    price: number;
    holes: 18 | 9;
    rate: string;
    cart: boolean;
    paid: boolean;
    /**
     * The reservation id. The detail screen prints it as `ID:10390147` and the
     * history dialog titles itself with it, so it has to be stable per booking
     * rather than derived at render time.
     */
    id: string;
    /** Green-fee line as the detail screen writes it: `Group Pricing : $1.00`. */
    rateName: string;
    /** Transportation line: `Dunes Cart Old : $26.82`, or a walking rate. */
    cartLabel: string;
    /** Loyalty points this round earns, printed `+125`. */
    pointsEarn: number;
    /** Points it redeems, printed `-1250`. */
    pointsRedeem: number;
    /** Free text the device shows for punch-card rounds, e.g. `9 rounds`. */
    rounds?: string;
    email?: string;
    /** Audit trail behind the History button. */
    history: ReservationEvent[];
    /** Cart keys signed out — shows the key glyph. */
    keyed?: boolean;
    /** On a raincheck — shows the bolt glyph. */
    raincheck?: boolean;
    /** Carries a balance — shows the large "$" watermark. */
    balance?: boolean;
    /** Booked online rather than at the counter — shows the globe glyph. */
    online?: boolean;
    checkedIn?: boolean;
    noShow?: boolean;
    /** Free-text notes the two notes dialogs read and write. */
    customerNotes?: string;
    groupNotes?: string;
}

export interface TeeTimeBooking {
    time: string;
    /** Always length 4. `null` is an open position. */
    positions: (Position | null)[];
    blocked?: boolean;
    /**
     * What a blocked row prints in each cell. The device uses more than one —
     * plain `BLOCKED` for a manual block, `Pre-Sunset Block` for the automatic
     * evening cutoff — and the difference matters to whoever is trying to sell
     * the slot.
     */
    blockLabel?: string;
    /** Printed in the detail screen's breadcrumb: `… - 6078027 - FRONT`. */
    confirmation?: string;
    nine?: "FRONT" | "BACK";
    /** Notes attached to the time rather than to a player. */
    teeTimeNotes?: string;
}

/** The four renderings of a day the action bar switches between. */
export type SheetView = "list" | "grid" | "multi" | "back9";

const usd = (n: number) => `$${n.toFixed(2)}`;

/* ------------------------------------------------------------- roster */

/** Green-fee rates the course sells, with what each charges for 18. */
const RATES = [
    { name: "Group Pricing", price: 28.47 },
    { name: "Dunes Rack Prime", price: 62.0 },
    { name: "Birdie (25%)", price: 46.5 },
    { name: "Senior Weekday", price: 34.0 },
    { name: "Online Discount", price: 52.0 },
    { name: "Course Level Fee", price: 58.0 },
    { name: "Gold Fee (50%)", price: 31.0 },
    { name: "Cheapos", price: 19.0 },
] as const;

/** Transportation options, priced per rider. */
const CARTS = [
    { name: "Dunes Cart Old", price: 26.82 },
    { name: "Dune Cart Plus", price: 32.0 },
    { name: "Dunes Member Cart", price: 0 },
    { name: "Free Punch Cart", price: 0 },
] as const;

const WALKING = { name: "Dunes Walking", price: 8.58 };

/**
 * Members and guests who appear on the sheet.
 *
 * Deliberately includes repeat names — the same family booking three positions,
 * a league taking a whole time — because that is what makes a real sheet hard to
 * read and what the design has to survive.
 */
const ROSTER = [
    "Oda Brennevin",
    "Ivar Brennevin",
    "Rufus Brennevin",
    "G-Oda Brennevin",
    "Women's League",
    "Men's League",
    "Igor Kuznetsov",
    "G-Igor Kuznetsov",
    "Weston Farnsworth",
    "Tony Finau",
    "Randy Orton",
    "Tom Watson",
    "Marissa Chen",
    "Priya Raman",
    "Chris Moreno",
    "Sutton, K.",
    "Doyle, F.",
    "Delgado Outing",
    "Sandhill Group",
    "Hamlet, J.",
] as const;

/**
 * Deterministic pseudo-random.
 *
 * The sheet must be byte-identical on every run — the smoke tests assert against
 * it, and a sheet that reshuffles on reload makes any screenshot comparison
 * worthless. So this is a plain LCG seeded once, not `Math.random`.
 */
const rng = (seed: number) => () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
};

const HISTORY_BY = ["John Admin", "Chris Moreno", "Starter Kiosk", "Online Booking"];

/* -------------------------------------------------------------- build */

/**
 * Builds a day of tee times.
 *
 * @param count       how many times to lay out — 40 is a full day at 14 minutes
 * @param startHour   first tee time, 24-hour
 * @param startMinute minutes past `startHour`
 * @param interval    minutes between times; differs per course
 * @param seed        varies the day without making it non-deterministic
 * @param density     0–1, roughly what fraction of positions get sold
 */
export function buildDaySheet({
    count = 40,
    startHour = 6,
    startMinute = 0,
    interval = 14,
    seed = 7,
    density = 0.45,
    firstId = 10390147,
}: {
    count?: number;
    startHour?: number;
    startMinute?: number;
    interval?: number;
    seed?: number;
    density?: number;
    firstId?: number;
} = {}): TeeTimeBooking[] {
    const rand = rng(seed);
    let id = firstId;
    let confirmation = 6078027;

    return Array.from({ length: count }, (_, index) => {
        const total = startHour * 60 + startMinute + index * interval;
        const h24 = Math.floor(total / 60) % 24;
        const m = total % 60;
        const time = `${h24 % 12 || 12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;

        // Two kinds of block, and they mean different things. The frost delay is
        // a manual block on the first two times; the sunset cutoff is automatic
        // and lands on the last three.
        if (index < 2) {
            return { time, blocked: true, blockLabel: "BLOCKED", positions: [null, null, null, null] };
        }
        if (index >= count - 3) {
            return { time, blocked: true, blockLabel: "Pre-Sunset Block", positions: [null, null, null, null] };
        }

        const roll = rand();

        // A league takes an entire time, all four positions the same name. This
        // is the case that breaks naive "show the party name" designs.
        const isLeague = roll > 0.88;
        // Mid-morning runs hot; the shoulders run cold. Fixed rather than uniform
        // so the sheet has shape — a uniformly busy sheet is not a real one.
        const hot = index > 8 && index < 26;
        const sold = isLeague ? 4 : Math.round((hot ? density + 0.25 : density - 0.15) * 4 * (0.6 + rand() * 0.8));
        const filled = Math.max(0, Math.min(4, sold));

        const leagueName = rand() > 0.5 ? "Women's League" : "Men's League";
        const conf = String(confirmation++);

        const positions = Array.from({ length: 4 }, (_, slot): Position | null => {
            if (slot >= filled) return null;

            const name = isLeague ? leagueName : ROSTER[Math.floor(rand() * ROSTER.length)];
            const rate = RATES[Math.floor(rand() * RATES.length)];
            const walking = rand() > 0.82;
            const cart = walking ? WALKING : CARTS[Math.floor(rand() * CARTS.length)];
            const holes: 18 | 9 = rand() > 0.85 ? 9 : 18;
            const green = holes === 9 ? +(rate.price / 2).toFixed(2) : rate.price;
            const price = +(green + cart.price).toFixed(2);

            // Early times have finished playing, so they are paid; late ones have
            // not teed off yet. State follows the clock rather than being
            // sprinkled at random, which is what makes the sheet legible.
            const paid = index < 14 && rand() > 0.35;
            const reservationId = String(id++);

            return {
                name,
                party: isLeague ? 4 : Math.max(1, Math.min(4, Math.round(rand() * 3) + 1)),
                price,
                holes,
                rate: rate.name,
                cart: !walking,
                paid,
                id: reservationId,
                rateName: `${rate.name} : ${usd(green)}`,
                cartLabel: `${cart.name} : ${usd(cart.price)}`,
                pointsEarn: Math.round(price * 4),
                pointsRedeem: rand() > 0.7 ? -Math.round(price * 40) : 0,
                rounds: cart.name === "Free Punch Cart" ? `${Math.ceil(rand() * 9)} rounds` : undefined,
                email: `${name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
                keyed: paid && rand() > 0.6,
                raincheck: rand() > 0.94,
                balance: !paid && rand() > 0.78,
                online: rand() > 0.7,
                checkedIn: paid,
                noShow: index < 10 && rand() > 0.96,
                history: [
                    {
                        at: `5/12/2026 ${1 + (index % 9)}:${String((index * 7) % 60).padStart(2, "0")} PM`,
                        by: HISTORY_BY[index % HISTORY_BY.length],
                        what: `Reservation Edited : ${usd(price)} -> ${usd(price)}`,
                    },
                ],
            };
        });

        return { time, positions, confirmation: conf, nine: "FRONT" as const };
    });
}

/** May 12 — the day the reference screenshots were taken on. */
export const may12Sheet = buildDaySheet({ seed: 7, density: 0.45 });

/**
 * Today. Quieter than May 12 and later in the day, so the two are visibly
 * different sheets rather than the same one under a different heading.
 */
export const todaySheet = buildDaySheet({ seed: 23, interval: 10, density: 0.3, firstId: 10420001 });

/** Sibling courses for Multi view, each on its own interval. */
export const eastCourseSheet = buildDaySheet({ seed: 41, startMinute: 40, interval: 10, density: 0.12, firstId: 10440001 });
export const westCourseSheet = buildDaySheet({ seed: 59, startHour: 6, interval: 9, density: 0.18, firstId: 10460001 });
