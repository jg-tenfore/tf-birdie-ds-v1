import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLookupResults } from "@/components/concepts/refunds/order-lookup-results";
import { dayOrderRows, refundOrder } from "@/components/concepts/refunds/refund-data";
import { TransactionDetails } from "@/components/concepts/refunds/transaction-details";

/**
 * **Step 5 — the result.**
 *
 * OK dismisses the dialog, the loading screen returns, and the app lands back on
 * Order Lookup Results with a green band: *Refund Saved Successfully!*
 *
 * The band names no order. The refund is the new top row — 6521287, −$42.34 —
 * and finding it means reading the list. Nothing is printed, nothing is offered
 * to the guest, and the flow ends on a list of the day's orders rather than on
 * the thing that just happened.
 *
 * Open that row and the design's central decision is visible: **a refund is a
 * new order, not a change to the old one.** It has its own id, its own time, its
 * own line items at −1 apiece under orange **Refunded** chips, and its own
 * payments. The order it reverses is not named anywhere on it.
 */
const meta = {
    title: "Flows/Refunds/5 — The result",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The success band over the day's orders.
 *
 * It is the whole confirmation: not dismissible, not linked to a row, and
 * identical whether $5 or $500 was returned.
 */
export const SavedSuccessfully: Story = {
    name: "Refund Saved Successfully",
    render: () => (
        <AppShell
            title="Order Lookup Results"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={<ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>}
        >
            <OrderLookupResults rows={dayOrderRows} banner="Refund Saved Successfully!" />
        </AppShell>
    ),
};

/**
 * The refund as its own transaction.
 *
 * Two things to take from this screen. The **Bubly Lime is simply absent** — a
 * line counted to zero in step 3 leaves no trace, so the record cannot tell
 * "they kept it" from "it was never on the order".
 *
 * And the **payments show a split the operator never saw**: Cash −$25.00, Gift
 * Card −$17.34. The app spent the cash tender first and put the remainder on the
 * card. That is a defensible rule, but it was applied silently, after the
 * confirmation, and it is the first time anyone sees the number $17.34.
 *
 * The red REFUND button is also still here, on a refund.
 */
export const TheRefundRecord: Story = {
    name: "The refund's own record",
    render: () => (
        <AppShell
            title="Transaction Details"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                    <ActionButton icon={<ChevronLeftIcon />}>PRO SHOP</ActionButton>
                    <ActionButton tone="danger">REFUND</ActionButton>
                </>
            }
        >
            <TransactionDetails order={refundOrder} />
        </AppShell>
    ),
};
