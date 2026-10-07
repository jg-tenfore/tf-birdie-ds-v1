import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { chickenWingsOrder, proShopOrder } from "@/components/concepts/refunds/refund-data";
import { TransactionDetails } from "@/components/concepts/refunds/transaction-details";

/**
 * **Step 2 — the transaction.**
 *
 * DETAILS opens the order, and this is where REFUND lives: bottom right, red,
 * beside BACK and PRO SHOP. It is the only entry point to a refund in the whole
 * app.
 *
 * The screen is a receipt and six facts. What it does not carry is any state:
 * there is no indication that an order has been refunded, in part or in full, so
 * the only protection against refunding the same order twice is the operator
 * remembering they already did. Compare this screen with step 5, which is the
 * *refund's* details — the same red REFUND button sits on that one too.
 */
const meta = {
    title: "Flows/Refunds/2 — The transaction",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DetailsShell = ({ children }: { children: React.ReactNode }) => (
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
        {children}
    </AppShell>
);

/**
 * One item, one tender — and the arithmetic worth settling before any redesign.
 *
 * The order total is **$18.44** and the card was charged $18.44, but the single
 * line on it prices at **$15.44**. Step 3 will offer to refund $15.44, because
 * the refund is built from lines and the remaining $3.00 is not a line. A full
 * refund of this order, done the only way the app allows, leaves the guest $3.00
 * short.
 */
export const SingleItemOrder: Story = {
    name: "One item, one tender",
    render: () => (
        <DetailsShell>
            <TransactionDetails order={chickenWingsOrder} />
        </DetailsShell>
    ),
};

/**
 * Six items settled across two tenders — $25.00 cash and $25.58 on a gift card.
 *
 * The Payments section is the only place the split is ever stated plainly. Hold
 * onto it: from step 3 onward, the app decides how a refund is divided between
 * these two and does not show the division again until it is done.
 */
export const MultiTenderOrder: Story = {
    name: "Six items, two tenders",
    render: () => (
        <DetailsShell>
            <TransactionDetails order={proShopOrder} />
        </DetailsShell>
    ),
};
