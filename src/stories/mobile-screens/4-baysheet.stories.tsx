import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileBaySheet, MobileNewReservation } from "@/components/mobile/screens/mobile-bay-sheet";

/**
 * **Mobile Screens — 4-baysheet.** Compare against `App Screens →
 * 4-baysheet`. No phone reference exists for this screen either.
 *
 * The tablet is a **true timeline** — a half-hour gutter, six bay columns, and
 * bookings drawn as blocks whose *height is their duration*. Two things do not
 * survive 402px: six columns beside a 72px gutter leaves 55px a bay, and
 * height-as-duration stops reading in a 55px strip.
 *
 * The switcher's first tab is the important one. This sheet is opened to answer
 * **what is free at 11:30**, which on the tablet is a glance down one row, so
 * `All bays` keeps that as a single column: one row per half hour, how many of
 * the six are open on the right. Picking a named bay then shows that bay's day.
 *
 * **What the phone gives up:** duration as a shape; *which* bays are free
 * without a second tap; and ZOOM OUT, which a scrolling list has nothing left
 * to do with.
 */
const meta = {
    title: "Mobile Screens/4-baysheet",
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

/** Nothing booked, as the tablet story ships it — twelve half-hours from 10:00. */
export const BaySheet: Story = { name: "Bay sheet", render: () => <MobileBaySheet /> };

/**
 * **MAKE A NEW RESERVATION**, as a screen rather than a near-full-bleed panel.
 *
 * The six values were three-across on two rows; three-across is 134px a value
 * here, so they unfold into one column. The bare `-` / `+` steppers become
 * tap-to-pick rows — three targets beside a label all land under 44dp — and
 * CANCEL becomes the ✕, because a full-width CANCEL above CREATE would be the
 * loudest control on a screen whose job is to create something.
 */
export const NewReservation: Story = { name: "New reservation", render: () => <MobileNewReservation /> };
