import { useMemo, useState } from "react";

import type { TransactionOrder } from "../refund-data";
import { emptyLedger, remainingOnTender, type RefundLedger } from "./refund-ledger";
import {
    allocate,
    refundBreakdown,
    selectionFromOrder,
    shortfallMessage,
    type RefundReason,
    type SelectedLine,
} from "./refund-modal-parts";

/**
 * The refund being composed.
 *
 * Two changes from Oct 6. **Amount refunds are gone** — they need a backend
 * change Birdie is not making now, so a refund is a basket, full stop. And
 * everything is measured against a **ledger**: what earlier refunds already took
 * off this order. On a first visit the ledger is empty and this behaves exactly
 * as before; on a second it is the difference between an order with two items
 * left and an order that looks untouched.
 *
 * The **tender selection follows the item selection** until an operator
 * overrides it: pick items and the tenders needed to cover them are checked
 * automatically, cash first, skipping any that are spent out.
 */
export interface RefundDraftSeed {
    /** Opens with everything still refundable selected — the whole-order case. */
    selectAll?: boolean;
    /** Per-line quantities, by item name, for the partial cases. */
    quantities?: Record<string, number>;
    /** Overrides the automatic cash-first choice, as unchecking a tender would. */
    tenders?: string[];
    reason?: RefundReason;
    note?: string;
}

export const useRefundDraft = (order: TransactionOrder, seed: RefundDraftSeed = {}, ledger: RefundLedger = emptyLedger) => {
    const [lines, setLines] = useState<SelectedLine[]>(() =>
        selectionFromOrder(order, ledger).map((line) => ({
            ...line,
            quantity: seed.quantities?.[line.name] ?? (seed.selectAll ? line.refundableQuantity : 0),
        })),
    );
    const [touchedTenders, setTouchedTenders] = useState<string[] | null>(seed.tenders ?? null);
    const [reason, setReason] = useState<RefundReason | null>(seed.reason ?? null);
    const [note, setNote] = useState(seed.note ?? "");

    const breakdown = useMemo(() => refundBreakdown(order, lines), [lines, order]);

    /** Cash first, then each tender in the order taken — skipping the spent-out. */
    const suggestedTenders = useMemo(() => {
        let left = breakdown.total;
        const methods: string[] = [];

        for (const payment of order.payments) {
            if (left <= 0.004) break;
            const available = remainingOnTender(ledger, payment);
            if (available === 0) continue;
            methods.push(payment.method);
            left -= available;
        }

        return methods;
    }, [breakdown.total, order.payments, ledger]);

    const selectedTenders = touchedTenders ?? suggestedTenders;
    const allocations = allocate(breakdown.total, order.payments, selectedTenders, ledger);
    const shortfall = shortfallMessage(breakdown.total, allocations);

    const toggleLine = (name: string) =>
        setLines((prev) =>
            prev.map((line) => (line.name === name ? { ...line, quantity: line.quantity > 0 ? 0 : line.refundableQuantity } : line)),
        );

    const setLineQuantity = (name: string, next: number) =>
        setLines((prev) => prev.map((line) => (line.name === name ? { ...line, quantity: next } : line)));

    /** Spent lines are not part of "all" — there is nothing left of them to select. */
    const selectable = lines.filter((line) => line.refundableQuantity > 0);
    const allSelected = selectable.length > 0 && selectable.every((line) => line.quantity === line.refundableQuantity);
    const someSelected = lines.some((line) => line.quantity > 0);

    const toggleAll = () => setLines((prev) => prev.map((line) => ({ ...line, quantity: allSelected ? 0 : line.refundableQuantity })));

    const toggleTender = (method: string) =>
        setTouchedTenders((prev) => {
            const current = prev ?? suggestedTenders;
            return current.includes(method) ? current.filter((item) => item !== method) : [...current, method];
        });

    /**
     * What is still missing, in the operator's words.
     *
     * One sentence, naming the next thing to do rather than the state of the
     * form — the shipping screen's whole failure is a message that describes a
     * condition and leaves the remedy to be guessed.
     */
    const blocker =
        selectable.length === 0
            ? "Everything on this order has been refunded"
            : breakdown.total <= 0
              ? "Choose what goes back"
              : shortfall
                ? shortfall
                : reason === null
                  ? "Choose a reason"
                  : reason === "Other" && note.trim().length === 0
                    ? "Say what happened"
                    : null;

    /**
     * The same obstacle, short enough for the footer.
     *
     * The full sentence belongs beside the control it is about; repeating it
     * verbatim in the footer just prints the same line twice on one screen.
     */
    const blockerShort = blocker === shortfall && shortfall ? "Tender does not cover it" : blocker;

    return {
        lines,
        breakdown,
        allocations,
        selectedTenders,
        shortfall,
        reason,
        setReason,
        note,
        setNote,
        allSelected,
        someSelected,
        toggleAll,
        toggleLine,
        setLineQuantity,
        toggleTender,
        blocker,
        blockerShort,
        /** Nothing on this order can be refunded again. */
        nothingLeft: selectable.length === 0,
        /** Everything the refund needs before it may be committed. */
        isComplete: blocker === null,
    };
};

export type RefundDraft = ReturnType<typeof useRefundDraft>;
