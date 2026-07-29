import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { ReservationForm } from "@/components/screens/restaurant/reservations-form";
import { AntlerEmptyState, ColumnHeaderBand, DateBand, EdgeLabel } from "@/components/screens/restaurant/tables-shared-parts";

/**
 * **Reservations** — the restaurant's book for one day.
 *
 * A single date at a time: the dark band names it, the grey band names the
 * columns, and everything below is the day's bookings. ADD RESERVATION in the
 * app bar opens the create form, which inherits that same date rather than
 * asking for it again.
 *
 * Replicated as-is from `references/072926/8-reservations/` and
 * `references/072926/7-tables/`.
 */
const meta = {
    title: "App Screens/8-reservations",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const referenceDate = "WEDNESDAY, JULY 29 2026";

const reservationColumns = ["Time", "Party", "First Name", "Last Name", "Email", "Phone"];

/**
 * The list screen's app bar actions, in the app's own order: ADD RESERVATION
 * sits *before* the account, and there is no overflow menu.
 */
const listTopBarRight = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        {["ADD RESERVATION", "TEST TEST ACCOUNT", "LOG OUT"].map((label) => (
            <Typography key={label} sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff" }}>
                {label}
            </Typography>
        ))}
    </Box>
);

/**
 * A day with nothing booked.
 *
 * The column header stays visible so the shape of the list is legible before
 * any rows exist. Note the app bar here carries no overflow menu — only ADD
 * RESERVATION, the account and LOG OUT.
 */
export const DayList: Story = {
    render: () => (
        <AppShell
            title="Restaurant Reservations"
            active="reservations"
            topBarRight={listTopBarRight}
            subBar={
                <Box sx={{ flexShrink: 0 }}>
                    <DateBand label={referenceDate} />
                    <ColumnHeaderBand columns={reservationColumns} />
                </Box>
            }
            actionBar={
                <ActionButton>
                    <EdgeLabel icon={<ChevronLeftIcon sx={{ fontSize: 30 }} />}>Back</EdgeLabel>
                </ActionButton>
            }
        >
            <AntlerEmptyState message="No reservations for this date." />
        </AppShell>
    ),
};

/**
 * Create a Reservation.
 *
 * The form strips the app bar back to the title alone. Time and party size come
 * first, then optional notes, then the customer — looked up against the golf
 * course record rather than typed fresh, which is why every customer field is a
 * search and why the resolved Golf Course Customer ID is printed above them.
 */
export const CreateReservation: Story = {
    render: () => (
        <AppShell
            title="Create a Reservation"
            active="reservations"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            subBar={<DateBand label={referenceDate} />}
            actionBar={
                <>
                    <ActionButton>
                        <EdgeLabel icon={<ChevronLeftIcon sx={{ fontSize: 30 }} />}>Back</EdgeLabel>
                    </ActionButton>
                    <ActionButton tone="primary">
                        <EdgeLabel icon={<CheckIcon sx={{ fontSize: 30 }} />} side="right">
                            Save Reservation
                        </EdgeLabel>
                    </ActionButton>
                </>
            }
        >
            <ReservationForm />
        </AppShell>
    ),
};
