import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import type { Ticket, TicketStatus } from "@/data/pos-data";
import { money, tickets } from "@/data/pos-data";
import { fontFamily } from "@/theme/tokens";

/**
 * Tickets — every open tab across the pro shop, snack bar, and beverage cart.
 *
 * This is a *finding* screen, not a reading screen: the operator arrives knowing
 * a name or a number and needs to land on one card fast. So the grid is tuned
 * for scanning — status color first, guest name second, amount third — and the
 * whole card is the target rather than a row action.
 */
const meta = {
    title: "App Screens/Tickets",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const statusStyle: Record<TicketStatus, { label: string; color: "success" | "info" | "warning" | "error" | "default" }> = {
    open: { label: "Open", color: "info" },
    paid: { label: "Paid", color: "success" },
    partial: { label: "Partially paid", color: "warning" },
    held: { label: "Held", color: "warning" },
    voided: { label: "Voided", color: "error" },
};

const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const status = statusStyle[ticket.status];

    return (
        <Card>
            <CardActionArea sx={{ p: 2, minHeight: 148, alignItems: "stretch" }}>
                <Stack spacing={1.5} sx={{ height: "100%", justifyContent: "space-between" }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontFamily: fontFamily.mono }}>
                                {ticket.number}
                            </Typography>
                            <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
                                {ticket.guest}
                            </Typography>
                        </Stack>
                        <Chip size="small" label={status.label} color={status.color} />
                    </Stack>

                    <Stack spacing={0.25}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {ticket.guests} {ticket.guests === 1 ? "guest" : "guests"} · {ticket.source}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {ticket.opened} · {ticket.server}
                        </Typography>
                    </Stack>

                    <Typography variant="h5" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                        {money(ticket.total)}
                    </Typography>
                </Stack>
            </CardActionArea>
        </Card>
    );
};

const TicketsScreen = ({ list = tickets, tab = 0 }: { list?: Ticket[]; tab?: number }) => (
    <PosShell active="tickets">
        <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", rowGap: 2 }}>
                <Typography variant="h3">Tickets</Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <TextField
                        placeholder="Name, ticket #, or member"
                        sx={{ width: 360 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button size="large">New ticket</Button>
                </Stack>
            </Stack>

            <Tabs value={tab} sx={{ mb: 2.5 }}>
                {["All", "Open", "Held", "Partially paid", "Paid today"].map((label) => (
                    <Tab key={label} label={label} />
                ))}
            </Tabs>

            {list.length === 0 ? (
                <Stack sx={{ alignItems: "center", justifyContent: "center", py: 10, textAlign: "center" }} spacing={1.5}>
                    <Typography variant="h5">No tickets match</Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 420 }}>
                        Try a partial last name, or clear the filter to see all 10 open tickets.
                    </Typography>
                    <Button variant="outlined" size="large" sx={{ mt: 1 }}>
                        Clear filters
                    </Button>
                </Stack>
            ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
                    {list.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </Box>
            )}
        </Box>
    </PosShell>
);

export const Default: Story = {
    render: () => <TicketsScreen />,
};

export const OpenOnly: Story = {
    name: "Open only",
    render: () => <TicketsScreen list={tickets.filter((ticket) => ticket.status === "open")} tab={1} />,
};

export const NoResults: Story = {
    name: "No results",
    render: () => <TicketsScreen list={[]} />,
};
