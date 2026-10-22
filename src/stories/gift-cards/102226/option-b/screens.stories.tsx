import type { Meta, StoryObj } from "@storybook/react-vite";

import { GiftCardFlow } from "@/components/concepts/gift-cards/102226/gift-card-flow";
import { OptionBFlow, saveLabelB, titleB } from "@/components/concepts/gift-cards/102226/options";

/**
 * **A — one screen, two modes.** A segmented control at the top of the cleaned
 * form; everything else is shared with B.
 *
 * Both stories are live — switch modes, tap the amount, search a customer.
 */
const meta = {
    title: "Flows/Gift Cards/102226/Option B — Two paths/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Screen = ({ mode }: { mode: "new" | "reload" }) => (
    <GiftCardFlow startInside startMode={mode} render={(api) => <OptionBFlow api={api} />} title={titleB} saveLabel={saveLabelB} />
);

/**
 * **The question, first.**
 *
 * Weston's own shape: *"there's gift card, and there's an option to reload or
 * purchase new, or something like that."*
 *
 * It costs a tap on every sale, including the common one — and it buys two
 * things. Neither screen can be mistaken for the other, and **nobody inherits
 * the last person's mode**, which is the failure Option A's switch can have.
 */
export const Choose: Story = {
    name: "1 — New card or reload?",
    render: () => <Screen mode="new" />,
};

/**
 * **The cleaned create screen**, reached by choosing *Sell a new card*.
 *
 * Against the [shipping version](?path=/story/flows-gift-cards-current-state-screens--empty),
 * five changes — all of them labelling or subtraction:
 *
 * 1. **The amount has a caption.** On the device the biggest control on screen
 *    carries no label at all.
 * 2. **FROM and TO are cards with plain headings** — *Bought by*, *For* —
 *    instead of `Gift Card FROM ——— Golf Course Customer ID 0` crammed above
 *    its fields. This is the cram Weston named.
 * 3. **`Same as From` is no longer a dark button.** It sat where a primary
 *    action goes while doing a copy; it is now a text action inside the card it
 *    fills, and only appears once there is a buyer to copy.
 * 4. **The spend categories get a sentence** saying what unticking one does.
 * 5. **The expiry says *set automatically*** — because it is computed from
 *    today and nobody chose it.
 *
 * And **SAVE is disabled until there is an amount**, where the device's is live
 * on an empty form.
 */
export const Create: Story = {
    name: "2 — Create, cleaned up",
    render: () => <Screen mode="new" />,
};

/**
 * **The reload screen**, reached by choosing *Reload a card*.
 *
 * Search `justin` — he holds **three**
 * cards, which is the case Weston named: *"you would click on it, because they
 * could have multiple."*
 *
 * Each row carries what it takes to tell them apart — the code, the balance,
 * what the card was issued at, when it was last used. One of his is **empty**,
 * which is exactly the card someone asks to reload.
 */
export const Reload: Story = {
    name: "3 — Reload a card",
    render: () => <Screen mode="reload" />,
};
