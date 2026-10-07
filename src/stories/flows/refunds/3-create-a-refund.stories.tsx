import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import {
    CreateRefund,
    linesFromOrder,
    refundTotal,
    RefundWarningBanner,
    type RefundLine,
} from "@/components/concepts/refunds/create-refund";
import { chickenWingsOrder, proShopOrder, type TransactionOrder } from "@/components/concepts/refunds/refund-data";

/**
 * **Step 3 — creating the refund.**
 *
 * Items left, tenders right, one sentence at the bottom. Everything that makes a
 * refund right or wrong is decided on this screen, and it is the screen in the
 * flow with the least feedback.
 *
 * Three behaviours to watch:
 *
 * - **A line is removed by counting it to zero.** A zeroed line stays where it
 *   was, at full price, with a `0` in the middle of its stepper. The price
 *   column never changes — it shows the line as sold, not as refunded — so the
 *   sentence at the bottom is the only number that moves.
 * - **Validation happens on press, not on change.** Check nothing, or check a
 *   tender too small to cover the amount, and the screen says nothing until
 *   REFUND is pressed; then an orange band appears at the top. It names no
 *   figure and no remedy, and the sentence underneath still promises the full
 *   amount.
 * - **The split across tenders is never shown.** Check two and the sentence
 *   names them in the order the order lists them. How much each one takes is
 *   only visible afterwards, in step 5.
 *
 * The stories are live: work the steppers, the checkboxes and REFUND, and the
 * screen responds as the device does.
 */
const meta = {
    title: "Flows/Refunds/3 — Create a refund",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const RefundScreen = ({
    order,
    selectedAtStart = [],
    zeroed = [],
    warnAtStart = false,
}: {
    order: TransactionOrder;
    selectedAtStart?: string[];
    zeroed?: string[];
    /** Opens in the state after a REFUND press that failed its coverage check. */
    warnAtStart?: boolean;
}) => {
    const [lines, setLines] = useState<RefundLine[]>(() =>
        linesFromOrder(order).map((line) => (zeroed.includes(line.name) ? { ...line, quantity: 0 } : line)),
    );
    const [selected, setSelected] = useState<string[]>(selectedAtStart);
    const [warning, setWarning] = useState(warnAtStart);

    const total = refundTotal(lines);
    const covered = order.payments.filter((payment) => selected.includes(payment.method)).reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <AppShell
            title="Create a Refund"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            subBar={warning ? <RefundWarningBanner /> : undefined}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                    {/* The device's check, as far as the captures show it: the
                        press is refused when the checked tenders cannot cover
                        the amount — including when none are checked. */}
                    <ActionButton tone="danger" onClick={() => setWarning(covered < total - 0.005)}>
                        REFUND
                    </ActionButton>
                </>
            }
        >
            <CreateRefund
                lines={lines}
                payments={order.payments}
                selected={selected}
                onQuantityChange={(name, next) =>
                    setLines((prev) => prev.map((line) => (line.name === name ? { ...line, quantity: next } : line)))
                }
                onTogglePayment={(method) =>
                    setSelected((prev) => (prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]))
                }
            />
        </AppShell>
    );
};

/**
 * How the screen opens: full quantity, no tender checked, no warning.
 *
 * The quantity is pre-filled and the destination is not, so the screen's default
 * state is one press away from being refused. Press REFUND here to see the band
 * arrive.
 */
export const AsItOpens: Story = {
    name: "As it opens",
    render: () => <RefundScreen order={chickenWingsOrder} />,
};

/**
 * After pressing REFUND with nothing checked.
 *
 * "Price of selected payments is less than total price to be refunded" is
 * technically true of an empty selection, but it describes a shortfall rather
 * than the actual problem, which is that no destination has been chosen. The
 * band does not clear until the next press.
 */
export const RefusedWithNoTender: Story = {
    name: "Refused — no tender checked",
    render: () => <RefundScreen order={chickenWingsOrder} warnAtStart />,
};

/**
 * One tender checked, and the sentence gains "to Credit".
 *
 * That is the entire acknowledgement a checkbox gets: no amount beside it, and
 * nothing to say that $15.44 is coming back out of an $18.44 payment — the $3.00
 * noted in step 2.
 */
export const TenderChosen: Story = {
    name: "Tender chosen",
    render: () => <RefundScreen order={chickenWingsOrder} selectedAtStart={["Credit"]} />,
};

/**
 * A partial refund on the six-item order: Bubly Lime counted down to 0, both
 * tenders checked.
 *
 * `$50.58` becomes `$42.34` in the sentence while the Bubly line still reads
 * `$8.24` in the price column. The only marks of an excluded line are a digit
 * inside a stepper and a total 400px away.
 */
export const PartialByZeroing: Story = {
    name: "Partial — a line counted to zero",
    render: () => <RefundScreen order={proShopOrder} selectedAtStart={["Cash", "Gift Card"]} zeroed={["Bubly Lime"]} />,
};

/**
 * Cash alone against $42.34 owed, after a press.
 *
 * The band says the selection is short. It does not say by how much ($17.34), or
 * that checking the Gift Card would close it exactly. Check it and press again:
 * the app divides the amount between the two tenders without ever showing the
 * division — Cash takes its full $25.00, the Gift Card absorbs the rest.
 */
export const NotEnoughTender: Story = {
    name: "Refused — tender does not cover it",
    render: () => <RefundScreen order={proShopOrder} selectedAtStart={["Cash"]} zeroed={["Bubly Lime"]} warnAtStart />,
};
