import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailFoursome } from "@/components/screens/tee-sheet/tee-sheet-data";

/**
 * **Step 1 — where a raincheck starts.**
 *
 * A tee time with four positions on it. Look at what each row offers: three of
 * them show **Cancel** and **No Show**, and Ivar Brennevin's shows **Raincheck**
 * in their place. The difference is that Ivar's round is paid. An unpaid booking
 * is cancelled; a paid one has money in it, and the only way to give that money
 * back is a credit.
 *
 * That is the entire entry point, and it is worth noticing how little signals
 * it. The button is the same size and weight as Cancel, in the same red, in a
 * row of seven — nothing marks it as the one that creates a financial
 * instrument. An operator looking for "refund" will not find that word anywhere
 * on this screen.
 *
 * The fourth row is **Women's League**: a booking with no customer behind it and
 * no actions at all. Rainchecks are filed against a customer record, so a league
 * cannot have one — which is correct, and is the case that breaks any design
 * assuming every name on a sheet is a person.
 *
 * Tapping Raincheck opens **Create raincheck**.
 */
const meta = {
    title: "Flows/Rainchecks/1 — Booking with a raincheck",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <TeeTimeDetailScreen detail={detailFoursome} />,
};
