import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailPaidPair } from "@/components/screens/tee-sheet/tee-sheet-data";
import { NotesDialog } from "@/components/screens/tee-sheet/tee-sheet-dialogs";

/**
 * **Customer Notes.**
 *
 * A free-text note against the customer, carried between visits. Both buttons
 * are slate — the app does not weight Save above Cancel here.
 */
const meta = { title: "App Screens/2-teesheet/Dialog — customer notes", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailPaidPair} />
            <NotesDialog title="Customer Notes" />
        </>
    ),
};
