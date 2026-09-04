import { useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BoltIcon from "@mui/icons-material/Bolt";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloudIcon from "@mui/icons-material/Cloud";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import GroupsIcon from "@mui/icons-material/Groups";
import { useNavigate } from "react-router-dom";

import { MobileActionArea, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { TipAuthorising, TipComplete, TipCustom, TipHandoff, TipReceipt, TipSelect } from "@/components/mobile/screens/mobile-tipping";
import { MobileEmpty, MobileSearch, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { isRedeemable, searchRainchecks } from "@/data/rainchecks";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { money, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Payment, on a phone.
 *
 * The terminal puts the ticket and the tender side by side with seven tender
 * tabs across the top. At 402px seven equal tabs are 57px each — narrower than
 * `GIFT CARD` — so the strip **scrolls**, exactly as the Storybook mobile
 * checkout does, and the ticket lives above the tender rather than beside it.
 *
 * Everything else is the terminal's own logic, imported rather than
 * reimplemented: the same `pay()` action, the same fake card authorisation, the
 * same raincheck lookup against `state.rainchecks`. A sale completed here is
 * indistinguishable from one completed on the counter, because it is the same
 * reducer call.
 *
 * ## The one place the phone is stricter
 *
 * Cash keys are **presets, not a keypad**. The terminal has a full amount field
 * because it has a hardware keyboard beside it; here the five Fast Pay values
 * plus "exact" cover what a counter actually takes, and an operator who needs
 * an odd figure taps `Exact` and settles the difference in the drawer. A
 * free-text money field on a phone is a mis-key waiting to happen.
 */

type Tender = "CREDIT" | "CASH" | "GIFT CARD" | "RAIN" | "MEMBER";

const TABS: { key: Tender; Icon: typeof CreditCardIcon }[] = [
    { key: "CREDIT", Icon: CreditCardIcon },
    { key: "CASH", Icon: AttachMoneyIcon },
    { key: "GIFT CARD", Icon: CardGiftcardIcon },
    { key: "RAIN", Icon: CloudIcon },
    { key: "MEMBER", Icon: GroupsIcon },
];

/** Fast Pay, plus the exact figure — five stacked keys, not a row of five. */
const FAST = [5, 10, 20, 50, 100];

export const MobilePaymentScreen = () => {
    const { ticket, lines, total, subtotal, tax, state } = useStore();
    const { pay } = useActions();
    const navigate = useNavigate();

    const [tab, setTab] = useState<Tender>("CASH");
    const [tendered, setTendered] = useState<number | null>(null);
    const [rainQuery, setRainQuery] = useState("");
    const [rainId, setRainId] = useState<string | undefined>();

    /**
     * The card path is a sequence, not a button.
     *
     * From the Sept 4 call: authorise, hand the device to the customer, take a
     * tip, approve, offer a receipt, hand it back. `null` means the card path is
     * not running and the ordinary tender UI is on screen.
     */
    const [tipStep, setTipStep] = useState<null | "authorising" | "handoff" | "tip" | "custom" | "receipt" | "complete">(null);
    const [tip, setTip] = useState<number | null>(null);
    const [tipDigits, setTipDigits] = useState("");
    const [email, setEmail] = useState("");
    const [receipt, setReceipt] = useState<"email" | "none">("none");

    const sale = state.lastSale;
    const rainResults = useMemo(() => searchRainchecks(rainQuery, state.rainchecks), [rainQuery, state.rainchecks]);
    const selectedRaincheck = rainResults.find((r) => r.id === rainId);

    // The processor answers on its own schedule; nothing the operator presses
    // makes it faster, so the authorising screen carries no control.
    useEffect(() => {
        if (tipStep !== "authorising") return;
        const t = setTimeout(() => setTipStep("handoff"), 1400);
        return () => clearTimeout(t);
    }, [tipStep]);

    /* --------------------------------------------------- the card sequence */

    /**
     * The tip flow, live.
     *
     * It runs **between** authorisation and capture: `pay()` is not dispatched
     * until the customer approves, and it carries the tip so the sale settles at
     * total + tip in one go. That is the ordering from the call — ask earlier
     * and a changed tip needs a second authorisation.
     */
    if (ticket && tipStep) {
        if (tipStep === "authorising") return <TipAuthorising total={total} />;

        if (tipStep === "handoff") return <TipHandoff total={total} onContinue={() => setTipStep("tip")} />;

        if (tipStep === "tip")
            return (
                <TipSelect
                    total={total}
                    subtotal={subtotal}
                    selected={tip}
                    onSelect={setTip}
                    onCustom={() => setTipStep("custom")}
                    onApprove={() => {
                        // Capture happens here, at total + tip.
                        pay("Card", undefined, undefined, tip ?? 0);
                        setTipStep("receipt");
                    }}
                />
            );

        if (tipStep === "custom")
            return (
                <TipCustom
                    total={total}
                    value={tipDigits}
                    onKey={(k) => setTipDigits((d) => (k === "del" ? d.slice(0, -1) : (d + k).replace(/^0+/, "").slice(0, 6)))}
                    onApprove={() => {
                        const amount = Number(tipDigits || "0") / 100;
                        setTip(amount);
                        pay("Card", undefined, undefined, amount);
                        setTipStep("receipt");
                    }}
                    onBack={() => setTipStep("tip")}
                />
            );
    }

    // Past capture the ticket is gone, so these read from `lastSale` — the same
    // record the terminal's Order Complete prints from.
    if (sale && tipStep === "receipt")
        return (
            <TipReceipt
                total={sale.total}
                tip={sale.tip}
                email={email}
                onEmail={setEmail}
                onFinish={(choice) => {
                    setReceipt(choice);
                    setTipStep("complete");
                }}
            />
        );

    if (sale && tipStep === "complete") return <TipComplete total={sale.total} tip={sale.tip} receipt={receipt} />;

    /* ---------------------------------------------------------- complete */

    if (!ticket && sale) {
        return (
            <MobileShell title="Order Complete" active="proshop" leading="none" showOverflow={false}>
                <Stack sx={{ alignItems: "center", gap: 0.5, py: 3, bgcolor: appColors.surface }}>
                    <CheckCircleIcon sx={{ fontSize: 44, color: appColors.green }} />
                    <Typography sx={{ fontSize: 20, color: appColors.green }}>Paid in full</Typography>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                        {sale.tender} · {money(sale.total)}
                    </Typography>
                    {/* `change` is already computed by the reducer — the terminal
                        prints it from the same field, so the two receipts agree. */}
                    {sale.change > 0 && (
                        <Typography sx={{ fontSize: 15, color: appColors.green }}>Change due {money(sale.change)}</Typography>
                    )}
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, mt: 0.5 }}>Order {sale.orderNumber}</Typography>
                </Stack>

                <MobileSectionHeading>What it paid for</MobileSectionHeading>
                {sale.ticket.lines.map((l) => (
                    <Stack
                        key={`${l.id}-${l.seat ?? "x"}`}
                        direction="row"
                        sx={{ px: 1.5, py: 1, gap: 1, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}
                    >
                        <Typography sx={{ fontSize: 15, flex: 1 }}>
                            {l.qty > 1 ? `${l.qty} × ` : ""}
                            {l.name}
                        </Typography>
                        <Typography sx={{ fontSize: 15 }}>{money(l.qty * l.unitPrice)}</Typography>
                    </Stack>
                ))}

                <Box sx={{ p: 1.5 }}>
                    <MobilePrimary onClick={() => navigate("/proshop")}>Back to register</MobilePrimary>
                </Box>
            </MobileShell>
        );
    }

    if (!ticket) {
        return (
            <MobileShell title="Payments" active="proshop">
                <MobileEmpty message="No open ticket. Ring something up first." />
                <Box sx={{ p: 1.5 }}>
                    <MobilePrimary onClick={() => navigate("/proshop")}>Back to register</MobilePrimary>
                </Box>
            </MobileShell>
        );
    }

    /* ------------------------------------------------------------ tender */

    const onRain = tab === "RAIN";
    const canCommit = onRain ? Boolean(selectedRaincheck) : tab !== "CASH" || tendered !== null;

    const commit = () => {
        if (onRain) {
            if (!selectedRaincheck) return;
            pay("Rain Check", 0, selectedRaincheck.id);
            return;
        }
        if (tab === "CREDIT") return setTipStep("authorising");
        pay(
            tab === "CASH" ? "Cash" : tab === "GIFT CARD" ? "Gift card" : "Member account",
            tab === "CASH" ? Math.max(tendered ?? total, total) : undefined,
        );
    };

    return (
        <MobileShell
            title="Payment"
            subtitle={`Ticket ${ticket.number} · ${ticket.customer ?? ticket.name ?? "No customer"}`}
            active="proshop"
            leading="close"
            onLeading={() => navigate("/proshop")}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary onClick={() => navigate("/customersearch")}>Customer</MobileSecondary>
                        <MobileSecondary onClick={() => navigate("/proshop")}>Add items</MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary
                        disabled={!canCommit}
                        icon={onRain ? <BoltIcon sx={{ fontSize: 20 }} /> : <CheckIcon sx={{ fontSize: 20 }} />}
                        onClick={commit}
                    >
                        {onRain
                            ? selectedRaincheck
                                ? `Apply ${money(selectedRaincheck.balance)}`
                                : "Pick a raincheck"
                            : tab === "CASH" && tendered === null
                              ? "Choose an amount"
                              : /* Card does not commit here — it starts the
                                   authorise → tip → approve sequence, and the
                                   label says so rather than promising a charge
                                   that has not been asked for yet. */
                                tab === "CREDIT"
                                ? "Take card payment"
                                : `Take ${money(total)}`}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            {/* Owed leads. On the terminal the totals sit in the left pane and
                are always on screen; here they have to be the first thing. */}
            <Stack sx={{ px: 1.5, py: 1.5, bgcolor: appColors.green, color: "#fff" }}>
                <Typography sx={{ fontSize: 13, opacity: 0.9 }}>Total owed</Typography>
                <Typography sx={{ fontSize: 32 }}>{money(total)}</Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.9 }}>
                    {lines.length} {lines.length === 1 ? "line" : "lines"} · {money(subtotal)} + {money(tax)} tax
                </Typography>
            </Stack>

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
                    const isActive = key === tab;
                    return (
                        <ButtonBase
                            key={key}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setTab(key)}
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

            {tab === "CASH" && (
                <>
                    <MobileSectionHeading>Amount tendered</MobileSectionHeading>
                    <Stack sx={{ px: 1.5, gap: 1, pb: 2 }}>
                        <ButtonBase
                            onClick={() => setTendered(total)}
                            sx={{
                                minHeight: 52,
                                bgcolor: tendered === total ? appColors.green : appColors.slate,
                                color: "#fff",
                                borderRadius: `${appRadius.button}px`,
                                fontSize: 16,
                            }}
                        >
                            Exact · {money(total)}
                        </ButtonBase>
                        {FAST.filter((f) => f >= total).map((f) => (
                            <ButtonBase
                                key={f}
                                onClick={() => setTendered(f)}
                                sx={{
                                    minHeight: 48,
                                    bgcolor: tendered === f ? appColors.green : appColors.slate,
                                    color: "#fff",
                                    borderRadius: `${appRadius.button}px`,
                                    fontSize: 15,
                                }}
                            >
                                {money(f)}
                            </ButtonBase>
                        ))}
                        {tendered !== null && tendered > total && (
                            <Typography sx={{ fontSize: 15, color: appColors.green, textAlign: "center", pt: 0.5 }}>
                                Change due {money(tendered - total)}
                            </Typography>
                        )}
                    </Stack>
                </>
            )}

            {tab === "CREDIT" && (
                <Stack sx={{ alignItems: "center", gap: 1, py: 5, px: 3 }}>
                    <CreditCardIcon sx={{ fontSize: 40, color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 16, textAlign: "center" }}>Present the card to the reader.</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, textAlign: "center" }}>
                        Tapping below runs a test authorisation.
                    </Typography>
                </Stack>
            )}

            {onRain && (
                <>
                    <MobileSearch placeholder="Raincheck id, customer name, or email" value={rainQuery} onChange={setRainQuery} />
                    {rainQuery.trim().length < 2 ? (
                        <Typography sx={{ px: 1.5, py: 2, fontSize: 14, color: appColors.textSecondary }}>
                            Search by name or by the id printed on the slip.
                        </Typography>
                    ) : rainResults.length === 0 ? (
                        <Typography sx={{ px: 1.5, py: 2, fontSize: 15 }}>Nothing spendable matches &ldquo;{rainQuery}&rdquo;.</Typography>
                    ) : (
                        rainResults.map((r) => {
                            const picked = r.id === rainId;
                            return (
                                <ButtonBase
                                    key={r.id}
                                    onClick={() => setRainId(r.id)}
                                    disabled={!isRedeemable(r)}
                                    sx={{
                                        display: "block",
                                        width: "100%",
                                        textAlign: "left",
                                        px: 1.5,
                                        py: 1.25,
                                        bgcolor: picked ? "#EAF3EC" : appColors.surface,
                                        borderLeft: "4px solid",
                                        borderLeftColor: picked ? appColors.greenTee : "transparent",
                                        borderBottom: `1px solid ${appColors.divider}`,
                                    }}
                                >
                                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
                                        <Typography sx={{ fontSize: 20, color: appColors.greenTee }}>{money(r.balance)}</Typography>
                                        <Box sx={{ flex: 1 }} />
                                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>#{r.id}</Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                        {r.customerName} · issued {r.issued}
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: r.balance >= total ? appColors.greenTee : appColors.orange }}>
                                        {r.balance >= total
                                            ? "Covers this ticket in full"
                                            : `${money(total - r.balance)} would still be owed`}
                                    </Typography>
                                </ButtonBase>
                            );
                        })
                    )}
                </>
            )}

            {(tab === "GIFT CARD" || tab === "MEMBER") && (
                <Stack sx={{ alignItems: "center", gap: 1, py: 5, px: 3 }}>
                    <Typography sx={{ fontSize: 16, textAlign: "center" }}>
                        {tab === "GIFT CARD" ? "Scan or key the gift card." : "Charge to the member account on the ticket."}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, textAlign: "center" }}>
                        Settles the ticket in full in this prototype.
                    </Typography>
                </Stack>
            )}
        </MobileShell>
    );
};
