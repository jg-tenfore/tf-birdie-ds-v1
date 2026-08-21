import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * Order Complete, from `references/072926/checkoutScreens/`.
 *
 * A full-bleed screen with no app bar and no action bar — the only ways out are
 * the four buttons, which is right: this is a decision point, not a place to
 * linger, and the sale is already closed.
 *
 * Left is the receipt as it will print. Right is what just happened and where to
 * go next. Three of the four exits carry a green tick and one carries a printer,
 * which reads as "these are done" against "this one does something" — it is
 * actually the reverse: the ticks are navigation and the printer is the action.
 * Reproduced, because it is the sort of thing that only looks wrong once it is
 * pointed at.
 *
 * The headline is the other thing worth noticing. It says **Cash Tendered** on
 * every tender, not "<tender> Tendered", so a sale settled with a raincheck
 * reads `Cash Tendered $0.00` above a `Rain Check $53.48` payment line. It is
 * about the drawer rather than about the ticket, and nothing on screen says so.
 */

export interface OrderCompleteLine {
    id: string;
    name: string;
    qty: number;
    /** The line's own total, not its unit price. */
    total: number;
    seat?: number;
}

export interface OrderCompleteSale {
    facility: string;
    orderNumber: string;
    lines: OrderCompleteLine[];
    /** How it was settled: `Cash`, `Card`, `Gift card`, `Rain Check`, … */
    tender: string;
    /** What the Payments line prints. */
    paid: number;
    /** Cash handed over. Zero on every tender that does not touch the drawer. */
    cash: number;
    change: number;
    subtotal: number;
    tax: number;
    total: number;
}

/** A sale settled with a raincheck — the ticket from the reference screenshot. */
export const raincheckSale: OrderCompleteSale = {
    facility: "The Dunes of Delgado PROD",
    orderNumber: "5823986",
    lines: [
        { id: "greenfee", name: "Senior Weekday", qty: 1, total: 26.99 },
        { id: "cart", name: "Dunes Cart", qty: 1, total: 23.1 },
    ],
    tender: "Rain Check",
    paid: 53.48,
    cash: 0,
    change: 0,
    subtotal: 50.09,
    tax: 3.39,
    total: 53.48,
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const ReceiptRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 4, py: 0.35 }}>
        <Typography sx={{ fontSize: 19, fontWeight: bold ? 700 : 400, minWidth: 200, textAlign: "right" }}>{label}</Typography>
        <Typography sx={{ fontSize: 19, fontWeight: bold ? 700 : 400, minWidth: 90, textAlign: "right" }}>{value}</Typography>
    </Stack>
);

const ExitButton = ({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick?: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            width: "100%",
            minHeight: 74,
            bgcolor: appColors.slate,
            color: "#fff",
            justifyContent: "flex-start",
            px: 1.25,
            gap: 3,
            borderRadius: 1,
        }}
    >
        <Box sx={{ display: "grid", placeItems: "center", width: 38, height: 38, bgcolor: appColors.green, borderRadius: 1 }}>{icon}</Box>
        <Typography sx={{ flex: 1, textAlign: "center", fontSize: 16, letterSpacing: "0.08em", pr: 7 }}>{label}</Typography>
    </ButtonBase>
);

export interface OrderCompleteProps {
    sale?: OrderCompleteSale;
    /** Pre-fills the receipt-email field. */
    email?: string;
    onPrint?: () => void;
    onSend?: (email: string) => void;
    onExit?: (to: "teesheet" | "proshop" | "customersearch") => void;
    /** The toast the device raises. Rendered here so a story can show it. */
    toast?: string | null;
}

