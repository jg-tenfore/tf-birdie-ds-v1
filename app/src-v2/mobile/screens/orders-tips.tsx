import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintIcon from "@mui/icons-material/Print";

import { MobileEmpty, MobileSeatBand, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { SEEDED, type TipRow } from "../../screens/orders-tips";
import { money, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Orders & Tips, on a phone.
 *
 * End-of-shift reconciliation, over the same rows the counter terminal
 * reconciles: the landscape screen's `SEEDED` fixture (imported, not copied)
 * plus every card sale closed in this session, read live from
 * `paidTickets`. Ring a card sale up on either device and it appears here.
 *
 * ## What changed from the landscape screen, and why
 *
 * **The 7-across totals strip rewraps to 2.** `DayTotalsStrip` is seven equal
 * cells on navy across 1290px — 183px each. At 402px that is **57px**, and
 * `Total Discounts` alone is ~98px at 13px: five of the seven labels would wrap
 * or clip. The cell is fine; there are simply too many per row. Two columns
 * gives 201px a cell, which fits the longest label with room over, and the same
 * seven cells wrap to four rows. The last row holds one cell rather than two,
 * left as it falls — `Total Tips` is the figure this screen is named for and
 * stretching it full-width would make it read as a summary of the six above it,
 * which it is not.
 *
 * **The 7-column ledger stacks, and Amount leads.** `Payment ID / Order ID /
 * Time / Customer / Payment / Amount / Tip` in the landscape pane's left 78% is
 * 45px a column at 402px. Stacked, the question is which of the seven leads.
 * It is **Amount** — not Tip, because Tip is the field being *entered* and a
 * value you are about to type cannot also identify the row you are typing into;
 * and not Payment ID, because an eleven-digit number identifies a row to the
 * system, not to the server reading it. So a row reads *Customer* with *Amount*
 * trailing on line 1, `Payment · Time · Order ID` joined on line 2, and the tip
 * as the row's own control. The header band that labelled the seven columns is
 * dropped for the same reason the reservations one is: once a row stacks there
 * are no columns left to head.
 *
 * **The tip control is presets, not a keypad** — the same rule the phone's
 * payment screen applies to cash. 15 / 18 / 20 % of the row's own amount, plus
 * `No tip`. It opens only on the row being adjusted, because eight rows each
 * carrying a permanent 44dp chip row would be 350px of controls for one edit.
 *
 * **Six buttons become four affordances.** `BACK / POP / TIP OUT / Wednesday,
 * July 29 2026 / DAY REPORT / SHIFT REPORT` is 205px a button across 1290px and
 * **67px** across 402px, in which a 22-character date is not a button.
 *
 * | Landscape | Phone | Why |
 * | :-- | :-- | :-- |
 * | BACK | App bar leading | As on every screen in this build |
 * | Wednesday, July 29 2026 | The slate day band | It is not an action, it is which day you are looking at |
 * | POP | Secondary, still red | It opens the drawer; the app colours that destructive-adjacent |
 * | TIP OUT | Secondary, slate | Pairs with POP — both act on money already taken |
 * | DAY REPORT | Full-width green primary | The one thing here that closes something |
 * | SHIFT REPORT | Overflow sheet | A day report closes the day and prints once; a shift report closes one server and prints on demand. The rarer of two prints is the one that moves |
 *
 * ## The one thing that is not persisted
 *
 * A tip typed here lives in this screen. The reducer has no tip ledger — the
 * landscape screen renders `r.tip` off a constant and has no way to change it
 * either — so rather than invent a store slice the phone keeps the adjustment
 * local and recomputes the navy strip from it live. Leave the screen and the
 * adjustment is gone, exactly as it would be on the terminal. That is a real
 * gap in the prototype, stated rather than hidden.
 */

const DAY_LABEL = "WEDNESDAY, JULY 29 2026";

/** What the landscape screen's day band charges tax at. */
const TAX_MULTIPLIER = 1.06;

const PRESETS = [0.15, 0.18, 0.2];

/**
 * The navy day-totals strip, rewrapped two-up.
 *
 * Local rather than shared because the reflow *is* the change: the landscape
 * strip takes its column count from the number of totals, which is exactly the
 * behaviour that has to stop at this width.
 */
const MobileDayTotals = ({ totals }: { totals: [string, string][] }) => (
    <Box
        sx={{
            flexShrink: 0,
            bgcolor: appColors.navy,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            alignContent: "start",
            rowGap: 1.5,
            py: 2,
        }}
    >
        {totals.map(([label, value]) => (
            <Stack key={label} sx={{ alignItems: "center", gap: 0.75, minHeight: 42 }}>
                <Typography sx={{ fontSize: 13, color: "#fff" }}>{label}</Typography>
                <Typography sx={{ fontSize: 17, color: "#fff" }}>{value}</Typography>
            </Stack>
        ))}
    </Box>
);

export const MobileOrdersTipsScreen = () => {
    const { paidTickets } = useStore();
    const { popDrawer, toast } = useActions();

    const [sheet, setSheet] = useState(false);
    const [open, setOpen] = useState<string | null>(null);
    /** Adjustments made in this session, keyed by payment id. */
    const [tips, setTips] = useState<Record<string, number>>({});

    const rows: TipRow[] = useMemo(() => {
        // Card sales taken in this session are tippable and belong in the list —
        // the same derivation the landscape screen runs.
        const live: TipRow[] = paidTickets
            .filter((t) => t.tender === "Card")
            .map((t, i) => ({
                paymentId: `8841${300 + i}`,
                orderId: t.number.replace(/\D/g, "") || `4410${i}`,
                time: "—",
                customer: t.customer ?? t.name,
                payment: "Visa 4242",
                amount: t.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * TAX_MULTIPLIER,
                tip: 0,
            }));
        return [...SEEDED, ...live];
    }, [paidTickets]);

    const tipOf = (row: TipRow) => tips[row.paymentId] ?? row.tip;

    const totalSales = rows.reduce((s, r) => s + r.amount, 0);
    const totalTips = rows.reduce((s, r) => s + tipOf(r), 0);
    const adjusted = Object.keys(tips).length;

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
        <MobileShell
            title="Orders & Tips"
            active="orderstips"
            onOverflow={() => setSheet(true)}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary tone="destructive" onClick={popDrawer}>
                            <FileDownloadOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                            Pop
                        </MobileSecondary>
                        <MobileSecondary onClick={() => toast(`Tipped out ${money(totalTips)}`)}>Tip Out</MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary icon={<PrintIcon sx={{ fontSize: 20 }} />} onClick={() => toast(`Day report — ${money(totalSales)}`)}>
                        Day Report
                    </MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            {
                                label: "Shift Report",
                                icon: <PrintIcon sx={{ fontSize: 20 }} />,
                                onClick: () => {
                                    toast("Shift report sent to the printer");
                                    setSheet(false);
                                },
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            {/* The date out of the middle of the landscape action bar, drawn as
                the day band the reservations screen already uses. */}
            <MobileSeatBand label={DAY_LABEL} color={appColors.slate} />
            <MobileDayTotals totals={totals} />

            {rows.length === 0 ? (
                <MobileEmpty message="No tippable payments exist for this day." />
            ) : (
                <>
                    <MobileSectionHeading>
                        {rows.length} tippable payments
                        {adjusted > 0 ? ` · ${adjusted} adjusted` : ""}
                    </MobileSectionHeading>

                    {rows.map((row) => {
                        const tip = tipOf(row);
                        const isOpen = open === row.paymentId;
                        return (
                            <Box key={row.paymentId} sx={{ bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
                                <ButtonBase
                                    onClick={() => setOpen(isOpen ? null : row.paymentId)}
                                    sx={{ display: "block", width: "100%", textAlign: "left", px: 1.5, py: 1 }}
                                >
                                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
                                        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16 }} noWrap>
                                            {row.customer}
                                        </Typography>
                                        <Typography sx={{ fontSize: 16 }}>{money(row.amount)}</Typography>
                                    </Stack>
                                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
                                        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13, color: appColors.textSecondary }} noWrap>
                                            {row.payment} · {row.time} · Order {row.orderId}
                                        </Typography>
                                        {/* A zero tip prints as a dash, not $0.00 — it
                                            means "not yet adjusted" rather than
                                            "tipped nothing", the same rule the
                                            landscape table follows. */}
                                        <Typography sx={{ fontSize: 13, color: tip ? appColors.greenTee : appColors.textSecondary }}>
                                            {tip ? `Tip ${money(tip)}` : "Tip —"}
                                        </Typography>
                                    </Stack>
                                </ButtonBase>

                                {isOpen && (
                                    <Stack direction="row" sx={{ gap: 1, px: 1.5, pb: 1.25 }}>
                                        {PRESETS.map((pct) => {
                                            const value = +(row.amount * pct).toFixed(2);
                                            return (
                                                <ButtonBase
                                                    key={pct}
                                                    onClick={() => setTips((t) => ({ ...t, [row.paymentId]: value }))}
                                                    sx={{
                                                        flex: 1,
                                                        flexDirection: "column",
                                                        minHeight: 48,
                                                        bgcolor: tip === value ? appColors.green : appColors.slate,
                                                        color: "#fff",
                                                        borderRadius: `${appRadius.button}px`,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {Math.round(pct * 100)}%
                                                    <Typography sx={{ fontSize: 12, opacity: 0.85 }}>{money(value)}</Typography>
                                                </ButtonBase>
                                            );
                                        })}
                                        <ButtonBase
                                            onClick={() => setTips((t) => ({ ...t, [row.paymentId]: 0 }))}
                                            sx={{
                                                flex: 1,
                                                minHeight: 48,
                                                bgcolor: appColors.canvasAlt,
                                                color: appColors.textSecondary,
                                                borderRadius: `${appRadius.button}px`,
                                                fontSize: 14,
                                            }}
                                        >
                                            No tip
                                        </ButtonBase>
                                    </Stack>
                                )}
                            </Box>
                        );
                    })}
                    <Box sx={{ height: 8 }} />
                </>
            )}
        </MobileShell>
    );
};
