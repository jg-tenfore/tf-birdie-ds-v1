import type { Meta, StoryObj } from "@storybook/react-vite";

import { GiftCardFlow } from "@/components/concepts/gift-cards/102226/gift-card-flow";
import { OptionA, saveLabelA, titleA } from "@/components/concepts/gift-cards/102226/options";

/**
 * **A — one screen, two modes.**
 *
 * ## The walkthrough
 *
 * 1. Tap the **Gift Card** tile.
 * 2. **New gift card** is showing. Tap the amount, then a field in each party
 *    card. **SAVE**.
 * 3. Tap **Gift Card** again, switch to **Reload a card**, and search `justin`.
 * 4. He holds **three** — pick one, choose an amount, **ADD**.
 * 5. Pay for both in one order.
 *
 * ## What the run shows
 *
 * **Both jobs put money on a card, and here they look like it.** The switch
 * keeps them visibly related, which is the argument for this version.
 *
 * **The switch is also the risk.** The screen under it changes completely when
 * it moves, so somebody arriving to sell a card can find a search box instead.
 * Option B asks before it opens anything.
 *
 * **A reload is a sale.** *"It'll just be another incoming order that adds
 * value to that card."* It lands in the rail beside the new card and goes
 * through the same tender — the balance moves because money moved.
 */
const meta = {
    title: "Flows/Gift Cards/102226/Option A — Mode switch/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Gift Card** tile in the Pro Shop grid. */
export const SellAndReload: Story = {
    name: "Sell one, then reload one",
    render: () => <GiftCardFlow render={(api) => <OptionA api={api} />} title={titleA} saveLabel={saveLabelA} />,
};
