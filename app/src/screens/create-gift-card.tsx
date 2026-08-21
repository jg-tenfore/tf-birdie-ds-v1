import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { CustomerLookupResults } from "@/components/screens/operations/customer-lookup";
import { searchCustomers, type Customer } from "@/data/crm";
import { appColors } from "@/theme/app-replica-tokens";
import { LiveOrderPanel, Shell } from "../pos-shell";
import { useActions, useStore } from "../store";

/**
 * Create a Gift Card, from `references/072926/createGiftCard/`.
 *
 * Reached by tapping the **Gift Card** tile in the Pro Shop, and it is the clearest
 * example of the convention that tile carries: a category tile is a destination,
 * not necessarily a list. A gift card has no price until somebody types one and no
 * meaning until it has a sender and a recipient, so it gets configured before it
 * can join the order at all.
 *
 * Two parties, four lookups each. FROM is who paid; TO is whose card it becomes,
 * and only TO gets a Golf Course Customer ID once matched — the purchaser stays
 * anonymous unless they happen to be a member too.
 *
 * The four spend categories start **all checked**, which means the default gift
 * card is good for anything including alcohol. Worth a decision rather than a
 * default.
 */

/** Spend restrictions. All on by default, as the device has them. */
const SPEND = ["Merchandise", "Food and Beverage", "Tee Fees", "Alcohol"] as const;

const GIFT_CARD_TYPES = ["Purchased Gift Card", "Winnings", "Promotional", "Replacement"] as const;

/** A party's four fields, each of which searches the customer database. */
const PartyFields = ({
    party,
    onPick,
    onChange,
    customers,
}: {
    party: { first: string; last: string; email: string; phone: string };
    onPick: (c: Customer) => void;
    onChange: (next: Partial<{ first: string; last: string; email: string; phone: string }>) => void;
    customers: Customer[];
}) => {
    const [focused, setFocused] = useState<string | null>(null);
    const query = focused ? (party[focused as keyof typeof party] ?? "") : "";
    const hits = useMemo(() => searchCustomers(query, 5, customers), [query, customers]);

    const field = (key: keyof typeof party, label: string) => (
        <Box sx={{ position: "relative" }}>
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    gap: 1.5,
                    bgcolor: appColors.fieldFill,
                    borderBottom: `1px solid ${appColors.textSecondary}`,
                    px: 2,
                    minHeight: 76,
                }}
            >
                <SearchIcon sx={{ color: appColors.textSecondary }} />
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    {party[key] && <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>}
                    <InputBase
                        value={party[key]}
                        onFocus={() => setFocused(key)}
                        onBlur={() => window.setTimeout(() => setFocused(null), 150)}
                        onChange={(e) => onChange({ [key]: e.target.value })}
                        placeholder={party[key] ? undefined : label}
                        sx={{
                            "& input": {
                                fontSize: 21,
                                p: 0,
                                "&::placeholder": { color: appColors.textSecondary, opacity: 1 },
                            },
                        }}
                    />
                </Stack>
            </Stack>

            {focused === key && query.trim().length >= 2 && hits.length > 0 && (
                <Box sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30 }}>
                    <CustomerLookupResults results={hits} onPick={onPick} />
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 2, rowGap: 1.5 }}>
            {field("first", "First Name")}
            {field("last", "Last Name")}
            {field("email", "Email")}
            {field("phone", "Phone")}
        </Box>
    );
};

const emptyParty = { first: "", last: "", email: "", phone: "" };

