import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

import { brand, fontSize, neutral, radius, status, touchTarget } from "@/theme/tokens";
import { formatMoney, type OrderPayment, type TransactionOrder } from "../refund-data";

/**
 * **Oct 6 — Create a Refund, as a modal.** Shared parts for both options.
 *
 * Weston's note on the shipping screen was that it inverts the operator's
 * intent: *"what these are doing is you're saying what you don't want to
 * refund."* Everything in this file follows from fixing that, and from the four
 * other failures the current-state folder records.
 *
 * | Problem today | What these parts do |
 * | :-- | :-- |
 * | Full quantity pre-filled; you subtract what you keep | Nothing is selected until it is chosen. {@link SelectAllRow} makes a whole-order refund one tap |
 * | A line excluded by counting it to 0, looking identical to an included one | Selection is a checkbox; quantity is a secondary control inside a selected row, reading `1 of 2` |
 * | Tender split invisible until the refund is done | {@link TenderSplit} prints the amount each tender takes, live, before anything commits |
 * | "Price of selected payments is less than total price to be refunded" on press | {@link shortfallMessage} states the gap in dollars, inline, as it happens |
 * | Tax has no line to go back on | {@link refundBreakdown} prorates it and shows it as its own row |
 *
 * Two things are deliberately **not** changed, because they work:
 * **a refund stays a reversal order** (Weston: *"it's a lot better that way,
 * reporting-wise"*), and **allocation stays cash-first** — the same rule the
 * backend already applies. The design makes the rule visible rather than
 * replacing it.
 *
 * These render on the Birdie design system (`birdieTheme`), not the MD2 replica:
 * this is the target state, and the folder beside it is the record of today.
 */

/* ----------------------------------------------------------------- math */

export interface SelectedLine {
    name: string;
    /** How many of this line are being refunded. 0 means the line is not selected. */
    quantity: number;
    /** How many were sold. */
    soldQuantity: number;
    /** Price of the whole line as sold, before tax. */
    linePrice: number;
}

/** Opens with nothing selected — the operator says what is going back. */
export const selectionFromOrder = (order: TransactionOrder): SelectedLine[] =>
    order.items.map((item) => ({ name: item.name, quantity: 0, soldQuantity: item.quantity, linePrice: item.price }));

export interface RefundBreakdown {
    /** Selected lines at their sold unit price. */
    subtotal: number;
    /** The order's tax, prorated to the share of the order being returned. */
    tax: number;
    /** What the guest gets back. */
    total: number;
}

/**
 * Splits a refund into goods and tax.
 *
 * The shipping screen builds a refund out of line prices alone, so an order that
 * charged $18.44 can only return $15.44 — the $3.00 of tax has no line to go
 * back on. Here the gap between the order total and its lines **is** the tax,
 * and it returns in the same proportion as the goods: refund everything and all
 * of it comes back; refund half the basket and half the tax follows.
 */
export const refundBreakdown = (order: TransactionOrder, lines: SelectedLine[]): RefundBreakdown => {
    const soldSubtotal = order.items.reduce((sum, item) => sum + item.price, 0);
    const orderTax = Math.max(0, order.total - soldSubtotal);

    const subtotal = lines.reduce((sum, line) => sum + (line.linePrice / line.soldQuantity) * line.quantity, 0);
    const tax = soldSubtotal === 0 ? 0 : orderTax * (subtotal / soldSubtotal);

    return { subtotal, tax, total: subtotal + tax };
};

export interface Allocation {
    method: string;
    /** What this tender took on the original order — its ceiling. */
    available: number;
    /** What this refund puts back on it. */
    amount: number;
}

/**
 * Cash first, then each remaining tender in the order it was taken — the rule
 * the backend already follows, stated out loud.
 *
 * Unchecking a tender re-runs it, so the operator can see what moves where
 * before committing rather than reading it off the record afterwards.
 */
export const allocate = (total: number, payments: OrderPayment[], selectedMethods: string[]): Allocation[] => {
    let left = total;

    return payments
        .filter((payment) => selectedMethods.includes(payment.method))
        .map((payment) => {
            const amount = Math.min(payment.amount, Math.max(0, Number(left.toFixed(2))));
            left -= amount;
            return { method: payment.method, available: payment.amount, amount };
        });
};

