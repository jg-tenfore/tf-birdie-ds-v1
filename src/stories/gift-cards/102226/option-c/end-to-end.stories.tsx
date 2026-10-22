import type { Meta, StoryObj } from "@storybook/react-vite";

import { GiftCardFlow } from "@/components/concepts/gift-cards/102226/gift-card-flow";
import { OptionC, saveLabelC, titleC } from "@/components/concepts/gift-cards/102226/options";

/**
 * **C — reload lives on the card.**
 *
 * No form. Find the customer, see every card they hold, tap one, add funds.
 *
 * ## The walkthrough
 *
 * 1. Tap the **Gift Card** tile.
 * 2. Search `justin` — he holds **three**, one of them empty.
 * 3. Pick one. The arithmetic is on screen: *balance now + this = after this
 *    sale*, because the question people actually ask is *"I'm at $25, can I
 *    make this to $100?"*
 * 4. **ADD**, then pay.
 *
 * ## What the run shows
 *
 * **The thing being worked on is a card, not a draft.** Every screen is about
 * something that already exists, which is what a reload is.
 *
 * **It answers the second ask for free.** *"I definitely think from the
 * customer profile it could be accessible… there's a section that says gift
 * cards."* → *"Yeah, just do it in both places."* This is that section — the
 * banner at the top says so.
 *
 * **It only does reloads.** Selling a new card is a separate screen reached
 * separately. If that split is wrong, A or B is the answer.
 */
const meta = {
    title: "Flows/Gift Cards/102226/Option C — Card first/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Gift Card** tile in the Pro Shop grid. */
export const ReloadACard: Story = {
    name: "Reload a card",
    render: () => <GiftCardFlow render={(api) => <OptionC api={api} />} title={titleC} saveLabel={saveLabelC} startMode="reload" />,
};
