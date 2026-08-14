/**
 * The customer database.
 *
 * The records live in `customers.json` beside this file and are committed, not
 * generated at boot. That is the important part: the tee sheet books against
 * these people, the raincheck ledger is owned by them, and the smoke tests
 * assert on them by name, so the database has to be a fixed thing you can open
 * and read rather than a function of a seed. `npm run generate:customers`
 * regrows it; edit the JSON directly for one-off changes.
 *
 * A hundred records rather than a handful, because the interesting problems in
 * Customer Search only appear at volume: a household sharing one phone number,
 * three people with the same first name, a member and their guest account
 * separated by two characters, and names long enough to truncate. A six-row
 * fixture makes the search look easy when it is not.
 */

import records from "./customers.json";

export interface Membership {
    name: string;
    expires: string;
}

export interface CrmGiftCard {
    id: string;
    type: "Purchased" | "Winnings";
    expires: string;
    awarded: number;
    spent: number;
    balance: number;
    upc: string;
}

export interface CrmTeeTime {
    id: string;
    date: string;
    players: number;
    /**
     * Absent on archive rows. Live bookings read off the tee sheets carry one,
     * so the profile can say which rounds are still to come.
     */
    status?: "Booked" | "Checked in" | "Paid" | "No show";
    /** Where it is on the sheet. Live rows only. */
    time?: string;
    course?: string;
}

export interface CrmPunchCard {
    name: string;
    remaining: number;
    total: number;
    expires: string;
}

export interface Customer {
    /** Internal id, printed as `Customer ID` in General Info. */
    id: string;
    /** The course's own id for the same person — they are not the same number. */
    courseId: string;
    firstName: string;
    lastName: string;
    /**
     * How the search results print them. Membership and customer-type suffixes
     * are part of the name on the device rather than a separate column, which is
     * why two records for one person can look like two different people.
     */
    displayName: string;
    /**
     * How a tee-time booking prints them, when that differs.
     *
     * The course abbreviates some regulars to "Sutton, K." and prefixes guest
     * accounts with "G-". Without this the name on a booking is just a string
     * that resembles a customer, and cannot be resolved to one.
     */
    sheetName?: string;
    /** A short code some records carry, shown bold-italic above the name. */
    tag?: string;
    email: string;
    phone?: string;
    birthday?: string;
    notes?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    memberships: Membership[];
    customerTypes: string[];
    giftCards: CrmGiftCard[];
    /** Rounds already played. Live bookings come from the tee sheets. */
    teeTimes: CrmTeeTime[];
    punchCards: CrmPunchCard[];
    rewardsBalance: number;
    /** Positive means they owe the course. */
    balance: number;
    cardOnFile?: string;
    cardExpires?: string;
}

export const customers = records as Customer[];

/**
 * Every type the course has configured, in the order the new-customer form lays
 * them out: four columns, filled left to right.
 */
export const CUSTOMER_TYPES = [
    "Senior",
    "Military",
    "Resident",
    "Private Cart",
    "Diamond",
    "New Deal",
    "Guest of Members",
    "Hero",
    "premium single",
    "Resident 22 Test",
    "Austin Test",
    "Test percent off",
    "Simp",
    "Employee",
    "Campaign Testers",
    "Wonderful Person",
    "Average Person",
] as const;

/**
 * The email domains the form offers as one-tap suffixes.
 *
 * Six buttons for the six providers this membership actually uses, which is
 * faster than typing on glass and removes the commonest source of a bad address.
 */
export const EMAIL_DOMAINS = ["@gmail.com", "@yahoo.com", "@hotmail.com", "@aol.com", "@sbcglobal.net", "@att.net"] as const;

/** How a booking prints this person — the abbreviation if there is one. */
export const bookingName = (customer: Customer) => customer.sheetName ?? `${customer.firstName} ${customer.lastName}`;

/**
 * Booking name → record.
 *
 * Built once. This is the join that makes a name on the tee sheet a person: the
 * detail screen, the raincheck ledger and the profile all resolve through it.
 */
export const customersByBookingName: Record<string, Customer> = Object.fromEntries(customers.map((c) => [bookingName(c), c]));

/**
 * The lookup the search field runs.
 *
 * Matches name, email and phone, because that is what the placeholder promises,
 * plus the customer id and the booking name so a person found on the tee sheet
 * can be found again here. Results are capped — the device returns everything
 * and the list just keeps going, which is fine on a real CRM but makes a demo
 * look broken when a two-letter query returns ninety rows.
 */
export function searchCustomers(query: string, limit = 8, list: Customer[] = customers): Customer[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return list
        .filter(
            (c) =>
                c.displayName.toLowerCase().includes(q) ||
                bookingName(c).toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone ?? "").includes(q) ||
                c.id.includes(q),
        )
        .slice(0, limit);
}

export const customerById = (id: string, list: Customer[] = customers) => list.find((c) => c.id === id) ?? null;

/** The record a booking belongs to, or null for a league or an outing. */
export const customerByBookingName = (name: string, list: Customer[] = customers) =>
    list.find((c) => bookingName(c) === name) ?? null;

/**
 * Builds a record from what the new-customer form collects.
 *
 * Everything the form does not ask for is left empty rather than invented — a
 * counter-created customer genuinely has no address, no memberships and no
 * history, and filling those in would make a brand-new record look like an
 * established one.
 */
export function newCustomer(
    input: { firstName: string; lastName: string; email?: string; phone?: string; birthday?: string; notes?: string; types?: string[] },
    seq: number,
): Customer {
    const suffix = input.types?.[0];
    return {
        id: String(560000 + seq),
        courseId: String(410000 + seq),
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: suffix ? `${input.firstName} ${input.lastName} - ${suffix}` : `${input.firstName} ${input.lastName}`,
        email: input.email ?? "",
        phone: input.phone,
        birthday: input.birthday,
        notes: input.notes,
        memberships: [],
        customerTypes: input.types ?? [],
        giftCards: [],
        teeTimes: [],
        punchCards: [],
        rewardsBalance: 0,
        balance: 0,
    };
}
