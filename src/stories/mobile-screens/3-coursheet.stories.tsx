import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileCourtSheet } from "@/components/mobile/screens/mobile-court-sheet";

/**
 * **Mobile Screens — 3-coursheet.** Compare against `App Screens →
 * 3-coursheet`. There is no phone reference for this screen — it is
 * extrapolated from the four rules in the category overview.
 *
 * **A resource grid does not narrow.** The tablet is six facility columns ×
 * eighteen 20-minute slots, and it is read *across* as much as down: *is
 * anything free at 7:20?* is one row. Six columns at 402px are 67px each —
 * narrower than `Pickleball Court 1` and narrower than a fingertip.
 *
 * So the phone shows **one facility at a time**, picked from a switcher, as a
 * time-ordered list. Same slots, same increments, same open/booked state.
 *
 * **What that costs, plainly:** cross-facility comparison. *Which court is free
 * at 7:20?* was a glance and is now up to six taps. Nothing single-column gives
 * it back; if it turns out to be the phone's main job, the answer is a
 * different screen — availability keyed by time — not a smaller version of this
 * one. The pager goes with it, because one facility at a time has no pages.
 */
const meta = {
    title: "Mobile Screens/3-coursheet",
    parameters: { layout: "fullscreen", replica: true },
    /**
     * Portrait, only here.
     *
     * Storybook 10 reads the viewport from **globals**;
     * `parameters.viewport.defaultViewport` is the Storybook 7 API and is
     * silently ignored.
     */
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The sheet as it opens: the first facility, every 20-minute slot from 6:00 AM
 * open. The date moved into the app bar and the ways of changing it into the
 * overflow sheet — four date buttons on one row leaves the date 180px and puts
 * the two chevrons a mis-tap apart.
 */
export const CourtSheet: Story = { name: "Court sheet", render: () => <MobileCourtSheet /> };
