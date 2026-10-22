import type { Meta, StoryObj } from "@storybook/react-vite";

import { GiftCardFlow } from "@/components/concepts/gift-cards/102226/gift-card-flow";
import { OptionBFlow, saveLabelB, titleB } from "@/components/concepts/gift-cards/102226/options";

/**
 * **B — the choice comes first.**
 *
 * The shape Weston reached for: *"there's gift card, and there's an option to
 * reload or purchase new, or something like that."*
 *
 * ## The walkthrough
 *
 * 1. Tap the **Gift Card** tile. It asks one question.
 * 2. **Sell a new card** → the cleaned form. Amount, both parties, **SAVE**.
 * 3. Tap **Gift Card** again — it asks again, because nobody should inherit
 *    the last person's mode.
 * 4. **Reload a card** → search `justin`, pick one of his three, add funds.
 *
 * ## What the run shows
 *
 * **Neither screen can be mistaken for the other**, and each is built for its
 * own job with nothing borrowed.
 *
 * **The cost is a tap on every sale**, including the common one. Whether that
 * is worth paying depends on how often a reload actually happens — which is
 * the thing nobody knows yet, because the feature does not exist.
 */
const meta = {
    title: "Flows/Gift Cards/102226/Option B — Two paths/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Gift Card** tile in the Pro Shop grid. */
export const SellAndReload: Story = {
    name: "Sell one, then reload one",
    render: () => <GiftCardFlow render={(api) => <OptionBFlow api={api} />} title={titleB} saveLabel={saveLabelB} />,
};
