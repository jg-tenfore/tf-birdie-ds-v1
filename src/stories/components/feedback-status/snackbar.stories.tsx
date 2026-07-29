import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Snackbars — confirmation for everything that *isn't* irreversible.
 *
 * The pairing rule with Dialog: if the operator can undo it, tell them with a
 * snackbar and offer Undo. If they can't, block them with a dialog first. Voiding
 * a ticket is a dialog; removing a line item is a snackbar with Undo.
 *
 * Positioned bottom-center, which on this layout means it floats just above the
 * action bar — visible without covering the Charge button.
 */
const meta = {
    title: "Components/Feedback & Status/Snackbar",
    component: Snackbar,
    parameters: { layout: "padded" },
    args: { open: true },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithUndo: Story = {
    name: "With undo",
    render: function Render() {
        const [open, setOpen] = useState(true);

        return (
            <Box sx={{ p: 3 }}>
                <Button size="large" onClick={() => setOpen(true)}>
                    Remove line item
                </Button>
                <Snackbar
                    open={open}
                    onClose={() => setOpen(false)}
                    autoHideDuration={6000}
                    message="Removed Range bucket — L"
                    action={
                        <>
                            <Button color="primary" size="small" onClick={() => setOpen(false)}>
                                Undo
                            </Button>
                            <IconButton size="small" aria-label="Dismiss" onClick={() => setOpen(false)} sx={{ color: "inherit" }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </>
                    }
                />
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 640 }}>
                    6 seconds, not the 4s default. An operator mid-conversation with a guest needs longer to notice, read, and decide to
                    undo.
                </Typography>
            </Box>
        );
    },
};

export const Severities: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 560 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Rendered inline so all four are visible at once — in the product only one shows at a time.
            </Typography>
            <Alert severity="success" onClose={() => {}}>
                Ticket #4127 closed — $324.36
            </Alert>
            <Alert severity="info" onClose={() => {}}>
                Tee sheet synced
            </Alert>
            <Alert severity="warning" onClose={() => {}}>
                Card reader battery at 12%
            </Alert>
            <Alert severity="error" onClose={() => {}}>
                Receipt printer is out of paper
            </Alert>
        </Stack>
    ),
};

export const Persistent: Story = {
    render: function Render() {
        const [open, setOpen] = useState(true);

        return (
            <Box sx={{ p: 3 }}>
                <Button size="large" onClick={() => setOpen(true)}>
                    Go offline
                </Button>
                <Snackbar open={open} onClose={() => setOpen(false)}>
                    <Alert
                        severity="warning"
                        sx={{ width: "100%" }}
                        action={
                            <Button color="inherit" size="small">
                                Details
                            </Button>
                        }
                    >
                        Offline — 3 tickets queued. Cash and member accounts still work.
                    </Alert>
                </Snackbar>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 640 }}>
                    No <code>autoHideDuration</code> here: connection state is a condition, not an event, so it stays until it's resolved or
                    explicitly dismissed.
                </Typography>
            </Box>
        );
    },
};

export const Positioning: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 680 }}>
            <Typography variant="h6">Positioning</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Bottom-center is the theme default. Top-center is acceptable for system-level conditions (sync, connectivity) so they don't
                collide with the action bar. Never bottom-right — on a 1280px canvas that puts it directly over the Charge button.
            </Typography>
        </Stack>
    ),
};
