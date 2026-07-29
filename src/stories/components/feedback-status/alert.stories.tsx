import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Status messaging for a screen nobody is watching closely.
 *
 * The POS reports state to someone mid-conversation with a guest. That means
 * status must survive a two-second glance: color, icon, and a verb — never
 * color alone, and never a message that requires reading a sentence to act on.
 */
const meta = {
    title: "Components/Feedback & Status/Alert",
    component: Alert,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Severities: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 720 }}>
            <Alert severity="success">Payment approved — $248.00 on Visa ••4021</Alert>
            <Alert severity="info">Tee sheet synced 2 minutes ago</Alert>
            <Alert severity="warning">Card reader is on battery — 12% remaining</Alert>
            <Alert severity="error" action={<Button color="inherit" size="small">Retry</Button>}>
                Payment declined — insufficient funds
            </Alert>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Every alert carries an icon as well as a color. Roughly 1 in 12 men has a color-vision
                deficiency, and a red/green pair is exactly the one they cannot resolve — which is the pair a
                POS leans on hardest.
            </Typography>
        </Stack>
    ),
};

export const Offline: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 720 }}>
            <Alert severity="warning" action={<Button color="inherit" size="small">Details</Button>}>
                Offline — 3 tickets queued. Card payments unavailable; cash and member accounts still work.
            </Alert>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Connectivity is the POS failure mode that matters. The message names what still works, because
                the operator's next question is never "what broke" — it is "can I take this person's money".
            </Typography>
        </Stack>
    ),
};

export const StatusChips: Story = {
    name: "Status chips",
    render: () => (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1.5 }}>
                <Chip label="Paid" color="success" />
                <Chip label="Open" color="info" />
                <Chip label="Partially paid" color="warning" />
                <Chip label="Voided" color="error" />
                <Chip label="Comped" variant="outlined" />
                <Chip label="Queued offline" color="warning" variant="outlined" />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 720 }}>
                Read-only chips sit at 36px rather than the 48dp floor — the floor governs things you tap, and
                forcing a label to 48dp would cost two rows of visible tickets. Tappable chips (filters) do get
                the full 48.
            </Typography>
            <Stack direction="row" spacing={1.5}>
                <Chip label="All tickets" color="primary" onClick={() => {}} />
                <Chip label="Open" onClick={() => {}} />
                <Chip label="Paid" onClick={() => {}} />
            </Stack>
        </Stack>
    ),
};
