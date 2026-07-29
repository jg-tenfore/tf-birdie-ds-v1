import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { EventsList, eventRows } from "@/components/screens/operations/events-list";
import {
    EventCategoryGrid,
    EventOrderLineRow,
    eventOrderLines,
} from "@/components/screens/operations/events-order";

/**
 * Events — pick a tournament or outing, then sell against its tab.
 *
 * Transcribed from `references/072926/15-events/`. The flow is two screens: a
 * flat alphabetical list of every event on the books, and the event's own
 * selling screen, which is the Pro Shop surface rebound to that event's tab.
 *
 * The list is unfiltered and unsorted by date — an event from 2026 sits next to
 * a row literally named "asdf" — so operators find events by scrolling. The
 * only app-bar affordance is the overflow menu.
 */
const meta = {
    title: "App Screens/Operations/Events",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The event picker. Two centred columns, ID and name, with no bottom action bar
 * at all — the list scrolls to the bottom edge of the screen.
 */
export const EventList: Story = {
    render: () => (
        <AppShell title="Events" active="events" accountLabel="" showLogOut={false} showOverflow>
            <EventsList rows={eventRows} />
        </AppShell>
    ),
};

/**
 * An event's order screen, opened from the list.
 *
 * The app bar carries the event name in place of the account cluster, the left
 * panel holds the event's running tab, and the right is the standard category
 * grid with the Scan Mode switch above it. The confirming action is ADD PAYMENT
 * rather than PAY, because an event tab is settled in instalments.
 */
export const EventOrder: Story = {
    render: () => (
        <AppShell
            title="1 Trevor Event Test"
            active="events"
            topBarRight={<Box />}
            orderPanel={
                <Stack sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                    {eventOrderLines.map((line) => (
                        <EventOrderLineRow key={line.id} line={line} />
                    ))}
                </Stack>
            }
            actionBar={
                <>
                    <ActionButton grow={1} icon={<ChevronLeftIcon />}>
                        Back
                    </ActionButton>
                    <ActionButton grow={1} tone="primary" icon={<AddIcon />}>
                        Add Payment
                    </ActionButton>
                </>
            }
        >
            <EventCategoryGrid />
        </AppShell>
    ),
};
