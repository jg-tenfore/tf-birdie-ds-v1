import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloudIcon from "@mui/icons-material/Cloud";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import NoteIcon from "@mui/icons-material/Note";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type Ticket } from "../store";

/**
 * Checkout, from `references/072926/checkoutScreens/`.
 *
 * Two panes. The left is the ticket — its lines, then the customer, then the
 * totals stack ending in a green TOTAL OWED band. The right is the tender
 * surface: seven icon tabs, only one of which is ever active, over a body that
 * changes completely per tender.
 *
 * A few things in here look like mistakes because they are — they are in the
 * shipping app and this is a replica of it:
 *
 *   - the button reads NAY WITH CARD, not PAY WITH CARD;
 *   - MEMBER and ROOM both head their amount field "Raincheck Amount", because
 *     the heading is not swapped when the tab changes;
 *   - MEMBER's third result column reads "Csutomer Balance".
 *
 * They are left alone deliberately. Quietly fixing them would make the replica
 * disagree with the device it is supposed to represent, and these are exactly
 * the kind of thing a redesign is meant to surface.
 */

type TenderTab = "CREDIT" | "CASH" | "GIFT CARD" | "RAIN" | "CHECK" | "MEMBER" | "ROOM";

const TABS: { key: TenderTab; Icon: typeof CreditCardIcon }[] = [
    { key: "CREDIT", Icon: CreditCardIcon },
    { key: "CASH", Icon: AttachMoneyIcon },
    { key: "GIFT CARD", Icon: CardGiftcardIcon },
    { key: "RAIN", Icon: CloudIcon },
    { key: "CHECK", Icon: NoteIcon },
    { key: "MEMBER", Icon: GroupsIcon },
    { key: "ROOM", Icon: HotelIcon },
];

/** Fixed quick-cash keys — not derived from the total, as the device is. */
const QUICK_CASH = [0, 5, 10, 20, 100];

const PANE_BG = "#F4F6F8";

const TabStrip = ({ active, onChange }: { active: TenderTab; onChange: (t: TenderTab) => void }) => (
    <Stack direction="row" sx={{ bgcolor: "#fff" }}>
        {TABS.map(({ key, Icon }) => {
            const isActive = key === active;
            return (
                <ButtonBase
                    key={key}
                    onClick={() => onChange(key)}
                    sx={{
                        flex: 1,
                        flexDirection: "column",
                        gap: 0.5,
                        pt: 1.75,
                        pb: 1.25,
                        // Inactive tabs are washed out rather than hidden — every
                        // tender stays visible so staff can see what is on offer.
                        color: isActive ? appColors.textPrimary : "#BFC4C9",
                        borderBottom: "3px solid",
                        borderColor: isActive ? appColors.textPrimary : "transparent",
                    }}
                >
                    <Icon sx={{ fontSize: 34 }} />
                    <Typography sx={{ fontSize: 13, letterSpacing: "0.06em" }}>{key}</Typography>
                </ButtonBase>
            );
        })}
    </Stack>
);

const AmountField = ({ heading, value, onChange }: { heading: string; value: string; onChange?: (v: string) => void }) => (
    <>
        <Typography sx={{ fontSize: 24, textAlign: "center", mt: 4, mb: 2 }}>{heading}</Typography>
        <InputBase
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={!onChange}
            sx={{
                display: "block",
                width: 344,
                mx: "auto",
                bgcolor: "#fff",
                border: "1px solid",
                borderColor: appColors.divider,
                "& input": { textAlign: "center", fontSize: 17, py: 1.75 },
            }}
        />
    </>
);

/** The grey lookup field the account-style tenders share. */
const LookupField = ({ label }: { label: string }) => (
    <Box sx={{ mx: 3, mt: 3, bgcolor: "#E4E6E8", px: 2, pt: 1.25, pb: 1, borderBottom: `1px solid ${appColors.textSecondary}` }}>
        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
        <Typography sx={{ fontSize: 16 }}>---</Typography>
    </Box>
);

/** The green result band. Columns differ per tender; the values never do here. */
const ResultBand = ({ columns }: { columns: string[] }) => (
    <Stack direction="row" sx={{ mx: 3, mt: 2, bgcolor: appColors.greenTee, color: "#fff", px: 2, py: 2.5 }}>
        {columns.map((c) => (
            <Stack key={c} sx={{ flex: 1, gap: 1 }}>
                <Typography sx={{ fontSize: 16 }}>{c}</Typography>
                <Typography sx={{ fontSize: 16 }}>---</Typography>
            </Stack>
        ))}
    </Stack>
);

