import { useState } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthLockLayout } from "@/components/auth/auth-layout";
import { PinPad, PinPrompt } from "@/components/auth/pin-pad";
import { operators } from "@/data/pos-data";

/**
 * PIN unlock — the flow staff actually use, dozens of times a day.
 *
 * A POS tablet is shared and physically exposed: it sits on a counter with
 * guests on the other side. Locking on idle and unlocking with a 4-digit PIN is
 * the only sign-in model that survives that, because it takes about a second and
 * is shoulder-surf resistant in a way a typed password is not.
 */
const meta = {
    title: "Sign in ∕ Sign up/PIN Unlock",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live pad so the interaction can actually be felt in the story. */
const InteractivePad = () => {
    const [pin, setPin] = useState("");

    return (
        <PinPad
            length={pin.length}
            onDigit={(digit) => setPin((current) => (current.length < 4 ? current + digit : current))}
            onBackspace={() => setPin((current) => current.slice(0, -1))}
        />
    );
};

export const Default: Story = {
    render: () => (
        <AuthLockLayout>
            <Stack spacing={4} sx={{ alignItems: "center" }}>
                <Stack spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar sx={{ width: 72, height: 72, bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontSize: 26, fontWeight: 600 }}>DK</Avatar>
                    <PinPrompt title="Dana Kim" hint="Enter your 4-digit PIN" />
                </Stack>
                <InteractivePad />
                <Button variant="text" sx={{ color: "rgba(255,255,255,0.75)" }}>
                    Switch operator
                </Button>
            </Stack>
        </AuthLockLayout>
    ),
};

export const IncorrectPin: Story = {
    name: "Incorrect PIN",
    render: () => (
        <AuthLockLayout>
            <Stack spacing={4} sx={{ alignItems: "center" }}>
                <Stack spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar sx={{ width: 72, height: 72, bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontSize: 26, fontWeight: 600 }}>DK</Avatar>
                    <PinPrompt title="Dana Kim" hint="Incorrect PIN — 2 attempts remaining" isError />
                </Stack>
                <PinPad length={4} isError />
                <Button variant="text" sx={{ color: "rgba(255,255,255,0.75)" }}>
                    Switch operator
                </Button>
            </Stack>
        </AuthLockLayout>
    ),
};

/**
 * Lockout names the manager who can clear it. An operator staring at a locked
 * till with a queue forming needs a next step, not just a refusal.
 */
export const LockedOut: Story = {
    name: "Locked out",
    render: () => (
        <AuthLockLayout>
            <Stack spacing={4} sx={{ alignItems: "center", maxWidth: 460, textAlign: "center" }}>
                <Stack spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar sx={{ width: 72, height: 72, bgcolor: "rgba(244,105,95,0.2)", color: "#f4695f", fontSize: 26, fontWeight: 600 }}>DK</Avatar>
                    <PinPrompt title="Too many attempts" hint="This PIN is locked for 5 minutes." isError />
                </Stack>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.72)" }}>
                    A shift lead can clear the lock from Settings → Employees, or you can sign in with another
                    operator's PIN to keep the line moving.
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" size="large" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
                        Switch operator
                    </Button>
                    <Button size="large">Manager override</Button>
                </Stack>
            </Stack>
        </AuthLockLayout>
    ),
};

/** Picking who is taking the till. Rows are 88px — this is a glance-and-tap. */
export const SwitchOperator: Story = {
    name: "Switch operator",
    render: () => (
        <AuthLockLayout>
            <Stack spacing={3} sx={{ alignItems: "center", width: "100%", maxWidth: 560 }}>
                <PinPrompt title="Who's taking this till?" />
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, width: "100%" }}>
                    {operators.map((operator) => (
                        <Button
                            key={operator.id}
                            variant="outlined"
                            sx={{
                                minHeight: 88,
                                justifyContent: "flex-start",
                                gap: 2,
                                px: 2.5,
                                color: "#fff",
                                borderColor: "rgba(255,255,255,0.3)",
                                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                            }}
                        >
                            <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 17 }}>
                                {operator.initials}
                            </Avatar>
                            <Stack spacing={0} sx={{ alignItems: "flex-start" }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {operator.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                                    {operator.role}
                                </Typography>
                            </Stack>
                        </Button>
                    ))}
                </Box>
            </Stack>
        </AuthLockLayout>
    ),
};
