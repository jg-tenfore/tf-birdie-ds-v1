import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { CustomerRecordPanel } from "@/components/screens/operations/customer-record";
import { AddCustomerAction, RecordActionBar } from "@/components/screens/operations/customer-search-chrome";
import { customers } from "@/data/crm";
import { rainchecks } from "@/data/rainchecks";
import { bookingsForCustomer, may12Sheet, todaySheet } from "@/data/tee-sheet";

/**
 * **Step 3 — where the credit lives between the two halves.**
 *
 * Days can pass between cutting a raincheck and spending it, and in that gap the
 * customer's record is the only place it exists. Until this section was added it
 * did not exist there at all: a raincheck was a bolt glyph on a tee time and a
 * chip at the till, so the question a counter actually gets asked — *how much do
 * I have?* — could not be answered from the customer's own screen.
 *
 * **Rain Checks sits directly under Gift Cards** because they are the same kind
 * of thing: money the course is holding on this person's behalf. The bar carries
 * the total, so a closed section still answers the question, and the total also
 * joins General Info beside Customer Balance — what they owe and what they are
 * owed, on one screen.
 *
 * The columns are the credit's whole life rather than just its balance. A
 * partly-spent raincheck is normal, and `$18.74` on its own tells a counter
 * nothing about where it came from or whether it is nearly gone.
 */
const meta = {
    title: "Flows/Rainchecks/3 — The credit on the record",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SHEETS = { "2026-05-12": may12Sheet, "2026-07-29": todaySheet };
const weston = customers.find((c) => c.displayName === "Weston Senior")!;

/** Two credits, $176.12 owed. Every bar toggles. */
export const Default: Story = {
    name: "Two credits",
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
            <CustomerRecordPanel
                customer={weston}
                rainchecks={rainchecks.filter((r) => r.customerId === weston.id)}
                booked={bookingsForCustomer(weston.id, SHEETS)}
            />
        </AppShell>
    ),
};

/**
 * The same record with everything shut.
 *
 * `Rain Checks $176.12` on a closed bar is the whole answer, without scrolling
 * and without opening anything. This is how the record should arrive.
 */
export const Collapsed: Story = {
    name: "Collapsed — balances on the bars",
    render: () => (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
            <CustomerRecordPanel
                customer={weston}
                rainchecks={rainchecks.filter((r) => r.customerId === weston.id)}
                booked={bookingsForCustomer(weston.id, SHEETS)}
                startCollapsed
            />
        </AppShell>
    ),
};

/**
 * Somebody with none.
 *
 * The empty state matters more than it looks: "No rainchecks." and a
 * `$0.00` total is a counter telling a customer *no, you don't have one* — so
 * the section has to be present and legible on every record, not hidden when
 * empty.
 */
export const NoCredits: Story = {
    name: "No credits",
    render: () => {
        const randy = customers.find((c) => c.displayName.startsWith("Randy Orton"))!;
        return (
            <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
                <CustomerRecordPanel customer={randy} rainchecks={[]} booked={bookingsForCustomer(randy.id, SHEETS)} />
            </AppShell>
        );
    },
};
