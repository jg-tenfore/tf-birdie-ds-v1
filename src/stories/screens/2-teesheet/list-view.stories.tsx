import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeSheetScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { listRows } from "@/components/screens/tee-sheet/tee-sheet-data";
import { TeeSheetListView } from "@/components/screens/tee-sheet/tee-sheet-views";

/**
 * **List view** — the default, and the one attendants live in.
 *
 * One row per tee time: the time on the left, four playing positions across the
 * middle, and a gear at the right end that operates on the whole time. Each
 * booked position carries the party size in parentheses, the booking name, a
 * cart glyph if a cart is attached, and the amount owed. A large "$" watermark
 * marks reservations carrying a balance; the two green 6:54 PM positions are paid.
 *
 * Note the 6:26 PM row: three positions all read `(4) Ivar Brennevin` at `$0.00`.
 * The sheet does nothing to disambiguate repeated names — the amount and the
 * position are the only distinguishing marks.
 */
const meta = { title: "App Screens/2-teesheet/List view", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TeeSheetScreen view="list">
            <TeeSheetListView rows={listRows} />
        </TeeSheetScreen>
    ),
};
