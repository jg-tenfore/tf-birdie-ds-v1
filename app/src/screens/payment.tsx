import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ContactlessOutlinedIcon from "@mui/icons-material/ContactlessOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type Ticket } from "../store";

/**
 * Tender.
 *
 * The one flow that has to feel real, because it is what makes the prototype
 * convincing: the amount is the actual cart total, choosing a tender actually
 * closes the ticket, and the approved screen shows the sale that just happened.
 *
 * Card runs a short fake authorisation so the waiting state is visible; cash
 * computes real change from the quick-cash denominations.
 */

type Stage = "select" | "cash" | "card" | "approved";

const TENDERS = [
    { key: "Card", label: "Card", Icon: CreditCardOutlinedIcon },
    { key: "Cash", label: "Cash", Icon: PaymentsOutlinedIcon },
    { key: "Member account", label: "Member account", Icon: AccountBalanceWalletOutlinedIcon },
    { key: "Gift card", label: "Gift card", Icon: CardGiftcardOutlinedIcon },
] as const;

const TenderKey = ({ label, Icon, onClick }: { label: string; Icon: typeof CreditCardOutlinedIcon; onClick: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            height: 120,
            flexDirection: "column",
            gap: 1,
            borderRadius: `${appRadius.button}px`,
            border: "2px solid",
            borderColor: appColors.divider,
            bgcolor: "#fff",
            "&:hover": { borderColor: appColors.green, bgcolor: "#fff" },
        }}
    >
        <Icon sx={{ fontSize: 36 }} />
        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{label}</Typography>
    </ButtonBase>
);

