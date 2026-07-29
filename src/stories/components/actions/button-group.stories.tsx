import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Button groups bind related actions into one control.
 *
 * The POS caveat: a grouped button has no gap between it and its neighbour,
 * which is exactly the adjacency the touch-target rules warn about. So groups
 * are fine for *low-stakes, same-family* choices (9 vs 18 holes) and wrong for
 * anything destructive — Void and Refund never share a group.
 */
const meta = {
    title: "Components/Actions/Button Group",
    component: ButtonGroup,
    parameters: { layout: "padded" },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Contained</Typography>
                <ButtonGroup>
                    <Button>9 holes</Button>
                    <Button>18 holes</Button>
                </ButtonGroup>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Outlined</Typography>
                <ButtonGroup variant="outlined">
                    <Button>Cash</Button>
                    <Button>Card</Button>
                    <Button>Account</Button>
                </ButtonGroup>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Vertical</Typography>
                <ButtonGroup orientation="vertical" variant="outlined" sx={{ width: 220 }}>
                    <Button>Print receipt</Button>
                    <Button>Email receipt</Button>
                    <Button>No receipt</Button>
                </ButtonGroup>
            </Stack>
        </Stack>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <ButtonGroup size="small">
                <Button>Small</Button>
                <Button>48dp</Button>
            </ButtonGroup>
            <ButtonGroup>
                <Button>Medium</Button>
                <Button>56dp</Button>
            </ButtonGroup>
            <ButtonGroup size="large">
                <Button>Large</Button>
                <Button>64dp</Button>
            </ButtonGroup>
        </Stack>
    ),
};

export const WhenNotToUse: Story = {
    name: "When not to use",
    render: () => (
        <Stack spacing={4} sx={{ p: 3, maxWidth: 640 }}>
            <Stack spacing={1.5}>
                <Typography variant="caption" sx={{ color: "error.main", fontWeight: 700 }}>
                    ✗ Destructive actions in a group
                </Typography>
                <ButtonGroup variant="outlined" color="error">
                    <Button>Void</Button>
                    <Button>Refund</Button>
                </ButtonGroup>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No gap between two irreversible actions. A finger landing on the seam picks one of them
                    and the operator can't tell which until it's done.
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                    ✓ Separate buttons, 8px apart
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" color="error">
                        Void
                    </Button>
                    <Button variant="outlined" color="error">
                        Refund
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    ),
};
