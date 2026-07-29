import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailPaidPair } from "@/components/screens/tee-sheet/tee-sheet-data";

/**
 * **Tee time detail** — 6:54 PM, a paid pair.
 *
 * The same screen for a time that has already been through checkout. Both
 * players show their email beside the name, and both gain **Customer Notes** and
 * **Group Notes** buttons on the right of the meta line.
 *
 * Oda's row has no Cancel or No Show — the round is paid and carries a
 * raincheck flag (the bolt) — and offers **Clone** plus both print actions
 * instead. G-Oda's row is still cancellable and still has Add to Cart, so the
 * two halves of one booking can be in different states at the same time.
 */
const meta = { title: "App Screens/2-teesheet/Tee time detail — paid pair", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <TeeTimeDetailScreen detail={detailPaidPair} />,
};
