import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PrintIcon from "@mui/icons-material/Print";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Orders & Tips, from `references/072926/9-ordersTips/`.
 *
 * Where card tips get adjusted after the fact. A navy totals band across the
 * top, a seven-column table of tippable payments beneath it, and a bottom bar
 * that mixes navigation, a cash drop, a date picker and two print jobs.
 *
 * Two faithful oddities:
 *
 *   - The table declares **eight** columns and fills seven, so there is a dead
 *     column of whitespace past Tip. The header band is drawn even with no rows.
 *   - The totals band renders its seven labels with no values at all until the
 *     day has activity, so on a quiet morning it reads as broken rather than
 *     empty.
 *
 * The seeded payments below are this prototype's own — the capture was an empty
 * day. Sales closed to card in the current session are appended to them, so a
 * tender you just took shows up here.
 */

export interface TipRow {
    paymentId: string;
    orderId: string;
    time: string;
    customer: string;
    payment: string;
    amount: number;
    tip: number;
}

const COLUMNS = ["Payment ID", "Order ID", "Time", "Customer", "Payment", "Amount", "Tip"];

/** A morning's card sales. Not from the device — its capture had none. */
export const SEEDED: TipRow[] = [
    {
        paymentId: "8841207",
        orderId: "43991",
        time: "7:42 AM",
        customer: "Weston Farnsworth",
        payment: "Visa 4242",
        amount: 168.4,
        tip: 25.0,
    },
    {
        paymentId: "8841211",
        orderId: "43994",
        time: "8:05 AM",
        customer: "Tony Finau",
        payment: "Mastercard 5104",
        amount: 84.2,
        tip: 12.0,
    },
    { paymentId: "8841218", orderId: "44001", time: "8:31 AM", customer: "Randy Orton", payment: "Visa 1881", amount: 246.9, tip: 40.0 },
    { paymentId: "8841224", orderId: "44008", time: "9:14 AM", customer: "Marissa Chen", payment: "Amex 3007", amount: 62.0, tip: 0 },
    {
        paymentId: "8841233",
        orderId: "44016",
        time: "10:02 AM",
        customer: "Delgado Men's League",
        payment: "Visa 9920",
        amount: 1240.0,
        tip: 186.0,
    },
    {
        paymentId: "8841240",
        orderId: "44022",
        time: "11:19 AM",
        customer: "Tom Watson",
        payment: "Mastercard 7741",
        amount: 96.5,
        tip: 15.0,
    },
    { paymentId: "8841248", orderId: "44031", time: "12:07 PM", customer: "Priya Raman", payment: "Visa 4242", amount: 133.75, tip: 20.0 },
    { paymentId: "8841255", orderId: "44039", time: "1:36 PM", customer: "Oda Brennevin", payment: "Discover 6011", amount: 58.3, tip: 0 },
];

const cell = { flex: 1, minWidth: 0, textAlign: "center" as const, px: 1 };

export const OrdersTipsScreen = () => {
    const { paidTickets } = useStore();
    const { popDrawer } = useActions();
    const navigate = useNavigate();

    // Card sales taken in this session are tippable and belong in the list.
    const live: TipRow[] = paidTickets
        .filter((t) => t.tender === "Card")
        .map((t, i) => ({
            paymentId: `8841${300 + i}`,
            orderId: t.number.replace(/\D/g, "") || `4410${i}`,
            time: "—",
            customer: t.customer ?? t.name,
            payment: "Visa 4242",
            amount: t.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06,
            tip: 0,
        }));

    const rows = [...SEEDED, ...live];

    const totalSales = rows.reduce((s, r) => s + r.amount, 0);
    const totalTips = rows.reduce((s, r) => s + r.tip, 0);

    const totals: [string, string][] = [
        ["Total Sales", money(totalSales)],
        ["Total Payments", money(totalSales + totalTips)],
        ["Cash Turn In", money(0)],
        ["Total Credit", money(totalSales + totalTips)],
        ["Total Comps", money(0)],
        ["Total Discounts", money(0)],
        ["Total Tips", money(totalTips)],
    ];

    return (
        <Shell
            title="Orders & Tips"
            active="orderstips"
            showCart={false}
            subBar={
                <Box sx={{ flexShrink: 0 }}>
                    {/* Navy, not slate — this band is a different surface from the app bar. */}
                    <Stack direction="row" sx={{ bgcolor: appColors.navy, minHeight: 107, alignItems: "flex-start", pt: 2.5 }}>
                        {totals.map(([label, value]) => (
                            <Stack key={label} sx={{ ...cell, gap: 1.5 }}>
                                <Typography sx={{ fontSize: 15, color: "#fff" }}>{label}</Typography>
                                <Typography sx={{ fontSize: 19, color: "#fff" }}>{value}</Typography>
                            </Stack>
                        ))}
                    </Stack>

                    <Stack direction="row" sx={{ height: 56, alignItems: "center", bgcolor: "#9A9A9A" }}>
                        {COLUMNS.map((c) => (
                            <Typography key={c} sx={{ ...cell, fontSize: 17, color: appColors.textPrimary }}>
                                {c}
                            </Typography>
                        ))}
                        {/* The dead eighth column. See the note at the top of the file. */}
                        <Box sx={cell} />
                    </Stack>
                </Box>
            }
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate(-1)}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<SaveAltIcon />} tone="destructive" onClick={popDrawer}>
                        Pop
                    </ActionButton>
                    <ActionButton>Tip out</ActionButton>
                    <ActionButton preserveCase>WEDNESDAY, JULY 29 2026</ActionButton>
                    <ActionButton icon={<PrintIcon />} tone="primary">
                        Day report
                    </ActionButton>
                    <ActionButton icon={<PrintIcon />} tone="primary">
                        Shift report
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%" }}>
                {rows.length === 0 ? (
                    <Box sx={{ py: 6 }}>
                        <OrderPanelEmpty message="No tippable payments exist for this day." />
                    </Box>
                ) : (
                    rows.map((r) => (
                        <Stack
                            key={r.paymentId}
                            direction="row"
                            sx={{
                                minHeight: 64,
                                alignItems: "center",
                                bgcolor: appColors.surface,
                                borderBottom: `1px solid ${appColors.divider}`,
                            }}
                        >
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.paymentId}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.orderId}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.time}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }} noWrap>
                                {r.customer}
                            </Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{r.payment}</Typography>
                            <Typography sx={{ ...cell, fontSize: 16 }}>{money(r.amount)}</Typography>
                            {/* A zero tip prints as a dash, not $0.00 — it means "not yet
                                adjusted" rather than "tipped nothing". */}
                            <Typography sx={{ ...cell, fontSize: 16, color: r.tip ? appColors.textPrimary : appColors.textSecondary }}>
                                {r.tip ? money(r.tip) : "—"}
                            </Typography>
                            <Box sx={cell} />
                        </Stack>
                    ))
                )}
            </Box>
        </Shell>
    );
};
