import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailEmpty } from "@/components/screens/tee-sheet/tee-sheet-data";
import { TeeTimeNotesDialog } from "@/components/screens/tee-sheet/tee-sheet-dialogs";

/**
 * **Tee Time Notes.**
 *
 * Attached to the time itself rather than to a player, which is why it is
 * reached from the bottom bar and why it has no Cancel — a single full-width
 * SAVE. It is a one-line field, not the multi-line box the notes dialogs use.
 */
const meta = { title: "App Screens/2-teesheet/Dialog — tee time notes", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailEmpty} />
            <TeeTimeNotesDialog />
        </>
    ),
};
