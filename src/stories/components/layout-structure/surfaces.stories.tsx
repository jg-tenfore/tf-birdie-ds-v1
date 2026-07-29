import AppBar from "@mui/material/AppBar";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { layout, touchTarget } from "@/theme/tokens";

/**
 * Surfaces — Paper, App Bar, and Accordion.
 *
 * The house style is flat: Paper and Card default to elevation 0 with a 1px
 * border. On a POS screen showing twenty surfaces at once, shadows stop
 * separating anything and become grain. Elevation is reserved for things that
 * genuinely float — menus, dialogs, snackbars.
 */
const meta = {
    title: "Components/Layout & Structure/Surfaces",
    component: Paper,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Paper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaperElevation: Story = {
    name: "Paper elevation",
    render: () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2 }}>
                {[0, 1, 2, 3, 4, 6, 8, 12, 16, 24].map((level) => (
                    <Paper
                        key={level}
                        elevation={level}
                        sx={{
                            height: 96,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 2,
                            border: level === 0 ? "1px solid" : "none",
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="subtitle2">{level}</Typography>
                    </Paper>
                ))}
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 680 }}>
                Levels above 8 are for overlays only. In dark mode MUI normally lightens the surface with elevation — the theme disables
                that (<code>backgroundImage: none</code>) so a card doesn't drift a different grey from its neighbour.
            </Typography>
        </Box>
    ),
};

export const AppBars: Story = {
    name: "App bar",
    render: () => (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">POS app bar — {layout.appBarHeight}px</Typography>
                <AppBar position="static">
                    <Toolbar>
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Sagamore Golf Club
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Register 2
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: 15 }}>DK</Avatar>
                            <IconButton aria-label="More">
                                <MoreVertIcon />
                            </IconButton>
                        </Stack>
                    </Toolbar>
                </AppBar>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Default color, not primary. A solid green bar across the top of every screen would spend the brand color on chrome —
                    it's reserved for the action to take.
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Brand variant — sign-in only</Typography>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Terminal setup
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Stack>
        </Stack>
    ),
};

export const Accordions: Story = {
    name: "Accordion",
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 720 }}>
            {[
                { title: "Golf", detail: "Green fees, carts, twilight and junior rates.", count: 8 },
                { title: "Range", detail: "Buckets and monthly range passes.", count: 4 },
                { title: "Rentals", detail: "Clubs, pull carts, shoes.", count: 4 },
            ].map((section, i) => (
                <Accordion key={section.title} defaultExpanded={i === 0} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: touchTarget.large }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {section.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {section.count} items
                            </Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
                            {section.detail}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Summaries are 64dp. Use accordions in Settings and reports, not on selling screens — hiding sellable items behind a
                disclosure adds a tap to every sale.
            </Typography>
        </Stack>
    ),
};

export const Dividers: Story = {
    name: "Divider",
    render: () => (
        <Stack spacing={4} sx={{ p: 3, maxWidth: 560 }}>
            <Stack spacing={2}>
                <Typography variant="h6">Horizontal</Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <Stack divider={<Divider />}>
                        {["Subtotal", "Tax", "Tip"].map((row) => (
                            <Box key={row} sx={{ p: 2 }}>
                                <Typography variant="body1">{row}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            </Stack>

            <Stack spacing={2}>
                <Typography variant="h6">With text</Typography>
                <Divider>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        or
                    </Typography>
                </Divider>
            </Stack>

            <Stack spacing={2}>
                <Typography variant="h6">Vertical</Typography>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ height: 56, alignItems: "center" }}
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    <Button variant="text">Print</Button>
                    <Button variant="text">Email</Button>
                    <Button variant="text">Text</Button>
                </Stack>
            </Stack>
        </Stack>
    ),
};
