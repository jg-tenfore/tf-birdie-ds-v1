import { useState } from "react";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import GolfCourseOutlinedIcon from "@mui/icons-material/GolfCourseOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";

/**
 * Bottom Navigation.
 *
 * Documented here for completeness, and **not used in Birdie**. Two reasons, both
 * specific to a landscape tablet:
 *
 *  1. Bottom nav is a phone pattern — it exists because a thumb can't reach the
 *     top of a tall screen held one-handed. A counter-mounted tablet has no such
 *     constraint; the operator uses both hands and the whole surface.
 *  2. The bottom edge is already spoken for. The action bar lives there, and
 *     putting navigation next to Charge is how you get someone tendering a
 *     payment when they meant to switch screens.
 *
 * Birdie uses the permanent nav rail instead. See Navigation → Drawer.
 */
const meta = {
    title: "Components/Navigation/Bottom Navigation",
    component: BottomNavigation,
    parameters: { layout: "padded" },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {
    render: function Render() {
        const [value, setValue] = useState(0);

        return (
            <Stack spacing={3} sx={{ p: 3, maxWidth: 720 }}>
                <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "warning.main", bgcolor: "warning.light" }}>
                    <Typography variant="body2" sx={{ color: "warning.dark", fontWeight: 600 }}>
                        Not used in Birdie — the action bar owns the bottom edge, and a landscape tablet doesn't have the one-handed-reach
                        problem this pattern solves.
                    </Typography>
                </Box>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <BottomNavigation value={value} onChange={(_, next) => setValue(next)} showLabels sx={{ height: touchTarget.large }}>
                        <BottomNavigationAction label="Register" icon={<PointOfSaleOutlinedIcon />} />
                        <BottomNavigationAction label="Tickets" icon={<ReceiptLongOutlinedIcon />} />
                        <BottomNavigationAction label="Payments" icon={<CreditCardOutlinedIcon />} />
                        <BottomNavigationAction label="Tee sheet" icon={<GolfCourseOutlinedIcon />} />
                    </BottomNavigation>
                </Paper>

                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    If it were ever used: always <code>showLabels</code>. The default hides labels on inactive items, which turns three of
                    the four into unlabeled icons.
                </Typography>
            </Stack>
        );
    },
};
