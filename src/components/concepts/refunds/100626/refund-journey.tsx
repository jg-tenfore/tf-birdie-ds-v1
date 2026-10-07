import { useState, type ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLookupResults } from "../order-lookup-results";
import { dayOrderRows, formatMoney, proShopOrder, refundOrder, type TransactionOrder } from "../refund-data";
import { TransactionDetails } from "../transaction-details";
import type { RefundCommit } from "./refund-commit";

/**
 * The whole refund, end to end, around either option's modal.
 *
 * The modal is the only screen being redesigned, so this shell is the shipping
 * app either side of it: Order Lookup Results, Transaction Details, and the
 * list again afterwards. Running it start to finish is the only way to judge
 * two things a single state cannot show —
 *
 * 1. **how many surfaces a refund costs**, and
 * 2. **what the operator is holding in their head** as they cross each one.
 *
 * One deliberate difference from the shipping flow at the end: there is no green
 * *Refund Saved Successfully!* band. The modal's own completion screen already
 * named the amount, the destinations and the reversal order, so the band would
 * be the third confirmation of the same fact. The list simply has the refund on
 * it, at the top, where it belongs.
 */
export interface RefundModalProps {
    order: typeof proShopOrder;
    reversalOrderId: string;
    /** Dismisses the modal — Cancel, the close icon, or Done. */
    onClose: () => void;
    /** Fires the moment the refund commits, before the operator dismisses it. */
    onCommitted: (commit: RefundCommit) => void;
}

/**
 * The reversal order the refund just wrote.
 *
 * Built from what was actually refunded rather than from the fixture, so the
 * list, the record and the modal's own confirmation all agree — refund the
 * whole basket and every surface says $50.58; keep a Bubly Lime and they all
 * say $46.46.
 */
const reversalFrom = (commit: RefundCommit): TransactionOrder => ({
    orderId: refundOrder.orderId,
    total: -commit.total,
    date: refundOrder.date,
    customerName: proShopOrder.customerName,
    email: proShopOrder.email,
    phone: proShopOrder.phone,
    isRefund: true,
    items: commit.lines.map((line) => ({
        name: line.name,
        quantity: -line.quantity,
        price: -(line.linePrice / line.soldQuantity) * line.quantity,
    })),
    payments: commit.allocations.map((allocation) => ({ method: allocation.method, amount: -allocation.amount })),
});

export const RefundJourney = ({ renderModal }: { renderModal: (props: RefundModalProps) => ReactNode }) => {
    const [stage, setStage] = useState<"results" | "details" | "refund" | "record">("results");
    const [commit, setCommit] = useState<RefundCommit | null>(null);

    const reversal = commit ? reversalFrom(commit) : null;
    const rows = reversal ? [{ ...dayOrderRows[0], amount: formatMoney(reversal.total) }, ...dayOrderRows.slice(1)] : dayOrderRows.slice(1);

    if (stage === "results") {
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
                    rows={rows}
                    onDetails={(row) => {
                        if (row.orderId === proShopOrder.orderId) setStage("details");
                        if (row.orderId === refundOrder.orderId) setStage("record");
                    }}
                />
            </AppShell>
        );
    }

    const order = stage === "record" ? (reversal ?? refundOrder) : proShopOrder;

    return (
        <AppShell
            title="Transaction Details"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            overlay={
                stage === "refund"
                    ? renderModal({
                          order: proShopOrder,
                          reversalOrderId: refundOrder.orderId,
                          onClose: () => setStage(commit ? "results" : "details"),
                          onCommitted: setCommit,
                      })
                    : undefined
            }
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />} onClick={() => setStage("results")}>
                        BACK
                    </ActionButton>
                    <ActionButton icon={<ChevronLeftIcon />}>PRO SHOP</ActionButton>
                    {/*
                     * Live on a refund order too, as it is on the device. The
                     * modal is the screen under review here; whether a
                     * refunded order should still offer REFUND is a question
                     * for the ticket, not something to quietly fix in a comp.
                     */}
                    <ActionButton tone="danger" onClick={() => setStage("refund")}>
                        REFUND
                    </ActionButton>
                </>
            }
        >
            <TransactionDetails order={order} />
        </AppShell>
    );
};

export default RefundJourney;
