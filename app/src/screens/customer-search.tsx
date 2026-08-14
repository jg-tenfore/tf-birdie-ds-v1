import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
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
import { CustomerRecordPanel } from "@/components/screens/operations/customer-record";
import { customerById, searchCustomers, type Customer } from "@/data/crm";
import { bookingsForCustomer } from "@/data/tee-sheet";
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
            <CustomerRecordPanel
                customer={customer}
                // The credits this person is holding, from the same ledger the
                // register spends out of — a raincheck cut ten minutes ago on
                // the tee sheet shows up here.
                rainchecks={state.rainchecks.filter((r) => r.customerId === customer.id)}
                // Every round this person has on any sheet the terminal is
                // holding, live — check someone in on the tee sheet and their
                // record says "Checked in" a moment later.
                booked={bookingsForCustomer(customer.id, state.teeSheets)}
                selectedTypes={types}
                onToggleType={(t) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
            />
        </Shell>
    );
};