/** `null` when the chosen tenders cover it; otherwise the gap, in words and dollars. */
export const shortfallMessage = (total: number, allocations: Allocation[]): string | null => {
    const covered = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    const gap = Number((total - covered).toFixed(2));

    if (gap <= 0) return null;
    if (allocations.length === 0) return `Choose where ${formatMoney(total)} goes back.`;

    return `${formatMoney(gap)} short. Add a tender, or refund fewer items.`;
};

/**
 * The fixed list, plus a note when none of them fit. Required before committing.
 *
 * Four and a catch-all, not ten: a list long enough to need reading is a list an
 * operator answers with whatever is nearest the thumb, and the point of
 * replacing the free-text prompt is data somebody can report on. Add to it from
 * what `Other` actually collects.
 */
export const refundReasons = ["Returned goods", "Wrong item", "Canceled order", "Other"] as const;
export type RefundReason = (typeof refundReasons)[number];

/* ------------------------------------------------------------- the shell */

/**
 * The modal itself: 680 tall on the scrim, centred over the transaction it is
 * refunding. Option B runs at 760 wide for a single column, Option A at 1000
 * for two.
 *
 * Sized so the order behind it stays legible around the edges — the operator is
 * working *on* that transaction, and hiding it is how the full-screen version
 * lost the context in the first place. 640 leaves 80px of chrome visible top and
 * bottom on the 800px reference device, which is enough for the destination,
 * the reason and the totals to sit on one surface without scrolling.
 */
export const RefundModal = ({
    title,
    caption,
    onClose,
    footer,
    children,
    width = 760,
    padBody = true,
}: {
    title: string;
    /** Right-hand header note — the step count, or the amount being committed. */
    caption?: string;
    onClose?: () => void;
    footer?: ReactNode;
    children: ReactNode;
    /** Option A runs wider: it holds two columns rather than one. */
    width?: number;
    /** Off when the body lays out its own columns and owns their padding. */
    padBody?: boolean;
}) => (
    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(16,24,40,0.55)", display: "grid", placeItems: "center", zIndex: 1300 }}>
        <Box
            role="dialog"
            aria-label={title}
            sx={{
                width,
                height: 680,
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                borderRadius: `${radius.lg}px`,
                boxShadow: "0 24px 48px -12px rgba(16,24,40,0.25)",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 3,
                    minHeight: 72,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <IconButton onClick={onClose} aria-label="Close" sx={{ ml: -1 }}>
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ flex: 1, fontSize: fontSize.h6, fontWeight: 500 }}>{title}</Typography>
                {caption && <Typography sx={{ fontSize: fontSize.body1, color: "text.secondary" }}>{caption}</Typography>}
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: padBody ? "auto" : "hidden", ...(padBody && { px: 3, py: 2.5 }) }}>{children}</Box>

            {footer && <Box sx={{ borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, bgcolor: neutral[25] }}>{footer}</Box>}
        </Box>
    </Box>
);

/** Section label above each block of the modal. */
export const SectionLabel = ({ children }: { children: string }) => (
    <Typography sx={{ fontSize: fontSize.caption, fontWeight: 500, letterSpacing: "0.08em", color: "text.secondary", mb: 1 }}>
        {children.toUpperCase()}
    </Typography>
);

/* ------------------------------------------------------- what to refund */

/** ITEMS / AMOUNT. Two ways to answer one question, so neither is buried. */
export const ScopeTabs = ({ value, onChange }: { value: "items" | "amount"; onChange: (next: "items" | "amount") => void }) => (
    <Box sx={{ display: "flex", gap: 1, p: 0.5, bgcolor: neutral[100], borderRadius: `${radius.md}px`, mb: 2.5 }}>
        {(["items", "amount"] as const).map((tab) => (
            <Button
                key={tab}
                onClick={() => onChange(tab)}
                variant="text"
                sx={{
                    flex: 1,
                    minHeight: touchTarget.min,
                    borderRadius: `${radius.sm}px`,
                    bgcolor: value === tab ? "background.paper" : "transparent",
                    color: value === tab ? "text.primary" : "text.secondary",
                    boxShadow: value === tab ? "0 1px 2px rgba(16,24,40,0.12)" : "none",
                    "&:hover": { bgcolor: value === tab ? "background.paper" : neutral[200] },
                }}
            >
                {tab === "items" ? "Items" : "Amount"}
            </Button>
        ))}
    </Box>
);

const rowSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    minHeight: touchTarget.comfortable,
    px: 1,
    borderRadius: `${radius.sm}px`,
};

/** One tap for the common case: the whole order goes back. */
export const SelectAllRow = ({ checked, indeterminate, onToggle }: { checked: boolean; indeterminate: boolean; onToggle: () => void }) => (
    <Box sx={{ ...rowSx, borderBottom: "1px solid", borderColor: "divider", borderRadius: 0 }}>
        <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={onToggle}
            slotProps={{ input: { "aria-label": "Select all items" } }}
        />
        <Typography sx={{ fontSize: fontSize.body1, fontWeight: 500 }}>Select all items</Typography>
    </Box>
);

/**
 * A selectable line.
 *
 * The checkbox carries inclusion and the stepper carries quantity — two
 * questions, two controls, where the shipping screen asked both through one
 * number. The stepper only appears on a line that was sold more than once, and
 * reads `1 of 2` so the part being kept is stated rather than inferred.
 */
export const ItemSelectRow = ({
    line,
    amount,
    onToggle,
    onQuantityChange,
}: {
    line: SelectedLine;
    /** The line's share of the refund at the chosen quantity. */
    amount: number;
    onToggle: () => void;
    onQuantityChange: (next: number) => void;
}) => {
    const selected = line.quantity > 0;

    return (
        <Box sx={{ ...rowSx, bgcolor: selected ? brand[25] : "transparent" }}>
            <Checkbox checked={selected} onChange={onToggle} slotProps={{ input: { "aria-label": `Refund ${line.name}` } }} />

            <Typography sx={{ flex: 1, minWidth: 0, fontSize: fontSize.body1 }} noWrap>
                {line.name}
            </Typography>

            {line.soldQuantity > 1 && selected && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Button
                        variant="outlined"
                        onClick={() => onQuantityChange(Math.max(1, line.quantity - 1))}
                        aria-label={`One fewer ${line.name}`}
                        sx={{ minWidth: touchTarget.min, minHeight: touchTarget.min, px: 0 }}
                    >
                        −
                    </Button>
                    <Typography sx={{ width: 68, textAlign: "center", fontSize: fontSize.body2, color: "text.secondary" }}>
                        {line.quantity} of {line.soldQuantity}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => onQuantityChange(Math.min(line.soldQuantity, line.quantity + 1))}
                        aria-label={`One more ${line.name}`}
                        sx={{ minWidth: touchTarget.min, minHeight: touchTarget.min, px: 0 }}
                    >
                        +
                    </Button>
                </Box>
            )}

            <Typography
                sx={{
                    width: 96,
                    textAlign: "right",
                    fontSize: fontSize.body1,
                    fontVariantNumeric: "tabular-nums",
                    color: selected ? "text.primary" : "text.secondary",
                }}
            >
                {formatMoney(selected ? amount : line.linePrice)}
            </Typography>
        </Box>
    );
};

/**
 * The amount tab: a figure instead of a basket.
 *
 * Kept because it is the only way to settle a dispute that does not map to
 * lines, and labelled with what it costs — an amount refund cannot tell
 * inventory what came back.
 */
export const AmountPane = ({ value, refundable, onChange }: { value: string; refundable: number; onChange: (next: string) => void }) => (
    <Box>
        <SectionLabel>Amount to refund</SectionLabel>
        <Box
            component="input"
            inputMode="decimal"
            aria-label="Amount to refund"
            value={value}
            placeholder="$0.00"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            sx={{
                width: "100%",
                minHeight: touchTarget.large,
                px: 2,
                fontSize: fontSize.h5,
                fontFamily: "inherit",
                color: "text.primary",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: neutral[300],
                borderRadius: `${radius.md}px`,
                outline: "none",
                "&:focus": { borderColor: brand[600], boxShadow: `0 0 0 3px ${brand[100]}` },
            }}
        />
        <Typography sx={{ mt: 1.5, fontSize: fontSize.body2, color: "text.secondary" }}>
            {formatMoney(refundable)} available to refund on this order.
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: fontSize.body2, color: status.warning.dark }}>
            An amount refund does not return items to inventory, and will not appear in item sales reporting.
        </Typography>
    </Box>
);

