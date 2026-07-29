import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Select — reach for it past about six options.
 *
 * Below that count a Toggle Button group is the better tablet control: every
 * option visible, one tap, no menu to open and dismiss. The Select earns its
 * place on long or unbounded lists (staff roster, tax class, discount reason).
 */
const meta = {
    title: "Components/Forms/Select",
    component: Select,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const reasons = ["Rain check", "Service recovery", "Employee comp", "Member benefit", "Manager discretion", "Damaged goods", "Price match"];

export const Default: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 460 }}>
            <TextField select label="Discount reason" defaultValue="Rain check" helperText="Required on any comp over $25">
                {reasons.map((reason) => (
                    <MenuItem key={reason} value={reason}>
                        {reason}
                    </MenuItem>
                ))}
            </TextField>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Menu items are 56dp so the open list is tappable, not a precision exercise. Seven options is about the point where this
                beats a toggle group.
            </Typography>
        </Stack>
    ),
};

export const Multiple: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 460 }}>
            <FormControl fullWidth>
                <InputLabel id="printers-label">Route to printers</InputLabel>
                <Select
                    labelId="printers-label"
                    multiple
                    label="Route to printers"
                    defaultValue={["Snack bar", "Turn shack"]}
                    renderValue={(selected) => (
                        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                            {(selected as string[]).map((value) => (
                                <Chip key={value} label={value} size="small" />
                            ))}
                        </Box>
                    )}
                >
                    {["Pro shop", "Snack bar", "Turn shack", "Beverage cart", "Kitchen"].map((printer) => (
                        <MenuItem key={printer} value={printer}>
                            <Checkbox checked={["Snack bar", "Turn shack"].includes(printer)} />
                            <ListItemText primary={printer} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Multi-select needs an explicit checkbox in each row. Without one, "selected" is conveyed only by a subtle background tint —
                invisible in sunlight through a pro shop window.
            </Typography>
        </Stack>
    ),
};

export const States: Story = {
    render: () => (
        <Stack spacing={2.5} sx={{ p: 3, maxWidth: 460 }}>
            <TextField select label="Till" defaultValue="r2">
                {["r1", "r2", "r3"].map((till) => (
                    <MenuItem key={till} value={till}>
                        Register {till.slice(1)}
                    </MenuItem>
                ))}
            </TextField>
            <TextField select label="Tax class" defaultValue="" error helperText="Pick a tax class before saving">
                <MenuItem value="std">Standard 6%</MenuItem>
                <MenuItem value="food">Prepared food 9%</MenuItem>
                <MenuItem value="exempt">Exempt</MenuItem>
            </TextField>
            <TextField select label="Terminal" defaultValue="sgm2" disabled helperText="Set during enrollment">
                <MenuItem value="sgm2">SGM-02</MenuItem>
            </TextField>
        </Stack>
    ),
};

export const Native: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 460 }}>
            <TextField select label="Course" defaultValue="north" slotProps={{ select: { native: true } }}>
                <option value="north">North course</option>
                <option value="south">South course</option>
                <option value="exec">Executive 9</option>
            </TextField>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                The native variant hands off to Android's own picker — a genuinely good option on a tablet, since the system wheel is large,
                familiar, and needs no touch-target work from us.
            </Typography>
        </Stack>
    ),
};
