import { useState } from "react";

import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { radius, touchTarget } from "@/theme/tokens";

/**
 * Toggle buttons — the POS workhorse for "pick one of a few".
 *
 * On a landscape tablet these beat a Select almost every time: every option is
 * visible and one tap away, with no menu to open, scroll, and dismiss. Reach for
 * a Select only past ~6 options, or when the labels are unpredictable in length.
 */
const meta = {
    title: "Components/Actions/Toggle Button",
    component: ToggleButtonGroup,
    parameters: { layout: "padded" },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const groupSx = { gap: 1 };
const buttonSx = {
    borderRadius: `${radius.md}px !important`,
    border: "1px solid !important",
    borderColor: "divider !important",
    minHeight: touchTarget.comfortable,
    px: 3,
};

export const Exclusive: Story = {
    render: function Render() {
        const [holes, setHoles] = useState("18");

        return (
            <Stack spacing={3} sx={{ p: 3 }}>
                <Typography variant="h6">Holes</Typography>
                <ToggleButtonGroup exclusive value={holes} onChange={(_, next) => next && setHoles(next)} sx={groupSx}>
                    <ToggleButton value="9" sx={buttonSx}>
                        9 holes
                    </ToggleButton>
                    <ToggleButton value="18" sx={buttonSx}>
                        18 holes
                    </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Exclusive: exactly one stays selected. `onChange` fires with `null` when the active button
                    is tapped again — guard it, or the operator can deselect into an invalid state.
                </Typography>
            </Stack>
        );
    },
};

export const Multiple: Story = {
    render: function Render() {
        const [extras, setExtras] = useState(["cart"]);

        return (
            <Stack spacing={3} sx={{ p: 3 }}>
                <Typography variant="h6">Add-ons</Typography>
                <ToggleButtonGroup value={extras} onChange={(_, next) => setExtras(next)} sx={groupSx}>
                    {[
                        { value: "cart", label: "Cart" },
                        { value: "clubs", label: "Club rental" },
                        { value: "range", label: "Range bucket" },
                        { value: "caddie", label: "Caddie" },
                    ].map((option) => (
                        <ToggleButton key={option.value} value={option.value} sx={buttonSx}>
                            {option.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
        );
    },
};

export const WithIcons: Story = {
    name: "With icons",
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <ToggleButtonGroup exclusive value="cart" sx={groupSx}>
                <ToggleButton value="cart" sx={{ ...buttonSx, gap: 1 }}>
                    <DirectionsCarFilledOutlinedIcon />
                    Riding
                </ToggleButton>
                <ToggleButton value="walk" sx={{ ...buttonSx, gap: 1 }}>
                    <DirectionsWalkIcon />
                    Walking
                </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                Keep the text label alongside the icon. An icon-only toggle is ambiguous under time pressure,
                and there is horizontal room to spare on a landscape tablet.
            </Typography>
        </Stack>
    ),
};

/** Sized up for tender selection, where the group is the primary control. */
export const LargeTargets: Story = {
    name: "Large targets",
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <ToggleButtonGroup exclusive value={4} sx={groupSx}>
                {[2, 3, 4, 5, 6].map((count) => (
                    <ToggleButton key={count} value={count} sx={{ ...buttonSx, minWidth: 88, minHeight: 72, fontSize: 22 }}>
                        {count}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Split-by-guest count. 88×72 with an 8px gutter — the same treatment as a tender key.
            </Typography>
        </Stack>
    ),
};
