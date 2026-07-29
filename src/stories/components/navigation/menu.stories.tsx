import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DiscountOutlinedIcon from "@mui/icons-material/DiscountOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Menu — the overflow pattern, and Birdie's answer to "where does everything
 * else go".
 *
 * Note on **Menubar**: MUI documents one, but it is a Base UI recipe rather than
 * a component in `@mui/material`, and a desktop-style menubar is the wrong shape
 * for a POS anyway — it hides everything behind a two-level hover interaction
 * that a finger can't perform. Birdie uses the nav rail for destinations and
 * this overflow Menu for secondary actions instead.
 */
const meta = {
    title: "Components/Navigation/Menu",
    component: Menu,
    parameters: { layout: "padded" },
    args: { open: false },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overflow: Story = {
    render: function Render() {
        const [anchor, setAnchor] = useState<null | HTMLElement>(null);

        return (
            <Box sx={{ p: 3 }}>
                <IconButton aria-label="Ticket actions" onClick={(event) => setAnchor(event.currentTarget)}>
                    <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                    <MenuItem onClick={() => setAnchor(null)}>
                        <ListItemIcon>
                            <PersonAddAltOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText>Attach member</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => setAnchor(null)}>
                        <ListItemIcon>
                            <DiscountOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText>Apply discount</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => setAnchor(null)}>
                        <ListItemIcon>
                            <PrintOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText>Print draft</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => setAnchor(null)} sx={{ color: "error.main" }}>
                        <ListItemIcon>
                            <DeleteOutlineOutlinedIcon sx={{ color: "error.main" }} />
                        </ListItemIcon>
                        <ListItemText>Void ticket</ListItemText>
                    </MenuItem>
                </Menu>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 680 }}>
                    Menu items are 56dp with 20px side padding. The destructive item is separated by a divider
                    and colored — it must never sit flush against a routine action in a list you tap quickly.
                </Typography>
            </Box>
        );
    },
};

export const Selection: Story = {
    render: function Render() {
        const [anchor, setAnchor] = useState<null | HTMLElement>(null);
        const [till, setTill] = useState("Register 2");

        return (
            <Box sx={{ p: 3 }}>
                <Button variant="outlined" size="large" onClick={(event) => setAnchor(event.currentTarget)}>
                    {till}
                </Button>
                <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                    {["Register 1", "Register 2", "Register 3", "Mobile 1"].map((option) => (
                        <MenuItem
                            key={option}
                            selected={option === till}
                            onClick={() => {
                                setTill(option);
                                setAnchor(null);
                            }}
                        >
                            {option}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        );
    },
};

export const Positioning: Story = {
    render: function Render() {
        const [anchor, setAnchor] = useState<null | HTMLElement>(null);

        return (
            <Stack spacing={3} sx={{ p: 3 }}>
                <Box>
                    <Button variant="outlined" size="large" onClick={(event) => setAnchor(event.currentTarget)}>
                        Open above the anchor
                    </Button>
                    <Menu
                        anchorEl={anchor}
                        open={Boolean(anchor)}
                        onClose={() => setAnchor(null)}
                        anchorOrigin={{ vertical: "top", horizontal: "left" }}
                        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                        {["Cash", "Card", "Member account", "Gift card"].map((option) => (
                            <MenuItem key={option} onClick={() => setAnchor(null)}>
                                {option}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                    For controls near the bottom of the canvas, open the menu upward. A menu that drops down
                    from the action bar lands under the operator's own hand.
                </Typography>
            </Stack>
        );
    },
};
