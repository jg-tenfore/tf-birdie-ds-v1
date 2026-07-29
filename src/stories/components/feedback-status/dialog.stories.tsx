import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PinPad } from "@/components/auth/pin-pad";
import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * Dialogs — the only correct pattern for a decision that must not be missed.
 *
 * The POS rule: a dialog is for things that are *irreversible* or *legally
 * gated*. Everything else is a Snackbar. Every dialog here states the
 * consequence in the body rather than the title, because "Are you sure?" tells
 * an operator nothing they didn't already know.
 *
 * Destructive confirmation puts the safe action on the right, where the thumb
 * rests — the opposite of the web convention, and deliberate.
 */
const meta = {
    title: "Components/Feedback & Status/Dialog",
    component: Dialog,
    parameters: { layout: "padded" },
    args: { open: true },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const Launcher = ({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) => {
    const [open, setOpen] = useState(true);

    return (
        <Box sx={{ p: 3 }}>
            <Button size="large" onClick={() => setOpen(true)}>
                {label}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                {children(() => setOpen(false))}
            </Dialog>
        </Box>
    );
};

export const Confirmation: Story = {
    render: () => (
        <Launcher label="Void ticket">
            {(close) => (
                <>
                    <DialogTitle>Void ticket #4127?</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
                            This removes all 7 line items and $324.36 from today's totals. The void is logged
                            against Dana Kim and can't be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" color="error" size="large" onClick={close}>
                            Void ticket
                        </Button>
                        <Button size="large" onClick={close} sx={{ minWidth: 160 }}>
                            Keep ticket
                        </Button>
                    </DialogActions>
                </>
            )}
        </Launcher>
    ),
};

/** A manager override — the dialog *is* the interaction, not a wrapper for one. */
export const ManagerOverride: Story = {
    name: "Manager override",
    render: () => (
        <Launcher label="Request override">
            {(close) => (
                <>
                    <DialogTitle>Manager override required</DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ alignItems: "center", py: 1 }}>
                            <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center" }}>
                                Refunds over $100 need a shift lead's PIN.
                            </Typography>
                            <PinPad length={2} tone="onLight" />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" size="large" onClick={close}>
                            Cancel
                        </Button>
                    </DialogActions>
                </>
            )}
        </Launcher>
    ),
};

/** A legal gate — blocking by design, and it cannot be dismissed by tapping away. */
export const AgeCheck: Story = {
    name: "Age check",
    render: () => (
        <Launcher label="Add draft beer">
            {(close) => (
                <>
                    <DialogTitle>Verify age — 21+</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2}>
                            <Typography variant="body1" sx={{ color: "text.secondary" }}>
                                Check ID before adding alcohol to this ticket. Guests must be born on or before:
                            </Typography>
                            <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "action.hover", textAlign: "center" }}>
                                <Typography variant="h3" sx={{ fontFamily: fontFamily.mono }}>
                                    Jul 29, 2005
                                </Typography>
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" size="large" onClick={close}>
                            Cancel
                        </Button>
                        <Button size="large" onClick={close} sx={{ minWidth: 200, minHeight: touchTarget.large }}>
                            ID checked — add
                        </Button>
                    </DialogActions>
                </>
            )}
        </Launcher>
    ),
};

export const WithForm: Story = {
    name: "With form",
    render: () => (
        <Launcher label="Apply discount">
            {(close) => (
                <>
                    <DialogTitle>Apply discount</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2.5} sx={{ pt: 1 }}>
                            <TextField label="Amount off" defaultValue="10.00" slotProps={{ htmlInput: { inputMode: "decimal" } }} />
                            <TextField select label="Reason" defaultValue="recovery" slotProps={{ select: { native: true } }}>
                                <option value="recovery">Service recovery</option>
                                <option value="rain">Rain check</option>
                                <option value="member">Member benefit</option>
                            </TextField>
                            <TextField label="Note (optional)" multiline rows={2} />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" size="large" onClick={close}>
                            Cancel
                        </Button>
                        <Button size="large" onClick={close} sx={{ minWidth: 160 }}>
                            Apply
                        </Button>
                    </DialogActions>
                </>
            )}
        </Launcher>
    ),
};

/**
 * Full-screen is usually wrong on a tablet — it throws away the landscape canvas
 * and the operator loses their place in the ticket behind it.
 */
export const Sizing: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 680 }}>
            <Typography variant="h6">Sizing guidance</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Use <code>maxWidth="sm"</code> (600px) for confirmations and <code>maxWidth="md"</code> (900px)
                for forms. Avoid <code>fullScreen</code>: at 1280×800 it hides the ticket the operator is
                deciding about, and the guest sees a screen that looks like the app crashed and restarted.
            </Typography>
        </Stack>
    ),
};

