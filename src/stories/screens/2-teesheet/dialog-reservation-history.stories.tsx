import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailFoursome } from "@/components/screens/tee-sheet/tee-sheet-data";
import { ReservationHistoryDialog } from "@/components/screens/tee-sheet/tee-sheet-dialogs";

/**
 * **Reservation History.**
 *
 * An append-only audit log for one reservation ID, reached from the History
 * button on a player card. Three columns — timestamp, staff member, what
 * changed. The body holds its full height with a single entry, and the only way
 * out is the green OK.
 *
 * The entry here reads `Reservation Edited : $26.33 -> $26.33` — the log records
 * the edit even when the amount did not move.
 */
const meta = { title: "App Screens/2-teesheet/Dialog — reservation history", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailFoursome} />
            <ReservationHistoryDialog />
        </>
    ),
};
