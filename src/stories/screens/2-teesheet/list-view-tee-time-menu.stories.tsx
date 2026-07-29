import type { Meta, StoryObj } from "@storybook/react-vite";

import { SlotSettingsMenu } from "@/components/screens/tee-sheet/tee-sheet-chrome";
import { TeeSheetScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { listRowsWithCartKey } from "@/components/screens/tee-sheet/tee-sheet-data";
import { TeeSheetListView } from "@/components/screens/tee-sheet/tee-sheet-views";

/**
 * **The tee-time gear menu, open.**
 *
 * Six operations, all on the tee time rather than on a player. Squeeze inserts
 * an extra time immediately before or after this one — how a walk-up gets fitted
 * into a full sheet. Clone copies the time and its players. Clear Time empties
 * it. Move Player(s) hands the group to another time.
 *
 * The 5:58 PM row also shows a key glyph on the first position here: that
 * reservation's cart has been signed out since the previous capture.
 */
const meta = { title: "App Screens/2-teesheet/List view — tee time menu", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TeeSheetScreen view="list">
            <TeeSheetListView rows={listRowsWithCartKey} slotMenu={<SlotSettingsMenu />} />
        </TeeSheetScreen>
    ),
};
