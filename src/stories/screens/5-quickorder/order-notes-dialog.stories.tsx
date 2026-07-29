import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { PotatoSkinsDetail, twoLineOrder } from "@/components/screens/restaurant/quick-order-story-parts";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Order Notes dialog.
 *
 * Opened from the "Enter Additional Notes…" field. The notes apply to the whole
 * order, not the item being edited, even though the dialog is reached from
 * inside item edit and the field that opens it sits under the item's name.
 */
const meta = {
    title: "App Screens/5-quickorder/Order notes dialog",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <>
            <AppShell title="Quick Order" active="quickorder" orderPanel={twoLineOrder} actionBar={<ActionButton>Back</ActionButton>}>
                <PotatoSkinsDetail activeGroup="Cheeses" />
            </AppShell>

            <Dialog open disablePortal={false} slotProps={{ paper: { sx: { width: 540, maxWidth: "none", p: 3 } } }}>
                <Typography sx={{ fontSize: 20, textAlign: "center", color: appColors.textPrimary, mb: 2.5 }}>Order Notes</Typography>

                <Box
                    sx={{
                        bgcolor: "#E1E1E1",
                        borderBottom: `1px solid ${appColors.textSecondary}`,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        mb: 2,
                    }}
                >
                    <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>Enter notes</Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button color="secondary" startIcon={<ChevronLeftIcon />} sx={{ flex: 1, minHeight: 44 }}>
                        Back
                    </Button>
                    <Button color="primary" startIcon={<CheckIcon />} sx={{ flex: 1, minHeight: 44 }}>
                        Save
                    </Button>
                </Stack>
            </Dialog>
        </>
    ),
};
