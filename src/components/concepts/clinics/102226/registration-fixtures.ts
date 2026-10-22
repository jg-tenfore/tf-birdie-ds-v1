import { demoCustomer } from "@/components/screens/clinics/demo-customer";
import type { Registration } from "./registration";

/**
 * Seeded registrations for the single-screen stories.
 *
 * A family of two, part-way through: Justin is in two clinics with dates on
 * both, one of them a date short of its discount; Weston is still empty. It is
 * the state every version's interesting screens are about.
 */

export const twoPlayers = (): Registration => ({
    players: [
        { id: "player-0", customer: demoCustomer(0) },
        { id: "player-1", customer: demoCustomer(1) },
    ],
    bookings: {},
});

/** Named, and the first one picked — what the clinic multi-select opens on. */
export const clinicsChosen = (): Registration => ({
    ...twoPlayers(),
    bookings: {
        "player-0": [
            { clinicId: "junior-golf-academy", dates: [] },
            { clinicId: "putting-lab", dates: [] },
        ],
    },
});

/**
 * Dates on both clinics, and **three** on the Junior Golf Academy — one short
 * of its five-date discount, so the nudge fires on the review screen.
 */
export const datesChosen = (): Registration => ({
    ...twoPlayers(),
    bookings: {
        "player-0": [
            { clinicId: "junior-golf-academy", dates: ["10/7/26 10:30 AM", "10/14/26 10:30 AM", "10/21/26 10:30 AM", "10/28/26 10:30 AM"] },
            { clinicId: "putting-lab", dates: ["10/5/26 4:30 PM", "10/8/26 4:30 PM"] },
        ],
    },
});

/** Both players booked, the second copied from the first then changed. */
export const bothBooked = (): Registration => ({
    ...twoPlayers(),
    bookings: {
        ...datesChosen().bookings,
        /*
         * Copied from Justin and then changed — Weston's case. 10/21 holds a
         * single place, which Justin already has, so this player could not be
         * put on it; 10/28 is the swap. And 10/7 holds exactly two, so with
         * both of them on it the row now reads none left.
         */
        "player-1": [{ clinicId: "junior-golf-academy", dates: ["10/7/26 10:30 AM", "10/14/26 10:30 AM", "10/28/26 10:30 AM"] }],
    },
});
