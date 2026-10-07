import type { Meta, StoryObj } from "@storybook/react-vite";

import { RefundModalScreen } from "@/components/concepts/refunds/100826/refund-modal";
import type { RefundLedger } from "@/components/concepts/refunds/100826/refund-ledger";
import { chickenWingsOrder, proShopOrder } from "@/components/concepts/refunds/refund-data";
import { RefundBackdrop } from "./backdrop";

/**
 * **Issue refund — the screens.**
 *
 * Option A, chosen on Oct 6, with the notes from Weston's walkthrough applied:
 * no ITEMS / AMOUNT tabs, one total instead of three, no Cancel beside the X,
 * BACK on the confirmation, and an order that can be refunded more than once.
 *
 * Every story is live. They open in the state they are about; everything after
 * that is the real component.
 *
 * The second-refund stories use a **ledger** — what earlier refunds already took
 * off this order. It is the only input that changes, and everything the operator
 * sees follows from it.
 */
const meta = {
    title: "Flows/Refunds/100826/Issue refund",
    // The replica theme: this is a cleanup of a screen inside the shipping app,
    // drawn with the app's own type, chrome and controls.
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing refunded yet — the ordinary case. */
const fresh: RefundLedger = { byItem: {}, byMethod: {} };

/**
 * Two lines already returned on an earlier visit: the dozen balls and the
 * sleeve, $28.96, which took the whole cash tender and $3.96 of the gift card.
 */
const afterFirstRefund: RefundLedger = {
    byItem: { "Callaway Supersoft (Dozen)": 1, "Callaway Supersoft Sleeve": 1 },
    byMethod: { Cash: 25.0, "Gift Card": 3.96 },
};

/** Everything except the Meatball Sub has gone back across two earlier visits. */
const nearlyEverything: RefundLedger = {
    byItem: { "Callaway Supersoft (Dozen)": 1, "Callaway Supersoft Sleeve": 1, Coffee: 1, "Bubly Lime": 2, Gatorade: 1 },
    byMethod: { Cash: 25.0, "Gift Card": 17.79 },
};

/* ------------------------------------------------------- the first refund */

/**
 * How it opens.
 *
 * The basket starts at the top of the pane — the ITEMS / AMOUNT tabs are gone,
 * because an amount refund needs a backend change Birdie is not making now.
 * Nothing is selected, and the footer carries the one total on the screen.
 *
 * Note what is *not* here: a Cancel button. The X in the header is the way out,
 * and a second control doing the same job is a decision the operator does not
 * need to make.
 */
export const Opens: Story = {
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <RefundModalScreen order={proShopOrder} reversalOrderId="6521287" />
        </RefundBackdrop>
    ),
};

/** Select all, and the split fills in — Cash $25.00, Gift Card $25.58. */
export const WholeOrder: Story = {
    name: "Whole order",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <RefundModalScreen order={proShopOrder} reversalOrderId="6521287" seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};

/**
 * A partial refund: one of the two Bubly Limes kept.
 *
 * The line reads **1 of 2** and the total drops to $46.46. With the right-hand
 * totals block gone, that figure lives in exactly one place — bottom left.
 */
export const Partial: Story = {
    name: "Partial — one of two",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <RefundModalScreen
                order={proShopOrder}
                reversalOrderId="6521287"
                seed={{
                    selectAll: true,
                    quantities: {
                        "Callaway Supersoft (Dozen)": 1,
                        "Callaway Supersoft Sleeve": 1,
                        Coffee: 1,
                        "Bubly Lime": 1,
                        Gatorade: 1,
                        "Meatball Sub": 1,
                    },
                }}
            />
        </RefundBackdrop>
    ),
};

/** Cash alone against $50.58, stated in dollars as it happens. */
export const Shortfall: Story = {
    name: "Shortfall — a tender removed",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <RefundModalScreen order={proShopOrder} reversalOrderId="6521287" seed={{ selectAll: true, tenders: ["Cash"] }} />
        </RefundBackdrop>
    ),
};

/**
 * The confirmation.
 *
 * No new decisions, and the left button is **BACK** now rather than Cancel —
 * from here the operator wants the basket again, not the door. The breakdown
 * lives on this screen and nowhere else.
 */
export const Confirm: Story = {
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <RefundModalScreen
                order={proShopOrder}
                reversalOrderId="6521287"
                openAt="confirm"
                seed={{ selectAll: true, reason: "Returned goods" }}
            />
        </RefundBackdrop>
    ),
};

/** Done: the amount, every destination, the reversal order, and the receipt. */
export const Complete: Story = {
    name: "Refund complete",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <RefundModalScreen
                order={proShopOrder}
                reversalOrderId="6521287"
                openAt="done"
                seed={{ selectAll: true, reason: "Returned goods" }}
            />
        </RefundBackdrop>
    ),
};

/**
 * The single-item order, where tax has somewhere to go.
 *
 * $15.44 of wings on an $18.44 ticket. The footer reads **$18.44** — the whole
 * charge — and the Items / Tax split that proves it is on the confirmation.
 */
