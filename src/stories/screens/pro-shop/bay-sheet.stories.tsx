import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { BaySheetGrid, bayTimes } from "@/components/screens/pro-shop/bay-sheet-grid";
import { DateNavBar } from "@/components/screens/pro-shop/date-nav-bar";
import { NewReservationDialog } from "@/components/screens/pro-shop/new-reservation-dialog";

/**
 * **Bay Sheet** — the simulator/hitting-bay calendar.
 *
 * A true timeline rather than a slot list: one half-hour gutter down the left,
 * six bays across, and a rule at every half hour. Bays are named by color
 * because that is how staff and signage refer to them on the floor.
 *
 * ZOOM OUT in the app bar widens the visible time range; the sheet opens
 * showing roughly four hours around the current time.
 *
 * Reproduced from `references/072926/4-baysheet/`.
 */
const meta = {
    title: "App Screens/Pro Shop/Bay Sheet",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Actions = () => (
    <>
        <ActionButton icon={<StorefrontIcon />}>Pro Shop</ActionButton>
        <ActionButton icon={<RestaurantIcon />}>Tables</ActionButton>
        <ActionButton icon={<ReplayIcon />}>Refresh</ActionButton>
        <ActionButton icon={<AddIcon />} tone="primary">
            New Booking
        </ActionButton>
    </>
);

const Sheet = () => (
    <AppShell
        title="Bay Sheet"
        active="baysheet"
        accountLabel="TEST TEST ACCOUNT"
        topActions={["ZOOM OUT"]}
        showOverflow={false}
        subBar={<DateNavBar date="Tuesday, May 12 2026" ratios={[1, 3, 2, 1]} />}
        actionBar={<Actions />}
    >
        <BaySheetGrid times={bayTimes(12, 10)} />
    </AppShell>
);

/** Nothing booked — the grid is the whole screen, NEW BOOKING is the only green. */
export const BaySheet: Story = {
    name: "Bay sheet",
    render: () => <Sheet />,
};

/**
 * NEW BOOKING opens MAKE A NEW RESERVATION over the dimmed sheet. Bay, fee and
 * date are pickers; party size, start time and duration are steppers, with
 * duration moving in 15-minute jumps.
 */
export const NewReservation: Story = {
    name: "New reservation",
    render: () => (
        <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
            <Sheet />
            <NewReservationDialog />
        </Box>
    ),
};
