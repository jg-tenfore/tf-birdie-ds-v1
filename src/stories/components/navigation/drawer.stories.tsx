import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import GolfCourseOutlinedIcon from "@mui/icons-material/GolfCourseOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { layout } from "@/theme/tokens";

/**
 * Drawer.
 *
 * The important guidance is about what Birdie *doesn't* do: there is no
 * hamburger. Primary navigation lives in a permanently visible 88px rail,
 * because a landscape tablet has the width and hiding destinations behind a tap
 * costs one on every screen change.
 *
 * Drawers are used for temporary side content — a ticket's history, a filter
 * panel, the expanded nav labels — never as the only route to a destination.
 */
const meta = {
    title: "Components/Navigation/Drawer",
    component: Drawer,
    parameters: { layout: "padded" },
    args: { open: false },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const destinations: { label: string; Icon: SvgIconComponent }[] = [
    { label: "Register", Icon: PointOfSaleOutlinedIcon },
    { label: "Tickets", Icon: ReceiptLongOutlinedIcon },
    { label: "Payments", Icon: CreditCardOutlinedIcon },
    { label: "Tee sheet", Icon: GolfCourseOutlinedIcon },
];

export const Permanent: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Typography variant="h6">Permanent — the Birdie default</Typography>
            <Box sx={{ display: "flex", height: 360, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ width: layout.navRailWidth, borderRight: "1px solid", borderColor: "divider", py: 1 }}>
                    <Stack spacing={0.5} sx={{ alignItems: "center" }}>
                        {destinations.map((item, i) => (
                            <Stack
                                key={item.label}
                                spacing={0.25}
                                sx={{
                                    width: layout.navRailWidth - 12,
                                    minHeight: 64,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 2,
                                    bgcolor: i === 0 ? "primary.main" : "transparent",
                                    color: i === 0 ? "primary.contrastText" : "text.secondary",
                                }}
                            >
                                <item.Icon />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {item.label}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
                <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Canvas
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                88px, icon plus label, always on screen. Every destination is one tap from every other destination — which is the entire
                argument against a hamburger on a tablet.
            </Typography>
        </Stack>
    ),
};

export const Temporary: Story = {
    render: function Render() {
        const [open, setOpen] = useState(false);

        return (
            <Box sx={{ p: 3 }}>
                <Button size="large" onClick={() => setOpen(true)}>
                    Open ticket history
                </Button>
                <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                    <Box sx={{ width: 420, p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Ticket #4127 history
                        </Typography>
                        <Divider />
                        <List>
                            {[
                                "9:40 AM — Opened by Dana K.",
                                "9:41 AM — Added Green fee ×4",
                                "9:42 AM — Added Cart ×2",
                                "9:44 AM — Member attached: Jordan Ellis",
                                "9:51 AM — Range bucket added",
                            ].map((entry) => (
                                <ListItemButton key={entry}>
                                    <ListItemText primary={entry} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                </Drawer>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 680 }}>
                    Right anchor for contextual detail — it slides in beside the ticket rather than covering it, and the operator keeps
                    their place.
                </Typography>
            </Box>
        );
    },
};

export const ExpandedRail: Story = {
    name: "Expanded rail",
    render: function Render() {
        const [open, setOpen] = useState(false);

        return (
            <Box sx={{ p: 3 }}>
                <Button variant="outlined" size="large" onClick={() => setOpen(true)}>
                    Expand nav labels
                </Button>
                <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                    <Box sx={{ width: layout.navDrawerWidth }}>
                        <Box sx={{ height: layout.appBarHeight, display: "flex", alignItems: "center", px: 2.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Sagamore Golf Club
                            </Typography>
                        </Box>
                        <Divider />
                        <List>
                            {destinations.map((item, i) => (
                                <ListItemButton key={item.label} selected={i === 0} sx={{ mx: 1, mb: 0.5 }}>
                                    <ListItemIcon>
                                        <item.Icon />
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                </Drawer>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 680 }}>
                    {layout.navDrawerWidth}px expanded. This is an *enhancement* of the rail, not a replacement — the rail's icons and
                    labels remain visible underneath at all times.
                </Typography>
            </Box>
        );
    },
};
