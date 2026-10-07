import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { formatMoney, type OrderPayment, type TransactionOrder } from "../refund-data";
import { emptyLedger, remainingOnTender, remainingQuantity, type RefundLedger } from "./refund-ledger";

/**
 * **Oct 8 — Create a Refund, as chosen.** The parts of the one modal.
 *
 * Option A won the Oct 6 comparison, and this folder is that option with
 * Weston's notes applied. Oct 6 stays beside it as the record of the choice.
 *
 * | His note | What it did here |
 * | :-- | :-- |
 * | *"We can't really do amount right now"* — it needs a backend change | The ITEMS / AMOUNT tabs are gone and the basket starts at the top of the pane |
 * | *"the total, the refund total and items all tell the same number"* | One figure, bottom left. The breakdown stays on the confirmation, where it is read rather than watched |
 * | *"change this cancel button to be a back button"* | No Cancel while composing — the X is the way out — and the confirmation's left button is BACK |
 * | *"support multiple refunds on the same order"* | Spent lines and spent-out tenders are shown, and cannot be chosen again |
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
 * **The look is the app's, not a new one.** Weston: *"keep it in the same
 * design system, we don't need to do anything super crazy."* So every surface
 * here is built from what the app already uses — navy dialog header, grey
 * section bands, 4px corners, ALL-CAPS slate/green/red actions, square dark
 * checkboxes, MD2 filled fields. What changed is the **order and the honesty of
 * the information**, not the paint.
 *
 * The one place the design system overrides the app is **touch size**: controls
 * here sit on the 48dp floor rather than the device's 40px, because this is the
 * screen that moves money.
 */

/* ----------------------------------------------------------------- math */

export interface SelectedLine {
    name: string;
    /** How many of this line are being refunded now. 0 means the line is not selected. */
    quantity: number;
    /** How many were sold. */
    soldQuantity: number;
    /**
     * How many are still refundable — `soldQuantity` minus whatever earlier
     * refunds already took. 0 means the line is spent and cannot be chosen.
     */
    refundableQuantity: number;
    /** Price of the whole line as sold, before tax. */
    linePrice: number;
}

/**
 * Opens with nothing selected — the operator says what is going back.
 *
 * `ledger` is what earlier refunds already took off this order, so a second
 * visit opens on the remainder rather than on the original basket.
 */
export const selectionFromOrder = (order: TransactionOrder, ledger: RefundLedger = emptyLedger): SelectedLine[] =>
    order.items.map((item) => ({
        name: item.name,
        quantity: 0,
        soldQuantity: item.quantity,
        refundableQuantity: remainingQuantity(ledger, item.name, item.quantity),
        linePrice: item.price,
    }));

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
    /** What this tender can still give back — its ceiling on this refund. */
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
export const allocate = (
    total: number,
    payments: OrderPayment[],
    selectedMethods: string[],
    ledger: RefundLedger = emptyLedger,
): Allocation[] => {
    let left = total;

    return payments
        .filter((payment) => selectedMethods.includes(payment.method))
        .map((payment) => {
            // A tender can only give back what it has not given back already.
            const available = remainingOnTender(ledger, payment);
            const amount = Math.min(available, Math.max(0, Number(left.toFixed(2))));
            left -= amount;
            return { method: payment.method, available, amount };
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
 * Chrome is the app's own dialog chrome — a solid navy header bar with the
 * title centred in it, a white body, and a light action band at the foot — so
 * this reads as a screen the product already has rather than a new idea bolted
 * on.
 *
 * Sized so the order behind it stays legible around the edges: the operator is
 * working *on* that transaction, and hiding it is how the full-screen version
 * lost the context in the first place.
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
    /** Right-hand header note — the step count, or the order being refunded. */
    caption?: string;
    onClose?: () => void;
    footer?: ReactNode;
    children: ReactNode;
    /** Option A runs wider: it holds two columns rather than one. */
    width?: number;
    /** Off when the body lays out its own columns and owns their padding. */
    padBody?: boolean;
}) => (
    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 1300 }}>
        <Box
            role="dialog"
            aria-label={title}
            sx={{
                width,
                height: 680,
                display: "flex",
                flexDirection: "column",
                bgcolor: appColors.surface,
                borderRadius: `${appRadius.card}px`,
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
            }}
        >
            {/* Navy bar, centred title — the app's dialog header, unchanged. */}
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", minHeight: 64, px: 1, bgcolor: appColors.navy }}>
                <IconButton onClick={onClose} aria-label="Close" sx={{ color: "#fff", zIndex: 1 }}>
                    <CloseIcon />
                </IconButton>

                <Typography
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 20,
                        color: "#fff",
                        pointerEvents: "none",
                    }}
                >
                    {title}
                </Typography>

                <Box sx={{ flex: 1 }} />
                {caption && (
                    <Typography sx={{ pr: 2, fontSize: 14, letterSpacing: "0.04em", color: "rgba(255,255,255,0.8)", zIndex: 1 }}>
                        {caption}
                    </Typography>
                )}
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: padBody ? "auto" : "hidden", ...(padBody && { px: 2, py: 2 }) }}>{children}</Box>

            {footer && <Box sx={{ flexShrink: 0, bgcolor: appColors.canvasAlt, px: 2, py: 1.5 }}>{footer}</Box>}
        </Box>
    </Box>
);

