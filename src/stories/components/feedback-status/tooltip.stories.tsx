import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Tooltip — available, but never load-bearing.
 *
 * A finger has no hover. On a touch device MUI falls back to long-press, which
 * is a gesture no operator will discover under time pressure. So the rule for
 * Birdie is absolute: **no POS flow may require a tooltip to be understood.**
 *
 * They stay in the system for docked terminals with a mouse, and for adding
 * detail to something already labeled — never for supplying the only label.
 */
const meta = {
    title: "Components/Feedback & Status/Tooltip",
    component: Tooltip,
    parameters: { layout: "padded" },
    args: { title: "Tooltip", children: <span /> },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placements: Story = {
    render: () => (
        <Stack spacing={4} sx={{ p: 6 }}>
            <Stack direction="row" spacing={3}>
                {(["top", "bottom", "left", "right"] as const).map((placement) => (
                    <Tooltip key={placement} title={`Placed ${placement}`} placement={placement}>
                        <Box
                            sx={{
                                width: 120,
                                height: 56,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            {placement}
                        </Box>
                    </Tooltip>
                ))}
            </Stack>
        </Stack>
    ),
};

export const TouchBehavior: Story = {
    name: "Touch behavior",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 680 }}>
            <Stack direction="row" spacing={2}>
                <Tooltip title="Reprint the customer copy">
                    <IconButton aria-label="Print receipt">
                        <PrintOutlinedIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Remove this line from the ticket">
                    <IconButton aria-label="Remove line">
                        <DeleteOutlineOutlinedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                The theme sets <code>enterTouchDelay=&#123;400&#125;</code> and{" "}
                <code>leaveTouchDelay=&#123;3000&#125;</code> — long-press for 400ms, then it stays up for 3
                seconds, long enough to actually read standing up.
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Note both icon buttons still carry an <code>aria-label</code>. That's what a screen reader
                announces and what makes the control identifiable without the tooltip ever appearing.
            </Typography>
        </Stack>
    ),
};

export const CorrectUse: Story = {
    name: "Correct use",
    render: () => (
        <Stack spacing={4} sx={{ p: 3, maxWidth: 680 }}>
            <Stack spacing={1.5}>
                <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                    ✓ Adding detail to something already labeled
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="body1">Available credit</Typography>
                    <Tooltip title="Remaining house-account balance for this billing cycle. Resets on the 1st.">
                        <IconButton size="small" aria-label="About available credit">
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="caption" sx={{ color: "error.main", fontWeight: 700 }}>
                    ✗ Supplying the only label
                </Typography>
                <Tooltip title="Void ticket">
                    <IconButton aria-label="Void ticket" color="error">
                        <DeleteOutlineOutlinedIcon />
                    </IconButton>
                </Tooltip>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    A destructive action identified only by an icon and a hover string. On a tablet, this is an
                    unlabeled red button. Put the word "Void" on it.
                </Typography>
            </Stack>
        </Stack>
    ),
};
