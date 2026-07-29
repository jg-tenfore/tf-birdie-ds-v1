import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Checkbox, Radio, and Switch — the three binary controls, and the rule for
 * picking between them.
 *
 * Checkbox: one or more of a set, applied on submit.
 * Radio: exactly one of a set, applied on submit.
 * Switch: a single setting that takes effect *immediately*.
 *
 * That last distinction is the one teams get wrong. If tapping it doesn't change
 * something right away, it should not be a switch.
 */
const meta = {
    title: "Components/Forms/Selection Controls",
    component: Checkbox,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checkboxes: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <FormControl>
                <FormLabel sx={{ mb: 1 }}>Receipt options</FormLabel>
                <FormGroup>
                    <FormControlLabel control={<Checkbox defaultChecked />} label="Print customer copy" />
                    <FormControlLabel control={<Checkbox />} label="Print merchant copy" />
                    <FormControlLabel control={<Checkbox defaultChecked />} label="Email to member on file" />
                    <FormControlLabel control={<Checkbox disabled />} label="Text receipt (no phone on file)" />
                </FormGroup>
            </FormControl>

            <Stack spacing={1}>
                <Typography variant="h6">Indeterminate</Typography>
                <FormControlLabel control={<Checkbox indeterminate />} label="All F & B items (2 of 5 selected)" />
            </Stack>

            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                The theme pads checkboxes to 48dp total (24px glyph + 12px each side). The tappable area is
                the label too — `FormControlLabel` wires that up, which nearly doubles the target.
            </Typography>
        </Stack>
    ),
};

export const Radios: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <FormControl>
                <FormLabel sx={{ mb: 1 }}>Rate type</FormLabel>
                <RadioGroup defaultValue="member">
                    <FormControlLabel value="rack" control={<Radio />} label="Rack — $62.00" />
                    <FormControlLabel value="member" control={<Radio />} label="Member — $34.00" />
                    <FormControlLabel value="twilight" control={<Radio />} label="Twilight — $44.00" />
                    <FormControlLabel value="junior" control={<Radio />} label="Junior — $28.00" />
                </RadioGroup>
            </FormControl>

            <Stack spacing={1}>
                <Typography variant="h6">Horizontal</Typography>
                <RadioGroup row defaultValue="18">
                    <FormControlLabel value="9" control={<Radio />} label="9 holes" />
                    <FormControlLabel value="18" control={<Radio />} label="18 holes" />
                </RadioGroup>
                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                    For two or three short options like this, a Toggle Button group is usually the better
                    tablet control — bigger targets, and the selection reads from across the counter.
                </Typography>
            </Stack>
        </Stack>
    ),
};

export const Switches: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 560 }}>
            <FormGroup>
                <FormControlLabel control={<Switch defaultChecked />} label="Open cash drawer on cash tender" />
                <FormControlLabel control={<Switch defaultChecked />} label="Auto-print on ticket close" />
                <FormControlLabel control={<Switch />} label="Require signature over $50" />
                <FormControlLabel control={<Switch disabled />} label="Customer display (not paired)" />
            </FormGroup>

            <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    These are all settings that apply the instant they're tapped — no Save button in sight.
                    That's the test for whether something should be a switch at all.
                </Typography>
            </Box>
        </Stack>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={4} sx={{ alignItems: "center" }}>
                <FormControlLabel control={<Checkbox size="small" />} label="Small checkbox" />
                <FormControlLabel control={<Checkbox />} label="Medium checkbox" />
                <FormControlLabel control={<Checkbox size="large" />} label="Large checkbox" />
            </Stack>
            <Stack direction="row" spacing={4} sx={{ alignItems: "center" }}>
                <FormControlLabel control={<Switch size="small" />} label="Small switch" />
                <FormControlLabel control={<Switch />} label="Medium switch" />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Prefer the default. `size="small"` shrinks the glyph but the theme keeps the 48dp hit area, so
                the only thing you lose is legibility.
            </Typography>
        </Stack>
    ),
};