export const OrderComplete = ({ sale = raincheckSale, email: initialEmail = "", onPrint, onSend, onExit, toast }: OrderCompleteProps) => {
    const [email, setEmail] = useState(initialEmail);

    return (
        <Stack direction="row" sx={{ height: "100vh", bgcolor: appColors.canvas, position: "relative" }}>
            {/* The receipt, as it prints. */}
            <Box sx={{ width: "48%", bgcolor: "#fff", m: 2, p: 4, overflowY: "auto" }}>
                <Typography sx={{ fontSize: 21, textAlign: "center" }}>{sale.facility}</Typography>
                <Typography sx={{ fontSize: 21, textAlign: "center", mb: 3 }}>{sale.orderNumber}</Typography>

                <Typography sx={{ fontSize: 19, textAlign: "center", mb: 1.5 }}>Order Items</Typography>
                {sale.lines.map((l) => (
                    <Stack
                        key={`${l.id}-${l.seat ?? "x"}`}
                        direction="row"
                        sx={{ justifyContent: "space-between", borderBottom: `1px solid ${appColors.divider}`, py: 0.75 }}
                    >
                        <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>
                            {l.name} x{l.qty}
                        </Typography>
                        <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{usd(l.total)}</Typography>
                    </Stack>
                ))}

                <Typography sx={{ fontSize: 19, textAlign: "center", mt: 2, mb: 1.5 }}>Payments</Typography>
                <Stack direction="row" sx={{ justifyContent: "space-between", borderBottom: `1px solid ${appColors.divider}`, py: 0.75 }}>
                    <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{sale.tender}</Typography>
                    <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{usd(sale.paid)}</Typography>
                </Stack>

                <Box sx={{ mt: 3 }}>
                    <ReceiptRow label="SubTotal" value={usd(sale.subtotal)} />
                    {/* Zero on a gift card — stored value is taxed when it is spent,
                        not when it is bought. */}
                    <ReceiptRow label="Taxes and Fees" value={usd(sale.tax)} />
                    <ReceiptRow label="Service Charge" value={usd(0)} />
                    <ReceiptRow label="Credit Surcharge" value={usd(0)} />
                    <ReceiptRow label="Discounts" value={usd(0)} />
                    <ReceiptRow label="Tip" value={usd(0)} />
                    <ReceiptRow label="Grand Total" value={usd(sale.total)} bold />
                </Box>
            </Box>

            {/* What happened, and where to go. */}
            <Stack sx={{ flex: 1, alignItems: "center", pt: 4, px: 6 }}>
                <Typography sx={{ fontSize: 36 }}>Order Complete</Typography>
                <Typography sx={{ fontSize: 21, color: appColors.greenTee, mt: 2 }}>Cash Tendered {usd(sale.cash)}</Typography>
                <Typography sx={{ fontSize: 21, color: appColors.greenTee, mt: 1 }}>Change Due {usd(sale.change)}</Typography>

                <Stack sx={{ width: "100%", maxWidth: 700, gap: 1.5, mt: 5 }}>
                    <ExitButton label="PRINT RECEIPT" icon={<ReceiptLongIcon sx={{ fontSize: 22, color: "#fff" }} />} onClick={onPrint} />
                    <ExitButton
                        label="TEE SHEET"
                        icon={<CheckIcon sx={{ fontSize: 22, color: "#fff" }} />}
                        onClick={() => onExit?.("teesheet")}
                    />
                    <ExitButton
                        label="PRO SHOP"
                        icon={<CheckIcon sx={{ fontSize: 22, color: "#fff" }} />}
                        onClick={() => onExit?.("proshop")}
                    />
                    <ExitButton
                        label="CUSTOMER SEARCH"
                        icon={<CheckIcon sx={{ fontSize: 22, color: "#fff" }} />}
                        onClick={() => onExit?.("customersearch")}
                    />
                </Stack>

                <Stack direction="row" sx={{ width: "100%", maxWidth: 700, mt: 2 }}>
                    <InputBase
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        inputProps={{ "aria-label": "Receipt email address" }}
                        sx={{ flex: 1, bgcolor: "#fff", px: 2, "& input": { fontSize: 19, py: 2 } }}
                    />
                    <ButtonBase
                        onClick={() => email.trim() && onSend?.(email)}
                        sx={{ width: 250, bgcolor: appColors.slate, color: "#fff", gap: 2 }}
                    >
                        <EmailIcon sx={{ fontSize: 26 }} />
                        <Typography sx={{ fontSize: 16, letterSpacing: "0.08em" }}>SEND</Typography>
                    </ButtonBase>
                </Stack>
            </Stack>

            {toast && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 40,
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: appColors.slate,
                        color: "#fff",
                        px: 3,
                        py: 2,
                        fontSize: 17,
                        borderRadius: 0.5,
                    }}
                >
                    {toast}
                </Box>
            )}
        </Stack>
    );
};
