import type { Meta, StoryObj } from "@storybook/react-vite";

import { OptionAOnePane } from "@/components/concepts/refunds/100626/option-a-one-pane";
import { chickenWingsOrder, proShopOrder } from "@/components/concepts/refunds/refund-data";
import { RefundBackdrop } from "./backdrop";

/**
 * **Option A — one pane, then confirm.**
 *
 * What goes back, where it goes and why, all on one surface, with the running
 * total and the tender split in view from the first tap. The second surface
 * restates those decisions and is the only place the red button appears.
 *
 * Every story is live — work the checkboxes, pull a tender out, change the
 * reason, and carry it through to the end. They open in the state each one is
 * about; nothing else is staged.
 *
 * Story names match Option B's wherever the situation is the same, so comparing
 * the two is a sideways move rather than a hunt.
 */
const meta = {
    title: "Flows/Refunds/100626/Option A — One pane",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * How it opens: **nothing selected**.
 *
 * The inversion Weston named — *"you're saying what you don't want to refund"* —
 * is gone. The operator says what goes back, and `Select all items` makes the
 * whole-order case one tap. The footer total reads $0.00 and the primary action
 * is disabled until the refund is actually valid.
 */
export const Opens: Story = {
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionAOnePane order={proShopOrder} reversalOrderId="6521287" />
        </RefundBackdrop>
    ),
};

/**
 * Select all, on a $50.58 order paid with two tenders.
 *
 * This is the moment the current screen cannot do: the split is already filled
 * in — **Cash $25.00, Gift Card $25.58** — before anything is committed. Cash
 * first, the rule the backend already uses, written where it can be read.
 */
export const WholeOrder: Story = {
    name: "Whole order",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionAOnePane order={proShopOrder} reversalOrderId="6521287" seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};

/**
 * A partial refund: everything except one of the two Bubly Limes.
 *
 * Quantity is a second control inside a selected row, reading **1 of 2**, so a
 * part-returned line says so in words. On the shipping screen the same decision
 * is a `0` in a stepper that looks identical to a `1`.
 *
 * Watch the split re-run as the amount drops: Cash still takes its $25.00 and
 * the Gift Card absorbs what is left.
 */
export const Partial: Story = {
    name: "Partial — one of two",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionAOnePane
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

/**
 * The shortfall, stated in dollars as it happens.
 *
 * Cash alone against $50.58: *"$25.58 of $50.58 has nowhere to go. Add another
 * tender, or refund fewer items."* Compare with what ships — an orange band
 * after a press, naming no figure and no remedy.
 */
export const Shortfall: Story = {
    name: "Shortfall — a tender removed",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionAOnePane order={proShopOrder} reversalOrderId="6521287" seed={{ selectAll: true, tenders: ["Cash"] }} />
        </RefundBackdrop>
    ),
};

/**
 * The amount tab, for the dispute that does not map to lines.
 *
 * Kept from the reference flow, and labelled with its cost: an amount refund
 * returns nothing to inventory and will not show in item sales reporting.
 */
export const AmountInstead: Story = {
    name: "An amount, not items",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionAOnePane order={proShopOrder} reversalOrderId="6521287" seed={{ scope: "amount", amountText: "20.00" }} />
        </RefundBackdrop>
    ),
};

/**
 * The confirmation.
 *
 * No new decisions — the lines, the totals, the destinations and the reason,
 * restated, with the amount on the button itself. This is what the shipping
 * flow's *"Why are you issuing this refund?"* dialog looks like it is doing and
 * is not.
 */
export const Confirm: Story = {
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionAOnePane
                order={proShopOrder}
                reversalOrderId="6521287"
                openAt="confirm"
                seed={{ selectAll: true, reason: "Returned goods" }}
            />
        </RefundBackdrop>
    ),
};

/**
 * Done — the amount, every destination, and the reversal order it created.
 *
 * The reversal stays exactly as Weston described it: a second order, not an
 * edit of the first. What changes is that the operator is told its number here
 * rather than having to find a new negative row in the day's list.
 *
 * **Print receipt** is the ask from the call, placed where the guest is still
 * standing at the counter.
 */
export const Complete: Story = {
    name: "Refund complete",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionAOnePane
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
 * $15.44 of wings on an $18.44 ticket. The current screen can only offer the
 * $15.44, leaving the guest $3.00 short; here the tax rides along as its own
 * line and the refund totals **$18.44** — the whole charge, back.
 */
export const TaxIncluded: Story = {
    name: "Tax has a line",
    render: () => (
        <RefundBackdrop order={chickenWingsOrder}>
            <OptionAOnePane order={chickenWingsOrder} reversalOrderId="6516890" seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};
