import type { Meta, StoryObj } from "@storybook/react-vite";

import { CourseMenu } from "@/components/screens/tee-sheet/tee-sheet-chrome";
import { TeeSheetScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { listRows } from "@/components/screens/tee-sheet/tee-sheet-data";
import { TeeSheetListView } from "@/components/screens/tee-sheet/tee-sheet-views";

/**
 * **The course picker, open.**
 *
 * Opens *upward* out of the bottom bar as a dark sheet, because the button it
 * belongs to already sits on the bottom edge of the screen. Three courses at
 * this facility: North, East, West. Picking one reloads the whole sheet; the
 * date and the layout toggle are unaffected.
 */
const meta = { title: "App Screens/2-teesheet/List view — course picker", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TeeSheetScreen view="list" courseMenu={<CourseMenu />}>
            <TeeSheetListView rows={listRows} />
        </TeeSheetScreen>
    ),
};
