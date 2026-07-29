import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { brand } from "@/theme/tokens";

/**
 * Avatars identify two very different people in this product: the *operator*
 * signed into the till, and the *member* being served. They are sized
 * differently on purpose — see below.
 */
const meta = {
    title: "Components/Media & Visuals/Avatar",
    component: Avatar,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                {[
                    { size: 32, label: "32 — table rows" },
                    { size: 40, label: "40 — list items" },
                    { size: 48, label: "48 — app bar (operator)" },
                    { size: 64, label: "64 — member lookup results" },
                    { size: 96, label: "96 — member profile" },
                ].map(({ size, label }) => (
                    <Stack key={size} spacing={1} sx={{ alignItems: "center" }}>
                        <Avatar sx={{ width: size, height: size, bgcolor: brand[600], fontSize: size / 2.6 }}>JE</Avatar>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 720 }}>
                Member avatars run larger than operator avatars. The operator knows who they are; the point of a member avatar is
                face-matching the person standing at the counter, and that needs pixels.
            </Typography>
        </Stack>
    ),
};

export const InContext: Story = {
    name: "In context",
    render: () => (
        <Stack spacing={4} sx={{ p: 3, maxWidth: 640 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Operator — app bar</Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Badge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} variant="dot" color="success">
                        <Avatar sx={{ width: 48, height: 48, bgcolor: brand[600] }}>DK</Avatar>
                    </Badge>
                    <Stack spacing={0}>
                        <Typography variant="subtitle2">Dana Kim</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Register 2 · Signed in 9:04 AM
                        </Typography>
                    </Stack>
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    The dot is a shift indicator, not a chat presence — it answers "is this till open under my name?", which matters at
                    close-out when the drawer has to reconcile to a person.
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Member — lookup result</Typography>
                <Stack spacing={1}>
                    {[
                        { initials: "JE", name: "Jordan Ellis", meta: "Eagle · TF-40912 · Balance $124.00" },
                        { initials: "RP", name: "Riley Park", meta: "Par · TF-38220 · Balance $0.00" },
                    ].map((member) => (
                        <Box
                            key={member.name}
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                                p: 1.5,
                                minHeight: 64,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Avatar sx={{ width: 56, height: 56, bgcolor: "grey.300", color: "grey.800", fontWeight: 600 }}>
                                {member.initials}
                            </Avatar>
                            <Stack spacing={0.25}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {member.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {member.meta}
                                </Typography>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Stack>
    ),
};
