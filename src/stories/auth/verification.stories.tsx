import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthLayout } from "@/components/auth/auth-layout";
import { FeatureMark } from "@/components/auth/feature-mark";
import { fontFamily, radius, touchTarget } from "@/theme/tokens";

/**
 * Terminal verification — the 6-digit code that enrolls a tablet to the club.
 *
 * The code boxes are 72×80: big enough to read across a pro shop counter and
 * big enough that a mis-tap between boxes is impossible. On a tablet the code
 * usually arrives on someone's phone and gets typed in by hand, so legibility of
 * *what has already been entered* matters more than entry speed.
 */
const meta = {
    title: "Sign in ∕ Sign up/Verification",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const CodeBoxes = ({ value, isError }: { value: string; isError?: boolean }) => (
    <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between" }}>
        {Array.from({ length: 6 }).map((_, i) => {
            const digit = value[i];
            const isActive = i === value.length;

            return (
                <Box
                    key={i}
                    sx={{
                        width: 72,
                        height: 80,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: `${radius.md}px`,
                        border: "2px solid",
                        borderColor: isError ? "error.main" : isActive ? "primary.main" : digit ? "primary.light" : "divider",
                        bgcolor: "background.paper",
                        fontFamily: fontFamily.mono,
                        fontSize: 34,
                        fontWeight: 500,
                        color: isError ? "error.main" : "text.primary",
                    }}
                >
                    {digit ?? ""}
                </Box>
            );
        })}
    </Stack>
);

export const CodeEntry: Story = {
    name: "Code entry",
    render: () => (
        <AuthLayout
            title="Enter verification code"
            subtitle={
                <>
                    We sent a 6-digit code to <strong>dana.kim@sagamore.golf</strong>.
                </>
            }
            width={520}
        >
            <Stack spacing={3}>
                <CodeBoxes value="493" />
                <Button size="large" sx={{ minHeight: touchTarget.critical }}>
                    Verify terminal
                </Button>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Didn't get it?
                    </Typography>
                    <Button variant="text" color="primary">
                        Resend in 0:42
                    </Button>
                </Stack>
            </Stack>
        </AuthLayout>
    ),
};

export const InvalidCode: Story = {
    name: "Invalid code",
    render: () => (
        <AuthLayout title="Enter verification code" subtitle="That code didn't match. Check it and try again." width={520}>
            <Stack spacing={3}>
                <CodeBoxes value="493822" isError />
                <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>
                    Incorrect or expired code — codes are good for 10 minutes.
                </Typography>
                <Button size="large" sx={{ minHeight: touchTarget.critical }}>
                    Verify terminal
                </Button>
                <Button variant="outlined" size="large">
                    Send a new code
                </Button>
            </Stack>
        </AuthLayout>
    ),
};

export const EmailVerification: Story = {
    name: "Email verification",
    render: () => (
        <AuthLayout title="Verify this terminal" subtitle="A one-time code keeps an unenrolled tablet from taking payments.">
            <Stack spacing={3}>
                <FeatureMark icon={ShieldOutlinedIcon} />
                <Button size="large" sx={{ minHeight: 64 }}>
                    Send code
                </Button>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Terminal SGM-02 · Last enrolled Mar 14 by Morgan Vale
                </Typography>
            </Stack>
        </AuthLayout>
    ),
};

export const Success: Story = {
    render: () => (
        <AuthLayout title="Terminal verified" subtitle="SGM-02 is enrolled to Sagamore Golf Club and ready to take payments.">
            <Stack spacing={3}>
                <FeatureMark icon={CheckCircleOutlinedIcon} color="success" />
                <Button size="large" sx={{ minHeight: touchTarget.critical }}>
                    Start a shift
                </Button>
            </Stack>
        </AuthLayout>
    ),
};