/**
 * Section heading.
 *
 * The same grey band Transaction Details puts over *Order Items* and
 * *Payments*, reused rather than re-invented — it is how this app says "new
 * section" and it already reads at arm's length.
 */
export const SectionLabel = ({ children }: { children: string }) => (
    <Box sx={{ height: 36, display: "flex", alignItems: "center", px: 1.25, mb: 0.5, bgcolor: "#F0F1F3" }}>
        <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{children}</Typography>
    </Box>
);

/* ------------------------------------------------------- what to refund */

/** Row geometry shared by the item list and the tender list. */
const rowSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    minHeight: touchTarget.comfortable,
    px: 1,
    borderBottom: "1px solid",
    borderColor: appColors.divider,
};

/** The app's square, dark checkbox — not a brand-coloured one. */
const checkboxSx = {
    color: appColors.textPrimary,
    "&.Mui-checked": { color: appColors.textPrimary },
    "&.MuiCheckbox-indeterminate": { color: appColors.textPrimary },
};

/** One tap for the common case: the whole order goes back. */
export const SelectAllRow = ({ checked, indeterminate, onToggle }: { checked: boolean; indeterminate: boolean; onToggle: () => void }) => (
    <Box sx={{ ...rowSx, bgcolor: appColors.canvas }}>
        <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={onToggle}
            sx={checkboxSx}
            slotProps={{ input: { "aria-label": "Select all items" } }}
        />
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: appColors.textPrimary }}>Select all items</Typography>
    </Box>
);

/**
 * A selectable line.
 *
 * The checkbox carries inclusion and the stepper carries quantity — two
 * questions, two controls, where the shipping screen asked both through one
 * number. The stepper reads `1 of 2` so the part being kept is stated rather
 * than inferred.
 *
 * **A line that has already gone back is shown, not hidden.** It keeps its
 * place in the order, greyed, with a `Refunded` chip and its checkbox
 * unavailable — the operator came to this screen holding a receipt, and a line
 * that quietly vanished would read as a mistake. Where only part of a line went
 * back, the row says so (`1 of 2 refunded`) and the stepper is capped at what
 * is left.
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
    const alreadyRefunded = line.soldQuantity - line.refundableQuantity;
    const spent = line.refundableQuantity === 0;

    return (
        <Box sx={{ ...rowSx, bgcolor: spent ? appColors.canvas : selected ? "#F3F7F4" : appColors.surface }}>
            <Checkbox
                checked={selected}
                disabled={spent}
                onChange={onToggle}
                sx={checkboxSx}
                slotProps={{ input: { "aria-label": `Refund ${line.name}` } }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, color: spent ? appColors.textDisabled : appColors.textPrimary }} noWrap>
                    {line.name}
                </Typography>
                {!spent && alreadyRefunded > 0 && (
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                        {alreadyRefunded} of {line.soldQuantity} refunded earlier
                    </Typography>
                )}
            </Box>

            {spent && <RefundedChip />}

            {line.refundableQuantity > 1 && selected && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "stretch",
                        height: touchTarget.min,
                        mr: 1,
                        border: "1px solid",
                        borderColor: appColors.textPrimary,
                        borderRadius: `${appRadius.button}px`,
                        overflow: "hidden",
                    }}
                >
                    {[
                        { glyph: "−", label: `One fewer ${line.name}`, next: Math.max(1, line.quantity - 1) },
                        { glyph: "", label: "", next: 0 },
                        { glyph: "+", label: `One more ${line.name}`, next: Math.min(line.refundableQuantity, line.quantity + 1) },
                    ].map((control, index) =>
                        index === 1 ? (
                            <Typography
                                key="count"
                                sx={{ alignSelf: "center", width: 72, textAlign: "center", fontSize: 14, color: appColors.textSecondary }}
                            >
                                {line.quantity} of {line.refundableQuantity}
                            </Typography>
                        ) : (
                            <Button
                                key={control.glyph}
                                variant="text"
                                aria-label={control.label}
                                onClick={() => onQuantityChange(control.next)}
                                disableRipple
                                sx={{
                                    minWidth: touchTarget.min,
                                    minHeight: 0,
                                    p: 0,
                                    lineHeight: 1,
                                    fontSize: 20,
                                    borderRadius: 0,
                                    bgcolor: "transparent",
                                    color: appColors.textPrimary,
                                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                                }}
                            >
                                {control.glyph}
                            </Button>
                        ),
                    )}
                </Box>
            )}

            <Typography
                sx={{
                    width: 92,
                    textAlign: "right",
                    fontSize: 15,
                    color: spent ? appColors.textDisabled : selected ? appColors.textPrimary : appColors.textSecondary,
                }}
            >
                {formatMoney(selected ? amount : line.linePrice)}
            </Typography>
        </Box>
    );
};

/** The orange chip the app already stamps on a refunded line, reused here. */
const RefundedChip = () => (
    <Box sx={{ bgcolor: appColors.orange, px: 1.25, py: 0.5, mr: 1 }}>
        <Typography sx={{ fontSize: 13, color: "#fff" }}>Refunded</Typography>
    </Box>
);

