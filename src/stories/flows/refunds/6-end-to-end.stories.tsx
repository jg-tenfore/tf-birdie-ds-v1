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
import { DialogScrim, RefundReasonDialog } from "@/components/concepts/refunds/refund-reason-dialog";
import { LookupLoading, OrderLookupResults } from "@/components/concepts/refunds/order-lookup-results";
import { dayOrderRows, proShopOrder, refundOrder } from "@/components/concepts/refunds/refund-data";
import { TransactionDetails } from "@/components/concepts/refunds/transaction-details";

/**
 * **The whole thing, end to end.**
 *
 * Five screens, two loading takeovers and one dialog, from the results list to
 * the refund's own record. Press DETAILS on **6521260 — Tony Finau, $50.58** to
 * start; everything else is live.
 *
 * Things to try, because they are the ones that cost money:
 *
 * - Press REFUND with no tender checked, and read what the band actually tells
 *   you.
 * - Count the Bubly Lime to **0** and watch what marks the line as excluded.
 * - Check Cash only — $25.00 against $42.34 — and press REFUND.
 * - Check both, finish the refund, and compare the split on the final screen
 *   with anything you were shown before confirming.
 *
 * The step count is worth stating plainly: a counter returning one item touches
 * **seven screens** and waits through two full-screen loads, and the only number
 * they are ever shown against a tender appears after the refund is done.
 */
const meta = {
    title: "Flows/Refunds/6 — End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Stage = "results" | "details" | "refund" | "reason" | "saving" | "saved" | "record";

const EndToEnd = () => {
    const [stage, setStage] = useState<Stage>("results");
    const [lines, setLines] = useState<RefundLine[]>(() => linesFromOrder(proShopOrder));
    const [selected, setSelected] = useState<string[]>([]);
    const [warning, setWarning] = useState(false);
    const [reason, setReason] = useState("");

    const total = refundTotal(lines);
    const covered = proShopOrder.payments
        .filter((payment) => selected.includes(payment.method))
        .reduce((sum, payment) => sum + payment.amount, 0);

    const restart = () => {
        setLines(linesFromOrder(proShopOrder));
        setSelected([]);
        setWarning(false);
        setReason("");
        setStage("results");
    };

    if (stage === "results" || stage === "saved") {
        return (
            <AppShell
                title="Order Lookup Results"
                active="orderlookup"
                accountLabel=""
                showLogOut={false}
                showOverflow={false}
                actionBar={<ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>}
            >
                <OrderLookupResults
                    rows={stage === "saved" ? dayOrderRows : dayOrderRows.slice(1)}
                    banner={stage === "saved" ? "Refund Saved Successfully!" : undefined}
                    onDetails={(row) => {
                        // Only the two orders this flow has records for open.
                        if (row.orderId === proShopOrder.orderId) setStage("details");
                        if (row.orderId === refundOrder.orderId) setStage("record");
                    }}
                />
            </AppShell>
        );
    }

    if (stage === "saving") {
        return (
            <AppShell title="Order Lookup Results" active="orderlookup" accountLabel="" showLogOut={false} showOverflow={false}>
                <LookupLoading />
            </AppShell>
        );
    }

    if (stage === "details" || stage === "record") {
        const isRecord = stage === "record";
        return (
            <AppShell
                title="Transaction Details"
                active="orderlookup"
                accountLabel=""
                showLogOut={false}
                actionBar={
                    <>
                        <ActionButton icon={<ChevronLeftIcon />} onClick={isRecord ? restart : () => setStage("results")}>
                            BACK
                        </ActionButton>
                        <ActionButton icon={<ChevronLeftIcon />}>PRO SHOP</ActionButton>
                        {/* On the refund's own record this button is present and
                            live on the device too — it is left working here
                            rather than quietly disabled. */}
                        <ActionButton tone="danger" onClick={() => setStage("refund")}>
                            REFUND
                        </ActionButton>
                    </>
                }
            >
                <TransactionDetails order={isRecord ? refundOrder : proShopOrder} />
            </AppShell>
        );
    }

    return (
        <AppShell
            title="Create a Refund"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            subBar={warning ? <RefundWarningBanner /> : undefined}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />} onClick={() => setStage("details")}>
                        BACK
                    </ActionButton>
                    <ActionButton
                        tone="danger"
                        onClick={() => {
                            const short = covered < total - 0.005;
                            setWarning(short);
                            if (!short) setStage("reason");
                        }}
                    >
                        REFUND
                    </ActionButton>
                </>
            }
            overlay={
                stage === "reason" ? (
                    <DialogScrim>
                        <RefundReasonDialog
                            value={reason}
                            onChange={setReason}
                            onOk={() => {
                                setStage("saving");
                                window.setTimeout(() => setStage("saved"), 1200);
                            }}
                        />
                    </DialogScrim>
                ) : undefined
            }
        >
            <CreateRefund
                lines={lines}
                payments={proShopOrder.payments}
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
 * Start on **6521260**. The refund you create appears at the top of the list
 * afterwards — open it to see what the record kept and what it did not.
 */
export const RefundAnOrder: Story = {
    name: "Refund an order",
    render: () => <EndToEnd />,
};
