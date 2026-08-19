import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { CustomerRecordPanel } from "@/components/screens/operations/customer-record";
import { AddCustomerAction, RecordActionBar } from "@/components/screens/operations/customer-search-chrome";
import { customers } from "@/data/crm";
import { rainchecks } from "@/data/rainchecks";
import { bookingsForCustomer, may12Sheet, todaySheet } from "@/data/tee-sheet";

/**
 * **Customer profile** — the whole record as one component, with real data.
 *
 * The two stories above transcribe the device. This is the composed version the
 * prototype actually runs, and it differs in three ways worth arguing about.
 *
 * **The bars collapse.** They always looked like they did. A record with a
 * hundred rounds of history put General Info an entire screen-height of
 * scrolling away, so the first thing to do with a section header nobody could
 * press was to let people press it.
 *
 * **Each bar carries its own number.** A closed Gift Cards section that says
 * `$0.00` has answered the question without being opened; so has a Rain Checks
 * bar reading `$190.88`. The counter's job here is almost always to answer *how
 * much do I have* — the sections were built to hold records, not to answer that.
 *
 * **Rain Checks is new, and it sits directly under Gift Cards** because the two
 * are the same kind of thing: money the course is holding on this person's
 * behalf. Before this, a raincheck existed as a bolt glyph on a tee time and a
 * chip at the till, and the customer's own record could not tell you it existed
 * at all. The total also joins General Info, next to Customer Balance — what
 * they owe and what they are owed, finally on one screen.
 *
 * The columns are the credit's whole life rather than just its balance, because
 * a partly-spent raincheck is normal and "$18.74" alone tells you nothing about
 * where it came from.
 *
 * **Tee Time History now has two halves.** Rounds on the sheets the terminal is
 * holding come first, with a live status; the archive follows underneath. Every
 * name on the tee sheet resolves to a record in `customers.json`, so a booking
 * and a customer are the same thing seen from two screens — see the **On the
 * sheet today** story for someone who is actually playing.
 */
const meta = {
    title: "App Screens/11-customerSearch/Customer profile",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The two days the terminal holds. Same seeds the prototype boots with. */
const SHEETS = { "2026-05-12": may12Sheet, "2026-07-29": todaySheet };

const weston = customers.find((c) => c.displayName === "Weston Senior")!;
const westonRainchecks = rainchecks.filter((r) => r.customerId === weston.id);
const westonBooked = bookingsForCustomer(weston.id, SHEETS);

/** Live — every bar toggles, and the customer-type checkboxes are real. */
export const Default: Story = {
    render: function CustomerProfileStory() {
        const [types, setTypes] = useState<string[]>(weston.customerTypes);
        return (
            <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
                <CustomerRecordPanel
                    customer={weston}
                    rainchecks={westonRainchecks}
                    booked={westonBooked}
                    selectedTypes={types}
                    onToggleType={(t) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                />
            </AppShell>
        );
    },
};

/**
 * How the record should arrive: every section shut, every balance still legible.
 *
 * Six bars and a footer fit on one screen. The open version does not, and never
 * could — Tee Time History alone is longer than the viewport.
 */
export const Collapsed: Story = {
    name: "Sections collapsed",
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
            <CustomerRecordPanel customer={weston} rainchecks={westonRainchecks} booked={westonBooked} startCollapsed />
        </AppShell>
    ),
};

/**
 * A customer who is actually playing.
 *
 * Randy Orton holds eight positions across the two seeded days, and they lead
 * the section with their live status — Paid, Checked in, Booked. Before the
 * booking name on a tee time resolved to a record, this section could only ever
 * show the archive, so the record could not answer the question a counter asks
 * most: *are they on today?*
 *
 * The reservation numbers here are the same ones the tee sheet prints, which is
 * the point — one round, one id, two screens.
 */
export const OnTheSheet: Story = {
    name: "On the sheet today",
    render: () => {
        const randy = customers.find((c) => c.displayName.startsWith("Randy Orton"))!;
        return (
            <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
                <CustomerRecordPanel
                    customer={randy}
                    rainchecks={rainchecks.filter((r) => r.customerId === randy.id)}
                    booked={bookingsForCustomer(randy.id, SHEETS)}
                />
            </AppShell>
        );
    },
};
