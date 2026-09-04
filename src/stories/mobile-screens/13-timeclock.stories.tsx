import type { Meta, StoryObj } from "@storybook/react-vite";

import type { TimeClockPunch } from "@/components/screens/operations/time-clock-panel";
import { MobileTimeClock } from "@/components/mobile/screens/mobile-time-clock";

/**
 * **Mobile Screens — 13-timeclock.** Staff punch in and out, laid out for a
 * phone. Compare against `App Screens → 13-timeclock`.
 *
 * The landscape screen is almost entirely absolute positioning: two 300×65
 * buttons at `pl: 173px, pt: 239px` with a 79px gap, and a punch log filling the
 * right 50% of the canvas. None of those three numbers means anything at 402px,
 * so the buttons move into the pinned action tray and the log becomes a
 * full-width list.
 *
 * The three navigation buttons in the tablet's action bar — QUICK ORDER, PRO
 * SHOP, TEE SHEET — are dropped, because all three are already in the drawer
 * this screen opens with its hamburger and the tray they occupied is now
 * carrying the punch actions.
 */
const meta = {
    title: "Mobile Screens/13-timeclock",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const clockIn: TimeClockPunch = { timestamp: "07/29/2026 9:04 AM", type: "Clock In" };
const clockOut: TimeClockPunch = { timestamp: "07/29/2026 9:04 AM", type: "Clock Out" };

/**
 * **Clocked out.** Start of shift. CLOCK IN is the green full-width primary,
 * CLOCK OUT is the grey disabled secondary above it — the tablet's rule that
 * the dead action is greyed rather than hidden, kept intact.
 *
 * This is the one place the mobile layout **adds** something the tablet does
 * not have. With no punches yet, the shipping screen shows nothing at all, and
 * that is unremarkable there because the two clock buttons still occupy the
 * middle of the canvas. Once those buttons are pinned to the bottom, the same
 * absence leaves the entire body blank, which reads as a failed load rather
 * than a fresh day — so the empty state is drawn.
 */
export const ClockedOut: Story = {
    name: "Clocked out",
    render: () => <MobileTimeClock state="clocked-out" />,
};

/**
 * **Clocked in.** The roles swap: CLOCK OUT becomes the primary and turns red —
 * the app's only use of red for a routine, non-destructive action — and CLOCK IN
 * greys out above it.
 *
 * The red is `MobilePrimary`'s `tone="destructive"` (`appColors.red`), not the
 * tablet's slightly brighter `appColors.clockOutRed`. That is the single visual
 * difference between the two screens, and it was taken rather than adding a
 * one-screen tone to a shared shell primitive.
 *
 * The punch appears immediately. Where the tablet set it in a `53% / 47%` grid
 * across the right half of the canvas, it stacks: type on line 1, timestamp on
 * line 2, full width.
 */
export const ClockedIn: Story = {
    name: "Clocked in",
    render: () => <MobileTimeClock state="clocked-in" punches={[clockIn]} />,
};

/**
 * **After clock out.** Both punches listed, newest at the top, buttons back to
 * their opening state.
 *
 * The tablet's log reads bottom-up as the shift because the timestamps are
 * right-aligned against the midline into a single scannable column. Stacked,
 * the type is what the eye runs down instead — which is why the type is the
 * title here and the timestamp the secondary line, rather than the other way
 * around.
 */
export const AfterClockOut: Story = {
    name: "After clock out",
    render: () => <MobileTimeClock state="clocked-out" punches={[clockOut, clockIn]} />,
};