export const CreateGiftCardScreen = () => {
    const navigate = useNavigate();
    const { state } = useStore();
    const { addItem } = useActions();

    const [amount, setAmount] = useState("");
    const [upc, setUpc] = useState("");
    const [type, setType] = useState<string>(GIFT_CARD_TYPES[0]);
    const [typeOpen, setTypeOpen] = useState(false);
    const [from, setFrom] = useState(emptyParty);
    const [to, setTo] = useState(emptyParty);
    const [toId, setToId] = useState<string | null>(null);
    const [fromId, setFromId] = useState<string | null>(null);
    const [spend, setSpend] = useState<string[]>([...SPEND]);
    const [confirmUpc, setConfirmUpc] = useState(false);

    const value = Number(amount) || 0;

    const commit = () => {
        addItem({ id: `giftcard-${Date.now().toString(36)}`, name: "Gift Card", price: value, taxable: false }, "Pro Shop");
        navigate("/proshop");
    };

    const save = () => {
        if (value <= 0) return;
        // No UPC means the server mints one, and the device says so before it
        // commits rather than after.
        if (!upc.trim()) return setConfirmUpc(true);
        commit();
    };

    const partyHeader = (label: string, id: string | null, name: string) => (
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5, mt: 3, mb: 1.5 }}>
            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{label}</Typography>
            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{name || "--------"}</Typography>
            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>Golf Course Customer ID</Typography>
            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{id ?? 0}</Typography>
        </Stack>
    );

    return (
        <Shell
            title="Create a Gift Card"
            active="giftcards"
            orderPanel={<LiveOrderPanel />}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate("/proshop")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<CheckIcon />} tone={value > 0 ? "primary" : "disabled"} grow={2} onClick={save}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%", p: 2 }}>
                <Stack direction="row" spacing={2}>
                    {/* The amount is the only required field and gets the loudest
                        treatment: a white box with an orange focus ring. */}
                    <Box sx={{ flex: 1 }}>
                        <InputBase
                            autoFocus
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                            placeholder="0.00"
                            sx={{
                                width: "100%",
                                bgcolor: "#fff",
                                border: `2px solid ${amount ? appColors.orange : appColors.divider}`,
                                borderRadius: 1,
                                "& input": { fontSize: 26, textAlign: "center", py: 2.5 },
                            }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <InputBase
                            value={upc}
                            onChange={(e) => setUpc(e.target.value)}
                            placeholder="Enter UPC Code (optional)"
                            sx={{
                                width: "100%",
                                bgcolor: appColors.fieldFill,
                                borderBottom: `1px solid ${appColors.textSecondary}`,
                                "& input": { fontSize: 21, py: 2.75, px: 2 },
                            }}
                        />
                    </Box>
                </Stack>

                <Stack direction="row" sx={{ alignItems: "center", mt: 2, mb: 1 }}>
                    <Stack direction="row" sx={{ flex: 1, alignItems: "center", gap: 2, position: "relative" }}>
                        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>Gift Card Type</Typography>
                        <ButtonBase onClick={() => setTypeOpen((o) => !o)} sx={{ gap: 1 }}>
                            <Typography sx={{ fontSize: 19 }}>{type}</Typography>
                            <ArrowDropDownIcon />
                        </ButtonBase>
                        {typeOpen && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 120,
                                    zIndex: 30,
                                    bgcolor: "#fff",
                                    boxShadow: 6,
                                    minWidth: 260,
                                }}
                            >
                                {GIFT_CARD_TYPES.map((t) => (
                                    <ButtonBase
                                        key={t}
                                        onClick={() => {
                                            setType(t);
                                            setTypeOpen(false);
                                        }}
                                        sx={{ display: "block", width: "100%", textAlign: "left", px: 2, py: 1.5, fontSize: 17 }}
                                    >
                                        {t}
                                    </ButtonBase>
                                ))}
                            </Box>
                        )}
                    </Stack>

                    <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
                        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>Expiration Date</Typography>
                        {/* A century out. The default is effectively "never", which
                            is a policy decision hiding in a date field. */}
                        <Box sx={{ bgcolor: appColors.slate, color: "#fff", px: 2.5, py: 1.5, fontSize: 15, letterSpacing: "0.06em" }}>
                            MAY 28 2122
                        </Box>
                    </Stack>
                </Stack>

                {partyHeader("Gift Card FROM", fromId, `${from.first} ${from.last}`.trim())}
                <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1 }}>
                        <PartyFields
                            party={from}
                            customers={state.customers}
                            onChange={(next) => setFrom((v) => ({ ...v, ...next }))}
                            onPick={(c) => {
                                setFrom({ first: c.firstName, last: c.lastName, email: c.email, phone: c.phone ?? "" });
                                setFromId(c.courseId);
                            }}
                        />
                    </Box>
                </Stack>

                {partyHeader("Gift Card TO", toId, `${to.first} ${to.last}`.trim())}
                <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                        <PartyFields
                            party={to}
                            customers={state.customers}
                            onChange={(next) => setTo((v) => ({ ...v, ...next }))}
                            onPick={(c) => {
                                setTo({ first: c.firstName, last: c.lastName, email: c.email, phone: c.phone ?? "" });
                                setToId(c.courseId);
                            }}
                        />
                    </Box>
                </Stack>

                <ButtonBase
                    onClick={() => {
                        setTo(from);
                        setToId(fromId);
                    }}
                    sx={{ bgcolor: appColors.slate, color: "#fff", px: 4, py: 1.75, fontSize: 19, mb: 2 }}
                >
                    Same as From
                </ButtonBase>

                {/* All four on by default — the out-of-the-box gift card buys
                    alcohol, which is a policy someone should choose rather than
                    inherit. */}
                <Stack direction="row" sx={{ justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
                    {SPEND.map((s) => (
                        <Stack key={s} direction="row" sx={{ alignItems: "center", gap: 1 }}>
                            <Checkbox
                                checked={spend.includes(s)}
                                onChange={(e) => setSpend((prev) => (e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)))}
                            />
                            <Typography sx={{ fontSize: 19 }}>{s}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </Box>

            <Dialog
                open={confirmUpc}
                onClose={() => setConfirmUpc(false)}
                slotProps={{ paper: { sx: { width: 560, borderRadius: 1, p: 3 } } }}
            >
                <Typography sx={{ fontSize: 22, mb: 1.5 }}>UPC was not provided</Typography>
                <Typography sx={{ fontSize: 17, color: appColors.textSecondary, lineHeight: 1.45 }}>
                    UPC was not provided, if you continue the server will assign a unique generated UPC code that will be printed on the
                    customer receipt.
                </Typography>
                <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 2, mt: 3 }}>
                    <Button onClick={() => setConfirmUpc(false)} sx={{ color: "#E53935", fontSize: 16 }}>
                        CANCEL
                    </Button>
                    <Button
                        onClick={() => {
                            setConfirmUpc(false);
                            commit();
                        }}
                        sx={{ color: appColors.green, fontSize: 16 }}
                    >
                        OK
                    </Button>
                </Stack>
            </Dialog>
        </Shell>
    );
};
