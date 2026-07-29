import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthLayout } from "@/components/auth/auth-layout";
import { PinPad } from "@/components/auth/pin-pad";

/**
 * Staff account creation, run by a shift lead adding someone to the roster.
 *
 * The two-column field pairing is the landscape payoff: name and role sit side
 * by side instead of stacking, which keeps the whole form above the fold even
 * with the Android keyboard open.
 */
const meta = {
    title: "Sign in ∕ Sign up/Sign up",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TwoUp = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>{children}</Box>
);

export const Default: Story = {
    render: () => (
        <AuthLayout
            title="Add an employee"
            subtitle="They'll set their own PIN the first time they take a till."
            width={520}
            footer={
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Already on the roster?{" "}
                    <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
                        Manage employees
                    </Box>
                </Typography>
            }
        >
            <Stack spacing={3}>
                <TwoUp>
                    <TextField label="First name" defaultValue="Ana" />
                    <TextField label="Last name" defaultValue="Silva" />
                </TwoUp>

                <TextField label="Work email" placeholder="ana.silva@sagamore.golf" slotProps={{ htmlInput: { inputMode: "email" } }} />

                <TwoUp>
                    <TextField select label="Role" defaultValue="snack">
                        {[
                            { value: "lead", label: "Shift lead" },
                            { value: "proshop", label: "Pro shop" },
                            { value: "snack", label: "Snack bar" },
                            { value: "cart", label: "Beverage cart" },
                        ].map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select label="Default till" defaultValue="r3">
                        {[
                            { value: "r1", label: "Register 1" },
                            { value: "r2", label: "Register 2" },
                            { value: "r3", label: "Register 3" },
                            { value: "m1", label: "Mobile 1" },
                        ].map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </TwoUp>

                <Stack spacing={1}>
                    <FormControlLabel control={<Checkbox defaultChecked />} label="Can process refunds and voids" />
                    <FormControlLabel control={<Checkbox />} label="Can open and close the register" />
                    <FormControlLabel control={<Checkbox />} label="Can apply comps and discounts" />
                </Stack>

                <Button size="large" sx={{ minHeight: 64 }}>
                    Add employee
                </Button>
            </Stack>
        </AuthLayout>
    ),
};

/** Step two, on the employee's first shift: they choose a PIN on the terminal. */
export const SetPin: Story = {
    name: "Set PIN",
    render: () => (
        <AuthLayout title="Choose a PIN" subtitle="Ana — you'll use this to unlock the till. Don't reuse your phone passcode." width={420}>
            <Stack spacing={4} sx={{ alignItems: "center" }}>
                <PinPad length={2} tone="onLight" />
                <Alert severity="info" sx={{ width: "100%" }}>
                    Avoid 1234, 0000, and your birth year — the till is in public view.
                </Alert>
            </Stack>
        </AuthLayout>
    ),
};

export const Creating: Story = {
    render: () => (
        <AuthLayout title="Adding Ana Silva" subtitle="Setting up permissions and syncing to the other terminals." width={420}>
            <Stack spacing={3}>
                <LinearProgress />
                <Stack spacing={1.5}>
                    {["Account created", "Permissions applied", "Syncing to 3 terminals"].map((step, i) => (
                        <Stack key={step} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <CheckCircleOutlinedIcon sx={{ color: i < 2 ? "success.main" : "text.disabled" }} />
                            <Typography variant="body1" sx={{ color: i < 2 ? "text.primary" : "text.secondary" }}>
                                {step}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Stack>
        </AuthLayout>
    ),
};
