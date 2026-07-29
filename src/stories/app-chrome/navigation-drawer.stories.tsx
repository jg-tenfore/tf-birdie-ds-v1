import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell, NavDrawerContent } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * The flyout navigation drawer — the app's only navigation surface.
 *
 * Transcribed from `references/072926/0-sidebarnav/`. Three things about it are
 * load-bearing for every other screen:
 *
 *  1. It is a **temporary drawer behind a hamburger**, not a persistent rail.
 *     Every destination change costs a tap to open, a tap to choose, and a
 *     dismiss animation.
 *  2. The dark header block carries the full operating identity — product,
 *     build (`v. 5.6.18.52`), signed-in account, facility, and the device ID.
 *     That is a support affordance: it is what staff read out on a phone call.
 *  3. Destinations are grouped **Pro Shop** / **Restaurant** / ungrouped
 *     operations, which is the app's real information architecture and the
 *     grouping this Storybook's sidebar mirrors.
 */
const meta = {
    title: "App Chrome/Navigation Drawer",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The drawer as the operator sees it — open, over a dimmed screen. */
export const Open: Story = {
    render: () => (
        <AppShell
            title="Pro Shop Order"
            active="proshop"
            defaultDrawerOpen
            actionBar={
                <>
                    <ActionButton>Tee sheet</ActionButton>
                    <ActionButton>Reset</ActionButton>
                    <ActionButton>Pop</ActionButton>
                    <ActionButton>Anonymous</ActionButton>
                    <ActionButton>Combos</ActionButton>
                    <ActionButton tone="disabled">Pay $0.00</ActionButton>
                </>
            }
        >
            <Box sx={{ p: 3 }}>
                <Typography sx={{ color: appColors.textSecondary }}>
                    The drawer opens over the current screen. Tap the scrim or a destination to dismiss it.
                </Typography>
            </Box>
        </AppShell>
    ),
};

/** The drawer contents alone, so the full list is readable without scrolling a scrim. */
export const Contents: Story = {
    render: () => (
        <Box sx={{ height: "100vh", bgcolor: appColors.canvas, display: "flex" }}>
            <Box sx={{ borderRight: "1px solid", borderColor: appColors.divider, overflowY: "auto" }}>
                <NavDrawerContent active="teesheet" />
            </Box>
            <Box sx={{ p: 4, maxWidth: 520 }}>
                <Typography sx={{ fontSize: 20, mb: 2 }}>Structure</Typography>
                <Typography sx={{ color: appColors.textSecondary, fontSize: 15, lineHeight: 1.7 }}>
                    Dark identity header, then three groups. "Pro Shop" and "Restaurant" carry grey headings
                    and are separated by dividers; the final block — Customer Search through Settings — has no
                    heading. Log Out sits inside that last block rather than in the header, one row above
                    Settings.
                </Typography>
            </Box>
        </Box>
    ),
};

/** Closed, showing the hamburger that is the only way in. */
export const Closed: Story = {
    render: () => (
        <AppShell
            title="Tee Sheet"
            active="teesheet"
            topActions={["HIDE BACK"]}
            showCart
            actionBar={
                <>
                    <ActionButton>Pro shop</ActionButton>
                    <ActionButton>North Course</ActionButton>
                    <ActionButton>Grid</ActionButton>
                    <ActionButton tone="active">List</ActionButton>
                    <ActionButton>Multi</ActionButton>
                    <ActionButton tone="disabled">Pay</ActionButton>
                </>
            }
        >
            <Box sx={{ p: 3 }}>
                <Typography sx={{ color: appColors.textSecondary }}>
                    Tap the hamburger at top left to open the drawer.
                </Typography>
            </Box>
        </AppShell>
    ),
};