/** The app's MD2 filled field — grey fill, hard bottom rule, square top corners. */
const filledFieldSx = {
    width: "100%",
    minHeight: touchTarget.min,
    px: 1.875,
    fontFamily: "inherit",
    color: appColors.textPrimary,
    bgcolor: appColors.fieldFill,
    border: "none",
    borderBottom: "1px solid rgba(0,0,0,0.42)",
    borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
    outline: "none",
};

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
    ledger = emptyLedger,
    onToggle,
}: {
    payments: OrderPayment[];
    selected: string[];
    allocations: Allocation[];
    /** What earlier refunds already put back on each tender. */
    ledger?: RefundLedger;
    onToggle: (method: string) => void;
}) => (
    <Box>
        <SectionLabel>Refund to</SectionLabel>
        {payments.map((payment) => {
            const allocation = allocations.find((item) => item.method === payment.method);
            const isSelected = selected.includes(payment.method);
            const left = remainingOnTender(ledger, payment);
            const spentOut = left === 0;

            return (
                <Box
                    key={payment.method}
                    sx={{ ...rowSx, bgcolor: spentOut ? appColors.canvas : isSelected ? "#F3F7F4" : appColors.surface }}
                >
                    <Checkbox
                        checked={isSelected && !spentOut}
                        disabled={spentOut}
                        onChange={() => onToggle(payment.method)}
                        sx={checkboxSx}
                        slotProps={{ input: { "aria-label": `Refund to ${payment.method}` } }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 15, color: spentOut ? appColors.textDisabled : appColors.textPrimary }}>
                            {payment.method}
                        </Typography>
                        {/*
                         * Two different facts, and the second one only exists
                         * after a first refund: what this tender took, and what
                         * is left on it. Weston's case — cash already returned
                         * in full, so the rest of the order has to go back to
                         * the gift card — is this line.
                         */}
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                            {spentOut
                                ? `${formatMoney(payment.amount)} already refunded in full`
                                : left < payment.amount
                                  ? `${formatMoney(left)} left of ${formatMoney(payment.amount)}`
                                  : `${formatMoney(payment.amount)} taken on this order`}
                        </Typography>
                    </Box>
                    <Typography
                        sx={{
                            fontSize: 17,
                            color: allocation && allocation.amount > 0 ? appColors.textPrimary : appColors.textDisabled,
                        }}
                    >
                        {formatMoney(allocation?.amount ?? 0)}
                    </Typography>
                </Box>
            );
        })}
    </Box>
);

/**
 * The shortfall, in the app's warning orange.
 *
 * Same colour the device already uses for *"Price of selected payments is less
 * than total price to be refunded"* — and that is the point: the band is
 * familiar, the sentence is not. It names the gap and the remedy, and it is
 * here while the selection is being made rather than after a press.
 */
