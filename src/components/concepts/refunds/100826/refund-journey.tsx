import { useState, type ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLookupResults } from "../order-lookup-results";
import { dayOrderRows, formatMoney, ordersById, reversalIdFor, type LookupRow, type TransactionOrder } from "../refund-data";
import { TransactionDetails } from "../transaction-details";
import type { RefundCommit } from "./refund-commit";
import { emptyLedger, isFullyRefunded, ledgerFrom, type RefundLedger } from "./refund-ledger";
import { RefundedTransactionDetails } from "./refunded-transaction-details";

/**
 * The whole refund, end to end — and now, more than once on the same order.
 *
 * The modal is the only screen being redesigned, so this shell is the shipping
 * app either side of it: Order Lookup Results, Transaction Details, the list
 * again afterwards. What is new on Oct 8 is that the shell **remembers**: every
 * refund written during a run is kept against the order it came from, so going
 * back into that order shows what is left rather than what was sold.
 *
 * That is the whole of Weston's multi-refund ask, and it is three rules:
 *
 * 1. a refunded line is shown and cannot be chosen again;
 * 2. a tender that has given back everything it took is closed, so the next
 *    refund has to go somewhere that still holds money;
 * 3. an order with nothing left stops offering REFUND at all.
 *
 * Every row in the day's list opens, and each keeps its own ledger, so two
 * orders refunded in one sitting do not contaminate each other.
 */
export interface RefundModalProps {
    order: TransactionOrder;
    reversalOrderId: string;
    ledger: RefundLedger;
    onClose: () => void;
    onCommitted: (commit: RefundCommit) => void;
}

/** Two minutes after the sale, which is where these land on the day's list. */
const twoMinutesLater = (date: string): string =>
    date.replace(/(\d{1,2}):(\d{2}) (AM|PM)$/, (_, hour: string, minute: string, meridiem: string) => {
        const next = Number(minute) + 2;
        return next < 60
            ? `${hour}:${String(next).padStart(2, "0")} ${meridiem}`
            : `${(Number(hour) % 12) + 1}:${String(next - 60).padStart(2, "0")} ${meridiem}`;
    });

/**
 * The reversal order a refund just wrote.
 *
 * Built from what was actually refunded, so the list, the record and the
 * modal's own confirmation always agree. A second refund against the same sale
 * writes a second reversal — never an edit of the first, which is the model
 * Weston asked to keep.
 */
const reversalFrom = (source: TransactionOrder, commit: RefundCommit, index: number): TransactionOrder => ({
    orderId: String(Number(reversalIdFor(source.orderId)) + index),
    total: -commit.total,
    date: twoMinutesLater(source.date),
    customerName: source.customerName,
    email: source.email,
    phone: source.phone,
    isRefund: true,
    items: commit.lines.map((line) => ({
        name: line.name,
        quantity: -line.quantity,
        price: -(line.linePrice / line.soldQuantity) * line.quantity,
    })),
    payments: commit.allocations.map((allocation) => ({ method: allocation.method, amount: -allocation.amount })),
});

const rowFor = (order: TransactionOrder): LookupRow => ({
    orderId: order.orderId,
    date: order.date,
    customerName: order.customerName,
    paymentType: order.payments.length > 1 ? "Multiple" : order.payments[0].method,
    amount: formatMoney(order.total),
});

export const RefundJourney = ({ renderModal }: { renderModal: (props: RefundModalProps) => ReactNode }) => {
    const [stage, setStage] = useState<"results" | "details" | "refund">("results");
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);
    /** Reversal orders written during this run, newest first. */
    const [written, setWritten] = useState<TransactionOrder[]>([]);
    /** Every refund, by the order it was taken against — the memory. */
    const [commits, setCommits] = useState<Record<string, RefundCommit[]>>({});
    const [justCommitted, setJustCommitted] = useState(false);

    const rows = [...written.map(rowFor), ...dayOrderRows.slice(1)];
    const lookup = (id: string): TransactionOrder | undefined => written.find((order) => order.orderId === id) ?? ordersById[id];

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
                        if (!lookup(row.orderId)) return;
                        setOpenOrderId(row.orderId);
                        setStage("details");
                    }}
                />
            </AppShell>
        );
    }

    const order = (openOrderId ? lookup(openOrderId) : undefined) ?? ordersById["6521260"];
    const ledger = order.isRefund ? emptyLedger : ledgerFrom(commits[order.orderId] ?? []);
    const hasRefunds = (commits[order.orderId] ?? []).length > 0;
    const exhausted = !order.isRefund && isFullyRefunded(order, ledger);

    return (
        <AppShell
            title="Transaction Details"
            active="orderlookup"
            accountLabel=""
            showLogOut={false}
            overlay={
                stage === "refund"
                    ? renderModal({
                          order,
                          reversalOrderId: String(Number(reversalIdFor(order.orderId)) + (commits[order.orderId] ?? []).length),
                          ledger,
                          onClose: () => {
                              // After a committed refund, Done lands back on the
                              // list where the new reversal is waiting; the X
                              // mid-refund returns to the transaction.
                              setStage(justCommitted ? "results" : "details");
                              setJustCommitted(false);
                          },
                          onCommitted: (commit) => {
                              const index = (commits[order.orderId] ?? []).length;
                              setWritten((prev) => [reversalFrom(order, commit, index), ...prev]);
                              setCommits((prev) => ({ ...prev, [order.orderId]: [...(prev[order.orderId] ?? []), commit] }));
                              setJustCommitted(true);
                          },
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
                     * Dead on a reversal order, and dead once an order has
                     * nothing left to give back — the two cases where the
                     * shipping app happily opens a refund screen that cannot
                     * produce a refund.
                     */}
                    <ActionButton tone="danger" disabled={Boolean(order.isRefund) || exhausted} onClick={() => setStage("refund")}>
                        REFUND
                    </ActionButton>
                </>
            }
        >
            {hasRefunds ? <RefundedTransactionDetails order={order} ledger={ledger} /> : <TransactionDetails order={order} />}
        </AppShell>
    );
};

export default RefundJourney;
