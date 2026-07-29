import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Rating.
 *
 * In a POS this appears on the *customer-facing* side — the post-round prompt on
 * a counter display — rather than in the operator's workflow. That changes the
 * sizing: it is being tapped by a guest who has never seen the screen before, so
 * it runs large.
 */
const meta = {
    title: "Components/Forms/Rating",
    component: Rating,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                <Typography variant="body2" sx={{ width: 120, color: "text.secondary" }}>
                    small
                </Typography>
                <Rating defaultValue={4} size="small" />
            </Stack>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                <Typography variant="body2" sx={{ width: 120, color: "text.secondary" }}>
                    medium
                </Typography>
                <Rating defaultValue={4} />
            </Stack>
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                <Typography variant="body2" sx={{ width: 120, color: "text.secondary" }}>
                    large
                </Typography>
                <Rating defaultValue={4} size="large" />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 640 }}>
                Only `large` (and up) is safe for input on a tablet — five adjacent stars at `small` puts each target near 20px, well under
                the floor. `small` is fine read-only.
            </Typography>
        </Stack>
    ),
};

export const ReadOnly: Story = {
    name: "Read only",
    render: () => (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Rating value={4.5} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    4.5 · 218 rounds rated this season
                </Typography>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Rating value={3} readOnly size="small" />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Course conditions — reported by staff
                </Typography>
            </Stack>
        </Stack>
    ),
};

export const GuestPrompt: Story = {
    name: "Guest prompt",
    render: () => (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    p: 5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    textAlign: "center",
                    maxWidth: 640,
                }}
            >
                <Stack spacing={3} sx={{ alignItems: "center" }}>
                    <Typography variant="h3">How was your round?</Typography>
                    <Rating
                        defaultValue={0}
                        size="large"
                        icon={<GolfCourseIcon sx={{ fontSize: 56 }} />}
                        emptyIcon={<GolfCourseIcon sx={{ fontSize: 56 }} />}
                        sx={{ gap: 1 }}
                    />
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        Tap to rate — Sagamore Golf Club
                    </Typography>
                </Stack>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 640 }}>
                56px icons with an 8px gap. A guest gets one shot at this while picking up their receipt, so every target is unmissable and
                the whole thing reads from standing height.
            </Typography>
        </Box>
    ),
};