export const ShortfallNote = ({ message }: { message: string }) => (
    <Box sx={{ mt: 1.5, mx: 1.25, px: 2, py: 1.5, bgcolor: appColors.orange, borderRadius: `${appRadius.button}px` }}>
        <Typography sx={{ fontSize: 15, color: "#fff" }}>{message}</Typography>
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
        <Box sx={{ px: 1.25, pt: 0.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {refundReasons.map((reason) => {
                    const isSelected = value === reason;

                    return (
                        <Button
                            key={reason}
                            onClick={() => onChange(reason)}
                            disableElevation
                            sx={{
                                minHeight: touchTarget.min,
                                px: 2,
                                borderRadius: `${appRadius.button}px`,
                                textTransform: "none",
                                fontSize: 15,
                                bgcolor: isSelected ? appColors.navy : appColors.surface,
                                color: isSelected ? "#fff" : appColors.textPrimary,
                                border: "1px solid",
                                borderColor: isSelected ? appColors.navy : appColors.greyLight,
                                "&:hover": { bgcolor: isSelected ? appColors.navyDeep : appColors.canvas },
                            }}
                        >
                            {reason}
                        </Button>
                    );
                })}
            </Box>

            {value === "Other" && (
                <Box
                    component="input"
                    aria-label="Refund reason note"
                    value={note}
                    placeholder="What happened?"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onNoteChange(event.target.value)}
                    sx={{ ...filledFieldSx, mt: 1.5, fontSize: 15 }}
                />
            )}
        </Box>
    </Box>
);

/* ------------------------------------------------------------- totals */

/** Goods, tax, total — the three numbers the shipping screen reduced to one. */
export const RefundTotals = ({ breakdown, dense = false }: { breakdown: RefundBreakdown; dense?: boolean }) => (
    <Box>
        {[{ label: "Items", value: breakdown.subtotal }, ...(breakdown.tax > 0.004 ? [{ label: "Tax", value: breakdown.tax }] : [])].map(
            (row) => (
                <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{formatMoney(row.value)}</Typography>
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
                borderColor: appColors.divider,
            }}
        >
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: appColors.textPrimary }}>Refund total</Typography>
            <Typography sx={{ fontSize: dense ? 20 : 24, fontWeight: 500, color: appColors.textPrimary }}>
                {formatMoney(breakdown.total)}
            </Typography>
        </Box>
    </Box>
);

/**
 * The footer: the running total on the left, the way on at the right.
 *
 * Two changes from Oct 6, both from Weston's walkthrough.
 *
 * **The total is the only one on the screen now.** The compose pane used to
 * print *Items*, *Refund total* and this figure, all the same number on an
 * untaxed order — *"I don't think we need all of them."* The breakdown survives
 * on the confirmation, where it is read once rather than watched changing.
 *
 * **Cancel is gone from the compose pane.** The header X is the way out of a
 * refund that should not happen; a second control that does the same thing only
 * adds a decision. On the confirmation the left button is **BACK**, because
 * from there the operator wants the basket again, not the door.
 */
export const ModalFooter = ({
    total,
    primaryLabel,
    primaryDisabled,
    onPrimary,
    onBack,
    committing = false,
    hint,
}: {
    total: number;
    primaryLabel: string;
    primaryDisabled?: boolean;
    onPrimary?: () => void;
    /** Supplied only where there is a previous step — the confirmation. */
    onBack?: () => void;
    /** The step that actually moves money: red, and wider. */
    committing?: boolean;
    hint?: string;
}) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0, pl: 0.5 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 500, color: appColors.textPrimary }}>{formatMoney(total)}</Typography>
            {hint && <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{hint}</Typography>}
        </Box>

        {onBack && (
            <Box sx={{ display: "flex", width: 160 }}>
                <ActionButton icon={<ChevronLeftIcon />} onClick={onBack}>
                    BACK
                </ActionButton>
            </Box>
        )}
        <Box sx={{ display: "flex", width: committing ? 280 : 240 }}>
            <ActionButton
                tone={primaryDisabled ? "disabled" : committing ? "danger" : "primary"}
                onClick={primaryDisabled ? undefined : onPrimary}
            >
                {primaryLabel}
            </ActionButton>
        </Box>
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
        <Box sx={{ width: 72, height: 72, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: appColors.green }}>
            <CheckIcon sx={{ fontSize: 42, color: "#fff" }} />
        </Box>

        <Typography sx={{ fontSize: 24, color: appColors.textPrimary }}>{formatMoney(total)} refunded</Typography>

        <Box sx={{ width: 360 }}>
            {allocations.map((allocation) => (
                <Box
                    key={allocation.method}
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid",
                        borderColor: appColors.divider,
                    }}
                >
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{allocation.method}</Typography>
                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{formatMoney(allocation.amount)}</Typography>
                </Box>
            ))}
        </Box>

        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>Reversal order #{reversalOrderId}</Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 1, width: 420 }}>
            <ActionButton icon={<PrintIcon />}>PRINT RECEIPT</ActionButton>
            <ActionButton tone="primary" onClick={onDone}>
                DONE
            </ActionButton>
        </Box>
    </Box>
);
