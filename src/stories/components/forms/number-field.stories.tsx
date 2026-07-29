import { useState } from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fontFamily, radius, touchTarget } from "@/theme/tokens";

/**
 * Number Field.
 *
 * Note: **Material UI does not ship a number field.** The MUI docs page for it
 * is a recipe built on Base UI (`@base-ui/react`), not a component in
 * `@mui/material`. Rather than add that dependency, Birdie composes one from
 * `TextField` + `IconButton` — which is the right call regardless, because Base
 * UI's spinner arrows are ~16px and would break the 48dp floor on their first
 * appearance.
 *
 * The quantity stepper below is the pattern the order panel uses.
 */
const meta = {
    title: "Components/Forms/Number Field",
    parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The POS quantity stepper: 48dp buttons flanking a monospace value. */
const QuantityStepper = ({
    value,
    onChange,
    min = 0,
    max = 99,
    size = 48,
}: {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    size?: number;
}) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton
            aria-label="Decrease"
            disabled={value <= min}
            onClick={() => onChange(value - 1)}
            sx={{ width: size, height: size, border: "1px solid", borderColor: "divider", borderRadius: `${radius.md}px` }}
        >
            <RemoveIcon />
        </IconButton>
        <Typography
            variant="h5"
            sx={{ minWidth: size, textAlign: "center", fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}
        >
            {value}
        </Typography>
        <IconButton
            aria-label="Increase"
            disabled={value >= max}
            onClick={() => onChange(value + 1)}
            sx={{ width: size, height: size, border: "1px solid", borderColor: "divider", borderRadius: `${radius.md}px` }}
        >
            <AddIcon />
        </IconButton>
    </Stack>
);

export const Stepper: Story = {
    render: function Render() {
        const [qty, setQty] = useState(4);
        const [players, setPlayers] = useState(2);

        return (
            <Stack spacing={4} sx={{ p: 3 }}>
                <Stack spacing={1.5}>
                    <Typography variant="h6">Line quantity</Typography>
                    <QuantityStepper value={qty} onChange={setQty} min={1} />
                </Stack>

                <Stack spacing={1.5}>
                    <Typography variant="h6">Players in group</Typography>
                    <QuantityStepper value={players} onChange={setPlayers} min={1} max={4} size={touchTarget.comfortable} />
                </Stack>

                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                    No keyboard is ever summoned. Changing a 2 to a 3 is one tap, and the value can't be typed into an invalid state — the
                    buttons disable at the bounds instead of validating after the fact.
                </Typography>
            </Stack>
        );
    },
};

/** When the range is wide, fall back to a keyed field with a numeric keypad. */
export const KeyedEntry: Story = {
    name: "Keyed entry",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 460 }}>
            <TextField
                label="Count on hand"
                defaultValue="248"
                slotProps={{
                    htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                    input: {
                        sx: { fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" },
                        endAdornment: <InputAdornment position="end">units</InputAdornment>,
                    },
                }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Inventory counts run to hundreds — a stepper would be absurd. Set <code>inputMode="numeric"</code> so Android raises the
                number pad, not the full keyboard.
            </Typography>
        </Stack>
    ),
};

export const Currency: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 460 }}>
            <TextField
                label="Amount tendered"
                defaultValue="340.00"
                slotProps={{
                    htmlInput: { inputMode: "decimal" },
                    input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        sx: { fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums", fontSize: 24 },
                    },
                }}
            />
            <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Money uses <code>inputMode="decimal"</code>, 24px monospace, and a leading adornment rather than a placeholder — the
                    currency symbol must survive the field having a value.
                </Typography>
            </Box>
        </Stack>
    ),
};
