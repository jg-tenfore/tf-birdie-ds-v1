import type { Meta, StoryObj } from "@storybook/react-vite";

import { OptionBStepped } from "@/components/concepts/refunds/100626/option-b-stepped";
import { chickenWingsOrder, proShopOrder } from "@/components/concepts/refunds/refund-data";
import { RefundBackdrop } from "./backdrop";

/**
 * **Option B — one question per step.**
 *
 * The same three decisions in sequence: what goes back, then where it goes and
 * why. One question per surface, so nothing scrolls on a six-line order and the
 * operator is never reading two decisions at once.
 *
 * This follows the shape of the reference flow in
 * `references/100626/RefundFlow-new`, with the amount kept in the header from
 * step 1 and the tender split printed with real amounts on step 2.
 *
 * Story names match Option A's wherever the situation is the same.
 */
const meta = {
    title: "Flows/Refunds/100626/Option B — Stepped",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Step 1, nothing selected.
 *
 * Against Option A: this surface asks one thing, and the refund total sits under
 * the list rather than competing with a tender split. What it cannot tell you
 * yet is where the money will go — that is a page turn away, and if the split is
 * wrong the fix is back here.
 */
export const Opens: Story = {
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionBStepped order={proShopOrder} reversalOrderId="6521287" />
        </RefundBackdrop>
    ),
};

/** Select all. One tap, and **Next** lights up with the amount already totalled. */
export const WholeOrder: Story = {
    name: "Whole order",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionBStepped order={proShopOrder} reversalOrderId="6521287" seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};

/**
 * A partial refund: one of the two Bubly Limes kept.
 *
 * Identical control to Option A — the same row, reading **1 of 2** — because
 * there is one item row in this design, not one per option.
 */
export const Partial: Story = {
    name: "Partial — one of two",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionBStepped
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
 * Step 2: where it goes, and why.
 *
 * The split is filled in and priced — **Cash $25.00, Gift Card $25.58** — and
 * the reason is a short fixed list rather than a blank field, so refund reasons
 * can be reported on later. Both are required before the red button is live.
 */
export const Destination: Story = {
    name: "Step 2 — where it goes",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionBStepped order={proShopOrder} reversalOrderId="6521287" openAt={2} seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};

/**
 * The shortfall, same wording as Option A, one step later.
 *
 * This is the clearest cost of the stepped shape: the operator chose the basket
 * on the previous surface and only learns here that cash cannot cover it.
 */
export const Shortfall: Story = {
    name: "Shortfall — a tender removed",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionBStepped order={proShopOrder} reversalOrderId="6521287" openAt={2} seed={{ selectAll: true, tenders: ["Cash"] }} />
        </RefundBackdrop>
    ),
};

/** The amount tab, with the same caution about inventory and reporting. */
export const AmountInstead: Story = {
    name: "An amount, not items",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionBStepped order={proShopOrder} reversalOrderId="6521287" seed={{ scope: "amount", amountText: "20.00" }} />
        </RefundBackdrop>
    ),
};

/**
 * Done.
 *
 * Identical to Option A's — the amount, the destinations, the reversal order
 * number, and the receipt reprint Weston asked for. Where the two options differ
 * is everything before this screen.
 */
export const Complete: Story = {
    name: "Refund complete",
    render: () => (
        <RefundBackdrop order={proShopOrder}>
            <OptionBStepped
                order={proShopOrder}
                reversalOrderId="6521287"
                openAt={3}
                seed={{ selectAll: true, reason: "Returned goods" }}
            />
        </RefundBackdrop>
    ),
};

/** The wings order again: $15.44 of goods, $3.00 of tax, $18.44 back. */
export const TaxIncluded: Story = {
    name: "Tax has a line",
    render: () => (
        <RefundBackdrop order={chickenWingsOrder}>
            <OptionBStepped order={chickenWingsOrder} reversalOrderId="6516890" seed={{ selectAll: true }} />
        </RefundBackdrop>
    ),
};
