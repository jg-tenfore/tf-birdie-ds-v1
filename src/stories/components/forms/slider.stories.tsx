import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Slider.
 *
 * Used sparingly. A slider trades precision for speed, and most POS numbers
 * (money, quantities) need precision — so this is for genuinely fuzzy settings:
 * screen brightness, a tip percentage, a date range on a report.
 *
 * The theme enlarges the thumb to 28px and the track to 8px. The default 12px
 * thumb is a desktop dimension and disappears under a fingertip.
 */
const meta = {
    title: "Components/Forms/Slider",
    component: Slider,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Stack spacing={5} sx={{ p: 4, maxWidth: 560 }}>
            <Stack spacing={1}>
                <Typography variant="h6">Screen brightness</Typography>
                <Slider defaultValue={70} />
            </Stack>

            <Stack spacing={1}>
                <Typography variant="h6">Tip suggestion</Typography>
                <Slider defaultValue={18} min={0} max={30} step={1} valueLabelDisplay="on" marks={[{ value: 0, label: "0%" }, { value: 15, label: "15%" }, { value: 30, label: "30%" }]} />
            </Stack>
        </Stack>
    ),
};

export const Range: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 4, maxWidth: 560 }}>
            <Typography variant="h6">Report window</Typography>
            <Slider
                defaultValue={[9, 17]}
                min={6}
                max={20}
                step={1}
                valueLabelDisplay="auto"
                marks={[
                    { value: 6, label: "6 AM" },
                    { value: 12, label: "Noon" },
                    { value: 20, label: "8 PM" },
                ]}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Two thumbs need ~44px between them at minimum value, or a finger can't grab the one it wants.
                Set a `step` and a sensible `min`/`max` so the thumbs can't fully collide.
            </Typography>
        </Stack>
    ),
};

export const Discrete: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 4, maxWidth: 560 }}>
            <Typography variant="h6">Idle lock timeout</Typography>
            <Slider
                defaultValue={2}
                min={1}
                max={5}
                step={null}
                valueLabelDisplay="auto"
                marks={[
                    { value: 1, label: "30s" },
                    { value: 2, label: "1m" },
                    { value: 3, label: "2m" },
                    { value: 4, label: "5m" },
                    { value: 5, label: "Never" },
                ]}
            />
            <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Snapping to labeled marks (`step=&#123;null&#125;`) is far more forgiving on a touch screen
                    than a continuous track — the operator can be sloppy and still land on a valid value.
                </Typography>
            </Box>
        </Stack>
    ),
};

export const Vertical: Story = {
    render: () => (
        <Stack direction="row" spacing={6} sx={{ p: 4, height: 320 }}>
            <Slider orientation="vertical" defaultValue={60} />
            <Slider orientation="vertical" defaultValue={[20, 80]} />
            <Typography variant="body2" sx={{ color: "text.secondary", alignSelf: "center", maxWidth: 380 }}>
                Vertical sliders are rare in landscape — height is the scarce axis, so a vertical control
                spends the resource we have least of.
            </Typography>
        </Stack>
    ),
};
