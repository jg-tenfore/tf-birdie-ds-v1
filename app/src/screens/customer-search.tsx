import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckIcon from "@mui/icons-material/Check";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { CustomerField, CustomerSection } from "@/components/screens/operations/customer-search-panel";
import { CUSTOMER_TYPES, customerById, searchCustomers, type Customer } from "@/data/crm";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Customer Search, from `references/072926/11-customerSearch/`.
 *
 * Three states on two routes. The search screen opens as a centred heading over
 * a single underlined field and nothing else — no recent customers, no browse.
 * Typing two characters drops a results sheet directly under the field, and
 * tapping a result opens the record.
 *
 * The thing worth noticing in the results: the membership or customer type is
 * baked into the printed name rather than shown in its own column, so "Weston
 * Farnsworth - 30 Day booking window" and "Weston Senior - Senior" read as two
 * unrelated people. With a hundred records and shared phone numbers, picking the
 * wrong one is easy — which is a finding for the redesign, not a bug to paper
 * over here.
 *
 * The record doubles as a payment screen: card capture and PAY ON BALANCE live in
 * its bottom bar, so "look someone up" and "charge someone" are the same screen.
 */

const RESULT_LIMIT = 8;

const ResultRow = ({ customer, onSelect }: { customer: Customer; onSelect: () => void }) => (
    <ButtonBase
        onClick={onSelect}
        sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            px: 2,
            py: 1.5,
            bgcolor: "#fff",
            borderBottom: `1px solid ${appColors.textPrimary}`,
            "&:hover": { bgcolor: appColors.canvas },
        }}
    >
        {customer.tag && (
            <Typography sx={{ fontSize: 15, fontWeight: 700, fontStyle: "italic", mb: 0.25 }}>{customer.tag}</Typography>
        )}
        <Typography sx={{ fontSize: 19 }}>{customer.displayName}</Typography>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1, mt: 0.5 }}>
            <EmailIcon sx={{ fontSize: 18, color: appColors.greenTee }} />
            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{customer.email}</Typography>
        </Stack>
        {customer.phone && (
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, mt: 0.25 }}>
                <PhoneIcon sx={{ fontSize: 18, color: appColors.greenTee }} />
                <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{customer.phone}</Typography>
            </Stack>
        )}
    </ButtonBase>
);

