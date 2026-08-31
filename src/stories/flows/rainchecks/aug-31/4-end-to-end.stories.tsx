import type { Meta, StoryObj } from "@storybook/react-vite";

import { CounterFlowB } from "@/components/concepts/rainchecks/aug-31/counter-flow-b";

/**
 * **Aug 31 — the chosen solution, start to finish.**
 *
 * Weston described a *sequence*, not a screen, so this is built as one. Same
 * customer, same ticket, same raincheck — walked through Option B.
 *
 * **For the contrast, open
 * [Aug 24 → 4 — Start to finish → Today](?path=/story/flows-rainchecks-aug-24-4-start-to-finish--today)
 * beside this.** That story is the shipping behaviour: it ends with a manager, a
 * queue and a second system. It is deliberately not duplicated here, because
 * everything in this folder is the chosen design and nothing else.
 *
 * The dialogue stays on screen at every step. This is a *conversation* failure
 * and the screen is only where it starts — *"I don't see it here"* is the line
 * that costs the money, and it belongs beside the pane that produces it.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/4 — Start to finish",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Weston's incident, settled at the counter.**
 *
 * Tap **RAIN**. Nothing is spendable — and the pane does not go blank. It says
 * what the customer had, and offers one labelled tap to the three credits on
 * their name.
 *
 * Tap that, and the answer is there with the course on it:
 *
 * > *"You did have one — it was spent on 5/02 at Falls Road, on a twilight
 * > green fee."*
 *
 * **Nothing was typed.** The customer was not wrong and was not told they were.
 * No manager, no Buck, no queue.
 *
 * Then take the other tender and finish the sale — because the point is that
 * the sale still completes.
 */
export const UsedElsewhere: Story = {
    name: "Used at another course — the incident, settled",
    render: () => <CounterFlowB ending="used-elsewhere" />,
};

/**
 * **The near miss — the credit was live all along.**
 *
 * Same flow, except this customer's raincheck is **valid**: issued at another
 * course, never spent, worth more than the ticket.
 *
 * This is the version that should worry us most. If the register's lookup is
 * scoped to the course you are standing in — **and nobody has checked the
 * device** — then this customer is turned away holding good money. That is a
 * worse failure than the one Weston described, because the credit is real and
 * the customer is right.
 *
 * Pick it, apply it, and the flow ends on the payment result, which names the
 * credit, the course that issued it and what is left. So the next conversation
 * starts from a receipt rather than from nothing.
 */
export const FoundElsewhere: Story = {
    name: "The near miss — a live credit from another course",
    render: () => <CounterFlowB ending="found-elsewhere" />,
};
