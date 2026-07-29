import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DoneIcon from "@mui/icons-material/Done";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";

/**
 * Chip — and the one rule that governs its size here.
 *
 * A chip is either a **label** (read-only status: Paid, Held, Eagle) or a
 * **control** (a filter you tap). Labels sit at 36px, because forcing them to
 * 48dp would cost two visible rows in a ticket list for no benefit — you can't
 * mis-tap something that isn't tappable. Controls get the full 48dp floor.
 */
const meta = {
    title: "Components/Feedback & Status/Chip",
    component: Chip,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusLabels: Story = {
    name: "Status labels — 36px",
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1.5 }}>
                <Chip label="Paid" color="success" />
                <Chip label="Open" color="info" />
                <Chip label="Partially paid" color="warning" />
                <Chip label="Voided" color="error" />
                <Chip label="Held" color="warning" variant="outlined" />
                <Chip label="Comped" variant="outlined" />
                <Chip label="Queued offline" color="warning" variant="outlined" />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                Never rely on color alone — each of these carries a word. A red/green pair is exactly what a
                colorblind operator can't separate, and it's the pair a POS leans on hardest.
            </Typography>
        </Stack>
    ),
};

export const FilterControls: Story = {
    name: "Filter controls — 48dp",
    render: () => (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1.5 }}>
                {["All", "Balls", "Apparel", "Accessories", "Rentals"].map((label, i) => (
                    <Chip
                        key={label}
                        label={label}
                        color={i === 0 ? "primary" : "default"}
                        onClick={() => {}}
                        sx={{ minHeight: touchTarget.min, px: 1 }}
                    />
                ))}
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1.5 }}>
                <Chip label="Open tickets" color="primary" icon={<DoneIcon />} onClick={() => {}} sx={{ minHeight: touchTarget.min }} />
                <Chip label="Today only" onDelete={() => {}} onClick={() => {}} sx={{ minHeight: touchTarget.min }} />
                <Chip label="Dana K." onDelete={() => {}} onClick={() => {}} sx={{ minHeight: touchTarget.min }} />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                Careful with <code>onDelete</code>: the ✕ is a second target inside the first. At 48dp there's
                room, but below that the delete and the chip body overlap into a coin flip.
            </Typography>
        </Stack>
    ),
};

export const WithAvatar: Story = {
    name: "With avatar",
    render: () => (
        <Stack direction="row" spacing={1.5} sx={{ p: 3, flexWrap: "wrap", rowGap: 1.5 }}>
            <Chip avatar={<Avatar>JE</Avatar>} label="Jordan Ellis" onDelete={() => {}} sx={{ minHeight: touchTarget.min }} />
            <Chip avatar={<Avatar>MV</Avatar>} label="Morgan Vale" onDelete={() => {}} sx={{ minHeight: touchTarget.min }} />
            <Chip avatar={<Avatar sx={{ bgcolor: "primary.main" }}>+2</Avatar>} label="2 more players" sx={{ minHeight: touchTarget.min }} />
        </Stack>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Chip label="Small — 24px" size="small" />
                <Chip label="Medium — 36px" />
                <Chip label="Tappable — 48dp" onClick={() => {}} sx={{ minHeight: touchTarget.min }} />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                `small` is for inside dense table cells only. It's below the legibility floor for anything a
                guest might read.
            </Typography>
        </Stack>
    ),
};