/* -------------------------------------------------------- where it goes */

/**
 * Where the money goes, with the amounts filled in.
 *
 * This is the fix Weston asked for without naming it: *"I'd have to do both the
 * cash and the gift card. I just don't know how that works."* Each row now
 * states what it takes and what it took originally, and the split updates as
 * the selection changes.
 */
export const TenderSplit = ({
    payments,
    selected,
    allocations,
    onToggle,
}: {
    payments: OrderPayment[];
    selected: string[];
    allocations: Allocation[];
    onToggle: (method: string) => void;
}) => (
    <Box>
        <SectionLabel>Refund to</SectionLabel>
        {payments.map((payment) => {
            const allocation = allocations.find((item) => item.method === payment.method);
            const isSelected = selected.includes(payment.method);

            return (
                <Box key={payment.method} sx={{ ...rowSx, bgcolor: isSelected ? brand[25] : "transparent" }}>
                    <Checkbox
                        checked={isSelected}
                        onChange={() => onToggle(payment.method)}
                        slotProps={{ input: { "aria-label": `Refund to ${payment.method}` } }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: fontSize.body1 }}>{payment.method}</Typography>
                        <Typography sx={{ fontSize: fontSize.caption, color: "text.secondary" }}>
                            {formatMoney(payment.amount)} taken on this order
                        </Typography>
                    </Box>
                    <Typography
                        sx={{
                            fontSize: fontSize.subtitle,
                            fontVariantNumeric: "tabular-nums",
                            color: allocation && allocation.amount > 0 ? "text.primary" : "text.disabled",
                        }}
                    >
                        {formatMoney(allocation?.amount ?? 0)}
                    </Typography>
                </Box>
            );
        })}
    </Box>
);

/** Inline, specific, and present before the operator presses anything. */
export const ShortfallNote = ({ message }: { message: string }) => (
    <Box sx={{ mt: 1.5, px: 2, py: 1.5, bgcolor: status.warning.light, borderRadius: `${radius.md}px` }}>
        <Typography sx={{ fontSize: fontSize.body2, color: status.warning.dark }}>{message}</Typography>
    </Box>
);

/** A short fixed list beats free text when the answer has to be reported on. */
export const ReasonPicker = ({
    value,
    note,
    onChange,
    onNoteChange,
}: {
    value: RefundReason | null;
    note: string;
    onChange: (next: RefundReason) => void;
    onNoteChange: (next: string) => void;
}) => (
    <Box>
        <SectionLabel>Reason for refund</SectionLabel>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {refundReasons.map((reason) => (
                <Button
                    key={reason}
                    onClick={() => onChange(reason)}
                    variant={value === reason ? "contained" : "outlined"}
                    sx={{ minHeight: touchTarget.min, borderRadius: `${radius.pill}px`, px: 2, fontSize: fontSize.body2 }}
                >
                    {reason}
                </Button>
            ))}
        </Box>

        {value === "Other" && (
            <Box
                component="input"
                aria-label="Refund reason note"
                value={note}
                placeholder="What happened?"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onNoteChange(event.target.value)}
                sx={{
                    mt: 1.5,
                    width: "100%",
                    minHeight: touchTarget.comfortable,
                    px: 2,
                    fontSize: fontSize.body1,
                    fontFamily: "inherit",
                    border: "1px solid",
                    borderColor: neutral[300],
                    borderRadius: `${radius.md}px`,
                    outline: "none",
                    "&:focus": { borderColor: brand[600], boxShadow: `0 0 0 3px ${brand[100]}` },
                }}
            />
        )}
    </Box>
);

/* ------------------------------------------------------------- totals */

