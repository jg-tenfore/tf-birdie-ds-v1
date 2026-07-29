import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { members, money } from "@/data/pos-data";
import { fontFamily } from "@/theme/tokens";

/**
 * Autocomplete — member lookup, which is its main job in a POS.
 *
 * The option rows are 72px, not the MUI default: the operator is face-matching a
 * person at the counter and needs the avatar, the tier, and the available credit
 * in one glance. A dense text-only list would be faster to scroll and slower to
 * use.
 */
const meta = {
    title: "Components/Forms/Autocomplete",
    component: Autocomplete,
    parameters: { layout: "padded" },
    // Stories render their own instance; this satisfies Autocomplete's required
    // props so the Docs tab still builds a props table from `component`.
    args: { options: [], renderInput: () => null },
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MemberLookup: Story = {
    name: "Member lookup",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 560 }}>
            <Autocomplete
                options={members}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Attach member" placeholder="Name, number, or phone" />}
                renderOption={(props, option) => {
                    const { key, ...rest } = props as typeof props & { key: string };

                    return (
                        <Box component="li" key={key} {...rest} sx={{ minHeight: 72, gap: 2 }}>
                            <Avatar sx={{ width: 44, height: 44, bgcolor: "grey.300", color: "grey.800", fontSize: 15, fontWeight: 600 }}>
                                {option.initials}
                            </Avatar>
                            <Stack sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {option.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: fontFamily.mono }}>
                                    {option.number} · {option.tier}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ fontFamily: fontFamily.mono, color: option.credit < 50 ? "error.main" : "text.secondary" }}>
                                {money(option.credit)}
                            </Typography>
                        </Box>
                    );
                }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Available credit sits on the right of every row because it decides whether the *next* action
                — charging to the account — will succeed.
            </Typography>
        </Stack>
    ),
};

export const Multiple: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 560 }}>
            <Autocomplete
                multiple
                options={members}
                getOptionLabel={(option) => option.name}
                defaultValue={[members[0], members[4]]}
                renderInput={(params) => <TextField {...params} label="Players in group" placeholder="Add player" />}
                renderValue={(value, getItemProps) =>
                    value.map((option, index) => {
                        const { key, ...rest } = getItemProps({ index });
                        return <Chip key={key} label={option.name} {...rest} />;
                    })
                }
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Chips are removable at 48dp. Building a foursome is the canonical multi-select in this product.
            </Typography>
        </Stack>
    ),
};

export const FreeSolo: Story = {
    name: "Free solo",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 560 }}>
            <Autocomplete
                freeSolo
                options={["Walk-up", "Jordan Ellis", "Morgan Vale", "Riley Park"]}
                renderInput={(params) => <TextField {...params} label="Guest name" placeholder="Type or pick" />}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Free-solo matters at a golf POS: most people at the counter are not members, and forcing a
                selection would block the sale.
            </Typography>
        </Stack>
    ),
};

export const Grouped: Story = {
    render: () => (
        <Box sx={{ p: 3, maxWidth: 560 }}>
            <Autocomplete
                options={[...members].sort((a, b) => a.tier.localeCompare(b.tier))}
                groupBy={(option) => option.tier}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Member by tier" />}
            />
        </Box>
    ),
};
