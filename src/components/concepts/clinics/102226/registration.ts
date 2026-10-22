import { demoCustomer, type DemoCustomer } from "@/components/screens/clinics/demo-customer";
import { clinicById, clinicCatalog, type CatalogClinic, type CatalogSession } from "../102126/clinic-catalog";

/**
 * **Oct 22 — one registration, not one booking.**
 *
 * The Oct 21 round asked *how many players* and then sold them all the same
 * dates in one clinic. Weston came back with the whole job:
 *
 * > *"Click on clinics and you'd first be asked how many players. Right off the
 * > get-go… and then you collect their information. We figure out who they
 * > are… and then you step through it for each person you're registering for."*
 *
 * > *"What if I want to do the putting lab and the junior golf academy? Like, I
 * > want them to do both. So if you could select both — it's more of like a
 * > multi-select."*
 *
 * > *"And then maybe we add a 'same as Justin' and it just selects it and skips
 * > those steps… but then he actually can't do Tuesdays because he has
 * > baseball, so I'm going to put him on Wednesday."*
 *
 * So a registration is **several players, each in several clinics, each on
 * their own dates**, assembled in one pass and added to the cart at the end:
 *
 * > *"I feel like adding it to the cart and not skipping gives us the most
 * > flexibility… is there that 10% where the course comes and complains because
 * > they needed to add a dozen golf balls and now it's two transactions?"*
 *
 * This file is the model all three versions share. They differ only in how the
 * dates get picked once a player's clinics are chosen — the one question
 * Weston handed back: *"do we do each clinic by itself, or is it all on this
 * page?"*
 */

/* ------------------------------------------------------------ the people */

export interface Player {
    id: string;
    /** Filled by the customer search on the "who they are" step. */
    customer?: DemoCustomer;
}

/** One clinic a player is being put into, and the dates within it. */
export interface PlayerBooking {
    clinicId: string;
    /** Session labels, in the clinic's own order. */
    dates: string[];
}

export interface Registration {
    players: Player[];
    /** Keyed by player id. A player with no entry is registered for nothing. */
    bookings: Record<string, PlayerBooking[]>;
}

export const emptyRegistration = (count: number): Registration => ({
    players: Array.from({ length: count }, (_, index) => ({ id: `player-${index}` })),
    bookings: {},
});

/** The nth player's name, or `Player 2` until the search has run. */
export const playerName = (player: Player, index: number): string =>
    player.customer ? `${player.customer.first} ${player.customer.last}` : `Player ${index + 1}`;

/** Tapping any field on the info step stands in for the lookup. */
export const findCustomer = (index: number): DemoCustomer => demoCustomer(index);

export const bookingsFor = (registration: Registration, playerId: string): PlayerBooking[] => registration.bookings[playerId] ?? [];

export const clinicsFor = (registration: Registration, playerId: string): string[] =>
    bookingsFor(registration, playerId).map((booking) => booking.clinicId);

export const datesFor = (registration: Registration, playerId: string, clinicId: string): string[] =>
    bookingsFor(registration, playerId).find((booking) => booking.clinicId === clinicId)?.dates ?? [];

/* ------------------------------------------------------------- the edits */

/** Add or drop a clinic for one player, keeping any dates already chosen. */
export const toggleClinic = (registration: Registration, playerId: string, clinicId: string): Registration => {
    const current = bookingsFor(registration, playerId);
    const existing = current.find((booking) => booking.clinicId === clinicId);

    return {
        ...registration,
        bookings: {
            ...registration.bookings,
            [playerId]: existing ? current.filter((booking) => booking.clinicId !== clinicId) : [...current, { clinicId, dates: [] }],
        },
    };
};

export const toggleDate = (registration: Registration, playerId: string, clinicId: string, label: string): Registration => {
    const current = bookingsFor(registration, playerId);

    return {
        ...registration,
        bookings: {
            ...registration.bookings,
            [playerId]: current.map((booking) =>
                booking.clinicId !== clinicId
                    ? booking
                    : {
                          ...booking,
                          dates: booking.dates.includes(label) ? booking.dates.filter((date) => date !== label) : [...booking.dates, label],
                      },
            ),
        },
    };
};

/**
 * **Same as Justin.**
 *
 * Copies one player's whole selection onto another — every clinic, every date.
 * Weston's shortcut, and the reason it is a copy rather than a link: *"he
 * actually can't do Tuesdays because he has baseball, so I'm going to put him
 * on Wednesday."* Once copied, the two drift apart freely.
 */
export const copyBookings = (registration: Registration, fromPlayerId: string, toPlayerId: string): Registration => ({
    ...registration,
    bookings: {
        ...registration.bookings,
        [toPlayerId]: bookingsFor(registration, fromPlayerId).map((booking) => ({ ...booking, dates: [...booking.dates] })),
    },
});

/* ---------------------------------------------------------- the capacity */

/**
 * **What is left on a date, counting this registration.**
 *
 * The catalogue's `spotsLeft` is what the course had before anyone walked up.
 * Put two of this family on a date with one place left and the second one has
 * to be refused — so the count on screen has to come down as players are
 * assigned, not at the end.
 *
 * That is the Oct 20 complaint, moved: *"users can fill out full registration
 * and only hit the limit at the very end."* Asking the party size up front
 * cannot fix it any more, because in this flow the players are not taking the
 * same dates.
 */
