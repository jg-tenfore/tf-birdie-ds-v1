import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailEmpty } from "@/components/screens/tee-sheet/tee-sheet-data";

/**
 * **Tee time detail** — 5:44 PM, nobody booked.
 *
 * An open time keeps the entire chrome and simply has no cards. There is no
 * empty-state illustration and no "add player" affordance in the body: booking
 * starts from the search field at the top, which fills the summary band and
 * enables RESERVE.
 */
const meta = { title: "App Screens/2-teesheet/Tee time detail — open time", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <TeeTimeDetailScreen detail={detailEmpty} />,
};