export const PaymentScreen = () => {
    const { ticket, lines, total, state } = useStore();
    const { pay } = useActions();
    const navigate = useNavigate();
    const [stage, setStage] = useState<Stage>("select");
    const [tendered, setTendered] = useState<number | null>(null);

    // A ticket that has already been paid leaves nothing to tender, so fall
    // back to the approved screen rather than rendering an empty total.
    const sale = state.lastSale;
    const isApproved = stage === "approved" || (!ticket && sale);

    useEffect(() => {
        if (stage !== "card") return;
        const t = setTimeout(() => {
            pay("Card");
            setStage("approved");
        }, 1600);
        return () => clearTimeout(t);
    }, [stage, pay]);

    if (!ticket && !sale) {
        return (
            <Shell
                title="Payments"
                active="proshop"
                actionBar={<ActionButton onClick={() => navigate("/proshop")}>Back to register</ActionButton>}
            >
                <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 22 }}>No open ticket</Typography>
                    <Typography sx={{ color: appColors.textSecondary }}>Ring something up first.</Typography>
                </Stack>
            </Shell>
        );
    }

    if (isApproved && sale) return <ApprovedScreen sale={sale} />;

    const amountDue = total;

    return (
        <Shell
            title="Payments"
            active="proshop"
            actionBar={
                <>
                    <ActionButton onClick={() => (stage === "select" ? navigate(-1) : setStage("select"))}>Back</ActionButton>
                    {stage === "cash" && (
                        <ActionButton
                            tone={tendered ? "primary" : "disabled"}
                            grow={2}
                            onClick={() => {
                                if (!tendered) return;
                                pay("Cash");
                                setStage("approved");
                            }}
                        >
                            {tendered ? `Tender ${money(tendered)}` : "Choose an amount"}
                        </ActionButton>
                    )}
                </>
            }
        >
            <Box sx={{ p: 3, maxWidth: 900 }}>
                <Box sx={{ bgcolor: "#fff", border: "1px solid", borderColor: appColors.divider, p: 3, mb: 3 }}>
                    <Typography sx={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: appColors.textSecondary }}>
                        Amount due
                    </Typography>
                    <Typography sx={{ fontSize: 44, fontWeight: 500, lineHeight: 1.1 }}>{money(amountDue)}</Typography>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                        Ticket {ticket?.number} · {lines.length} {lines.length === 1 ? "item" : "items"} ·{" "}
                        {ticket?.customer ?? ticket?.name}
                    </Typography>
                </Box>

                {stage === "select" && (
                    <>
                        <Typography sx={{ fontSize: 20, mb: 1.5 }}>How is this being paid?</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                            {TENDERS.map((t) => (
                                <TenderKey
                                    key={t.key}
                                    label={t.label}
                                    Icon={t.Icon}
                                    onClick={() => {
                                        if (t.key === "Card") return setStage("card");
                                        if (t.key === "Cash") return setStage("cash");
                                        pay(t.key);
                                        setStage("approved");
                                    }}
                                />
                            ))}
                        </Box>
                    </>
                )}

                {stage === "cash" && (
                    <>
                        <Typography sx={{ fontSize: 20, mb: 1.5 }}>Quick cash</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                            {[amountDue, Math.ceil(amountDue / 10) * 10, Math.ceil(amountDue / 20) * 20, Math.ceil(amountDue / 50) * 50]
                                .filter((v, i, a) => a.indexOf(v) === i)
                                .map((amount, i) => (
                                    <ButtonBase
                                        key={amount}
                                        onClick={() => setTendered(amount)}
                                        sx={{
                                            minHeight: 88,
                                            fontSize: 20,
                                            borderRadius: `${appRadius.button}px`,
                                            border: "2px solid",
                                            borderColor: tendered === amount ? appColors.green : appColors.divider,
                                            bgcolor: tendered === amount ? appColors.green : "#fff",
                                            color: tendered === amount ? "#fff" : appColors.textPrimary,
                                        }}
                                    >
                                        {i === 0 ? `Exact ${money(amount)}` : money(amount)}
                                    </ButtonBase>
                                ))}
                        </Box>

                        {tendered !== null && (
                            <Box sx={{ mt: 3, p: 3, bgcolor: "#D9F2E1" }}>
                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 20, color: appColors.greenTee }}>Change due</Typography>
                                    <Typography sx={{ fontSize: 40, fontWeight: 500, color: appColors.greenTee }}>
                                        {money(Math.max(0, tendered - amountDue))}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </>
                )}

                {stage === "card" && (
                    <Stack sx={{ alignItems: "center", gap: 3, py: 6 }}>
                        <ContactlessOutlinedIcon sx={{ fontSize: 96, color: appColors.green }} />
                        <Typography sx={{ fontSize: 28 }}>Tap, insert, or swipe</Typography>
                        <Typography sx={{ fontSize: 22, color: appColors.textSecondary }}>{money(amountDue)}</Typography>
                        <Box sx={{ width: 380 }}>
                            <LinearProgress />
                        </Box>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>Reader SGM-02-R · Connected</Typography>
                    </Stack>
                )}
            </Box>
        </Shell>
    );
};

const ApprovedScreen = ({ sale }: { sale: { ticket: Ticket; total: number; tender: string } }) => {
    const navigate = useNavigate();

    return (
        <Shell
            title="Payments"
            active="proshop"
            actionBar={
                <>
                    <ActionButton onClick={() => navigate("/orderlookup")}>Print receipt</ActionButton>
                    <ActionButton onClick={() => navigate("/orderlookup")}>Email receipt</ActionButton>
                    <ActionButton tone="primary" grow={2} onClick={() => navigate("/proshop")}>
                        New ticket
                    </ActionButton>
                </>
            }
        >
            <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center", gap: 2, textAlign: "center" }}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 112, color: appColors.greenTee }} />
                <Typography sx={{ fontSize: 34 }}>Approved</Typography>
                <Typography sx={{ fontSize: 26 }}>{money(sale.total)}</Typography>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                    {sale.tender} · Ticket {sale.ticket.number} closed · {sale.ticket.lines.length} items
                </Typography>
            </Stack>
        </Shell>
    );
};
