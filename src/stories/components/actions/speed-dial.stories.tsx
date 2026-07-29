import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DiscountOutlinedIcon from "@mui/icons-material/DiscountOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Speed dial — a FAB that fans out into related actions.
 *
 * Included for completeness, with a caution: it hides its actions behind a tap,
 * and hidden actions are undiscoverable to an operator who is not exploring.
 * In Birdie it is reserved for *secondary* clusters an experienced user seeks
 * out deliberately. Anything a new hire needs on day one belongs in the action
 * bar, visible.
 */
const meta = {
    title: "Components/Actions/Speed Dial",
    component: SpeedDial,
    parameters: { layout: "padded" },
    // Stories render their own instance; this satisfies SpeedDial's required
    // prop so the Docs tab still builds a props table from `component`.
    args: { ariaLabel: "Ticket actions" },
} satisfies Meta<typeof SpeedDial>;

export default meta;
type Story = StoryObj<typeof meta>;

const actions = [
    { icon: <PersonAddAltOutlinedIcon />, name: "Attach member" },
    { icon: <DiscountOutlinedIcon />, name: "Apply discount" },
    { icon: <ReceiptLongOutlinedIcon />, name: "Split ticket" },
    { icon: <PrintOutlinedIcon />, name: "Print draft" },
];

export const Default: Story = {
    render: () => (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    position: "relative",
                    height: 420,
                    borderRadius: 3,
                    border: "1px dashed",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    p: 3,
                }}
            >
                <Typography variant="h5">Ticket #4127</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1, maxWidth: 520 }}>
                    Secondary ticket actions. Charge stays in the action bar — only the things an operator reaches for occasionally live in
                    here.
                </Typography>

                <SpeedDial ariaLabel="Ticket actions" sx={{ position: "absolute", bottom: 24, right: 24 }} icon={<SpeedDialIcon />} open>
                    {actions.map((action) => (
                        <SpeedDialAction key={action.name} icon={action.icon} slotProps={{ tooltip: { title: action.name, open: true } }} />
                    ))}
                </SpeedDial>
            </Box>
        </Box>
    ),
};

export const AlwaysLabeled: Story = {
    name: "Always labeled",
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 680 }}>
            <Typography variant="h6">Keep tooltips open</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Pass <code>slotProps=&#123;&#123; tooltip: &#123; open: true &#125; &#125;&#125;</code> so every action is labeled the
                moment the dial expands. The default reveals labels on hover, and a finger never hovers — without this the operator gets
                four unlabeled circles.
            </Typography>
        </Stack>
    ),
};
