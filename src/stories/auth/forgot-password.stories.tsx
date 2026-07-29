import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthLayout } from "@/components/auth/auth-layout";
import { FeatureMark } from "@/components/auth/feature-mark";

/**
 * Password recovery for the terminal account.
 *
 * Worth noting what this flow is *not* for: a forgotten operator PIN never comes
 * here. That is cleared by a shift lead on the spot, because a staff member
 * locked out mid-rush cannot wait on an email round-trip.
 */
const meta = {
    title: "Sign in ∕ Sign up/Forgot password",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const BackToSignIn = (
    <Button variant="text" startIcon={<ArrowBackIcon />} color="primary">
        Back to sign in
    </Button>
);

export const Request: Story = {
    render: () => (
        <AuthLayout title="Reset password" subtitle="We'll email a reset link to the terminal's account owner." footer={BackToSignIn}>
            <Stack spacing={3}>
                <TextField label="Work email" placeholder="you@sagamore.golf" slotProps={{ htmlInput: { inputMode: "email" } }} />
                <Button size="large" sx={{ minHeight: 64 }}>
                    Send reset link
                </Button>
                <Alert severity="info">
                    Locked out of a <strong>PIN</strong> instead? Ask a shift lead to clear it from Settings → Employees — no email needed.
                </Alert>
            </Stack>
        </AuthLayout>
    ),
};

export const CheckEmail: Story = {
    name: "Check email",
    render: () => (
        <AuthLayout
            title="Check your email"
            subtitle={
                <>
                    We sent a reset link to <strong>dana.kim@sagamore.golf</strong>. It expires in 30 minutes.
                </>
            }
            footer={BackToSignIn}
        >
            <Stack spacing={3}>
                <FeatureMark icon={MarkEmailReadOutlinedIcon} />
                <Button variant="outlined" size="large">
                    Resend email
                </Button>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Wrong address, or no longer have access to it? Any shift lead with admin rights can move the terminal to a new account.
                </Typography>
            </Stack>
        </AuthLayout>
    ),
};

export const SetNewPassword: Story = {
    name: "Set new password",
    render: () => (
        <AuthLayout
            title="Set a new password"
            subtitle="At least 12 characters. This unlocks the terminal, not the till."
            footer={BackToSignIn}
        >
            <Stack spacing={3}>
                <TextField
                    label="New password"
                    type="password"
                    defaultValue="••••••••••••••"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlinedIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Stack spacing={1}>
                    <LinearProgress variant="determinate" value={80} color="success" sx={{ height: 8, borderRadius: 999 }} />
                    <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                        Strong
                    </Typography>
                </Stack>

                <TextField label="Confirm password" type="password" defaultValue="••••••••••••••" />

                <Button size="large" sx={{ minHeight: 64 }}>
                    Set password
                </Button>
            </Stack>
        </AuthLayout>
    ),
};

export const PasswordReset: Story = {
    name: "Password reset",
    render: () => (
        <AuthLayout title="Password updated" subtitle="All four Sagamore terminals were signed out and will need re-enrolling.">
            <Stack spacing={3}>
                <FeatureMark icon={CheckCircleOutlinedIcon} color="success" />
                <Button size="large" sx={{ minHeight: 64 }}>
                    Sign in
                </Button>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "warning.main",
                        bgcolor: "warning.light",
                        color: "warning.dark",
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Open tickets were preserved. Nothing in the queue was lost — 6 tickets are waiting on Register 2.
                    </Typography>
                </Box>
            </Stack>
        </AuthLayout>
    ),
};
