import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ContactlessOutlinedIcon from "@mui/icons-material/ContactlessOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import { money } from "@/data/pos-data";
import { fontFamily, radius, touchTarget } from "@/theme/tokens";

/**
 * Payments — tender selection and capture.
 *
 * This is the highest-stakes screen in the product: it moves money and it is
 * where the guest is watching. Everything here is oversized on purpose. Tender
 * keys are 120px, the amount due is 44px, and quick-cash denominations exist so
 * the common case ("here's three hundred") needs one tap, not six.
 */
const meta = {
    title: "App Screens/Payments",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TOTAL = 324.36;

const tenders = [
    { key: "card", label: "Card", Icon: CreditCardOutlinedIcon },
    { key: "cash", label: "Cash", Icon: PaymentsOutlinedIcon },
    { key: "member", label: "Member account", Icon: AccountBalanceWalletOutlinedIcon },
    { key: "gift", label: "Gift card", Icon: CardGiftcardOutlinedIcon },
];

const TenderKey = ({ label, Icon, isActive }: { label: string; Icon: typeof CreditCardOutlinedIcon; isActive?: boolean }) => (
    <ButtonBase
        sx={{
            height: 120,
            borderRadius: `${radius.lg}px`,
            border: "2px solid",
            borderColor: isActive ? "primary.main" : "divider",
            bgcolor: isActive ? "primary.main" : "background.paper",
            color: isActive ? "primary.contrastText" : "text.primary",
            flexDirection: "column",
            gap: 1,
            transition: "background-color 120ms linear, border-color 120ms linear",
        }}
    >
        <Icon sx={{ fontSize: 36 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {label}
        </Typography>
    </ButtonBase>
);

const AmountDue = ({ amount = TOTAL, label = "Amount due" }: { amount?: number; label?: string }) => (
    <Card sx={{ p: 3 }}>
        <Stack spacing={0.5}>
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
                {label}
            </Typography>
            <Typography variant="h1" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                {money(amount)}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Ticket #4127 · Jordan Ellis · 4 guests
            </Typography>
        </Stack>
    </Card>
);

const PaymentsScreen = ({ children, actionBar }: { children: React.ReactNode; actionBar?: React.ReactNode }) => (
    <PosShell active="payments" actionBar={actionBar}>
        <Box sx={{ p: 3, height: "100%" }}>{children}</Box>
    </PosShell>
);

export const SelectTender: Story = {
    name: "Select tender",
    render: () => (
        <PaymentsScreen
            actionBar={
                <>
                    <Button variant="outlined" size="large">
                        Back to ticket
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button variant="outlined" size="large">
                        Split payment
                    </Button>
                </>
            }
        >
            <Stack spacing={3} sx={{ maxWidth: 900 }}>
                <AmountDue />
                <Stack spacing={1.5}>
                    <Typography variant="h5">How is Jordan paying?</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                        {tenders.map((tender) => (
                            <TenderKey key={tender.key} label={tender.label} Icon={tender.Icon} isActive={tender.key === "card"} />
                        ))}
                    </Box>
                </Stack>
            </Stack>
        </PaymentsScreen>
    ),
};

/**
 * Cash tender. The quick-cash row is the whole point — "$340" and "$350" are
 * pre-computed round-ups, so the operator taps once instead of keying an amount
 * and doing change arithmetic in their head with a queue forming.
 */
export const CashTender: Story = {
    name: "Cash tender",
    render: () => (
        <PaymentsScreen
            actionBar={
                <>
                    <Button variant="outlined" size="large">
                        Back
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button size="large" sx={{ minHeight: touchTarget.critical, minWidth: 300, fontSize: 20 }}>
                        Tender $340.00
                    </Button>
                </>
            }
        >
            <Stack spacing={3} sx={{ maxWidth: 760 }}>
                <AmountDue />

                <Stack spacing={1.5}>
                    <Typography variant="h5">Quick cash</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
                        {["Exact $324.36", "$330", "$340", "$350"].map((amount, i) => (
                            <Button key={amount} variant={i === 2 ? "contained" : "outlined"} sx={{ minHeight: 88, fontSize: 20, fontFamily: fontFamily.mono }}>
                                {amount}
                            </Button>
                        ))}
                    </Box>
                </Stack>

                <Card sx={{ p: 3, bgcolor: "success.light" }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h5" sx={{ color: "success.dark" }}>
                            Change due
                        </Typography>
                        <Typography variant="h1" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums", color: "success.dark" }}>
                            $15.64
                        </Typography>
                    </Stack>
                </Card>
            </Stack>
        </PaymentsScreen>
    ),
};

/** Card capture. One instruction, nothing else competing for attention. */
export const AwaitingCard: Story = {
    name: "Awaiting card",
    render: () => (
        <PaymentsScreen
            actionBar={
                <>
                    <Button variant="outlined" size="large" color="error">
                        Cancel payment
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button variant="outlined" size="large">
                        Enter card manually
                    </Button>
                </>
            }
        >
            <Stack spacing={4} sx={{ alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                <ContactlessOutlinedIcon sx={{ fontSize: 96, color: "primary.main" }} />
                <Stack spacing={1}>
                    <Typography variant="h2">Tap, insert, or swipe</Typography>
                    <Typography variant="h4" sx={{ fontFamily: fontFamily.mono, color: "text.secondary" }}>
                        {money(TOTAL)}
                    </Typography>
                </Stack>
                <Box sx={{ width: 400 }}>
                    <LinearProgress />
                </Box>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Reader SGM-02-R · Connected
                </Typography>
            </Stack>
        </PaymentsScreen>
    ),
};

/**
 * Split by guest. Four-ways is the default because it is a golf POS and the
 * foursome is the unit — the split control is a toggle group, not a stepper.
 */
export const SplitPayment: Story = {
    name: "Split payment",
    render: () => (
        <PaymentsScreen
            actionBar={
                <>
                    <Button variant="outlined" size="large">
                        Back
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button size="large" sx={{ minHeight: touchTarget.large, minWidth: 280, fontSize: 20 }}>
                        Charge guest 1 — $81.09
                    </Button>
                </>
            }
        >
            <Stack spacing={3} sx={{ maxWidth: 820 }}>
                <AmountDue />

                <Stack spacing={1.5}>
                    <Typography variant="h5">Split evenly between</Typography>
                    <ToggleButtonGroup exclusive value={4} sx={{ gap: 1 }}>
                        {[2, 3, 4, 5, 6].map((count) => (
                            <ToggleButton key={count} value={count} sx={{ minWidth: 88, minHeight: 72, fontSize: 22, borderRadius: `${radius.md}px !important`, border: "1px solid !important", borderColor: "divider !important" }}>
                                {count}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Stack>

                <Card>
                    <Stack divider={<Divider />}>
                        {[1, 2, 3, 4].map((guest) => (
                            <Stack key={guest} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", p: 2.5 }}>
                                <Stack spacing={0.25}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Guest {guest}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: guest === 1 ? "warning.main" : "text.secondary", fontWeight: guest === 1 ? 600 : 400 }}>
                                        {guest === 1 ? "Up next" : "Not yet paid"}
                                    </Typography>
                                </Stack>
                                <Typography variant="h5" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                    $81.09
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Card>
            </Stack>
        </PaymentsScreen>
    ),
};

export const Approved: Story = {
    render: () => (
        <PaymentsScreen
            actionBar={
                <>
                    <Button variant="outlined" size="large">
                        Print receipt
                    </Button>
                    <Button variant="outlined" size="large">
                        Email receipt
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button size="large" sx={{ minHeight: touchTarget.large, minWidth: 240, fontSize: 20 }}>
                        New ticket
                    </Button>
                </>
            }
        >
            <Stack spacing={3} sx={{ alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 112, color: "success.main" }} />
                <Stack spacing={1}>
                    <Typography variant="h2">Approved</Typography>
                    <Typography variant="h4" sx={{ fontFamily: fontFamily.mono }}>
                        {money(TOTAL)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        Visa ••4021 · Auth 04Z18B · Ticket #4127 closed
                    </Typography>
                </Stack>
            </Stack>
        </PaymentsScreen>
    ),
};

export const Declined: Story = {
    render: () => (
        <PaymentsScreen
            actionBar={
                <>
                    <Button variant="outlined" size="large">
                        Back to ticket
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button size="large" sx={{ minHeight: touchTarget.large, minWidth: 260, fontSize: 20 }}>
                        Try another tender
                    </Button>
                </>
            }
        >
            <Stack spacing={3} sx={{ alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", maxWidth: 560, mx: "auto" }}>
                <Box sx={{ width: 112, height: 112, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "error.light" }}>
                    <CreditCardOutlinedIcon sx={{ fontSize: 56, color: "error.dark" }} />
                </Box>
                <Stack spacing={1}>
                    <Typography variant="h2">Declined</Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        Visa ••4021 — insufficient funds. Nothing was charged and the ticket is still open.
                    </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Wording matters here: the operator has to say this out loud to a guest, so the screen gives
                    them a neutral sentence rather than a bank error code.
                </Typography>
            </Stack>
        </PaymentsScreen>
    ),
};
