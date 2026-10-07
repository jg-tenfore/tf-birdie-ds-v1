import { useMemo, useState } from "react";

import type { TransactionOrder } from "../refund-data";
import {
    allocate,
    refundBreakdown,
    selectionFromOrder,
    shortfallMessage,
    type RefundReason,
    type SelectedLine,
} from "./refund-modal-parts";

/**
 * The refund being composed, shared by both options.
 *
 * Both concepts answer the same three questions — what goes back, where it
 * goes, why — and differ only in how many surfaces they spread them over. Those
 * answers live here so the comparison is about layout and sequence rather than
 * two implementations that drifted apart.
 *
 * The **tender selection follows the item selection** until an operator
 * overrides it: pick items and the tenders needed to cover them are checked
 * automatically, cash first, which makes the common case zero extra taps and
 * still lets the split be changed before anything commits.
 */
export interface RefundDraftSeed {
    scope?: "items" | "amount";
    /** Opens with every line selected — the whole-order case. */
    selectAll?: boolean;
    /** Per-line quantities, by item name, for the partial cases. */
    quantities?: Record<string, number>;
    amountText?: string;
    /** Overrides the automatic cash-first choice, as unchecking a tender would. */
    tenders?: string[];
    reason?: RefundReason;
    note?: string;
}

export const useRefundDraft = (order: TransactionOrder, seed: RefundDraftSeed = {}) => {
    const [scope, setScope] = useState<"items" | "amount">(seed.scope ?? "items");
    const [lines, setLines] = useState<SelectedLine[]>(() =>
        selectionFromOrder(order).map((line) => ({
            ...line,
            quantity: seed.quantities?.[line.name] ?? (seed.selectAll ? line.soldQuantity : 0),
        })),
    );
    const [amountText, setAmountText] = useState(seed.amountText ?? "");
    const [touchedTenders, setTouchedTenders] = useState<string[] | null>(seed.tenders ?? null);
    const [reason, setReason] = useState<RefundReason | null>(seed.reason ?? null);
    const [note, setNote] = useState(seed.note ?? "");

    const breakdown = useMemo(() => {
        if (scope === "amount") {
            const typed = Number(amountText.replace(/[^0-9.]/g, ""));
            const amount = Number.isFinite(typed) ? Math.min(typed, order.total) : 0;
            return { subtotal: amount, tax: 0, total: amount };
        }
        return refundBreakdown(order, lines);
    }, [scope, amountText, lines, order]);

    /** Cash first, then each tender in the order taken, until the amount is covered. */
    const suggestedTenders = useMemo(() => {
        let left = breakdown.total;
        const methods: string[] = [];

        for (const payment of order.payments) {
            if (left <= 0.004) break;
            methods.push(payment.method);
            left -= payment.amount;
        }

        return methods;
    }, [breakdown.total, order.payments]);

    const selectedTenders = touchedTenders ?? suggestedTenders;
    const allocations = allocate(breakdown.total, order.payments, selectedTenders);
    const shortfall = shortfallMessage(breakdown.total, allocations);

    const toggleLine = (name: string) =>
        setLines((prev) =>
            prev.map((line) => (line.name === name ? { ...line, quantity: line.quantity > 0 ? 0 : line.soldQuantity } : line)),
        );

    const setLineQuantity = (name: string, next: number) =>
        setLines((prev) => prev.map((line) => (line.name === name ? { ...line, quantity: next } : line)));

    const allSelected = lines.every((line) => line.quantity === line.soldQuantity);
    const someSelected = lines.some((line) => line.quantity > 0);

    const toggleAll = () => setLines((prev) => prev.map((line) => ({ ...line, quantity: allSelected ? 0 : line.soldQuantity })));

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
        breakdown.total <= 0
            ? scope === "amount"
                ? "Enter an amount to refund"
                : "Choose what goes back"
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
        scope,
        setScope,
        lines,
        amountText,
        setAmountText,
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
        /** Everything the refund needs before it may be committed. */
        isComplete: blocker === null,
    };
};

export type RefundDraft = ReturnType<typeof useRefundDraft>;
