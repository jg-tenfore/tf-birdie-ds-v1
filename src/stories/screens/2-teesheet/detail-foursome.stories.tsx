import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import { detailFoursome } from "@/components/screens/tee-sheet/tee-sheet-data";

/**
 * **Tee time detail** — 5:58 PM, a foursome.
 *
 * Tapping a position on the sheet lands here. The app bar becomes a full
 * breadcrumb (`facility - course - date time - confirmation # - FRONT`) and the
 * account cluster is replaced by a cart and an hourglass.
 *
 * Two bands sit above the players: a customer lookup, and a slate summary of
 * whoever that lookup finds. The `--------` placeholders are the app's real
 * empty state, not a spinner, and RESERVE stays grey until a customer is
 * attached.
 *
 * Each reservation gets its own card and its own row of actions, and the rows
 * differ by state — this is the important part of the screen:
 *
 * - **Oda Brennevin** ($27.82, unpaid): Cancel, No Show, History, Edit, Cart
 *   Signout, Cart Key, **Add to Cart**.
 * - **Ivar Brennevin** ($1.00, on a raincheck — note the "$" after the name):
 *   **Raincheck** replaces Cancel/No Show, and Print Starter / Print Receipt
 *   appear because there is something to print against.
 * - **Rufus Brennevin** ($37.05): back to the unpaid row.
 *
 * The grey meta line carries holes, the named rate, the cart product, the
 * reservation ID and the loyalty delta. Ivar's ends "9 roudns" — the app's own
 * typo, kept verbatim.
 */
const meta = { title: "App Screens/2-teesheet/Tee time detail — foursome", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <TeeTimeDetailScreen detail={detailFoursome} />,
};
