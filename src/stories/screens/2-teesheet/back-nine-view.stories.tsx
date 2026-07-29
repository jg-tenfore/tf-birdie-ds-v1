import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeSheetScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { TeeSheetBackNineView } from "@/components/screens/tee-sheet/tee-sheet-views";

/**
 * **Back 9 view** — the front and back nines of one course, side by side.
 *
 * For courses selling 9-hole rounds off both tees. The two halves share a time
 * axis; the back-nine times are printed in a slate blue so the halves stay
 * distinguishable when the screen is dense.
 *
 * The 7:00 AM league block shows the "9H D35" tags — the app's shorthand for a
 * 9-hole round on a named rate — alongside $25.93. A weather line sits above the
 * Front/Back headers and holds its row even when there is nothing to say.
 */
const meta = { title: "App Screens/2-teesheet/Back 9 view — front and back", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TeeSheetScreen view="back9">
            <TeeSheetBackNineView />
        </TeeSheetScreen>
    ),
};
