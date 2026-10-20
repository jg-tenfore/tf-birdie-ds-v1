import { girlsSummerCamp, type Clinic, type ClinicSession } from "@/components/screens/clinics/clinic-data";

/**
 * **Oct 20 — what the clinic screens are missing: a number.**
 *
 * Weston's note, on the `10` printed on the clinic card:
 *
 * > *"The key UX problem: the 10 shown on the clinic tile represents max roster
 * > size, not availability. No indication of spots remaining before checkout.
 * > Users can fill out full registration and only hit the limit at the very
 * > end."*
 *
 * Every one of the three versions is an answer to that, so the number lives
 * here, once, and each version decides how to show it rather than what it is.
 *
 * **These counts are invented.** The device never exposes a remaining figure —
 * that is the whole complaint — so the two sessions it marks `(FULL)` are the
 * only ones whose availability is known. The rest are filled in to make a
 * realistic spread: a couple nearly gone, several open, one with a single place
 * left.
 */

export interface SessionAvailability extends ClinicSession {
    /** Places still open on this date. */
    spotsLeft: number;
    /** The clinic's roster size — the same for every session. */
    capacity: number;
    /** What one session costs. The screens today show no price at all. */
    price: number;
}

const SPOTS_LEFT: Record<string, number> = {
    "10/6/26 2:00 PM": 4,
    "10/8/26 2:00 PM": 7,
    "10/13/26 2:00 PM (FULL)": 0,
    "10/15/26 2:00 PM": 1,
    "10/20/26 2:00 PM": 6,
    "10/22/26 2:00 PM": 3,
    "10/27/26 2:00 PM": 8,
    "10/29/26 2:00 PM": 2,
    "11/3/26 1:00 PM": 5,
    "11/5/26 2:00 PM (FULL)": 0,
};

/** $22.47 a session — the figure the shipping order panel reaches by itself. */
export const SESSION_PRICE = 22.47;

/** The date, without the `(FULL)` the device appends to the label itself. */
export const sessionDate = (session: ClinicSession): string => session.label.replace(" (FULL)", "");

export const clinicSessions: SessionAvailability[] = girlsSummerCamp.sessions.map((session) => ({
    ...session,
    spotsLeft: SPOTS_LEFT[session.label] ?? 0,
    capacity: girlsSummerCamp.capacity,
    price: SESSION_PRICE,
}));

export interface ClinicWithAvailability extends Omit<Clinic, "sessions"> {
    sessions: SessionAvailability[];
}

/** The clinic, with its sessions carrying availability. */
export const camp: ClinicWithAvailability = { ...girlsSummerCamp, sessions: clinicSessions };

/**
 * The clinic's own availability line.
 *
 * A clinic is not full until every session is, so the headline figure is the
 * **next** date that can still take someone, plus how many dates are open at
 * all. A single "2 of 10" on the card would be the wrong number: it describes
 * one session, and the card stands for ten.
 */
export const clinicSummary = (sessions: SessionAvailability[]) => {
    const open = sessions.filter((session) => session.spotsLeft > 0);
    const nextOpen = open[0];

    return {
        openSessions: open.length,
        totalSessions: sessions.length,
        nextOpen,
        spotsAcross: open.reduce((sum, session) => sum + session.spotsLeft, 0),
    };
};

/** `3 spots left`, `1 spot left`, `Full` — the words each version prints. */
export const spotsLabel = (spotsLeft: number): string =>
    spotsLeft === 0 ? "Full" : spotsLeft === 1 ? "1 spot left" : `${spotsLeft} spots left`;

/** Nearly gone, which earns a warning colour in every version. */
export const isNearlyFull = (spotsLeft: number): boolean => spotsLeft > 0 && spotsLeft <= 2;

export const usd = (value: number): string => `$${value.toFixed(2)}`;
