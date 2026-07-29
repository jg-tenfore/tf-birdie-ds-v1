import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OpenFoodForm } from "@/components/screens/restaurant/tabs-parts";
import { SeatPanel, editorTitle } from "@/components/screens/restaurant/tabs-story-parts";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * OPEN FOOD — ringing up something that is not on the menu.
 *
 * A green SAVE with a back-chevron sits alone at the top-left of the canvas,
 * above the form it saves, while SAVE CHANGES for the whole order sits in the
 * bottom bar. Two differently-scoped saves are on screen simultaneously.
 *
 * Every field is placeholder-only, so the labels vanish as soon as the operator
 * types.
 */
const meta = {
    title: "App Screens/6-tabs/Tab detail — open food",
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
                    <ActionButton tone="primary">Save Changes</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.surface, minHeight: "100%", pt: "20px", px: 2 }}>
                <Button color="primary" startIcon={<ChevronLeftIcon />} sx={{ width: 148, minHeight: 44 }}>
                    Save
                </Button>
                <OpenFoodForm />
            </Box>
        </AppShell>
    ),
};
