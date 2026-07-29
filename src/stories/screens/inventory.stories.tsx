import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import BarcodeReaderIcon from "@mui/icons-material/BarcodeReader";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import {
    InventoryCategoryMenu,
    InventoryCountList,
    inventoryCountRows,
} from "@/components/screens/operations/inventory-count-list";
import {
    InventoryCountDetail,
    accessoriesCountLines,
} from "@/components/screens/operations/inventory-count-detail";
import { InventoryNewCountForm } from "@/components/screens/operations/inventory-new-count-form";

/**
 * Inventory Counts — physical stock counts against the product catalogue.
 *
 * Transcribed from `references/072926/16-inventory/`. Four screens: the list of
 * saved counts, the category picker that scopes it, the new-count form behind
 * the "+" action, and an open count being tallied.
 *
 * This is the one Operations screen whose app bar carries icon actions instead
 * of the account cluster — "+" to start a count, "⋮" for the overflow. Inside a
 * count the bar changes again, to a barcode scanner trigger and REFRESH.
 */
const meta = {
    title: "App Screens/16-inventory",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ListTopActions = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton aria-label="New count" sx={{ color: "#fff" }}>
            <AddIcon sx={{ fontSize: 32 }} />
        </IconButton>
        <IconButton aria-label="More" edge="end" sx={{ color: "#fff" }}>
            <MoreVertIcon />
        </IconButton>
    </Box>
);

const RefreshAction = ({ withScanner }: { withScanner?: boolean }) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        {withScanner && (
            <IconButton aria-label="Scan barcode" sx={{ color: "#fff" }}>
                <BarcodeReaderIcon sx={{ fontSize: 30 }} />
            </IconButton>
        )}
        <Typography sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff", pr: 1 }}>REFRESH</Typography>
    </Stack>
);

/**
 * Saved counts, newest first. The bottom bar is not an action — it is the
 * product-category scope for the list, rendered as a full-width slate bar.
 */
export const CountList: Story = {
    render: () => (
        <AppShell
            title="Inventory Counts"
            active="inventory"
            topBarRight={<ListTopActions />}
            actionBar={<ActionButton grow={1}>Merchandise</ActionButton>}
        >
            <InventoryCountList rows={inventoryCountRows} />
        </AppShell>
    ),
};

/**
 * The category scope, open. It is a full-bleed dark sheet floating over the
 * list rather than a popover anchored to the bar, and the bar itself stays
 * visible beneath it.
 */
export const CategoryPickerOpen: Story = {
    render: () => (
        <Box sx={{ position: "relative", height: "100vh" }}>
            <AppShell
                title="Inventory Counts"
                active="inventory"
                topBarRight={<ListTopActions />}
                actionBar={<ActionButton grow={1}>Merchandise</ActionButton>}
            >
                <InventoryCountList rows={inventoryCountRows} />
            </AppShell>
            <InventoryCategoryMenu selected="Merchandise" />
        </Box>
    ),
};

/**
 * The new-count form behind "+". Only two inputs, and SAVE is enabled before a
 * title has been entered.
 */
export const NewCount: Story = {
    render: () => (
        <AppShell
            title="Inventory Count"
            active="inventory"
            topBarRight={<RefreshAction />}
            actionBar={
                <>
                    <ActionButton grow={1} icon={<ChevronLeftIcon />}>
                        Back
                    </ActionButton>
                    <ActionButton grow={1} tone="primary" icon={<BackupOutlinedIcon />}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <InventoryNewCountForm category="Merchandise" />
        </AppShell>
    ),
};

/**
 * An open count. The title bar reads "{count id} - {count title}", products are
 * grouped under a dark section band, and each line shows the expected quantity
 * beside the counted one. Expected reads 0.0 throughout here, which is what the
 * device shows when the catalogue has no on-hand figure to compare against.
 */
export const CountDetail: Story = {
    render: () => (
        <AppShell
            title="3484 - 78987"
            active="inventory"
            topBarRight={<RefreshAction withScanner />}
            actionBar={
                <>
                    <ActionButton grow={1} icon={<ChevronLeftIcon />}>
                        Back
                    </ActionButton>
                    <ActionButton grow={1} tone="primary" icon={<BackupOutlinedIcon />}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <InventoryCountDetail section="Accessories" lines={accessoriesCountLines} />
        </AppShell>
    ),
};