/** The two greyed buttons pinned above the action bar on the keyed tenders. */
const CardButtons = () => (
    <Stack direction="row" spacing={1} sx={{ mt: "auto", px: 1.5, pb: 1.5 }}>
        {/* "NAY" is the shipping app's typo — see the note at the top of the file. */}
        {["NAY WITH CARD", "MANUAL PAYMENT"].map((label) => (
            <Box
                key={label}
                sx={{
                    flex: 1,
                    bgcolor: "#DCDEE0",
                    color: "#8A9096",
                    textAlign: "center",
                    py: 2.5,
                    fontSize: 15,
                    letterSpacing: "0.06em",
                }}
            >
                {label}
            </Box>
        ))}
    </Stack>
);

const TenderBody = ({ tab, amount, onAmount }: { tab: TenderTab; amount: string; onAmount: (v: string) => void }) => {
    switch (tab) {
        case "CREDIT":
            return (
                <>
                    <AmountField heading="Charge amount" value={amount} onChange={onAmount} />
                    <CardButtons />
                </>
            );
        case "CASH":
            return (
                <>
                    <AmountField heading="Cash Amount" value={amount} onChange={onAmount} />
                    <Typography sx={{ fontSize: 20, px: 3, mt: 3, mb: 1.5 }}>Charge amount</Typography>
                    <Stack direction="row" spacing={1} sx={{ px: 3 }}>
                        {QUICK_CASH.map((v) => (
                            <ButtonBase
                                key={v}
                                onClick={() => onAmount(money(v))}
                                sx={{ flex: 1, bgcolor: appColors.slate, color: "#fff", py: 2.5, fontSize: 16 }}
                            >
                                {money(v)}
                            </ButtonBase>
                        ))}
                    </Stack>
                    <CardButtons />
                </>
            );
        case "GIFT CARD":
            return (
                <>
                    <AmountField heading="Gift Card Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Enter UPC code or customer name" />
                    <ResultBand columns={["Customer Name", "UPC", "Balance"]} />
                </>
            );
        case "RAIN":
            return (
                <>
                    <AmountField heading="Raincheck Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Enter Raincheck id, customer name, or email" />
                    <ResultBand columns={["Customer Name", "UPC", "Balance"]} />
                </>
            );
        case "CHECK":
            return (
                <>
                    <AmountField heading="Cash Amount" value={amount} onChange={onAmount} />
                    <AmountField heading="Check Number" value={money(0)} />
                    <CardButtons />
                </>
            );
        case "MEMBER":
            return (
                <>
                    {/* Heading is not swapped for this tab on the device. */}
                    <AmountField heading="Raincheck Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Search by customer name, email, or phone...." />
                    <ResultBand columns={["Customer Name", "Customer ID", "Csutomer Balance"]} />
                </>
            );
        case "ROOM":
            return (
                <>
                    <AmountField heading="Raincheck Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Search by room" />
                    <ButtonBase
                        sx={{
                            mx: 3,
                            mt: 2,
                            bgcolor: appColors.slate,
                            color: "#fff",
                            py: 2.5,
                            gap: 1,
                            fontSize: 16,
                            letterSpacing: "0.06em",
                            boxShadow: 2,
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 22 }} />
                        LOOK UP ROOM
                    </ButtonBase>
                    <ResultBand columns={["Customer Name", "UPC", "Balance"]} />
                </>
            );
    }
};

const TotalRow = ({ label, value, green }: { label: string; value: string; green?: boolean }) => (
    <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.6 }}>
        <Typography sx={{ fontSize: 20, color: green ? appColors.greenTee : appColors.textPrimary }}>{label}</Typography>
        <Typography sx={{ fontSize: 20, color: green ? appColors.greenTee : appColors.textPrimary }}>{value}</Typography>
    </Stack>
);

