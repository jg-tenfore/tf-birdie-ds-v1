import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeSheetScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { TeeSheetMultiView } from "@/components/screens/tee-sheet/tee-sheet-views";

/**
 * **Multi view** — all three courses at once.
 *
 * Each course is a column with its own card stack, and each keeps its own
 * interval: North runs every 14 minutes, East every 10, West every 9. The rows
 * therefore never line up horizontally, and no attempt is made to align them.
 *
 * The course picker disappears from the bottom bar in this mode, since every
 * course is already on screen. North's 5:36 AM card shows four BLOCKED bars; its
 * 6:04 AM has a pair booked online — the globe glyph — at $120.00 each.
 */
const meta = { title: "App Screens/2-teesheet/Multi view — three courses", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TeeSheetScreen view="multi">
            <TeeSheetMultiView />
        </TeeSheetScreen>
    ),
};
