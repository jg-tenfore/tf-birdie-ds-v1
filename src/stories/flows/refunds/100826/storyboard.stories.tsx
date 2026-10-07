import type { Meta, StoryObj } from "@storybook/react-vite";

import { FlowStoryboard, StoryboardFrame } from "@/components/concepts/refunds/100826/flow-storyboard";
import { RefundModalScreen } from "@/components/concepts/refunds/100826/refund-modal";
import type { RefundLedger } from "@/components/concepts/refunds/100826/refund-ledger";
import { proShopOrder } from "@/components/concepts/refunds/refund-data";
import { RefundBackdrop, RefundResultsScreen } from "./backdrop";

/**
 * **The flow as comps.**
 *
 * Every frame is a real screen at 1280×800, scaled — the same components the
 * prototype runs, so a sheet cannot drift away from what it documents.
 *
 * Two sheets, because Oct 8 has two stories to tell: the ordinary refund, and
 * the second one against the same order, which the register cannot do today.
 */
const meta = {
    title: "Flows/Refunds/100826/Flow storyboards",
    parameters: { layout: "fullscreen", replica: true, viewport: { defaultViewport: "reset" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** What the first refund took: the dozen and the sleeve, $28.96. */
const afterFirstRefund: RefundLedger = {
    byItem: { "Callaway Supersoft (Dozen)": 1, "Callaway Supersoft Sleeve": 1 },
    byMethod: { Cash: 25.0, "Gift Card": 3.96 },
};

const partialSeed = {
    quantities: { "Callaway Supersoft (Dozen)": 1, "Callaway Supersoft Sleeve": 1 },
    reason: "Returned goods" as const,
};

export const FirstRefund: Story = {
    name: "1 — A refund, start to finish",
    render: () => (
        <FlowStoryboard
            title="Issue refund — the chosen design"
            summary="Option A with Weston's notes applied: no ITEMS / AMOUNT tabs, one total rather than three, no Cancel beside the X, and BACK on the confirmation. Five surfaces, one of them new."
        >
            <StoryboardFrame
                step={1}
                title="The transaction"
                caption="REFUND opens the modal over the order rather than replacing it, so the receipt stays legible around the edges."
            >
                <RefundBackdrop order={proShopOrder} />
            </StoryboardFrame>

            <StoryboardFrame
                step={2}
                title="Issue refund — as it opens"
                caption="The basket starts at the top: the ITEMS / AMOUNT tabs are gone, because an amount refund needs a backend change. Nothing is selected, and there is no Cancel — the X is the way out."
            >
                <RefundBackdrop order={proShopOrder}>
                    <RefundModalScreen order={proShopOrder} reversalOrderId="6521287" />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={3}
                title="Two lines chosen"
                caption="The dozen and the sleeve, $28.96. One total on the screen, bottom left — and the split fills in beside the basket: Cash $25.00, Gift Card $3.96."
            >
                <RefundBackdrop order={proShopOrder}>
                    <RefundModalScreen order={proShopOrder} reversalOrderId="6521287" seed={partialSeed} />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={4}
                title="Confirm"
                caption="No new decisions — the lines, the destinations, the reason and the breakdown, restated, with the amount on the button. The left button is BACK now, not Cancel."
            >
                <RefundBackdrop order={proShopOrder}>
                    <RefundModalScreen order={proShopOrder} reversalOrderId="6521287" openAt="confirm" seed={partialSeed} />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={5}
                title="Refund complete"
                caption="The amount, every destination it went to, the reversal order number, and the receipt reprint — while the guest is still at the counter."
            >
                <RefundBackdrop order={proShopOrder}>
                    <RefundModalScreen order={proShopOrder} reversalOrderId="6521287" openAt="done" seed={partialSeed} />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={6}
                title="Back on the list"
                caption="The reversal order sits on top, named on the way out rather than hunted for."
            >
                <RefundResultsScreen />
            </StoryboardFrame>
        </FlowStoryboard>
    ),
};

export const SecondRefund: Story = {
    name: "2 — A second refund on the same order",
    render: () => (
        <FlowStoryboard
            title="Refunding the same order twice"
            summary="New in this pass, and not supported by Birdie today. The order remembers what it gave back: spent lines are shown and closed, a spent-out tender cannot be chosen again, and an order with nothing left stops offering REFUND."
        >
            <StoryboardFrame
                step={1}
                title="Back in the order"
                caption="Partially refunded · $28.96 returned · $21.62 still on this order. The two returned lines carry chips, and Cash reads 'nothing left on this tender'."
            >
                <RefundBackdrop order={proShopOrder} ledger={afterFirstRefund} />
            </StoryboardFrame>

            <StoryboardFrame
                step={2}
                title="The second refund opens"
                caption="Spent lines hold their place, greyed and unselectable. Cash is closed; the gift card shows $21.62 left of $25.58 — the only place the money can go."
            >
                <RefundBackdrop order={proShopOrder} ledger={afterFirstRefund}>
                    <RefundModalScreen order={proShopOrder} reversalOrderId="6521288" ledger={afterFirstRefund} />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={3}
                title="The rest of it"
                caption="Select all means all of what is left — $21.62, entirely to the gift card. The spent lines are not part of 'all'."
            >
                <RefundBackdrop order={proShopOrder} ledger={afterFirstRefund}>
                    <RefundModalScreen
                        order={proShopOrder}
                        reversalOrderId="6521288"
                        ledger={afterFirstRefund}
                        seed={{ selectAll: true, reason: "Returned goods" }}
                    />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={4}
                title="Confirm the second refund"
                caption="A second reversal order, not an edit of the first — the reporting model Weston asked to keep, now applied twice to one sale."
            >
                <RefundBackdrop order={proShopOrder} ledger={afterFirstRefund}>
                    <RefundModalScreen
                        order={proShopOrder}
                        reversalOrderId="6521288"
                        ledger={afterFirstRefund}
                        openAt="confirm"
                        seed={{ selectAll: true, reason: "Returned goods" }}
                    />
                </RefundBackdrop>
            </StoryboardFrame>

            <StoryboardFrame
                step={5}
                title="Nothing left"
                caption="Fully refunded, and REFUND is dead on the order. The operator is stopped here rather than inside a refund screen that cannot produce a refund."
            >
                <RefundBackdrop
                    order={proShopOrder}
                    refundDisabled
                    ledger={{
                        byItem: {
                            "Callaway Supersoft (Dozen)": 1,
                            "Callaway Supersoft Sleeve": 1,
                            Coffee: 1,
                            "Bubly Lime": 2,
                            Gatorade: 1,
                            "Meatball Sub": 1,
                        },
                        byMethod: { Cash: 25.0, "Gift Card": 25.58 },
                    }}
                />
            </StoryboardFrame>
        </FlowStoryboard>
    ),
};
