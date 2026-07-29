import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fontFamily } from "@/theme/tokens";

/**
 * Progress indicators.
 *
 * The POS rule is about *which* one: determinate whenever the total is known
 * (syncing 12 tickets), indeterminate only when it genuinely isn't (waiting on a
 * card reader). A fake progress bar that crawls to 90% and stops is worse than a
 * spinner, because the operator plans around it.
 */
const meta = {
    title: "Components/Feedback & Status/Progress",
    component: LinearProgress,
    parameters: { layout: "padded" },
} satisfies Meta<typeof LinearProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Linear: Story = {
    render: () => (
        <Stack spacing={4} sx={{ p: 3, maxWidth: 560 }}>
            <Stack spacing={1}>
                <Typography variant="subtitle2">Indeterminate</Typography>
                <LinearProgress />
            </Stack>
            <Stack spacing={1}>
                <Typography variant="subtitle2">Determinate — 68%</Typography>
                <LinearProgress variant="determinate" value={68} />
            </Stack>
            <Stack spacing={1}>
                <Typography variant="subtitle2">Buffer</Typography>
                <LinearProgress variant="buffer" value={48} valueBuffer={72} />
            </Stack>
            <Stack spacing={1}>
                <Typography variant="subtitle2">Thick — better at arm's length</Typography>
                <LinearProgress variant="determinate" value={68} sx={{ height: 10, borderRadius: 999 }} />
            </Stack>
        </Stack>
    ),
};

export const Circular: Story = {
    render: () => (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Stack direction="row" spacing={4} sx={{ alignItems: "center" }}>
                <CircularProgress size={24} />
                <CircularProgress size={40} />
                <CircularProgress size={64} />
                <CircularProgress variant="determinate" value={72} size={64} thickness={5} />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                40px is the minimum readable size at counter distance. The 24px variant is for inline use beside text only.
            </Typography>
        </Stack>
    ),
};

/** A labeled determinate bar — what a sync should actually look like. */
export const WithLabel: Story = {
    name: "With label",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 560 }}>
            <Box sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Syncing queued tickets
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: fontFamily.mono, color: "text.secondary" }}>
                            8 / 12
                        </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={66} sx={{ height: 10, borderRadius: 999 }} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Back online · about 20 seconds remaining
                    </Typography>
                </Stack>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Count and time remaining, not just a bar. The operator's real question is "can I take the next payment yet", and only the
                numbers answer it.
            </Typography>
        </Stack>
    ),
};

export const InlineInButton: Story = {
    name: "Inline in button",
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 640 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                MUI v9's <code>Button</code> has a built-in <code>loading</code> prop — the old <code>LoadingButton</code> from{" "}
                <code>@mui/lab</code> is gone. Keep the label visible with <code>loadingIndicator</code> so the button doesn't change width
                mid-transaction and shift the action bar under the operator's thumb.
            </Typography>
        </Stack>
    ),
};
