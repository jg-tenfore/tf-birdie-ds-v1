import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Floating action buttons.
 *
 * Used sparingly in Birdie, and never as the primary commit. A POS always has a
 * persistent action bar at the bottom, so a floating button competing with it
 * gives the operator two candidate "main" actions — the one thing a
 * high-tempo interface can't afford.
 *
 * Where the FAB earns its place: screens with *no* action bar, like a list where
 * the only action is "add a new one".
 */
const meta = {
    title: "Components/Actions/Floating Action Button",
    component: Fab,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                <Fab color="primary" aria-label="New ticket">
                    <AddIcon />
                </Fab>
                <Fab color="secondary" aria-label="Edit">
                    <EditOutlinedIcon />
                </Fab>
                <Fab variant="extended" color="primary">
                    <AddIcon sx={{ mr: 1 }} />
                    New ticket
                </Fab>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                Prefer the extended variant. A bare icon asks the operator to remember what it does; the label costs 100px of a 1280px
                canvas.
            </Typography>
        </Stack>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                <Fab size="small" color="primary" aria-label="Add">
                    <AddIcon />
                </Fab>
                <Fab size="medium" color="primary" aria-label="Add">
                    <AddIcon />
                </Fab>
                <Fab color="primary" aria-label="Add">
                    <AddIcon />
                </Fab>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                The theme floors every Fab at 64dp, so even `size="small"` clears the touch minimum.
            </Typography>
        </Stack>
    ),
};

/** Placement: bottom-right, clear of the action bar's footprint. */
export const InPlace: Story = {
    name: "In place",
    render: () => (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    position: "relative",
                    height: 420,
                    borderRadius: 3,
                    border: "1px dashed",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    p: 3,
                }}
            >
                <Typography variant="h5">Members</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1, maxWidth: 460 }}>
                    A list screen with no action bar — the only action is "add", so the FAB is the whole affordance and doesn't compete with
                    anything.
                </Typography>

                <Fab variant="extended" color="primary" sx={{ position: "absolute", right: 24, bottom: 24 }}>
                    <AddIcon sx={{ mr: 1 }} />
                    Add member
                </Fab>
            </Box>
        </Box>
    ),
};
