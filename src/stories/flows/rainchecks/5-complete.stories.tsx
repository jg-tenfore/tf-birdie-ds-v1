import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrderComplete, raincheckSale } from "@/components/screens/checkout/order-complete";

/**
 * **Step 5 — what the customer walks away with.**
 *
 * The receipt prints `Rain Check $53.48` under Payments, and the headline above
 * the exits reads **Cash Tendered $0.00**.
 *
 * That pair is the thing to look at. The headline says "Cash Tendered" on every
 * tender — it is not swapped for the one that was used — so a raincheck sale,
 * a card sale and a gift-card sale all report `$0.00` here while the actual
 * payment sits in a different column on a different half of the screen. The
 * headline is about the drawer; the receipt is about the ticket. Nothing says
 * so, and `$0.00` in large green type directly under **Order Complete** reads
 * like a failure until you know that.
 *
 * The receipt is also the only place the credit's use is recorded from the
 * customer's side. It does not say which raincheck was spent or what is left on
 * it — a customer holding two, having just spent one, cannot tell from this
 * which one went.
 */
const meta = {
    title: "Flows/Rainchecks/5 — Order complete",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: "Settled with a raincheck",
    render: () => <OrderComplete sale={raincheckSale} email="weston.farnsworth+senior@tenfore.golf" />,
};

/**
 * The same screen after a cash sale, for comparison.
 *
 * Here the headline is telling the truth — $60 went in the drawer and $6.52 came
 * back out. It is the same component and the same layout; only the tender
 * differs. Flip between this and the story above to see how much of the
 * headline's meaning depends on knowing which tender was used.
 */
export const CashForComparison: Story = {
    name: "Cash, for comparison",
    render: () => (
        <OrderComplete
            sale={{ ...raincheckSale, orderNumber: "5823987", tender: "Cash", cash: 60, change: 6.52 }}
            email="weston.farnsworth+senior@tenfore.golf"
        />
    ),
};

/** The print confirmation, which is the only feedback either exit button gives. */
export const Printing: Story = {
    name: "Print queued",
    render: () => <OrderComplete sale={raincheckSale} toast="Print job queued up!" />,
};
