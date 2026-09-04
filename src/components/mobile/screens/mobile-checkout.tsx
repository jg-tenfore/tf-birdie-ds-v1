import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CheckIcon from "@mui/icons-material/Check";
import CloudIcon from "@mui/icons-material/Cloud";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import NoteIcon from "@mui/icons-material/Note";

import { checkoutCustomer, checkoutLines, checkoutTotals } from "@/components/screens/checkout/checkout-fixtures";
import type { TenderTab } from "@/components/screens/checkout/checkout-panes";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { MobileRow, MobileTotals } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobilePrimary, MobileScreen, MobileSecondary, MobileSecondaryRow } from "../mobile-shell";

/**
 * **Mobile Screens — checkoutScreens.** From `references/090426/`, laid out
 * against `App Screens → checkoutScreens`.
 *
 * ## The hardest narrowing in the app
 *
 * Checkout is two panes that both need to be visible: the **ticket** on the
 * left (what is owed, and what it is made of) and the **tender** on the right
 * (how it is being paid). Seven tender tabs run across the top of the second
 * pane, and a six-button action bar runs under both.
 *
 * At 402px none of that survives intact, and the references resolve it by
 * splitting the two panes into **two screens**:
 *
 * 1. **The ticket.** Lines, the customer, the totals stack, the green
 *    `Total Owed` band. This is the screen you land on.
 * 2. **The tender.** The seven tabs, the amount, the fast-pay keys, PAY.
 *
 * Both are reached with `X` back to the sale, which is why the app bar uses
 * `close` rather than `back` — you are abandoning a payment, not stepping back
 * through a hierarchy.
 *
 * ## Seven tabs in 402px
 *
 * They **scroll horizontally** rather than shrink. Seven equal tabs would give
 * each 57px, which fits neither `GIFT CARD` nor `MEMBER`. The references show
 * four visible with the fifth cut off at the edge, which is the honest
 * affordance: a partially visible tab is what tells you the row scrolls.
 *
 * The order is unchanged from the tablet strip — CREDIT, CASH, GIFT CARD, RAIN,
 * CHECK, MEMBER, ROOM — so an operator who learned it on the counter terminal
 * finds it in the same sequence here.
 *
 * ## The six-button action bar
 *
 * `BACK / MOVE TO TAB / PRINT SEPARATE SEATS / PRINT COMBINED SEATS / PRINT
 * COMBINED CHECK / APPLY PAYMENT` becomes two secondaries and one primary. The
 * three print variants collapse into the overflow — they are end-of-sale
 * housekeeping, and none of them is the thing the operator is here to do.
 */

const TABS: { key: TenderTab; Icon: typeof CreditCardIcon }[] = [
    { key: "CREDIT", Icon: CreditCardIcon },
    { key: "CASH", Icon: AttachMoneyIcon },
    { key: "GIFT CARD", Icon: CardGiftcardIcon },
    { key: "RAIN", Icon: CloudIcon },
    { key: "CHECK", Icon: NoteIcon },
    { key: "MEMBER", Icon: GroupsIcon },
    { key: "ROOM", Icon: HotelIcon },
];

const FAST_PAY = [0, 5, 10, 20, 100];

/**
 * The tender strip, scrolling.
 *
 * Icons over ALL-CAPS labels, active underlined — the tablet's own treatment at
 * a width that cannot show all seven. Inactive tabs stay washed out rather than
 * hidden, exactly as the landscape strip does, so every tender the course
 * accepts is still discoverable.
 */
