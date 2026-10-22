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
 * **A credit, granted rather than sold.**
 *
 * The same screen with `Customer Credit` chosen. The balance lands in the
 * order at **$0.00** and the sale completes without ever reaching the tender
 * screen — because nothing is owed.
 *
 * Watch what the screen does *not* do on the way through: the amount box stays
 * live and the four spend categories stay ticked, so the operator fills in a
 * form identical to the one that takes $200 and no money moves. The only
 * difference between the two runs is one line of text.
 *
 * **The settlement behaviour here is a reading, not a record.** The Oct 22
 * capture shows the three names; what each does to the order is not in it.
 */
export const CustomerCredit: Story = {
    name: "Grant a customer credit",
    render: () => <GiftCardJourney startType="Customer Credit" />,
};

/**
 * **Winnings.**
 *
 * The third type, and the one that says most about the screen: a prize paid
 * out of a tournament is being entered on the same form as a Christmas gift
 * card, with a *Gift Card FROM* block at the top of it.
 *
 * Who the winnings are *from* is a question the screen insists on asking and
 * nobody can answer — the course, presumably, which is not a customer record.
 */
export const Winnings: Story = {
    name: "Pay out winnings",
    render: () => <GiftCardJourney startType="Winnings" />,
};
