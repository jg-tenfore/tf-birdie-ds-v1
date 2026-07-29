import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";

/**
 * Buttons, as tuned for Birdie.
 *
 * Defaults differ from stock MUI in three ways, all set in `birdie-theme.ts`:
 * `contained` is the default variant, elevation is off, and the minimum height
 * is 56dp rather than 36px.
 */
const meta = {
    title: "Components/Actions/Button",
    component: Button,
    parameters: { layout: "centered" },
    argTypes: {
        variant: { control: "inline-radio", options: ["contained", "outlined", "text"] },
        color: { control: "select", options: ["primary", "secondary", "success", "warning", "error", "info"] },
        size: { control: "inline-radio", options: ["small", "medium", "large"] },
        disabled: { control: "boolean" },
    },
    args: { children: "Add to order", variant: "contained", color: "primary", size: "medium", disabled: false },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Button variant="contained">Contained</Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="text">Text</Button>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                One contained button per view. It is the answer to "what do I do next?" — a screen with three contained buttons has no
                answer.
            </Typography>
        </Stack>
    ),
};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Button size="small">Small — {touchTarget.min}dp</Button>
                <Button size="medium">Medium — {touchTarget.comfortable}dp</Button>
                <Button size="large">Large — {touchTarget.large}dp</Button>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                Even `small` clears the 48dp Android floor. There is no smaller size, by design — a 36px button is a desktop artifact.
            </Typography>
        </Stack>
    ),
};

export const PosActions: Story = {
    name: "POS actions",
    parameters: { layout: "padded" },
    render: () => (
        <Stack spacing={4} sx={{ p: 3, maxWidth: 720 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Primary commit</Typography>
                <Button size="large" startIcon={<CreditCardOutlinedIcon />} sx={{ minHeight: touchTarget.critical, fontSize: 20 }}>
                    Charge $248.00
                </Button>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {touchTarget.critical}dp and always in the action bar, in the same place on every screen. It carries the amount because
                    the operator confirms the number, not the verb.
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Destructive</Typography>
                <Stack direction="row" spacing={`${touchTarget.minGap}px`}>
                    <Button color="error" variant="outlined" size="large">
                        Void ticket
                    </Button>
                    <Button color="error" variant="outlined" size="large">
                        Refund
                    </Button>
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Outlined, not contained — a filled red button next to a filled green one is a coin flip at a glance. Both always confirm
                    in a dialog.
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Repeated / eyes-off</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: `${touchTarget.minGap}px`, maxWidth: 420 }}>
                    {["Green fee", "Cart", "Range", "Beer", "Soda", "Snack"].map((label) => (
                        <Button key={label} variant="outlined" startIcon={<AddIcon />} sx={{ minHeight: touchTarget.large }}>
                            {label}
                        </Button>
                    ))}
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Quick-add tiles at {touchTarget.large}dp with an {touchTarget.minGap}px gutter. These get hit hundreds of times a shift
                    without the operator looking down.
                </Typography>
            </Stack>
        </Stack>
    ),
};
