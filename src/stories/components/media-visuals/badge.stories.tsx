import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Badge — small counts and state dots layered on an icon.
 *
 * Two POS uses: how many tickets are waiting, and whether the operator's shift
 * is open. Both are glanceable-only — a badge never carries information that
 * exists nowhere else, because it is small enough to miss in a busy pro shop.
 */
const meta = {
    title: "Components/Media & Visuals/Badge",
    component: Badge,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Counts: Story = {
    render: () => (
        <Stack direction="row" spacing={5} sx={{ p: 4, alignItems: "center" }}>
            <Badge badgeContent={4} color="primary">
                <ReceiptLongOutlinedIcon sx={{ fontSize: 32 }} />
            </Badge>
            <Badge badgeContent={12} color="error">
                <NotificationsOutlinedIcon sx={{ fontSize: 32 }} />
            </Badge>
            <Badge badgeContent={128} max={99} color="warning">
                <ShoppingCartOutlinedIcon sx={{ fontSize: 32 }} />
            </Badge>
            <Badge badgeContent={0} showZero color="primary">
                <ReceiptLongOutlinedIcon sx={{ fontSize: 32 }} />
            </Badge>
        </Stack>
    ),
};

export const Dots: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 4 }}>
            <Stack direction="row" spacing={5} sx={{ alignItems: "center" }}>
                <Badge variant="dot" color="success" overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Avatar sx={{ width: 48, height: 48 }}>DK</Avatar>
                </Badge>
                <Badge variant="dot" color="warning" overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <Avatar sx={{ width: 48, height: 48 }}>CM</Avatar>
                </Badge>
                <Badge variant="dot" color="error">
                    <NotificationsOutlinedIcon sx={{ fontSize: 32 }} />
                </Badge>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                On an operator avatar the dot means "shift open", not chat presence — it's what makes a mis-attributed drawer visible at
                close-out.
            </Typography>
        </Stack>
    ),
};

export const OnInteractive: Story = {
    name: "On interactive targets",
    render: () => (
        <Stack spacing={3} sx={{ p: 4 }}>
            <Stack direction="row" spacing={3}>
                <IconButton aria-label="Open tickets — 4 waiting">
                    <Badge badgeContent={4} color="primary">
                        <ReceiptLongOutlinedIcon />
                    </Badge>
                </IconButton>
                <IconButton aria-label="Alerts — 2 unread">
                    <Badge badgeContent={2} color="error">
                        <NotificationsOutlinedIcon />
                    </Badge>
                </IconButton>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                The badge rides *inside* the button, so the 48dp target is unchanged — the count is never its own tap target. Put the number
                in the <code>aria-label</code> too; a badge is invisible to a screen reader otherwise.
            </Typography>
        </Stack>
    ),
};