const TenderStrip = ({ active, onChange }: { active: TenderTab; onChange?: (t: TenderTab) => void }) => (
    <Stack
        direction="row"
        role="tablist"
        sx={{
            bgcolor: appColors.surface,
            overflowX: "auto",
            flexShrink: 0,
            borderBottom: `1px solid ${appColors.divider}`,
            "&::-webkit-scrollbar": { display: "none" },
        }}
    >
        {TABS.map(({ key, Icon }) => {
            const isActive = key === active;
            return (
                <ButtonBase
                    key={key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onChange?.(key)}
                    sx={{
                        flex: "0 0 96px",
                        flexDirection: "column",
                        gap: 0.25,
                        pt: 1.25,
                        pb: 0.75,
                        color: isActive ? appColors.textPrimary : "#BFC4C9",
                        borderBottom: "3px solid",
                        borderColor: isActive ? appColors.textPrimary : "transparent",
                    }}
                >
                    <Icon sx={{ fontSize: 26 }} />
                    <Typography sx={{ fontSize: 11, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{key}</Typography>
                </ButtonBase>
            );
        })}
    </Stack>
);

/* ----------------------------------------------------------------- ticket */

/**
 * **The ticket.** What the landscape left pane becomes, at full width.
 *
 * Every line, the customer, the totals stack and the green band — unchanged in
 * substance and in order. It is the screen the operator lands on, because *what
 * is owed* is the question that comes before *how it is paid*.
 */
export const MobileCheckoutTicket = () => (
    <MobileScreen
        appBar={<MobileAppBar title="Credit Card Payment" subtitle="Table 2 | Order ID 3846547" leading="close" showOverflow />}
        actions={
            <MobileActionArea>
                <MobilePrimary>Choose a tender</MobilePrimary>
            </MobileActionArea>
        }
    >
        {checkoutLines.map((l) => (
            <MobileRow key={l.id} title={l.name} subtitle={l.note} price={l.unitPrice * l.qty} image={l.image ?? ""} />
        ))}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" sx={{ px: 1.5, py: 1, gap: 1, bgcolor: appColors.surface, borderTop: `1px solid ${appColors.divider}` }}>
            <Typography sx={{ fontSize: 15, flex: 1 }}>{checkoutCustomer}</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>50</Typography>
        </Stack>
        <MobileTotals
            rows={[
                { label: "SubTotal", value: checkoutTotals.subtotal },
                { label: "Taxes", value: checkoutTotals.tax },
                { label: "Grand Total", value: checkoutTotals.total },
                { label: "Total Payments", value: 0, green: true },
            ]}
            owed={checkoutTotals.total}
        />
    </MobileScreen>
);

/* ----------------------------------------------------------------- tender */

export const MobileCheckoutTender = ({ tab: tab0 = "CREDIT" }: { tab?: TenderTab }) => {
    const [tab, setTab] = useState<TenderTab>(tab0);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Credit Card Payment" subtitle="Table 2 | Order ID 3846547" leading="close" showOverflow />}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary tone="muted" disabled>
                            Pay with card
                        </MobileSecondary>
                        <MobileSecondary tone="muted" disabled>
                            Manual payment
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Pay</MobilePrimary>
                </MobileActionArea>
            }
        >
            <TenderStrip active={tab} onChange={setTab} />

            <Typography sx={{ textAlign: "center", fontSize: 20, pt: 2, pb: 1.5 }}>Charge amount</Typography>
            <Box
                sx={{
                    mx: 1.5,
                    bgcolor: appColors.surface,
                    border: `1px solid ${appColors.divider}`,
                    borderRadius: `${appRadius.button}px`,
                    py: 1.5,
                }}
            >
                <Typography sx={{ textAlign: "center", fontSize: 16, color: appColors.textSecondary }}>
                    {tab === "CASH" ? "$0.00" : "Label"}
                </Typography>
            </Box>

            {tab === "CREDIT" && (
                <Typography sx={{ textAlign: "center", fontSize: 14, color: appColors.orange, pt: 1.5 }}>No reader connected</Typography>
            )}

            {/* Fast Pay is five equal buttons in a row on tablet. Five at 402px
                is 74px each, so they stack — which also puts the commonest
                amount nearest the thumb. */}
            {tab === "CASH" && (
                <>
                    <Typography sx={{ px: 1.5, pt: 2, pb: 0.5, fontSize: 15 }}>Charge amount</Typography>
                    <Stack sx={{ px: 1.5, gap: 1, pb: 2 }}>
                        {FAST_PAY.map((amount) => (
                            <ButtonBase
                                key={amount}
                                sx={{
                                    minHeight: 48,
                                    bgcolor: appColors.slate,
                                    color: "#fff",
                                    borderRadius: `${appRadius.button}px`,
                                    fontSize: 15,
                                }}
                            >
                                ${amount.toFixed(2)}
                            </ButtonBase>
                        ))}
                    </Stack>
                </>
            )}

            {tab === "RAIN" && (
                <Box sx={{ px: 1.5, pt: 2 }}>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                        Raincheck lookup — see <strong>Flows → Rainchecks → Aug 31</strong> for the redesigned tender. This screen is the
                        shipping behaviour at phone width.
                    </Typography>
                </Box>
            )}
        </MobileScreen>
    );
};

/* --------------------------------------------------------- order complete */

/**
 * **Order Complete.**
 *
 * The tablet renders a full receipt preview on the left and the three delivery
 * actions on the right. The preview is a document — it does not narrow, it just
 * gets unreadable — so on the phone the receipt collapses to its totals and the
 * three actions become the screen. Emailing, printing or handing over a receipt
 * is the only thing left to do here.
 */
export const MobileOrderComplete = () => (
    <MobileScreen appBar={<MobileAppBar title="Order Complete" leading="close" showOverflow={false} />}>
        <Stack sx={{ alignItems: "center", gap: 0.5, py: 3, bgcolor: appColors.surface }}>
            <CheckIcon sx={{ fontSize: 40, color: appColors.green }} />
            <Typography sx={{ fontSize: 20, color: appColors.green }}>Order Complete</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.green }}>Cash Tendered $30.00</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.green }}>Change Due $1.15</Typography>
        </Stack>

        <Box sx={{ m: 1.5, bgcolor: appColors.canvasAlt, px: 1.5, py: 1.25 }}>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Enter Customer Email</Typography>
        </Box>

        <Stack sx={{ px: 1.5, gap: 1 }}>
            {["Email Receipt", "Print Receipt", "Print Seats"].map((label) => (
                <ButtonBase
                    key={label}
                    sx={{
                        minHeight: 52,
                        bgcolor: appColors.slate,
                        color: "#fff",
                        borderRadius: `${appRadius.button}px`,
                        fontSize: 15,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </ButtonBase>
            ))}
        </Stack>
    </MobileScreen>
);
