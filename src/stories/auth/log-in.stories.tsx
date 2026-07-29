import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthLayout } from "@/components/auth/auth-layout";

/**
 * Terminal sign-in — the *manager* flow, run once when a tablet is set up or
 * after a full sign-out. It is deliberately not the flow staff use during a
 * shift; that is PIN Unlock, and separating the two is the whole point.
 *
 * Typing an email and password on a tablet at a counter is slow and error-prone,
 * so this screen is designed to be rare.
 */
const meta = {
    title: "Sign in ∕ Sign up/Log in",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const LogInForm = ({ error }: { error?: boolean }) => (
    <Stack spacing={3}>
        {error && <Alert severity="error">Email or password is incorrect. 2 attempts remaining.</Alert>}

        <TextField
            label="Work email"
            defaultValue={error ? "dana.kim@sagamore.golf" : ""}
            placeholder="you@sagamore.golf"
            error={error}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <MailOutlinedIcon />
                        </InputAdornment>
                    ),
                },
                htmlInput: { inputMode: "email", autoComplete: "username" },
            }}
        />

        <TextField
            label="Password"
            type="password"
            defaultValue={error ? "••••••••" : ""}
            error={error}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockOutlinedIcon />
                        </InputAdornment>
                    ),
                },
                htmlInput: { autoComplete: "current-password" },
            }}
        />

        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
            {/* "Keep this terminal signed in" rather than "Remember me": the
                tablet is shared, so the thing being remembered is the device
                enrollment, not a person. */}
            <FormControlLabel control={<Checkbox defaultChecked />} label="Keep this terminal signed in" />
            <Button variant="text" color="primary">
                Forgot password
            </Button>
        </Stack>

        <Button size="large" sx={{ minHeight: 64 }}>
            Sign in
        </Button>

        <Divider>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                or
            </Typography>
        </Divider>

        <Button variant="outlined" size="large">
            Use terminal enrollment code
        </Button>
    </Stack>
);

export const Default: Story = {
    render: () => (
        <AuthLayout title="Sign in" subtitle="Enroll this terminal to Sagamore Golf Club.">
            <LogInForm />
        </AuthLayout>
    ),
};

export const Error: Story = {
    render: () => (
        <AuthLayout title="Sign in" subtitle="Enroll this terminal to Sagamore Golf Club.">
            <LogInForm error />
        </AuthLayout>
    ),
};

/**
 * A terminal that has been enrolled before skips the password entirely and goes
 * straight to picking an operator — the state staff should see 99% of the time.
 */
export const KnownTerminal: Story = {
    name: "Known terminal",
    render: () => (
        <AuthLayout
            title="Welcome back"
            subtitle="Terminal SGM-02 is enrolled. Choose an operator to start a shift."
            footer={
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Not this club?{" "}
                    <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
                        Sign out of terminal
                    </Box>
                </Typography>
            }
        >
            <Stack spacing={2}>
                {[
                    { name: "Dana Kim", role: "Shift lead · Register 2" },
                    { name: "Chris Moreno", role: "Pro shop · Register 1" },
                    { name: "Ana Silva", role: "Snack bar · Register 3" },
                ].map((operator) => (
                    <Button
                        key={operator.name}
                        variant="outlined"
                        size="large"
                        sx={{ minHeight: 72, justifyContent: "flex-start", px: 3, textAlign: "left" }}
                    >
                        <Stack spacing={0}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {operator.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {operator.role}
                            </Typography>
                        </Stack>
                    </Button>
                ))}
            </Stack>
        </AuthLayout>
    ),
};