/** Goods, tax, total — the three numbers the shipping screen reduced to one. */
export const RefundTotals = ({ breakdown, dense = false }: { breakdown: RefundBreakdown; dense?: boolean }) => (
    <Box>
        {[{ label: "Items", value: breakdown.subtotal }, ...(breakdown.tax > 0.004 ? [{ label: "Tax", value: breakdown.tax }] : [])].map(
            (row) => (
                <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography sx={{ fontSize: fontSize.body2, color: "text.secondary" }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: fontSize.body2, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                        {formatMoney(row.value)}
                    </Typography>
                </Box>
            ),
        )}
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                pt: 1,
                mt: 0.5,
                borderTop: "1px solid",
                borderColor: "divider",
            }}
        >
            <Typography sx={{ fontSize: fontSize.body1, fontWeight: 500 }}>Refund total</Typography>
            <Typography sx={{ fontSize: dense ? fontSize.h6 : fontSize.h5, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {formatMoney(breakdown.total)}
            </Typography>
        </Box>
    </Box>
);

/**
 * The footer: the running total on the left, the way out and the way on on the
 * right.
 *
 * The committing button carries the amount — *Refund $42.34*, never a bare
 * verb — so the last thing read before the money moves is the money.
 */
export const ModalFooter = ({
    total,
    primaryLabel,
    primaryDisabled,
    onPrimary,
    onCancel,
    committing = false,
    hint,
}: {
    total: number;
    primaryLabel: string;
    primaryDisabled?: boolean;
    onPrimary?: () => void;
    onCancel?: () => void;
    /** The step that actually moves money: red, and taller. */
    committing?: boolean;
    hint?: string;
}) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: fontSize.h6, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {formatMoney(total)}
            </Typography>
            {hint && <Typography sx={{ fontSize: fontSize.body2, color: "text.secondary" }}>{hint}</Typography>}
        </Box>

        <Button variant="outlined" onClick={onCancel} sx={{ minHeight: touchTarget.comfortable, minWidth: 140 }}>
            Cancel
        </Button>
        <Button
            variant="contained"
            color={committing ? "error" : "primary"}
            disabled={primaryDisabled}
            onClick={onPrimary}
            sx={{ minHeight: committing ? touchTarget.large : touchTarget.comfortable, minWidth: 220 }}
        >
            {primaryLabel}
        </Button>
    </Box>
);

/**
 * Done.
 *
 * Names the amount, every destination it went to, and the reversal order it
 * created — so the operator leaves knowing what happened instead of hunting a
 * list for a new negative row. Reprinting the receipt is offered here because
 * this is the moment the guest is still standing there.
 */
export const RefundComplete = ({
    total,
    allocations,
    reversalOrderId,
    onDone,
}: {
    total: number;
    allocations: Allocation[];
    reversalOrderId: string;
    onDone?: () => void;
}) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, px: 4 }}>
        <Box
            sx={{
                width: 72,
                height: 72,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                bgcolor: status.success.light,
                color: status.success.dark,
            }}
        >
            <CheckIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography sx={{ fontSize: fontSize.h5, fontWeight: 500 }}>{formatMoney(total)} refunded</Typography>

        <Box sx={{ width: 380 }}>
            {allocations.map((allocation) => (
                <Box key={allocation.method} sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
                    <Typography sx={{ fontSize: fontSize.body1, color: "text.secondary" }}>{allocation.method}</Typography>
                    <Typography sx={{ fontSize: fontSize.body1, fontVariantNumeric: "tabular-nums" }}>
                        {formatMoney(allocation.amount)}
                    </Typography>
                </Box>
            ))}
        </Box>

        <Typography sx={{ fontSize: fontSize.body2, color: "text.secondary" }}>Reversal order #{reversalOrderId}</Typography>

        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Button variant="outlined" startIcon={<PrintIcon />} sx={{ minHeight: touchTarget.comfortable, minWidth: 200 }}>
                Print receipt
            </Button>
            <Button variant="contained" onClick={onDone} sx={{ minHeight: touchTarget.comfortable, minWidth: 200 }}>
                Done
            </Button>
        </Box>
    </Box>
);
