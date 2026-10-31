import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

import { AppShell, type AppShellProps } from "@/components/app-chrome/app-shell";
import type { NavKey } from "@/components/app-chrome/nav-items";
import { OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { appColors } from "@/theme/app-replica-tokens";
import { money, useActions, useStore, type Line } from "./store";

/** Drawer destination → route. Log Out is handled as an action, not a route. */
export const ROUTES: Record<NavKey, string> = {
    proshop: "/proshop",
    teesheet: "/teesheet",
    courtsheet: "/coursheet",
    baysheet: "/baysheet",
    quickorder: "/quickorder",
    tabs: "/tabs",
    tables: "/tables",
    reservations: "/reservations",
    orderstips: "/orderstips",
    tablechart: "/tablechart",
    customersearch: "/customersearch",
    orderlookup: "/orderlookup",
    timeclock: "/timeclock",
    giftcards: "/giftcards",
    events: "/events",
    inventory: "/inventory",
    shift: "/shift",
    settings: "/settings",
    logout: "/signin",
};

/**
 * The app's shell.
 *
 * Wraps the replica `AppShell` and gives its drawer a real navigate, which is
 * the difference between the documentation and this prototype: choosing a
 * destination here actually changes screen.
 */
export const Shell = ({ children, ...props }: AppShellProps & { children?: ReactNode }) => {
    const navigate = useNavigate();
    const { state } = useStore();
    const { signOut, toast } = useActions();

    return (
        <>
            <AppShell
                accountLabel={state.operator ? state.operator.name.toUpperCase() : "SIGNED OUT"}
                {...props}
                onNavigate={(key) => {
                    if (key === "logout") {
                        signOut();
                        navigate("/signin");
                        return;
                    }
                    navigate(ROUTES[key]);
                }}
            >
                {children}
            </AppShell>

            <Snackbar
                open={Boolean(state.toast)}
                message={state.toast ?? ""}
                autoHideDuration={2200}
                onClose={() => toast(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                sx={{ mb: 10 }}
            />
        </>
    );
};

/* ------------------------------------------------------------------ *
 * Order panel — live, shared by every selling screen.
 * ------------------------------------------------------------------ */

const LineRow = ({ line }: { line: Line }) => {
    const { changeQty } = useActions();

    return (
        <Stack direction="row" spacing={1.5} sx={{ px: 2, py: 1.5, alignItems: "flex-start" }}>
            <Box
                sx={{
                    position: "relative",
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    bgcolor: line.image ? "#fff" : appColors.canvasAlt,
                    border: "1px solid",
                    borderColor: appColors.divider,
                    overflow: "hidden",
                }}
            >
                {line.image && (
                    <Box
                        component="img"
                        src={line.image}
                        alt=""
                        sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                )}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        minWidth: 26,
                        height: 26,
                        px: 0.5,
                        bgcolor: appColors.greenTee,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 15,
                        lineHeight: 1,
                    }}
                >
                    {line.qty}
                </Box>
            </Box>

            <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{line.name}</Typography>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{money(line.unitPrice)} each</Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 0.5 }}>
                    <IconButton
                        size="small"
                        aria-label={`Decrease ${line.name}`}
                        onClick={() => changeQty(line.id, -1, line.seat)}
                        sx={{ border: "1px solid", borderColor: appColors.divider, borderRadius: 1 }}
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        aria-label={`Increase ${line.name}`}
                        onClick={() => changeQty(line.id, 1, line.seat)}
                        sx={{ border: "1px solid", borderColor: appColors.divider, borderRadius: 1 }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{money(line.qty * line.unitPrice)}</Typography>
        </Stack>
    );
};

/** The live cart. Empty state matches the shipping app's antler watermark. */
export const LiveOrderPanel = () => {
    const { ticket, lines, subtotal, tax, total } = useStore();
    const navigate = useNavigate();

    if (lines.length === 0) return <OrderPanelEmpty />;

    return (
        <>
            <Stack direction="row" sx={{ px: 2, pt: 2, pb: 1, justifyContent: "space-between", alignItems: "flex-start" }}>
                <Stack>
                    <Typography sx={{ fontSize: 17, fontWeight: 500 }}>Ticket {ticket?.number}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{ticket?.customer ?? ticket?.name}</Typography>
                </Stack>
                <IconButton aria-label="Attach customer" onClick={() => navigate("/customersearch")}>
                    <PersonAddAltOutlinedIcon />
                </IconButton>
            </Stack>
            <Divider />

            <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                <Stack divider={<Divider />}>
                    {lines.map((line) => (
                        <LineRow key={`${line.id}-${line.seat ?? "x"}`} line={line} />
                    ))}
                </Stack>
            </Box>

            <Divider />
            <Stack spacing={0.5} sx={{ px: 2, py: 1.5 }}>
                {[
                    ["Subtotal", subtotal],
                    ["Tax", tax],
                ].map(([label, amount]) => (
                    <Stack key={label as string} direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{money(amount as number)}</Typography>
                    </Stack>
                ))}
                <Stack direction="row" sx={{ justifyContent: "space-between", mt: 0.5 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 500 }}>Total</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 500 }}>{money(total)}</Typography>
                </Stack>
            </Stack>
        </>
    );
};
