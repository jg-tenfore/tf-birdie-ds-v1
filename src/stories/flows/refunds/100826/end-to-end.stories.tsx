import type { Meta, StoryObj } from "@storybook/react-vite";

import { RefundJourney } from "@/components/concepts/refunds/100826/refund-journey";
import { RefundModalScreen } from "@/components/concepts/refunds/100826/refund-modal";

/**
 * **The whole thing, working.**
 *
 * Order Lookup Results → the transaction → the modal → back to the list with
 * the reversal order on it. Every row opens; every sale can be refunded.
 *
 * What is new on Oct 8 is that it **remembers**. Refund part of an order, come
 * back into it, and the order has changed: a status band, chips on the lines
 * that went back, a tender marked spent out. Refund the rest and it closes —
 * REFUND goes dead on an order with nothing left.
 *
 * ## The walkthrough Weston described
 *
 * 1. **DETAILS** on the first row, **6521260 — Tony Finau, $50.58**.
 * 2. **REFUND** → tick the **dozen balls** and the **sleeve** → a reason → REVIEW
 *    REFUND → **REFUND $28.96** → DONE. Cash takes its $25.00 and the gift card
 *    the remaining $3.96.
 * 3. You land on the list, with reversal order **6521287** on top. Open
 *    **6521260** again — the same order you just refunded.
 * 4. It now reads *Partially refunded · $28.96 returned · $21.62 still on this
 *    order*, with chips on the two spent lines and *nothing left on this tender*
 *    under Cash.
 * 5. **REFUND** again: the two spent lines are greyed and unselectable, Cash is
 *    closed, and the gift card shows **$21.62 left of $25.58**. Refund the
 *    Bubly Lime and the Gatorade — a second, separate reversal order.
 * 6. Go back in once more and the order is down to two live lines.
 *
 * Nothing about that is supported today, which is why it is worth clicking
 * rather than reading.
 */
const meta = {
    title: "Flows/Refunds/100826/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Start on any row. Refund the same order twice to see the part that is new.
 */
export const RefundAnOrder: Story = {
    name: "Refund an order",
    render: () => (
        <RefundJourney
            renderModal={({ order, reversalOrderId, ledger, onClose, onCommitted }) => (
                <RefundModalScreen
                    order={order}
                    reversalOrderId={reversalOrderId}
                    ledger={ledger}
                    onClose={onClose}
                    onCommitted={onCommitted}
                />
            )}
        />
    ),
};
