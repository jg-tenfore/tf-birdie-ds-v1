import type { OrderPayment, TransactionOrder } from "../refund-data";
import type { RefundCommit } from "./refund-commit";

/**
 * **Oct 7 — what an order has already given back.**
 *
 * Birdie cannot refund an order twice today; Weston asked for it, and the whole
 * design of a second refund turns on one question: *what is left?* Everything
 * about the second pass — which lines can be chosen, which tenders are still
 * live, what the order's own screen says — comes from this ledger.
 *
 * It is kept per order rather than per refund, because an order may be returned
 * to three times and the operator on the third visit cares about the remainder,
 * not the history.
 */
export interface RefundLedger {
    /** Quantity already refunded, by item name. */
    byItem: Record<string, number>;
    /** Dollars already returned, by tender. */
    byMethod: Record<string, number>;
}

export const emptyLedger: RefundLedger = { byItem: {}, byMethod: {} };

/** Folds every refund written against one order into a single remainder. */
export const ledgerFrom = (commits: RefundCommit[]): RefundLedger =>
    commits.reduce<RefundLedger>(
        (ledger, commit) => ({
            byItem: commit.lines.reduce(
                (items, line) => ({ ...items, [line.name]: (items[line.name] ?? 0) + line.quantity }),
                ledger.byItem,
            ),
            byMethod: commit.allocations.reduce(
                (methods, allocation) => ({ ...methods, [allocation.method]: (methods[allocation.method] ?? 0) + allocation.amount }),
                ledger.byMethod,
            ),
        }),
        emptyLedger,
    );

/** How many of this line are still refundable. */
export const remainingQuantity = (ledger: RefundLedger, name: string, soldQuantity: number): number =>
    Math.max(0, soldQuantity - (ledger.byItem[name] ?? 0));

/**
 * What a tender can still take back.
 *
 * Cash that has already been handed over cannot be handed over twice: once
 * $25.00 of a $25.00 cash tender has gone back, the only place left for the
 * rest of the order is the gift card. The modal shows that rather than letting
 * an operator pick a tender with nothing left in it — Weston's note exactly.
 */
export const remainingOnTender = (ledger: RefundLedger, payment: OrderPayment): number =>
    Math.max(0, Number((payment.amount - (ledger.byMethod[payment.method] ?? 0)).toFixed(2)));

/** Nothing left to give back on any line. */
export const isFullyRefunded = (order: TransactionOrder, ledger: RefundLedger): boolean =>
    order.items.every((item) => remainingQuantity(ledger, item.name, item.quantity) === 0);

/** Something has gone back, but not all of it. */
export const isPartlyRefunded = (order: TransactionOrder, ledger: RefundLedger): boolean =>
    Object.keys(ledger.byItem).length > 0 && !isFullyRefunded(order, ledger);
