import type { Meta, StoryObj } from "@storybook/react-vite";

import { MembershipJourney } from "@/components/concepts/memberships/membership-journey";

/**
 * **Selling a membership, start to finish — as it ships.**
 *
 * The whole path in one component: the Pro Shop grid, the catalogue, the form,
 * the order, payment and the receipt.
 *
 * ## The walkthrough
 *
 * 1. Tap the **Memberships** tile in the grid.
 * 2. Tap the `testing` group tile — eighteen rows become two.
 * 3. Open **Austin Membership**, priced **$1.00** on its tile.
 * 4. Tap any field to attach the customer, then **SAVE**.
 * 5. Pay, and read the receipt.
 *
 * ## What the run shows that a screenshot cannot
 *
 * **The price changes twice and nobody says why.** $1.00 on the tile, $0.32 in
 * the form, $0.36 on the ticket. The only thing on screen connecting them is a
 * read-only sentence — *First month type: Prorated* — and the arithmetic
 * happens somewhere no one can see.
 *
 * **The group tiles are filters.** They are drawn exactly like the things they
 * filter, and once you are inside a group they disappear, so the only way out
 * is a BACK button that the grid above does not have.
 *
 * **Nothing stops you.** No required field, no member number check, and SAVE
 * live from the first frame.
 */
const meta = {
    title: "Flows/Memberships/Current state/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Memberships** tile in the Pro Shop grid. */
export const SellAMembership: Story = {
    name: "Sell a membership",
    render: () => <MembershipJourney />,
};
