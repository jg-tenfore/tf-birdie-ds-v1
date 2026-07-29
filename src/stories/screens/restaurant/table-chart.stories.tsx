import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import {
    CreateTableDialog,
    RoomPickerSheet,
    SaveConfirmationBanner,
    TableChartCanvas,
    chartRooms,
    type ChartTable,
} from "@/components/screens/restaurant/table-chart-canvas";
import { AntlerEmptyState, EdgeLabel, ScrimOverlay } from "@/components/screens/restaurant/tables-shared-parts";
import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * **Table Chart** — the floor-plan editor.
 *
 * Managers lay out a room here: pick a room from the middle bottom-bar button,
 * drag tokens to match the real floor, add tables with NEW TABLE, then SAVE.
 * The app bar drops the account cluster and overflow menu entirely — NEW TABLE
 * is the only top-bar action.
 *
 * Replicated as-is from `references/072926/10-tablechart/`.
 */
const meta = {
    title: "App Screens/Restaurant/Table Chart",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const newTableAction = <Typography sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff" }}>NEW TABLE</Typography>;

const detachedTokens: ChartTable[] = [
    { label: "Detached 27699", x: 96, y: 90 },
    { label: "Detached 58829", x: 241, y: 111 },
];

const ChartActionBar = ({ room, saveTone = "primary" }: { room: string; saveTone?: "primary" | "disabled" }) => (
    <>
        <ActionButton>
            <EdgeLabel icon={<ChevronLeftIcon sx={{ fontSize: 26 }} />}>Tables</EdgeLabel>
        </ActionButton>
        <ActionButton>
            <EdgeLabel transform="none">{room}</EdgeLabel>
        </ActionButton>
        <ActionButton tone={saveTone}>
            <EdgeLabel icon={<CheckIcon sx={{ fontSize: 30 }} />}>Save</EdgeLabel>
        </ActionButton>
    </>
);

/**
 * The `[Detached Tables]` room.
 *
 * Tokens are fixed-size dark squares with a single centered label. The label is
 * never shortened or wrapped — "Detached 27699" simply loses both ends to the
 * token's edges, which is why chart tables are normally numbered.
 */
export const DetachedTables: Story = {
    render: () => (
        <AppShell
            title="Table Chart"
            active="tablechart"
            topBarRight={newTableAction}
            actionBar={<ChartActionBar room="[Detached Tables]" />}
        >
            <TableChartCanvas tables={detachedTokens} />
        </AppShell>
    ),
};

/**
 * Choosing a room.
 *
 * The middle button raises the full room list straight over the canvas, with no
 * scrim. SAVE greys out while the picker is open. These eleven rooms are the
 * ones configured on the reference device.
 */
export const RoomPicker: Story = {
    render: () => (
        <Box sx={{ position: "relative" }}>
            <AppShell
                title="Table Chart"
                active="tablechart"
                topBarRight={newTableAction}
                actionBar={<ChartActionBar room="[Detached Tables]" saveTone="disabled" />}
            >
                <AntlerEmptyState message="No active tables." />
            </AppShell>
            <RoomPickerSheet rooms={chartRooms} />
        </Box>
    ),
};

/**
 * A room with nothing in it yet.
 *
 * SET UP TABLES is the same action as NEW TABLE, surfaced where the eye
 * already is. SAVE stays disabled until the layout changes.
 */
export const EmptyRoom: Story = {
    render: () => (
        <AppShell
            title="Table Chart"
            active="tablechart"
            topBarRight={newTableAction}
            actionBar={<ChartActionBar room="banquet" saveTone="disabled" />}
        >
            <AntlerEmptyState
                message="No active tables."
                action={
                    <Button sx={{ bgcolor: appColors.slate, borderRadius: `${appRadius.button}px`, px: 3, minHeight: 44 }}>
                        Set Up Tables
                    </Button>
                }
            />
        </AppShell>
    ),
};

/**
 * NEW TABLE.
 *
 * Two free-text fields — the table's number and its cover count — over a slate
 * SAVE. The new token lands on the canvas unsaved; the bottom-bar SAVE is what
 * commits the layout.
 */
export const CreateTable: Story = {
    render: () => (
        <Box>
            <AppShell
                title="Table Chart"
                active="tablechart"
                topBarRight={newTableAction}
                actionBar={<ChartActionBar room="banquet" saveTone="disabled" />}
            >
                <AntlerEmptyState message="No active tables." />
            </AppShell>
            <ScrimOverlay opacity={0.8}>
                <CreateTableDialog />
            </ScrimOverlay>
        </Box>
    ),
};

/**
 * After SAVE.
 *
 * A green confirmation band pushes the canvas down and stays until the next
 * navigation. Table 10 sits where it was dropped, and SAVE is live again.
 */
export const LayoutSaved: Story = {
    render: () => (
        <AppShell
            title="Table Chart"
            active="tablechart"
            topBarRight={newTableAction}
            subBar={<SaveConfirmationBanner message="Table layout saved successfully!" />}
            actionBar={<ChartActionBar room="banquet" />}
        >
            <TableChartCanvas tables={[{ label: "10", x: 803, y: 372 }]} />
        </AppShell>
    ),
};
