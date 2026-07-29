import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";

/**
 * Tabs — the primary in-screen switch on a landscape tablet.
 *
 * Landscape gives us horizontal room, so tabs beat a dropdown almost every
 * time: every option is visible and one tap away, with no menu to open first.
 */
const meta = {
    title: "Components/Navigation/Tabs",
    component: Tabs,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const TabDemo = ({ labels, variant }: { labels: string[]; variant?: "standard" | "fullWidth" | "scrollable" }) => {
    const [value, setValue] = useState(0);

    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
                value={value}
                onChange={(_, next) => setValue(next)}
                variant={variant}
                scrollButtons={variant === "scrollable" ? "auto" : false}
            >
                {labels.map((label) => (
                    <Tab key={label} label={label} />
                ))}
            </Tabs>
        </Box>
    );
};

export const Standard: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <TabDemo labels={["Open tickets", "Paid today", "Voided", "All"]} />
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 720 }}>
                Tabs are {touchTarget.comfortable}dp tall and sentence case. On a 1280px-wide canvas there is room for six or seven before
                scrolling — past that, the grouping is wrong, not the component.
            </Typography>
        </Stack>
    ),
};

export const FullWidth: Story = {
    name: "Full width",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 560 }}>
            <TabDemo labels={["Cash", "Card", "Member"]} variant="fullWidth" />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Full width inside a fixed panel — the order panel or a dialog — where each target should be as large as the space allows.
            </Typography>
        </Stack>
    ),
};

export const Scrollable: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <TabDemo
                labels={["Golf", "Range", "Pro shop", "F & B", "Rentals", "Lessons", "Memberships", "Events", "Gift cards"]}
                variant="scrollable"
            />
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 720 }}>
                Scrollable tabs are a last resort: anything off-screen is effectively invisible to an operator working at speed. Prefer to
                re-group, or move the long list into the nav rail.
            </Typography>
        </Stack>
    ),
};