export const CustomerSearchScreen = () => {
    const { ticket, state } = useStore();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    // Live as you type — two characters is the floor, because one returns most
    // of the database and tells you nothing.
    const results = useMemo(() => searchCustomers(query, RESULT_LIMIT, state.customers), [query, state.customers]);

    return (
        <Shell
            title="Customer Search"
            active="customersearch"
            topBarRight={
                <IconButton aria-label="Add customer" sx={{ color: "#fff" }}>
                    <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%", pt: 14 }}>
                <Typography sx={{ fontSize: 22, textAlign: "center", mb: 2 }}>Customer Search</Typography>

                <Box sx={{ px: 3, position: "relative" }}>
                    <InputBase
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by customer name, email, or phone…"
                        sx={{
                            width: "100%",
                            borderBottom: `1px solid ${appColors.textPrimary}`,
                            "& input": {
                                fontSize: 22,
                                textAlign: "center",
                                py: 1,
                                "&::placeholder": { color: appColors.textSecondary, opacity: 1 },
                            },
                        }}
                    />

                    {/* The sheet hangs off the field rather than replacing the
                        screen, so the query stays visible while you scan. */}
                    {query.trim().length >= 2 && (
                        <Box sx={{ mt: "1px", mx: -1, boxShadow: 4, bgcolor: "#fff", borderTop: `1px solid ${appColors.textPrimary}` }}>
                            {results.length === 0 ? (
                                <Typography sx={{ p: 2, fontSize: 17, color: appColors.textSecondary }}>
                                    No customers match “{query.trim()}”.
                                </Typography>
                            ) : (
                                results.map((c) => <ResultRow key={c.id} customer={c} onSelect={() => navigate(`/customersearch/${c.id}`)} />)
                            )}
                        </Box>
                    )}
                </Box>

                {ticket && (
                    <Typography sx={{ mt: 4, textAlign: "center", fontSize: 14, color: appColors.textSecondary }}>
                        Selecting a customer attaches them to ticket {ticket.number}.
                    </Typography>
                )}
            </Box>
        </Shell>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <Stack direction="row" sx={{ py: 0.75 }}>
        <Typography sx={{ flex: 1, fontSize: 17, fontStyle: "italic", color: appColors.textSecondary }}>{label}</Typography>
        <Typography sx={{ fontSize: 17 }}>{value}</Typography>
    </Stack>
);

export const CustomerRecordScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { attachCustomer } = useActions();
    const { ticket, state } = useStore();

    const customer = id ? customerById(id, state.customers) : null;
    const [types, setTypes] = useState<string[]>(customer?.customerTypes ?? []);

    if (!customer) {
        return (
            <Shell title="Customer Search" active="customersearch" actionBar={<ActionButton onClick={() => navigate("/customersearch")}>Back</ActionButton>}>
                <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 20 }}>No such customer.</Typography>
                </Stack>
            </Shell>
        );
    }

    return (
        <Shell
            title="Customer Search"
            active="customersearch"
            topBarRight={
                <IconButton aria-label="Add customer" sx={{ color: "#fff" }}>
                    <AddIcon sx={{ fontSize: 30 }} />
                </IconButton>
            }
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate("/customersearch")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<CreditCardIcon />}>Swipe CC</ActionButton>
                    <ActionButton icon={<CreditCardIcon />}>Key CC</ActionButton>
                    <ActionButton
                        icon={<AttachMoneyIcon />}
                        tone={customer.balance > 0 ? "default" : "disabled"}
                        onClick={() => customer.balance > 0 && navigate("/pay")}
                    >
                        {customer.balance > 0 ? `Pay ${money(customer.balance)}` : "Pay on balance"}
                    </ActionButton>
                    <ActionButton
                        icon={<CheckIcon />}
                        tone="primary"
                        onClick={() => {
                            attachCustomer(customer.displayName);
                            navigate(ticket ? "/proshop" : "/customersearch");
                        }}
                    >
                        Save
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: "#fff", minHeight: "100%", pb: 4 }}>
                {/* The record's three field rows. */}
                <Box sx={{ px: 1, pt: 1 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.75, mb: 1.75 }}>
                        <CustomerField label="First Name" value={customer.firstName} />
                        <CustomerField label="Last Name" value={customer.lastName} />
                        <CustomerField label="Enter Customer Email" value={customer.email} />
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.75, mb: 1.75 }}>
                        <CustomerField label="Phone Number" value={customer.phone} />
                        <CustomerField label="Customer Birthday" value={customer.birthday} />
                        <CustomerField label="Enter notes for this customer" value={customer.notes} />
                    </Box>
                    {/* Street keeps a third of the width; the rest share what is left. */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1.47fr 1fr 1fr 1fr", gap: 1.75 }}>
                        <CustomerField label="Street Address" value={customer.street} />
                        <CustomerField label="City" value={customer.city} />
                        <CustomerField label="State" value={customer.state} />
                        <CustomerField label="Zip Code" value={customer.zip} />
                    </Box>
                </Box>

                <CustomerSection title="Memberships">
                    {customer.memberships.length === 0 ? (
                        <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No memberships.</Typography>
                    ) : (
                        customer.memberships.map((m) => (
                            <Stack key={m.name} direction="row" sx={{ px: 2, py: 1.5, gap: 2 }}>
                                <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{m.name}</Typography>
                                <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>Expires</Typography>
                                <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{m.expires}</Typography>
                            </Stack>
                        ))
                    )}
                </CustomerSection>

                {/* Every configured type, checked or not — the list is the same on
                    every record, which is why it is so long. */}
                <CustomerSection title="Customer Types">
                    <Box sx={{ px: 1, py: 0.5 }}>
                        {CUSTOMER_TYPES.map((t) => (
                            <Stack key={t} direction="row" sx={{ alignItems: "center" }}>
                                <Checkbox
                                    checked={types.includes(t)}
                                    onChange={(e) => setTypes((prev) => (e.target.checked ? [...prev, t] : prev.filter((x) => x !== t)))}
                                    size="small"
                                />
                                <Typography sx={{ fontSize: 17 }}>{t}</Typography>
                            </Stack>
                        ))}
                    </Box>
                </CustomerSection>

                <CustomerSection title="Gift Cards">
                    {customer.giftCards.length === 0 ? (
                        <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No gift cards.</Typography>
                    ) : (
                        customer.giftCards.map((g) => (
                            <Stack key={g.id} direction="row" sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${appColors.divider}` }}>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{g.id}</Typography>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{g.type}</Typography>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{g.expires}</Typography>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{money(g.awarded)}</Typography>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{money(g.spent)}</Typography>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{money(g.balance)}</Typography>
                            </Stack>
                        ))
                    )}
                </CustomerSection>

                <CustomerSection title="Tee Time History">
                    {customer.teeTimes.length === 0 ? (
                        <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No rounds on record.</Typography>
                    ) : (
                        customer.teeTimes.map((t) => (
                            <Stack key={t.id} direction="row" sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${appColors.divider}` }}>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{t.id}</Typography>
                                <Typography sx={{ flex: 2, fontSize: 16 }}>{t.date}</Typography>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>
                                    {t.players} {t.players === 1 ? "player" : "players"}
                                </Typography>
                            </Stack>
                        ))
                    )}
                </CustomerSection>

                <CustomerSection title="Punch Cards">
                    {customer.punchCards.length === 0 ? (
                        <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No punch cards.</Typography>
                    ) : (
                        customer.punchCards.map((p) => (
                            <Stack key={p.name} direction="row" sx={{ px: 2, py: 1.25, gap: 3 }}>
                                <Typography sx={{ flex: 1, fontSize: 16 }}>{p.name}</Typography>
                                <Typography sx={{ fontSize: 16 }}>
                                    {p.remaining} of {p.total} left
                                </Typography>
                                <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>Expires {p.expires}</Typography>
                            </Stack>
                        ))
                    )}
                </CustomerSection>

                <Box sx={{ px: 2, mt: 3 }}>
                    <Typography sx={{ fontSize: 19, mb: 1 }}>General Info</Typography>
                    <InfoRow label="Customer ID" value={customer.id} />
                    <InfoRow label="Golf Course Customer ID" value={customer.courseId} />
                    <InfoRow label="Rewards Balance:" value={String(customer.rewardsBalance)} />
                    <InfoRow label="Customer Balance" value={money(customer.balance)} />
                    <InfoRow label="Card on File" value={customer.cardOnFile ?? "—"} />
                    <InfoRow label="Card on File Expires" value={customer.cardExpires ?? "—"} />
                </Box>
            </Box>
        </Shell>
    );
};
