import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { members, money } from "@/data/pos-data";
import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * List — the master pane, the settings pane, and the menu.
 *
 * `ListItemButton` is floored at 56dp by the theme, which is what makes a list
 * usable with a finger. The one thing to watch: a row with a secondary action
 * (an overflow menu, a switch) has two nested targets, and they need real
 * separation or the operator hits the wrong one.
 */
const meta = {
    title: "Components/Layout & Structure/List",
    component: List,
    parameters: { layout: "padded" },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
    render: () => (
        <Box sx={{ p: 3, maxWidth: 380 }}>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List>
                    {[
                        { label: "Terminal", hint: "SGM-02 · Register 2", Icon: PointOfSaleOutlinedIcon },
                        { label: "Hardware", hint: "Printer, reader, drawer", Icon: PrintOutlinedIcon },
                        { label: "Receipts", hint: "Print & email", Icon: ReceiptLongOutlinedIcon },
                    ].map((item, i) => (
                        <ListItemButton key={item.label} selected={i === 1}>
                            <ListItemIcon>
                                <item.Icon />
                            </ListItemIcon>
                            <ListItemText primary={item.label} secondary={item.hint} />
                        </ListItemButton>
                    ))}
                </List>
            </Paper>
        </Box>
    ),
};

export const WithAvatars: Story = {
    name: "With avatars",
    render: () => (
        <Box sx={{ p: 3, maxWidth: 520 }}>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List disablePadding>
                    {members.slice(0, 5).map((member, i, arr) => (
                        <Box key={member.id}>
                            <ListItemButton sx={{ minHeight: 72 }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ width: 44, height: 44, bgcolor: "grey.300", color: "grey.800", fontSize: 15, fontWeight: 600 }}>
                                        {member.initials}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={member.name} secondary={`${member.tier} · ${member.number}`} />
                                <Typography variant="body2" sx={{ fontFamily: fontFamily.mono, color: "text.secondary" }}>
                                    {money(member.credit)}
                                </Typography>
                            </ListItemButton>
                            {i < arr.length - 1 && <Divider component="li" />}
                        </Box>
                    ))}
                </List>
            </Paper>
        </Box>
    ),
};

export const WithSecondaryActions: Story = {
    name: "With secondary actions",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 520 }}>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List>
                    {["Auto-print on close", "Print merchant copy", "Open drawer on cash"].map((label, i) => (
                        <ListItem
                            key={label}
                            secondaryAction={<Switch defaultChecked={i !== 1} />}
                            sx={{ minHeight: touchTarget.large }}
                        >
                            <ListItemText primary={label} />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List>
                    {["Green fee — 18", "Cart — 18", "Range bucket — L"].map((label) => (
                        <ListItem
                            key={label}
                            disablePadding
                            secondaryAction={
                                <IconButton edge="end" aria-label={`Options for ${label}`}>
                                    <MoreVertIcon />
                                </IconButton>
                            }
                        >
                            <ListItemButton>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                The overflow button sits outside the `ListItemButton`, so tapping the row and tapping the menu
                are genuinely separate targets rather than nested ones.
            </Typography>
        </Stack>
    ),
};

export const WithSelection: Story = {
    name: "With selection",
    render: () => (
        <Box sx={{ p: 3, maxWidth: 520 }}>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List subheader={<ListSubheader>Select items to void</ListSubheader>}>
                    {["Green fee — 18 ×4", "Cart — 18 ×2", "Range bucket — L", "Draft beer ×2"].map((label, i) => (
                        <ListItemButton key={label} sx={{ minHeight: touchTarget.large }}>
                            <ListItemIcon>
                                <Checkbox edge="start" defaultChecked={i < 2} disableRipple />
                            </ListItemIcon>
                            <ListItemText primary={label} />
                        </ListItemButton>
                    ))}
                </List>
            </Paper>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
                Tapping anywhere in the row toggles the checkbox — the whole 64dp row is the target, not the
                24px glyph.
            </Typography>
        </Box>
    ),
};
