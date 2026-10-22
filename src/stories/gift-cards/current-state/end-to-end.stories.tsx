import type { Meta, StoryObj } from "@storybook/react-vite";

import { GiftCardJourney } from "@/components/concepts/gift-cards/gift-card-journey";

/**
 * **Selling a gift card, start to finish — as it ships.**
 *
 * The whole path in one component: the Pro Shop grid, the one screen that does
 * the job, the UPC dialog, the order, payment and the receipt.
 *
 * ## The walkthrough
 *
 * 1. Tap the **Gift Card** tile in the grid.
 * 2. Tap the unlabelled white box. It is the amount; $200.00 goes in.
 * 3. Tap any FROM field — standing in for typing — and pick the buyer.
 * 4. Tap any TO field and pick the recipient from the six Westons.
 * 5. **SAVE**, read the UPC dialog, **OK**.
 * 6. Pay, and read the receipt.
 *
 * ## What the run shows that a screenshot cannot
 *
 * **Nothing stops you.** SAVE is live from the first frame — no amount, no
 * buyer, no recipient. The only gate on the screen is a dialog about a field
 * it calls optional, and it arrives *after* all the work.
 *
 * **The error glyphs appear mid-search.** Attach the buyer and the TO block
 * immediately marks its Email and Phone invalid — while you are still choosing
 * the person who will fill them.
 *
 * **The sale is untaxed and unnamed.** One order line reading `Gift Card` with
 * no recipient on it, SubTotal and Grand Total both $200.00.
 */
const meta = {
    title: "Flows/Gift Cards/Current state/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Gift Card** tile in the Pro Shop grid. */
export const Purchased: Story = {
    name: "Sell a purchased gift card",
    render: () => <GiftCardJourney />,
};

/**
 * **A customer credit.**
 *
 * The same screen, the same $200.00, the same tender. Weston: *"No, it's just
 * the type… it doesn't add anything. It's mostly for reporting purposes. They
 * act the same."*
 *
 * Run it beside the purchased card and nothing differs — which is the finding.
 * The control that looks like it changes the transaction changes a report, and
 * the counter standing here has no way to know that, in either direction: no
 * way to see it is harmless, and no way to see it matters.
 */
export const CustomerCredit: Story = {
    name: "Record a customer credit",
    render: () => <GiftCardJourney startType="Customer Credit" />,
};

/**
 * **Winnings.**
 *
 * The third type, and the one that says most about the screen: a prize paid
 * out of a tournament is entered on the same form as a Christmas gift card,
 * with a *Gift Card FROM* block at the top of it.
 *
 * The two-party block is deliberate — Weston: *"the reason that's there is you
 * do want to put the to and from if it's to somebody different."* That answers
 * it for a gift. It does not answer it for a prize, which comes from the
 * course rather than from a customer, and the block is still required.
 */
export const Winnings: Story = {
    name: "Record winnings",
    render: () => <GiftCardJourney startType="Winnings" />,
};
