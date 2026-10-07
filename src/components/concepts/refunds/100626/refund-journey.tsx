import { useState, type ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLookupResults } from "../order-lookup-results";
import { dayOrderRows, formatMoney, ordersById, reversalIdFor, type LookupRow, type TransactionOrder } from "../refund-data";
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
 * **Every row in the list opens**, and any sale on it can be refunded: a
 * six-line basket on two tenders, a $414 driver on one card, two green fees and
 * a cart. A walkthrough where only the rehearsed order works teaches the shape
 * of the demo rather than the shape of the screen.
 *
 * Two things the shell does deliberately:
 *
 * - **A reversal order cannot be refunded.** Its REFUND button is dead, because
 *   a refund of a refund is not a thing the register should offer. The device
 *   does offer it; that is recorded in the as-is folder and left as a question
 *   for the ticket rather than smuggled in here as a fix.
 * - **No success band at the end.** The modal's completion screen already named
 *   the amount, the destinations and the reversal order, so a third
 *   confirmation on the list would be noise. The refund is simply on top of it.
 */
export interface RefundModalProps {
    order: TransactionOrder;
    reversalOrderId: string;
    /** Dismisses the modal — Cancel, the close icon, or Done. */
    onClose: () => void;
    /** Fires the moment the refund commits, before the operator dismisses it. */
    onCommitted: (commit: RefundCommit) => void;
}

/**
 * The reversal order a refund just wrote.
 *
 * Built from what was actually refunded rather than from a fixture, so the list,
 * the record and the modal's own confirmation all agree — refund the whole
 * basket and every surface says $50.58; keep a Bubly Lime and they all say
 * $46.46.
 */
/** Two minutes after the sale, which is where these land on the day's list. */
const twoMinutesLater = (date: string): string =>
    date.replace(/(\d{1,2}):(\d{2}) (AM|PM)$/, (_, hour: string, minute: string, meridiem: string) => {
        const next = Number(minute) + 2;
        return next < 60
            ? `${hour}:${String(next).padStart(2, "0")} ${meridiem}`
            : `${(Number(hour) % 12) + 1}:${String(next - 60).padStart(2, "0")} ${meridiem}`;
    });

const reversalFrom = (source: TransactionOrder, commit: RefundCommit): TransactionOrder => ({
    orderId: reversalIdFor(source.orderId),
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

/** The row the new reversal adds to the top of the day. */
const rowFor = (order: TransactionOrder): LookupRow => ({
    orderId: order.orderId,
    date: order.date,
    customerName: order.customerName,
    paymentType: order.payments.length > 1 ? "Multiple" : order.payments[0].method,
    amount: formatMoney(order.total),
});

export const RefundJourney = ({ renderModal }: { renderModal: (props: RefundModalProps) => ReactNode }) => {
    const [stage, setStage] = useState<"results" | "details" | "refund">("results");
    /** The order being looked at, whichever row was opened. */
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);
    /** Refunds written during this run, newest first. */
    const [written, setWritten] = useState<TransactionOrder[]>([]);
    /** Set while a refund has committed but the operator has not dismissed it. */
    const [justCommitted, setJustCommitted] = useState(false);

    // The day starts without 6521287: that refund has not been made yet. Anything
    // written during the run joins the top of the list.
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
    const isReversal = Boolean(order.isRefund);

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
                          reversalOrderId: reversalIdFor(order.orderId),
                          // Done after a committed refund returns to the list,
                          // where the new reversal order is waiting; Cancel
                          // returns to the transaction it came from.
                          onClose: () => {
                              setStage(justCommitted ? "results" : "details");
                              setJustCommitted(false);
                          },
                          onCommitted: (commit) => {
                              setWritten((prev) => [reversalFrom(order, commit), ...prev]);
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
                    <ActionButton tone="danger" disabled={isReversal} onClick={() => setStage("refund")}>
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
