import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { LookupLoading, OrderLookupResults } from "@/components/concepts/refunds/order-lookup-results";
import { dayOrderRows, westonOrderRows } from "@/components/concepts/refunds/refund-data";
import { OrderLookupForm } from "@/components/screens/operations/order-lookup-form";

/**
 * **Step 1 — finding the order.**
 *
 * There is no refund screen in the navigation drawer. A refund begins at **Order
 * Lookup**, the same screen used to reprint a receipt, and it begins with a
 * search scoped to one course and one day.
 *
 * That scope is the first constraint on the whole flow: the three search fields
 * — Order ID, Payment ID, Product — are alternatives, not filters, and none of
 * them searches by customer. A guest who comes back on Tuesday about Monday's
 * charge is found by changing the date and reading the list.
 *
 * The results carry the second constraint. Six of the ten rows below are
 * refunds, and the only thing that says so is a minus sign set in the same grey
 * as every other figure on the screen.
 */
const meta = {
    title: "Flows/Refunds/1 — Find the order",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The search screen, scoped to the day the reference captures were taken. */
export const Search: Story = {
    render: () => (
        <AppShell
            title="Order Lookup"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                    <ActionButton icon={<PrintIcon />}>PRINT SNAPSHOT</ActionButton>
                    <ActionButton tone="primary" icon={<SearchIcon />}>
                        SEARCH
                    </ActionButton>
                </>
            }
        >
            <OrderLookupForm course="The Dunes of Delgado PROD" date="TUESDAY, OCTOBER 06 2026" />
        </AppShell>
    ),
};

/**
 * Between SEARCH and results. A full-screen takeover, not a spinner in place —
 * and the operator sees it twice per refund, the second time after the money has
 * already moved.
 */
export const Loading: Story = {
    render: () => (
        <AppShell title="Order Lookup Results" active="orderlookup" accountLabel="" showLogOut={false} showOverflow={false}>
            <LookupLoading />
        </AppShell>
    ),
};

/**
 * The day's orders, newest first.
 *
 * Read the amounts as a pair-matching exercise and the cost of the current
 * design is obvious: 6520452 (+$207.14) and 6520482 (−$207.14) are a sale and
 * its reversal two minutes apart, and nothing on the row connects them. There is
 * no refund column, no status, no grouping, and no running day total.
 */
export const Results: Story = {
    render: () => (
        <AppShell
            title="Order Lookup Results"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={<ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>}
        >
            <OrderLookupResults rows={dayOrderRows} />
        </AppShell>
    ),
};

/**
 * The same day searched by product, which is how the single-item example in
 * step 2 is reached.
 *
 * The last two rows belong to Jack Black and Austin Zech. A search that looks
 * like it is about one customer is in fact about one day and one product, and
 * the screen never says which — so the operator has to know that already.
 */
export const ResultsFromProductSearch: Story = {
    name: "Results — searched by product",
    render: () => (
        <AppShell
            title="Order Lookup Results"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={<ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>}
        >
            <OrderLookupResults rows={westonOrderRows} />
        </AppShell>
    ),
};
