import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * Form controls at POS scale.
 *
 * The theme sets every input to 56dp with 16px text. 16px is not an aesthetic
 * choice — it is the threshold below which mobile browsers zoom on focus, and a
 * zoom mid-transaction is a lost sale.
 */
const meta = {
    title: "Components/Forms/Text Field",
    component: TextField,
    parameters: { layout: "centered" },
    args: { label: "Guest name", placeholder: "Search members", helperText: "", error: false, disabled: false },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <Box sx={{ width: 420, p: 3 }}>
            <TextField {...args} />
        </Box>
    ),
};

export const States: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Stack spacing={2.5} sx={{ p: 3, maxWidth: 460 }}>
            <TextField label="Guest name" placeholder="Jordan Ellis" />
            <TextField label="Member number" defaultValue="TF-40912" />
            <TextField label="Email" defaultValue="not-an-email" error helperText="Enter a valid email address" />
            <TextField label="Till" defaultValue="Register 2" disabled helperText="Set at sign-in" />
            <TextField
                label="Search"
                placeholder="Product, member, or ticket #"
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </Stack>
    ),
};

export const CurrencyAndNumbers: Story = {
    name: "Currency & numbers",
    parameters: { layout: "padded" },
    render: () => (
        <Stack spacing={2.5} sx={{ p: 3, maxWidth: 460 }}>
            <TextField
                label="Amount tendered"
                defaultValue="260.00"
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        sx: { fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums", fontSize: 24 },
                    },
                    htmlInput: { inputMode: "decimal" },
                }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Money fields use monospace with tabular figures and set <code>inputMode</code> so the tablet
                raises the numeric keypad rather than the full keyboard — one less tap, every single time.
            </Typography>
            <TextField label="Quantity" defaultValue="2" slotProps={{ htmlInput: { inputMode: "numeric" } }} sx={{ maxWidth: 160 }} />
        </Stack>
    ),
};

export const SelectAndToggles: Story = {
    name: "Select & toggles",
    parameters: { layout: "padded" },
    render: () => (
        <Stack spacing={2.5} sx={{ p: 3, maxWidth: 460 }}>
            <TextField select label="Payment method" defaultValue="card">
                {[
                    { value: "card", label: "Credit card" },
                    { value: "cash", label: "Cash" },
                    { value: "member", label: "Member account" },
                    { value: "gift", label: "Gift card" },
                ].map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Menu items are {touchTarget.comfortable}dp so a dropdown is scrollable-and-tappable, not a
                precision exercise.
            </Typography>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Print receipt" />
            <FormControlLabel control={<Switch defaultChecked />} label="Email receipt to member" />
        </Stack>
    ),
};
