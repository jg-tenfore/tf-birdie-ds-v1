import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import type { TeeTime } from "@/data/pos-data";
import { teeSheet } from "@/data/pos-data";
import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * Tee sheet — arrivals for the current window.
 *
 * A tee sheet is a time-ordered list, and time order is the one sort an operator
 * never wants overridden. So there is no sorting control: the rows are chrono,
 * "now" is pinned in view, and filtering narrows the set rather than reordering
 * it. Breaking chronology on a tee sheet loses the operator's place instantly.
 */
const meta = {
    title: "App Screens/Tee Sheet",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const statusMeta: Record<TeeTime["status"], { label: string; color: "success" | "info" | "default" | "error" }> = {
    "checked-in": { label: "Checked in", color: "success" },
    booked: { label: "Booked", color: "info" },
    open: { label: "Open", color: "default" },
    "no-show": { label: "No show", color: "error" },
};

const TeeRow = ({ slot, isNow }: { slot: TeeTime; isNow?: boolean }) => {
    const status = statusMeta[slot.status];
    const isOpen = slot.status === "open";

    return (
        <Stack
            direction="row"
            spacing={2.5}
            sx={{
                alignItems: "center",
                px: 2.5,
                py: 2,
                minHeight: 88,
                bgcolor: isNow ? "primary.light" : "transparent",
                borderLeft: "4px solid",
                borderColor: isNow ? "primary.main" : "transparent",
            }}
        >
            <Typography variant="h5" sx={{ fontFamily: fontFamily.mono, minWidth: 76 }}>
                {slot.time}
            </Typography>

            <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: isOpen ? 400 : 600, color: isOpen ? "text.secondary" : "text.primary" }}>
                    {isOpen ? "Available" : slot.players.join(", ")}
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {slot.players.length}/{slot.capacity} · {slot.holes} holes
                    </Typography>
                    {slot.cart && <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />}
                </Stack>
            </Stack>

            <Chip label={status.label} color={status.color} size="small" />

            <Button variant={slot.status === "booked" ? "contained" : "outlined"} sx={{ minWidth: 150, minHeight: touchTarget.min }}>
                {isOpen ? "Book" : slot.status === "checked-in" ? "View ticket" : "Check in"}
            </Button>
        </Stack>
    );
};

export const Default: Story = {
    render: () => (
        <PosShell active="teesheet">
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", rowGap: 2 }}>
                    <Stack spacing={0.25}>
                        <Typography variant="h3">Tee sheet</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Saturday, July 29 · 9:20 AM – 11:10 AM · 42 of 96 slots booked
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" size="large">
                            Change day
                        </Button>
                        <Button size="large">Book tee time</Button>
                    </Stack>
                </Stack>

                <Tabs value={0} sx={{ mb: 2 }}>
                    {["All", "Not checked in", "Checked in", "Open slots"].map((label) => (
                        <Tab key={label} label={label} />
                    ))}
                </Tabs>

                <Card>
                    <Stack divider={<Divider />}>
                        {teeSheet.map((slot, i) => (
                            <TeeRow key={slot.time} slot={slot} isNow={i === 2} />
                        ))}
                    </Stack>
                </Card>
            </Box>
        </PosShell>
    ),
};

/** Check-in turns a booking into a ticket — the tee sheet's only real job at the counter. */
export const CheckIn: Story = {
    name: "Check in",
    render: () => (
        <PosShell
            active="teesheet"
            actionBar={
                <>
                    <Button variant="outlined" size="large">
                        Cancel
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button size="large" sx={{ minHeight: touchTarget.large, minWidth: 300, fontSize: 20 }}>
                        Check in & open ticket
                    </Button>
                </>
            }
        >
            <Box sx={{ p: 3, maxWidth: 820 }}>
                <Stack spacing={3}>
                    <Stack spacing={0.25}>
                        <Typography variant="h3">Check in — 10:00 AM</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            18 holes · Cart included · Booked online Jul 24
                        </Typography>
                    </Stack>

                    <Card>
                        <Stack divider={<Divider />}>
                            {[
                                { name: "Sutton, K.", tier: "Eagle member", rate: "Member — $34.00" },
                                { name: "Ibarra, L.", tier: "Guest of member", rate: "Guest — $48.00" },
                                { name: "Doyle, F.", tier: "Public", rate: "Rack — $62.00" },
                                { name: "Open slot", tier: "—", rate: "Add player" },
                            ].map((player, i) => (
                                <Stack key={player.name} direction="row" spacing={2} sx={{ alignItems: "center", p: 2.5, minHeight: 88 }}>
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: "50%",
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: i === 3 ? "action.hover" : "primary.main",
                                            color: i === 3 ? "text.secondary" : "primary.contrastText",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {i + 1}
                                    </Box>
                                    <Stack sx={{ flex: 1 }} spacing={0.25}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {player.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            {player.tier}
                                        </Typography>
                                    </Stack>
                                    <Button variant="outlined" sx={{ minWidth: 190 }}>
                                        {player.rate}
                                    </Button>
                                </Stack>
                            ))}
                        </Stack>
                    </Card>

                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Rate is per-player and editable at check-in, because the foursome that booked as public
                        routinely turns up with a member in it.
                    </Typography>
                </Stack>
            </Box>
        </PosShell>
    ),
};
