import type { Meta, StoryObj } from "@storybook/react-vite";

import { GiftCardFlow } from "@/components/concepts/gift-cards/102226/gift-card-flow";
import { OptionC, saveLabelC, titleC } from "@/components/concepts/gift-cards/102226/options";

/**
 * **C — reload lives on the card.** No form, no mode switch: find the
 * customer, see what they hold, add to one of them.
 *
 * Live — search `justin`, or a card number like `7741`.
 */
const meta = {
    title: "Flows/Gift Cards/102226/Option C — Card first/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **The whole of it.**
 *
 * Search `justin` and he returns **three** cards — the case Weston named:
 * *"you would click on it, because they could have multiple."* One is empty,
 * which is exactly the card somebody asks to reload.
 *
 * Pick one and the arithmetic appears, because the question people actually
 * ask is a target rather than an amount: *"oh, I'm at $25, can I make this to
 * $100?"* The screen shows **balance now + this = after this sale** so the two
 * readings cannot be confused.
 *
 * The band at the top is the second half of Weston's ask — *"I definitely
 * think from the customer profile it could be accessible"* → *"yeah, just do
 * it in both places."* This version needs no extra screen to satisfy it,
 * because the screen is already about the customer's cards.
 */
export const Reload: Story = {
    name: "1 — Find the card, add funds",
    render: () => (
        <GiftCardFlow startInside startMode="reload" render={(api) => <OptionC api={api} />} title={titleC} saveLabel={saveLabelC} />
    ),
};
