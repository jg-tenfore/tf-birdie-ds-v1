/**
 * **The customers a search would have found.**
 *
 * Every clinic screen has a bank of customer fields on it, and in a static
 * prototype they stay empty — which is the one state nobody needs to review.
 * The interesting screen is the filled one: how a found guest sits in the
 * layout, whether the booking summary and the name still fit above the fold,
 * what the step bar says once it knows who it is for.
 *
 * So tapping any field in those banks fills **the whole record**, because that
 * is what a lookup does — nobody types a first name and gets a first name back.
 * Each form keeps a CLEAR beside it to get back to the empty state.
 *
 * Six people, so a party of six reads as six different families' worth of
 * detail rather than one name repeated. The first is the account the reference
 * device is signed into.
 */

export interface DemoCustomer {
    first: string;
    last: string;
    email: string;
    phone: string;
    birthday: string;
    /** The device calls this Golf Course Customer ID. */
    customerId: string;
}

export const demoCustomers: DemoCustomer[] = [
    {
        first: "Justin",
        last: "Girard",
        email: "hello@girardjustin.com",
        phone: "(555) 215-8844",
        birthday: "04/12/1986",
        customerId: "TD-104882",
    },
    {
        first: "Avery",
        last: "Nguyen",
        email: "avery.nguyen@email.com",
        phone: "(801) 555-0148",
        birthday: "09/30/2014",
        customerId: "TD-118207",
    },
    {
        first: "Maya",
        last: "Okafor",
        email: "m.okafor@email.com",
        phone: "(801) 555-0192",
        birthday: "02/18/2013",
        customerId: "TD-118944",
    },
    {
        first: "Riley",
        last: "Hartman",
        email: "riley.hartman@email.com",
        phone: "(385) 555-0107",
        birthday: "11/02/2015",
        customerId: "TD-121530",
    },
    {
        first: "Sofia",
        last: "Reyes",
        email: "sofia.reyes@email.com",
        phone: "(385) 555-0163",
        birthday: "06/24/2012",
        customerId: "TD-122881",
    },
    {
        first: "Jordan",
        last: "Blake",
        email: "jordan.blake@email.com",
        phone: "(801) 555-0175",
        birthday: "03/08/2014",
        customerId: "TD-123406",
    },
];

/** The nth demo customer, wrapping round so any party size is covered. */
export const demoCustomer = (index = 0): DemoCustomer => demoCustomers[index % demoCustomers.length];

export const customerName = (customer: DemoCustomer): string => `${customer.first} ${customer.last}`;

/**
 * What a given field shows once the record is found.
 *
 * Keyed by the device's own field labels, so the as-is screens and the new ones
 * fill from the same place.
 */
export const customerValueFor = (customer: DemoCustomer, label: string): string => {
    switch (label) {
        case "First Name":
            return customer.first;
        case "Last Name":
            return customer.last;
        case "Email":
            return customer.email;
        case "Phone":
            return customer.phone;
        case "Customer Birthday":
            return customer.birthday;
        case "Golf Course Customer ID":
            return customer.customerId;
        default:
            return "";
    }
};