export const TaxIncluded: Story = {
    name: "Tax has a line",
    render: () => (
        <RefundBackdrop order={chickenWingsOrder}>
            <RefundModalScreen order={chickenWingsOrder} reversalOrderId="6516578" seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};

/* ------------------------------------------------------ the second refund */

/**
 * **Back in the same order, after one refund.**
 *
 * The two returned lines hold their place, greyed, chipped `Refunded`, with
 * their checkboxes dead. Behind the sheet the order says *Partially refunded ·
 * $28.96 returned · $21.62 still on this order*.
 *
 * The tenders are the part worth looking at. Cash gave back its whole $25.00
 * last time, so it is closed — *"already refunded in full"* — and the gift card
 * is the only destination left, with **$21.62 left of $25.58**. That is Weston's
 * case, stated by the screen instead of discovered by an operator.
 */
export const SecondRefund: Story = {
    name: "Second refund — what is left",
    render: () => (
        <RefundBackdrop order={proShopOrder} ledger={afterFirstRefund}>
            <RefundModalScreen order={proShopOrder} reversalOrderId="6521288" ledger={afterFirstRefund} />
        </RefundBackdrop>
    ),
};

/**
 * The same visit with the remainder chosen: the coffee, both Bubly Limes, the
 * Gatorade and the sub — $21.62, all of it to the gift card, because cash has
 * nothing left to give.
 *
 * Select all means *all of what is left*; the spent lines are not part of it.
 */
export const SecondRefundChosen: Story = {
    name: "Second refund — the rest of it",
    render: () => (
        <RefundBackdrop order={proShopOrder} ledger={afterFirstRefund}>
            <RefundModalScreen
                order={proShopOrder}
                reversalOrderId="6521288"
                ledger={afterFirstRefund}
                seed={{ selectAll: true, reason: "Returned goods" }}
            />
        </RefundBackdrop>
    ),
};

/**
 * A third visit, with one line left.
 *
 * Five of the six lines are spent and the Meatball Sub is all that can go back
 * — $7.79, to the gift card. The screen is mostly history at this point, which
 * is correct: the operator is looking at a receipt that has been picked over
 * twice and needs to see why only one line is live.
 */
export const ThirdRefund: Story = {
    name: "Third refund — one line left",
    render: () => (
        <RefundBackdrop order={proShopOrder} ledger={nearlyEverything}>
            <RefundModalScreen order={proShopOrder} reversalOrderId="6521289" ledger={nearlyEverything} seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};

/**
 * Nothing left.
 *
 * Every line is spent, so the modal says so and offers no way on. In practice
 * an operator will not reach this screen — REFUND is dead on the order behind
 * it, which is the better place to stop them — but the modal refuses on its own
 * terms rather than relying on the screen that opened it.
 */
export const NothingLeft: Story = {
    name: "Nothing left to refund",
    render: () => {
        const everything: RefundLedger = {
            byItem: {
                "Callaway Supersoft (Dozen)": 1,
                "Callaway Supersoft Sleeve": 1,
                Coffee: 1,
                "Bubly Lime": 2,
                Gatorade: 1,
                "Meatball Sub": 1,
            },
            byMethod: { Cash: 25.0, "Gift Card": 25.58 },
        };

        return (
            <RefundBackdrop order={proShopOrder} ledger={everything} refundDisabled>
                <RefundModalScreen order={proShopOrder} reversalOrderId="6521290" ledger={everything} />
            </RefundBackdrop>
        );
    },
};

/* ------------------------------------------------------------ the order */

/**
 * **The order itself, between refunds** — no modal, which is the point.
 *
 * Weston: *"Does it look like now that these two items have been refunded?"*
 * Today it does not. Here the status band names what has gone back and what is
 * left, each spent line carries a chip, and Payments shows which tender is
 * exhausted. This is what makes a second refund safe to start.
 */
export const OrderPartlyRefunded: Story = {
    name: "The order — partly refunded",
    render: () => <RefundBackdrop order={proShopOrder} ledger={afterFirstRefund} />,
};

/** Nothing left: the band reads *Fully refunded* and REFUND is dead. */
export const OrderFullyRefunded: Story = {
    name: "The order — fully refunded",
    render: () => {
        const everything: RefundLedger = {
            byItem: {
                "Callaway Supersoft (Dozen)": 1,
                "Callaway Supersoft Sleeve": 1,
                Coffee: 1,
                "Bubly Lime": 2,
                Gatorade: 1,
                "Meatball Sub": 1,
            },
            byMethod: { Cash: 25.0, "Gift Card": 25.58 },
        };

        return <RefundBackdrop order={proShopOrder} ledger={everything} refundDisabled />;
    },
};

/** Untouched, for comparison with the two above. */
export const OrderUntouched: Story = {
    name: "The order — untouched",
    render: () => <RefundBackdrop order={proShopOrder} ledger={fresh} />,
};