export const spotsRemaining = (registration: Registration, clinicId: string, session: CatalogSession, exceptPlayerId?: string): number => {
    const taken = registration.players.filter(
        (player) => player.id !== exceptPlayerId && datesFor(registration, player.id, clinicId).includes(session.label),
    ).length;

    return Math.max(0, session.spotsLeft - taken);
};

/** Whether this player can still be put on this date. */
export const canTakeDate = (registration: Registration, playerId: string, clinicId: string, session: CatalogSession): boolean =>
    datesFor(registration, playerId, clinicId).includes(session.label) || spotsRemaining(registration, clinicId, session, playerId) > 0;

/* ---------------------------------------------------------- the discount */

/**
 * **Buy four, and all four are cheaper.**
 *
 * > *"You can set up a discount of like buy 4 and get a 5th free. Or
 * > discounted… so it's not you get the 5th free, it's if you buy 4, you get
 * > them 25% off. All 4 of them."*
 *
 * The device configures this on the **instance** — one session carries the
 * rule — which is not something a per-clinic prototype can show, so it is
 * modelled here as a rule on the clinic and flagged. What matters for the
 * screens is the arithmetic and the nudge: at one short of the threshold, the
 * confirmation screen says so.
 *
 * > *"On this confirmation screen we may want to just call that out… hey, they
 * > have 4. Hey, add one more and get 25% off."*
 */
export interface ClinicDiscount {
    /** Dates in the same clinic needed before it applies. */
    quantity: number;
    percentOff: number;
}

/** Invented, like the availability counts. Three clinics carry a rule. */
export const clinicDiscounts: Record<string, ClinicDiscount> = {
    "girls-summer-camp": { quantity: 4, percentOff: 25 },
    "junior-golf-academy": { quantity: 5, percentOff: 20 },
    "putting-lab": { quantity: 4, percentOff: 15 },
};

export const discountFor = (clinicId: string): ClinicDiscount | undefined => clinicDiscounts[clinicId];

export interface BookingPrice {
    clinic: CatalogClinic;
    dates: string[];
    gross: number;
    discount?: ClinicDiscount;
    /** Money off, once the threshold is met. */
    saved: number;
    net: number;
    /** One more date would earn the discount — what the nudge is for. */
    oneShort: boolean;
}

export const priceBooking = (booking: PlayerBooking): BookingPrice => {
    const clinic = clinicById(booking.clinicId);
    const gross = booking.dates.length * clinic.price;
    const discount = discountFor(booking.clinicId);
    const earned = Boolean(discount && booking.dates.length >= discount.quantity);
    const saved = earned && discount ? Number(((gross * discount.percentOff) / 100).toFixed(2)) : 0;

    return {
        clinic,
        dates: booking.dates,
        gross,
        discount,
        saved,
        net: Number((gross - saved).toFixed(2)),
        oneShort: Boolean(discount && booking.dates.length === discount.quantity - 1),
    };
};

/* ------------------------------------------------------------- the money */

export interface RegistrationTotals {
    dates: number;
    gross: number;
    saved: number;
    net: number;
}

export const registrationTotals = (registration: Registration): RegistrationTotals =>
    registration.players
        .flatMap((player) => bookingsFor(registration, player.id))
        .map(priceBooking)
        .reduce(
            (sum, price) => ({
                dates: sum.dates + price.dates.length,
                gross: Number((sum.gross + price.gross).toFixed(2)),
                saved: Number((sum.saved + price.saved).toFixed(2)),
                net: Number((sum.net + price.net).toFixed(2)),
            }),
            { dates: 0, gross: 0, saved: 0, net: 0 },
        );

/** Every nudge the confirmation screen should print, in player order. */
export const discountNudges = (registration: Registration): { player: string; clinic: string; discount: ClinicDiscount }[] =>
    registration.players.flatMap((player, index) =>
        bookingsFor(registration, player.id)
            .map(priceBooking)
            .filter((price) => price.oneShort && price.discount)
            .map((price) => ({ player: playerName(player, index), clinic: price.clinic.name, discount: price.discount! })),
    );

/* -------------------------------------------------------------- the cart */

/**
 * **One line per player per date**, named and dated.
 *
 * The shipping flow drops three lines reading *Come learn the game!* with no
 * dates and no guest on them, however many sessions were chosen. A counter
 * reading that order cannot tell who is booked into what — which is the whole
 * point of a registration that handles a family.
 *
 * A discount earned on a clinic is spread evenly across that clinic's lines, so
 * every line still shows what it actually cost.
 */
export const registrationLines = (registration: Registration) =>
    registration.players.flatMap((player, index) =>
        bookingsFor(registration, player.id)
            .map(priceBooking)
            .flatMap((price) =>
                price.dates.map((label) => {
                    const each = price.dates.length === 0 ? 0 : price.net / price.dates.length;

                    return {
                        id: `${player.id}-${price.clinic.id}-${label}`,
                        name: `${playerName(player, index)} — ${price.clinic.name} — ${label}`,
                        qty: 1,
                        price: `$${each.toFixed(2)}`,
                        ...(price.saved > 0 ? { note: `${price.discount?.percentOff}% off ${price.dates.length} dates` } : {}),
                    };
                }),
            ),
    );

/** Clinics that can still take anyone at all, for the multi-select. */
export const bookableClinics: CatalogClinic[] = clinicCatalog.filter((clinic) => clinic.sessions.some((session) => session.spotsLeft > 0));
