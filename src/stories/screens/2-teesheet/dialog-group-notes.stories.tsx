import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailPaidPair } from "@/components/screens/tee-sheet/tee-sheet-data";
import { NotesDialog } from "@/components/screens/tee-sheet/tee-sheet-dialogs";

/**
 * **Group Notes.**
 *
 * The same dialog against the whole booking group rather than one customer.
 * Note the placeholder is identical — "Enter notes for this customer" — in both,
 * which is a real inconsistency in the shipping app.
 */
const meta = { title: "App Screens/2-teesheet/Dialog — group notes", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailPaidPair} />
            <NotesDialog title="Group Notes" />
        </>
    ),
};
