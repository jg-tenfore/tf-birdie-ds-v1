import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { members } from "@/data/pos-data";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Tabs, tables, and the back-office screens.
 *
 * These are thinner than the selling and tee-sheet flows by design — they do the
 * one thing each is for (reopen a tab, attach a customer, clock in, end the
 * shift) and read live state, rather than reproducing every state the
 * documentation covers.
 */

const Page = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) => (
    <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 26, mb: subtitle ? 0.25 : 2 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mb: 2 }}>{subtitle}</Typography>}
        {children}
    </Box>
);

const Row = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            display: "flex",
            width: "100%",
            textAlign: "left",
            px: 2,
            py: 2,
            minHeight: 72,
            bgcolor: "#fff",
            borderBottom: "1px solid",
            borderColor: appColors.divider,
            "&:hover": { bgcolor: "#F7F9FA" },
        }}
    >
        {children}
    </ButtonBase>
);

/* ------------------------------ Tabs ------------------------------ */

/* ------------------------- Customer search ------------------------ */

export const CustomerSearchScreen = () => {
    const [q, setQ] = useState("");
    const { attachCustomer } = useActions();
    const { ticket } = useStore();
    const navigate = useNavigate();
    const results = members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.number.includes(q));

    return (
        <Shell title="Customer Search" active="customersearch" topBarRight={null}>
            <Page
                title="Customer Search"
                subtitle={ticket ? `Attaching to ticket ${ticket.number}` : "No open ticket — attach will just select."}
            >
                <InputBase
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by customer name, email, or phone…"
                    sx={{ width: "100%", fontSize: 20, borderBottom: `1px solid ${appColors.textSecondary}`, pb: 1, mb: 2 }}
                />
                <Box sx={{ border: "1px solid", borderColor: appColors.divider }}>
                    {results.map((m) => (
                        <Row
                            key={m.id}
                            onClick={() => {
                                attachCustomer(m.name);
                                navigate(-1);
                            }}
                        >
                            <Stack sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: 18 }}>{m.name}</Typography>
                                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                    {m.number} · {m.tier} · credit {money(m.credit)}
                                </Typography>
                            </Stack>
                            <Typography sx={{ fontSize: 14, color: appColors.green }}>Attach</Typography>
                        </Row>
                    ))}
                    {results.length === 0 && <Typography sx={{ p: 2, color: appColors.textSecondary }}>No matches.</Typography>}
                </Box>
            </Page>
        </Shell>
    );
};

/* --------------------------- Back office -------------------------- */

export const OrderLookupScreen = () => {
    const { paidTickets } = useStore();
    return (
        <Shell title="Order Lookup" active="orderlookup">
            <Page title="Order Lookup" subtitle="Completed sales this session.">
                {paidTickets.length === 0 ? (
                    <Typography sx={{ color: appColors.textSecondary }}>No sales yet. Complete one from the register.</Typography>
                ) : (
                    <Box sx={{ border: "1px solid", borderColor: appColors.divider }}>
                        {paidTickets.map((t) => (
                            <Row key={t.id}>
                                <Stack sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: 17 }}>
                                        {t.number} · {t.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                        {t.tender} · {t.lines.length} items · {t.source}
                                    </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: 17 }}>
                                    {money(t.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06)}
                                </Typography>
                            </Row>
                        ))}
                    </Box>
                )}
            </Page>
        </Shell>
    );
};

export const TimeClockScreen = () => {
    const { state } = useStore();
    const { clockToggle } = useActions();
    return (
        <Shell
            title="Time Clock"
            active="timeclock"
            actionBar={
                <ActionButton tone={state.clockedIn ? "danger" : "primary"} grow={1} onClick={clockToggle}>
                    {state.clockedIn ? "Clock out" : "Clock in"}
                </ActionButton>
            }
        >
            <Page title="Time Clock" subtitle={state.operator?.name ?? "Not signed in"}>
                <Typography sx={{ fontSize: 22 }}>{state.clockedIn ? "You are clocked in." : "You are clocked out."}</Typography>
            </Page>
        </Shell>
    );
};

export const ShiftScreen = () => {
    const { state, paidTickets } = useStore();
    const { endShift } = useActions();
    const takings = paidTickets.reduce((s, t) => s + t.lines.reduce((n, l) => n + l.qty * l.unitPrice, 0) * 1.06, 0);

    return (
        <Shell
            title="Shift"
            active="shift"
            actionBar={
                <ActionButton tone={state.shiftOpen ? "danger" : "disabled"} grow={1} onClick={endShift}>
                    {state.shiftOpen ? "End shift" : "Shift ended"}
                </ActionButton>
            }
        >
            <Page title="Shift" subtitle={`${state.operator?.name ?? "—"} · ${state.operator?.till ?? "—"}`}>
                <Stack spacing={1} sx={{ maxWidth: 460 }}>
                    {[
                        ["Sales this shift", paidTickets.length],
                        ["Takings", money(takings)],
                        ["Open tabs", state.tickets.filter((t) => t.status === "held").length],
                        ["Status", state.shiftOpen ? "Open" : "Ended"],
                    ].map(([k, v]) => (
                        <Stack
                            key={k as string}
                            direction="row"
                            sx={{ justifyContent: "space-between", py: 1, borderBottom: "1px solid", borderColor: appColors.divider }}
                        >
                            <Typography sx={{ color: appColors.textSecondary }}>{k}</Typography>
                            <Typography sx={{ fontWeight: 500 }}>{v}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </Page>
        </Shell>
    );
};

/** A generic screen for the destinations that exist but aren't wired deeply. */
export const StubScreen = ({ title, active, note }: { title: string; active: Parameters<typeof Shell>[0]["active"]; note: string }) => {
    const navigate = useNavigate();
    return (
        <Shell title={title} active={active} actionBar={<ActionButton onClick={() => navigate("/proshop")}>Back to register</ActionButton>}>
            <Page title={title} subtitle={note}>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ color: appColors.textSecondary, maxWidth: 620 }}>
                    This destination is reachable and themed, but its interactions are not wired yet. The documented states for it live in
                    Storybook.
                </Typography>
            </Page>
        </Shell>
    );
};
