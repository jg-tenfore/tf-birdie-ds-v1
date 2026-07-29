import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { TimeClockPanel, type TimeClockPunch } from "@/components/screens/operations/time-clock-panel";

/**
 * **Time Clock** — staff punch in and out for the day.
 *
 * Two buttons, only one of them live: the app decides which action is available
 * from the last punch on record and greys out the other rather than hiding it.
 * Punches accumulate in a list on the right, newest first, and there is no edit
 * or delete — a mistaken punch is corrected by punching again.
 *
 * The action bar is pure navigation (QUICK ORDER, PRO SHOP, TEE SHEET), which
 * makes this screen a natural landing point at the start of a shift.
 */
const meta = {
    title: "App Screens/13-timeclock",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const NavActionBar = (
    <>
        <ActionButton>
            <BoltIcon sx={{ position: "absolute", left: 20 }} />
            QUICK ORDER
        </ActionButton>
        <ActionButton>
            <StorefrontIcon sx={{ position: "absolute", left: 20 }} />
            PRO SHOP
        </ActionButton>
        <ActionButton>
            <CalendarMonthIcon sx={{ position: "absolute", left: 20 }} />
            TEE SHEET
        </ActionButton>
    </>
);

const clockIn: TimeClockPunch = { timestamp: "07/29/2026 9:04 AM", type: "Clock In" };
const clockOut: TimeClockPunch = { timestamp: "07/29/2026 9:04 AM", type: "Clock Out" };

/**
 * Start of shift. CLOCK IN is green, CLOCK OUT is disabled, and with no punches
 * yet the list is absent — the app shows no empty state for it.
 */
export const ClockedOut: Story = {
    name: "Clocked out",
    render: () => (
        <AppShell title="Time Clock" active="timeclock" showOverflow={false} actionBar={NavActionBar}>
            <TimeClockPanel state="clocked-out" />
        </AppShell>
    ),
};

/**
 * On the clock. The roles swap — CLOCK IN greys out and CLOCK OUT turns red,
 * the app's only use of red for a routine, non-destructive action. The punch
 * appears immediately in the list.
 */
export const ClockedIn: Story = {
    name: "Clocked in",
    render: () => (
        <AppShell title="Time Clock" active="timeclock" showOverflow={false} actionBar={NavActionBar}>
            <TimeClockPanel state="clocked-in" punches={[clockIn]} />
        </AppShell>
    ),
};

/**
 * After punching out. The buttons return to their opening state and both punches
 * stay listed, newest at the top — the pair reads bottom-up as the shift.
 */
export const AfterClockOut: Story = {
    name: "After clock out",
    render: () => (
        <AppShell title="Time Clock" active="timeclock" showOverflow={false} actionBar={NavActionBar}>
            <TimeClockPanel state="clocked-out" punches={[clockOut, clockIn]} />
        </AppShell>
    ),
};
