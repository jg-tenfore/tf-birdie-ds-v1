import type { Meta, StoryObj } from "@storybook/react-vite";

import { FlowStoryboard, StoryboardFrame } from "@/components/concepts/refunds/100626/flow-storyboard";
import { OptionBStepped } from "@/components/concepts/refunds/100626/option-b-stepped";
import { RefundJourney } from "@/components/concepts/refunds/100626/refund-journey";
import { chickenWingsOrder, proShopOrder } from "@/components/concepts/refunds/refund-data";
import { RefundBackdrop, RefundResultsScreen } from "./backdrop";

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
    // The replica theme, deliberately: this is a cleanup of a screen inside
    // the shipping app, so it is drawn with the app's own type, chrome and
    // controls rather than the design system's target-state ones.
    parameters: { layout: "fullscreen", replica: true },
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

/* ------------------------------------------------------- the whole flow */

/**
 * **The flow, clickable.** Start on **6521260 — Tony Finau, $50.58**.
 *
 * Order Lookup Results → the transaction → step 1 → step 2 → complete → back to
 * the list with the reversal order on it.
 *
 * Run it straight after Option A's and the trade is plain: this one asks less
 * per surface and asks it one more time. The place to feel it is a selection
 * that cash cannot cover — here you learn about it on step 2, having chosen the
 * basket on step 1, and the fix is a page back.
 */
export const EndToEnd: Story = {
    name: "End to end",
    render: () => (
        <RefundJourney
            renderModal={({ order, reversalOrderId, onClose, onCommitted }) => (
                <OptionBStepped order={order} reversalOrderId={reversalOrderId} onClose={onClose} onCommitted={onCommitted} />
            )}
        />
    ),
};

/**
 * **The flow, as comps.** Every frame is a real screen at 1280×800, scaled.
 *
 * Six surfaces to Option A's five — the extra one is the step boundary. In
 * exchange, nothing on any surface scrolls and no screen holds two decisions.
 */
export const Storyboard: Story = {
    name: "Flow storyboard",
    parameters: { layout: "fullscreen", replica: true, viewport: { defaultViewport: "reset" } },
    render: () => (
        <FlowStoryboard
            title="Option B — one question per step"
            summary="What goes back, then where it goes and why. Each surface asks one thing; the amount rides along in the header from step 1 so it is never out of sight."
        >
            <StoryboardFrame
                step={1}
                title="The transaction"
                caption="REFUND opens the modal over the order. Same entry point as Option A — the difference starts inside."
            >
                <RefundBackdrop order={proShopOrder}>{null}</RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={2}
                title="Step 1 — what goes back"
                caption="Nothing selected, Next disabled. The running total sits under the basket, pinned, so the figure never scrolls away."
            >
                <RefundBackdrop order={proShopOrder}>
                    <OptionBStepped order={proShopOrder} reversalOrderId="6521287" />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={3}
                title="Step 1 — a part kept"
                caption="One of two Bubly Limes kept: the line reads 1 of 2 and the total drops to $46.46. The same row as Option A — there is one item row in this design, not one per option."
            >
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
            </StoryboardFrame>

            <StoryboardFrame
                step={4}
                title="Step 2 — where it goes, and why"
                caption="The split arrives priced — Cash $25.00, Gift Card $25.58 — beside a short fixed reason list. Both are required before the red button is live."
            >
                <RefundBackdrop order={proShopOrder}>
                    <OptionBStepped order={proShopOrder} reversalOrderId="6521287" openAt={2} seed={{ selectAll: true }} />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={5}
                title="Refund complete"
                caption="Identical to Option A's ending: amount, destinations, reversal order number, receipt reprint. The options differ in everything before this."
            >
                <RefundBackdrop order={proShopOrder}>
                    <OptionBStepped
                        order={proShopOrder}
                        reversalOrderId="6521287"
                        openAt={3}
                        seed={{ selectAll: true, reason: "Returned goods" }}
                    />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame step={6} title="Back on the list" caption="The reversal order on top, found rather than hunted.">
                <RefundResultsScreen />
            </StoryboardFrame>
        </FlowStoryboard>
    ),
};