export const PaymentScreen = () => {
    const { ticket, lines, total, subtotal, tax, state } = useStore();
    const { pay } = useActions();
    const navigate = useNavigate();

    const [tab, setTab] = useState<TenderTab>("CASH");
    const [amount, setAmount] = useState(money(0));
    const [authorising, setAuthorising] = useState(false);

    const sale = state.lastSale;

    // Card runs a short fake authorisation so the waiting state is visible.
    useEffect(() => {
        if (!authorising) return;
        const t = setTimeout(() => {
            pay("Card");
            setAuthorising(false);
        }, 1200);
        return () => clearTimeout(t);
    }, [authorising, pay]);

    if (!ticket && sale) return <ApprovedScreen sale={sale} />;

    if (!ticket) {
        return (
            <Shell title="Payments" active="proshop" actionBar={<ActionButton onClick={() => navigate("/proshop")}>Back to register</ActionButton>}>
                <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 22 }}>No open ticket</Typography>
                    <Typography sx={{ color: appColors.textSecondary }}>Ring something up first.</Typography>
                </Stack>
            </Shell>
        );
    }

    const tender = () => {
        if (tab === "CREDIT") return setAuthorising(true);
        pay(tab === "CASH" ? "Cash" : tab === "GIFT CARD" ? "Gift card" : "Member account");
    };

    return (
        <Shell
            title="Credit Card Payment"
            active="proshop"
            accountLabel="Join Admin"
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton>West Course</ActionButton>
                    <ActionButton icon={<CreditCardIcon />}>Grid</ActionButton>
                    <ActionButton icon={<StarIcon />}>List</ActionButton>
                    <ActionButton icon={<StarIcon />}>Multi</ActionButton>
                    <ActionButton icon={<RefreshIcon />} grow={0.4}>
                        {""}
                    </ActionButton>
                    <ActionButton icon={<CheckIcon />} tone="primary" grow={1.6} onClick={tender}>
                        {authorising ? "Authorising…" : "Pay"}
                    </ActionButton>
                </>
            }
        >
            <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
                {/* Ticket pane. Wider than the register's order rail. */}
                <Stack sx={{ width: "42%", minWidth: 0, bgcolor: "#fff", borderRight: `1px solid ${appColors.divider}` }}>
                    <Stack sx={{ flex: 1, overflowY: "auto" }} divider={<Divider />}>
                        {lines.map((l) => (
                            <Stack key={`${l.id}-${l.seat ?? "x"}`} direction="row" spacing={2} sx={{ px: 2, py: 1.75, alignItems: "center" }}>
                                <Box
                                    component="img"
                                    src={l.image ?? assetUrl("logos/tf-square-black.svg")}
                                    alt=""
                                    sx={{ width: 62, height: 62, objectFit: "contain", flexShrink: 0 }}
                                />
                                <Stack sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 19, fontWeight: 500 }} noWrap>
                                        {l.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }} noWrap>
                                        {l.note ?? `Qty ${l.qty} · ${money(l.unitPrice)} each`}
                                    </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{money(l.qty * l.unitPrice)}</Typography>
                            </Stack>
                        ))}
                    </Stack>

                    {/* A heavy rule, not a hairline — it separates ticket from money. */}
                    <Box sx={{ borderTop: `2px solid ${appColors.textPrimary}`, px: 2, pt: 2 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: 22 }}>{ticket.customer ?? ticket.name}</Typography>
                            <Typography sx={{ fontSize: 22 }}>{lines.reduce((n, l) => n + l.qty, 0)}</Typography>
                        </Stack>
                        <TotalRow label="Tax" value={money(tax)} />
                        <TotalRow label="Subtotal" value={money(subtotal)} />
                        <TotalRow label="Grand Total" value={money(total)} />
                        <TotalRow label="Total Payments" value={money(0)} green />
                    </Box>
                    <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between", bgcolor: appColors.greenTee, color: "#fff", px: 2, py: 2, mt: 1.5 }}
                    >
                        <Typography sx={{ fontSize: 22 }}>Total Owed</Typography>
                        <Typography sx={{ fontSize: 22 }}>{money(total)}</Typography>
                    </Stack>
                </Stack>

                {/* Tender pane. */}
                <Stack sx={{ flex: 1, minWidth: 0, bgcolor: PANE_BG }}>
                    <TabStrip active={tab} onChange={setTab} />
                    <Stack sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        <TenderBody tab={tab} amount={amount} onAmount={setAmount} />
                    </Stack>
                </Stack>
            </Stack>
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
