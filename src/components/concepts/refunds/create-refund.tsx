import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { formatMoney, type OrderPayment, type TransactionOrder } from "./refund-data";

/**
 * Create a Refund — the screen where the money is decided.
 *
 * Transcribed from `references/100626/`. Items on the left with a −/+ stepper
 * each, tenders on the right with a checkbox each, and a single sentence at the
 * bottom left that is the only running total on the screen.
 *
 * The interaction is two separate decisions that the screen treats as unrelated:
 *
 * 1. **How much** — set by the steppers. A line is excluded by counting it down
 *    to **0**, which leaves it in place looking exactly like an included line
 *    apart from one digit. There is no "select all" and no per-line checkbox.
 * 2. **Where it goes** — set by the checkboxes. Checking two tenders tells the
 *    app to split across them, but the split itself is never shown: the
 *    sentence reads "will be refunded to Cash, Gift Card" and the operator finds
 *    out it was $25.00 / $17.34 afterwards, on the refund's own details screen.
 *
 * The warning band is the screen's one piece of validation, and it arrives late:
 * nothing is said while the selection is being made, and pressing REFUND with
 * tenders that cannot cover the amount — including none at all — drops an orange
 * band at the top of the screen. It names no figure and no remedy, REFUND stays
 * live underneath it, and the sentence at the bottom still promises the full
 * amount.
 */

export interface RefundLine {
    name: string;
    /** Quantity being refunded. Starts at the quantity sold; 0 excludes the line. */
    quantity: number;
    /** Line price at the quantity sold — the figure the app shows regardless of the stepper. */
    price: number;
    /** What the line is worth per unit, used to total the refund as quantities change. */
    unitPrice: number;
}

/** Opens the refund with every line at the quantity sold, which is what the device does. */
export const linesFromOrder = (order: TransactionOrder): RefundLine[] =>
    order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.price / item.quantity,
    }));

export const refundTotal = (lines: RefundLine[]): number => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

/**
 * The sentence under the items.
 *
 * Without a tender it reads "$42.34 will be refunded"; with tenders it appends
 * them in the order they appear on the order, never the amounts.
 */
export const refundSentence = (total: number, selected: string[]): string =>
    selected.length > 0 ? `${formatMoney(total)} will be refunded to ${selected.join(", ")}` : `${formatMoney(total)} will be refunded`;

/**
 * The −/+ control. 118 × 40 on the device, so each target is about 39 × 40 —
 * well under the 48dp floor the design system holds to, on the control that
 * decides how much money goes back.
 *
 * Every size here is set explicitly because the Birdie theme's `MuiButton`
 * defaults are built for the 48dp floor: contained, green, `minHeight: 56`. A
 * 56px button inside a 40px box pushes its glyph below the centre line, which
 * is what made the first pass at this control look broken.
 */
const StepperButton = ({ label, onClick, children }: { label: string; onClick?: () => void; children: string }) => (
    <Button
        variant="text"
        aria-label={label}
        onClick={onClick}
        disableElevation
        disableRipple
        sx={{
            minWidth: 0,
            minHeight: 0,
            flex: 1,
            alignSelf: "stretch",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 0,
            lineHeight: 1,
            bgcolor: "transparent",
            color: appColors.textPrimary,
            fontSize: 20,
            fontWeight: 400,
            borderRadius: 0,
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
        }}
    >
        {children}
    </Button>
);

const QuantityStepper = ({ value, onChange }: { value: number; onChange?: (next: number) => void }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "stretch",
            width: 118,
            height: 40,
            flexShrink: 0,
            overflow: "hidden",
            bgcolor: appColors.surface,
            border: "1px solid",
            borderColor: appColors.textPrimary,
            borderRadius: `${appRadius.button}px`,
        }}
    >
        {/* U+2212, not a hyphen: it sits on the same optical line as the plus. */}
        <StepperButton label="One fewer" onClick={() => onChange?.(Math.max(0, value - 1))}>
            −
        </StepperButton>
        <Typography sx={{ flex: 1, alignSelf: "center", textAlign: "center", fontSize: 16, color: appColors.textPrimary }}>
            {value}
        </Typography>
        <StepperButton label="One more" onClick={() => onChange?.(value + 1)}>
            +
        </StepperButton>
    </Box>
);

