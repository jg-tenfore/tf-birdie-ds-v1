import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeSheetScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { TeeSheetGridView } from "@/components/screens/tee-sheet/tee-sheet-views";

/**
 * **Grid view** — six tee times across, one card each.
 *
 * Roughly four hours of the sheet fit on screen against List view's ninety
 * minutes. The trade is that positions stop being columns: a card just lists its
 * players top to bottom, so you can no longer see at a glance which of the four
 * slots is free.
 *
 * The colour is doing the work here — white is open, navy is booked, slate-blue
 * is paid, grey is blocked. The 3:10 and 3:24 PM cards are a recurring
 * "Pre-Sunset Block" that holds the last daylight times off the market.
 */
const meta = { title: "App Screens/2-teesheet/Grid view", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TeeSheetScreen view="grid">
            <TeeSheetGridView />
        </TeeSheetScreen>
    ),
};
