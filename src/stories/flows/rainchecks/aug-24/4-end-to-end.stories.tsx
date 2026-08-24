import type { Meta, StoryObj } from "@storybook/react-vite";

import { CounterMomentFlow } from "@/components/concepts/rainchecks/counter-moment-flow";

/**
 * **Concept — Aug 24. The incident, start to finish.**
 *
 * Weston described a *sequence*, not a screen, so this is built as one. Same
 * customer, same $100 ticket, same raincheck. What changes is whether the
 * register can answer the question it is asked.
 *
 * **Run "Today" first.** It ends where the real one did — with a manager and a
 * second system. Then run the same incident through the proposal and watch it
 * finish at the counter.
 *
 * The dialogue stays on screen at every step, because this is a *conversation*
 * failure and the screen is only where it starts. *"I don't see it here"* is the
 * line that costs the money, and it belongs next to the pane that produces it.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 24/4 — Start to finish",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Today — where it goes wrong.**
 *
 * > *"Employee clicks raincheck payment type and searches customer name. Nothing
 * > comes up. Employee says 'I don't see it here.' Customer gets mad."*
 *
 * Tap **RAIN CHECK** and look at what the screen offers: an empty result and
 * nothing else. The customer's raincheck is real — `29115`, spent at Falls Road
 * on 5/02 — and this screen holds that fact and cannot say it, because the
 * lookup filters out anything that cannot be spent. **"Used" and "never existed"
 * produce the same empty screen.**
 *
 * The only control left is **Ask a manager**, which is exactly what happens.
 */
export const Today: Story = {
    name: "Today — ends with a manager and Buck",
    render: () => <CounterMomentFlow variant="today" ending="used-elsewhere" />,
};

/**
 * **The proposal — the same incident, settled at the counter.**
 *
 * Identical ticket, identical customer, identical raincheck. Tap **RAIN CHECK**
 * and the pane does not go empty: it says what the customer had and what
 * happened to it, naming the course.
 *
 * > *"You did have one — it was spent on 5/02 at Falls Road, on a twilight green
 * > fee."*
 *
 * That sentence is the entire fix, and **it needs no search**. The employee never
 * types, never says "I don't see it here", and never leaves the sale. Below the
 * divider the expired and voided credits are listed too, so nothing about this
 * customer is hidden.
 *
 * No manager, no Buck, no queue.
 */
export const Proposed: Story = {
    name: "Proposed — settled at the counter",
    render: () => <CounterMomentFlow variant="proposed" ending="used-elsewhere" />,
};

/**
 * **The near miss — the credit was there all along.**
 *
 * The same flow, except this customer's raincheck is **live**: issued at another
 * course, never spent, and worth more than the ticket.
 *
 * This is the version that should worry us most, and it is the reason the open
 * question in the Overview matters. If the register's lookup is scoped to the
 * course you are standing in, **this customer is turned away holding a valid
 * credit** — and that is a worse failure than the one Weston described, because
 * the money is real and the customer is right.
 *
 * Nobody has checked the device. Somebody should.
 *
 * Pick the credit, apply it, and the flow ends on the payment result — which now
 * names the credit, the course that issued it, and what is left. So the next
 * conversation starts from a receipt rather than from nothing.
 */
export const FoundElsewhere: Story = {
    name: "The near miss — a live credit from another course",
    render: () => <CounterMomentFlow variant="proposed" ending="found" />,
};