/** Full-width orange band under the app bar. White text, centred, not dismissible. */
export const RefundWarningBanner = ({
    message = "Price of selected payments is less than total price to be refunded",
}: {
    message?: string;
}) => (
    <Box sx={{ flexShrink: 0, minHeight: 55, bgcolor: appColors.orange, display: "grid", placeItems: "center", px: 2 }}>
        <Typography sx={{ fontSize: 17, color: "#fff", textAlign: "center" }}>{message}</Typography>
    </Box>
);

export interface CreateRefundProps {
    lines: RefundLine[];
    payments: OrderPayment[];
    /** Methods currently checked, by `OrderPayment.method`. */
    selected: string[];
    onQuantityChange?: (name: string, next: number) => void;
    onTogglePayment?: (method: string) => void;
}

export const CreateRefund = ({ lines, payments, selected, onQuantityChange, onTogglePayment }: CreateRefundProps) => (
    <Box sx={{ display: "flex", minHeight: "100%", bgcolor: appColors.surface }}>
        {/* Items, and the sentence pinned under them. */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Box sx={{ height: 36, bgcolor: "#F0F1F3", display: "flex", alignItems: "center", px: 1.25 }}>
                <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>Order Items</Typography>
            </Box>

            {lines.map((line) => (
                <Box
                    key={line.name}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        minHeight: 54,
                        px: 1.25,
                        py: 0.5,
                    }}
                >
                    <Typography
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 15,
                            color: appColors.textPrimary,
                            borderBottom: "1px solid",
                            borderColor: appColors.divider,
                            alignSelf: "stretch",
                            display: "flex",
                            alignItems: "center",
                        }}
                        noWrap
                    >
                        {line.name}
                    </Typography>
                    <QuantityStepper value={line.quantity} onChange={(next) => onQuantityChange?.(line.name, next)} />
                    {/* The price never changes with the stepper — it is the line
                        as sold, not the line as refunded. */}
                    <Typography sx={{ width: 120, textAlign: "right", fontSize: 15, color: appColors.textPrimary }}>
                        {formatMoney(line.price)}
                    </Typography>
                </Box>
            ))}

            <Box sx={{ flex: 1 }} />

            <Typography sx={{ fontSize: 16, color: appColors.textPrimary, px: 1.25, pb: 2 }}>
                {refundSentence(refundTotal(lines), selected)}
            </Typography>
        </Box>

        {/* Tenders. One checkbox each, no amounts beyond what was taken. */}
        <Box sx={{ width: 405, flexShrink: 0, borderLeft: "1px solid", borderColor: appColors.divider }}>
            <Box sx={{ height: 36, bgcolor: "#F0F1F3", display: "flex", alignItems: "center", px: 1.25 }}>
                <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>Payments</Typography>
            </Box>

            {payments.map((payment) => (
                <Box
                    key={payment.method}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        minHeight: 48,
                        mx: 1.25,
                        borderBottom: "1px solid",
                        borderColor: appColors.divider,
                    }}
                >
                    <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: appColors.textPrimary }}>
                        {payment.method} ({formatMoney(payment.amount)})
                    </Typography>
                    <Checkbox
                        checked={selected.includes(payment.method)}
                        onChange={() => onTogglePayment?.(payment.method)}
                        slotProps={{ input: { "aria-label": `Refund to ${payment.method}` } }}
                        sx={{ color: appColors.textPrimary, "&.Mui-checked": { color: appColors.textPrimary } }}
                    />
                </Box>
            ))}
        </Box>
    </Box>
);

export default CreateRefund;
