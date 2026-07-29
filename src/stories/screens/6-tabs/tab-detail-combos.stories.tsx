import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { ComboTileGrid } from "@/components/screens/restaurant/tabs-parts";
import { SeatPanel, combos, editorTitle } from "@/components/screens/restaurant/tabs-story-parts";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * COMBOS, with an item added to seat 3.
 *
 * Combos replace the entire menu browser — search field, chips, and grid all
 * go. Every combo falls back to the antler mark, which is what the app itself
 * shows; several are priced at $0.00 and read as configuration left in the live
 * menu rather than sellable items.
 */
const meta = {
    title: "App Screens/6-tabs/Tab detail — combos",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title={editorTitle}
            active="tabs"
            orderPanel={<SeatPanel expandedSeat={3} pearlBeerOnSeat3 />}
            actionBar={
                <>
                    <ActionButton>Back</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Save Changes</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.surface, minHeight: "100%" }}>
                <ComboTileGrid combos={combos} />
            </Box>
        </AppShell>
    ),
};
