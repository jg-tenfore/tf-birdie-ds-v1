import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * PIN sign-in — the first screen of the shipping app.
 *
 * Transcribed from `references/072926/pin.png`. Worth noting how spare it is:
 * a full-bleed navy field, the Tenfore Golf mark, one text input and one green
 * SIGN IN button, both about 690px wide and centered. There is no on-screen
 * keypad, no operator picker, and no "forgot PIN" affordance — the PIN is typed
 * on the Android soft keyboard.
 */
const meta = {
    title: "Sign in ∕ Sign up/PIN Sign In",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Tenfore Golf lockup: antler roundel over "TENFORE" / "GOLF". */
const TenforeGolfMark = () => (
    <Stack sx={{ alignItems: "center", gap: 1.5 }}>
        <Box component="svg" viewBox="0 0 64 60" sx={{ width: 82, height: 77 }} aria-hidden>
            <circle cx="32" cy="30" r="28" fill="none" stroke={appColors.green} strokeWidth="2.4" />
            {/* Simplified antler-and-head mark matching the app's roundel. */}
            <path
                d="M32 44c-5 0-9-3.6-9-8.4 0-3 1.4-5 1.4-7.6 0-2-1-3.2-2.6-4.2-2.4-1.5-4-3-4.8-5.6M32 44c5 0 9-3.6 9-8.4 0-3-1.4-5-1.4-7.6 0-2 1-3.2 2.6-4.2 2.4-1.5 4-3 4.8-5.6"
                fill="none"
                stroke={appColors.green}
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            <path
                d="M21 18.2c-1.8-.6-3.4-.2-4.6.8M47 18.2c1.8-.6 3.4-.2 4.6.8M26 24c-1.6-1.4-2.2-3.4-2-5.4M38 24c1.6-1.4 2.2-3.4 2-5.4"
                fill="none"
                stroke={appColors.green}
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <path d="M32 30v10" fill="none" stroke={appColors.green} strokeWidth="2.4" strokeLinecap="round" />
        </Box>

        <Typography sx={{ color: "#fff", fontSize: 21, letterSpacing: "0.42em", pl: "0.42em", fontWeight: 400 }}>TENFORE</Typography>
        <Typography sx={{ color: appColors.green, fontSize: 11, letterSpacing: "0.5em", pl: "0.5em" }}>GOLF</Typography>
    </Stack>
);

const SignInScreen = ({ value = "" }: { value?: string }) => (
    <Box
        sx={{
            height: "100vh",
            bgcolor: appColors.navy,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
        }}
    >
        <TenforeGolfMark />

        <Stack sx={{ width: 690, gap: 3 }}>
            {/* Light grey filled field, square corners, centered placeholder. */}
            <InputBase
                value={value}
                placeholder="Enter your PIN"
                type={value ? "password" : "text"}
                readOnly
                inputProps={{ "aria-label": "Enter your PIN", inputMode: "numeric", style: { textAlign: "center" } }}
                sx={{
                    bgcolor: "#E4E4E4",
                    borderRadius: `${appRadius.tile}px`,
                    height: 88,
                    px: 3,
                    fontSize: 24,
                    color: appColors.textPrimary,
                    "& input::placeholder": { color: "#6E6E6E", opacity: 1 },
                }}
            />

            <Button
                disableElevation
                sx={{
                    height: 100,
                    bgcolor: appColors.green,
                    color: "#fff",
                    fontSize: 15,
                    letterSpacing: "0.09em",
                    borderRadius: `${appRadius.tile}px`,
                    "&:hover": { bgcolor: appColors.greenDark },
                }}
            >
                Sign in
            </Button>
        </Stack>
    </Box>
);

export const Default: Story = {
    render: () => <SignInScreen />,
};

export const PinEntered: Story = {
    name: "PIN entered",
    render: () => <SignInScreen value="4821" />,
};
