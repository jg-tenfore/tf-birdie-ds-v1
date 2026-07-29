import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";

/**
 * Transfer List.
 *
 * MUI ships this as a *pattern* rather than a component — you compose it from
 * List, Checkbox, and Buttons. It's a genuinely good fit for landscape: two
 * full-height panes side by side is a layout a phone can't do at all.
 *
 * Used in Birdie for back-office assignment (which items route to which printer,
 * which employees are on a shift). Never in a selling flow — it's a
 * considered, two-handed interaction.
 */
const meta = {
    title: "Components/Forms/Transfer List",
    parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TransferPane = ({
    title,
    items,
    checked,
    onToggle,
}: {
    title: string;
    items: string[];
    checked: string[];
    onToggle: (item: string) => void;
}) => (
    <Paper variant="outlined" sx={{ width: 300, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {checked.length} of {items.length} selected
            </Typography>
        </Box>
        <Divider />
        <List sx={{ height: 300, overflowY: "auto" }} dense={false}>
            {items.map((item) => (
                <ListItemButton key={item} onClick={() => onToggle(item)} sx={{ minHeight: touchTarget.comfortable }}>
                    <ListItemIcon>
                        <Checkbox checked={checked.includes(item)} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                </ListItemButton>
            ))}
            {items.length === 0 && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Nothing here yet
                    </Typography>
                </Box>
            )}
        </List>
    </Paper>
);

export const PrinterRouting: Story = {
    name: "Printer routing",
    render: function Render() {
        const [left, setLeft] = useState(["Hot dog", "Cheeseburger", "Turkey club", "Chicken wrap", "Coffee"]);
        const [right, setRight] = useState(["Draft beer", "Bottled beer", "Fountain soda"]);
        const [checked, setChecked] = useState<string[]>([]);

        const toggle = (item: string) =>
            setChecked((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));

        const moveRight = () => {
            const moving = left.filter((item) => checked.includes(item));
            setLeft((current) => current.filter((item) => !checked.includes(item)));
            setRight((current) => [...current, ...moving]);
            setChecked((current) => current.filter((item) => !moving.includes(item)));
        };

        const moveLeft = () => {
            const moving = right.filter((item) => checked.includes(item));
            setRight((current) => current.filter((item) => !checked.includes(item)));
            setLeft((current) => [...current, ...moving]);
            setChecked((current) => current.filter((item) => !moving.includes(item)));
        };

        const leftChecked = left.filter((item) => checked.includes(item));
        const rightChecked = right.filter((item) => checked.includes(item));

        return (
            <Stack spacing={3} sx={{ p: 3 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h5">Kitchen printer routing</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Items on the right print a ticket at the bar instead of the kitchen.
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <TransferPane title="Kitchen" items={left} checked={checked} onToggle={toggle} />

                    <Stack spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={moveRight}
                            disabled={leftChecked.length === 0}
                            aria-label="Move selected to bar"
                            sx={{ minWidth: touchTarget.comfortable, minHeight: touchTarget.comfortable, px: 0 }}
                        >
                            <ChevronRightIcon />
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={moveLeft}
                            disabled={rightChecked.length === 0}
                            aria-label="Move selected to kitchen"
                            sx={{ minWidth: touchTarget.comfortable, minHeight: touchTarget.comfortable, px: 0 }}
                        >
                            <ChevronLeftIcon />
                        </Button>
                    </Stack>

                    <TransferPane title="Bar" items={right} checked={checked} onToggle={toggle} />
                </Stack>

                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 720 }}>
                    The transfer buttons are 56×56 with real icons and <code>aria-label</code>s — MUI's own
                    demo uses tiny <code>&gt;</code> and <code>&lt;</code> glyphs that are impossible to hit
                    and unreadable to a screen reader.
                </Typography>
            </Stack>
        );
    },
};
