import type { Meta, StoryObj } from "@storybook/react-vite";

import {
    TipAuthorising,
    TipComplete,
    TipCustom,
    TipHandoff,
    TipReceipt,
    TipSelect,
    TippingFlow,
} from "@/components/mobile/screens/mobile-tipping";

/**
 * **Tipping — the handheld flow.** From the Sept 4 call with Weston.
 *
 * The handheld is not a Clover, so the tip flow it used to borrow has to be
 * built. This is that flow, in his order.
 *
 * > *"It would be before the transaction finishes. The employee would hit pay,
 * > it would authorize, they'd tap their card… once we get an OK from the
 * > processor, then it would go to that tip screen — because it's like, yep,
 * > we're going to charge that card, do you want to add a tip?"*
 *
 * **Start with "The whole flow"**, which walks all six screens.
 *
 * The one thing to take from this folder: the tip sits **after authorisation
 * and before capture**. Ask earlier and a changed tip needs a second
 * authorisation; ask later and the sale has to be voided and re-run.
 */
const meta = {
    title: "Mobile Screens/Tipping",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **The whole flow**, on Weston's own $74 example.
 *
 * Six screens: authorise → hand over → tip → approve → receipt → hand back.
 * The authorising step runs on a timer because that is what it does on the
 * device — skipping it would hide the one moment the customer is not yet
 * committed.
 *
 * Try **Custom** as well as the suggestions; it has its own keypad.
 */
export const WholeFlow: Story = { name: "The whole flow", render: () => <TippingFlow total={74} /> };

/**
 * **1 — Authorising.** The employee is still holding the device.
 *
 * Nothing here asks the customer for anything, because until the processor says
 * yes there is nothing to ask about.
 */
export const Authorising: Story = { name: "1 — Authorising", render: () => <TipAuthorising total={74} /> };

/**
 * **2 — Hand it over.** A deliberate full-screen beat.
 *
 * > *"the employee would then hand that to the customer"*
 *
 * The card is approved and the amount is fixed, so the screen stops and says so
 * rather than letting a tip prompt appear in the employee's hands. Without this,
 * an employee watches a customer poke at a screen wondering whose turn it is.
 */
export const Handoff: Story = { name: "2 — Hand to the customer", render: () => <TipHandoff total={74} /> };

/**
 * **3 — The tip screen.** The one the customer holds.
 *
 * Every suggestion shows **the percentage and the money it comes to**. A
 * customer choosing between 20% and 25% on a $74 bill is doing arithmetic under
 * mild social pressure with an employee watching — `$14.80` beside `20%`
 * removes it.
 *
 * The chrome is bare on purpose: no drawer, no overflow, no back. The device is
 * in a stranger's hands and every control that is not the task is a way out of
 * it.
 *
 * **`Approve`, not `Save`** — Weston corrected himself on the call, and it is
 * the right word. The customer is agreeing to a charge, not filing a preference.
 */
export const Select: Story = { name: "3 — Choose a tip", render: () => <TipSelect total={74} /> };

/** The same screen with 25% taken, showing what the button becomes. */
export const SelectChosen: Story = { name: "3 — Chosen", render: () => <TipSelect total={74} selected={18.5} /> };

/**
 * **4 — Custom.** A dollar amount, as Weston specified.
 *
 * > *"If they hit custom, then they can add a dollar amount."*
 *
 * Its own keypad, for the same reason sign-in has one: a POS should not summon
 * a QWERTY keyboard to collect four digits, and the OS keyboard would cover
 * half the screen.
 */
export const Custom: Story = { name: "4 — Custom amount", render: () => <TipCustom total={74} value="1200" /> };

/**
 * **5 — Receipt.** Email or nothing.
 *
 * > *"this device won't have a printer, so I'd want to avoid that option for
 * > the golfer. They can always go print it in the kitchen area."*
 *
 * **Print is not an option here.** A print button that cannot print is worse
 * than no button — the customer taps it, the employee explains, and the device
 * has cost time instead of saving it.
 */
export const Receipt: Story = { name: "5 — Receipt", render: () => <TipReceipt total={74} tip={18.5} email="golfer@example.com" /> };

/**
 * **6 — Done.** The second handoff.
 *
 * > *"that would give them a completion screen, like, yeah, you did it. Please
 * > hand the device back to the employee."*
 *
 * The customer needs to know they are finished and the employee needs to know
 * they can take the device back. One screen does both.
 */
export const Complete: Story = { name: "6 — Hand it back", render: () => <TipComplete total={74} tip={18.5} receipt="email" /> };

/**
 * **Tipped on the subtotal instead.**
 *
 * **This is the open question.** Justin asked on the call whether the tip is
 * calculated on the subtotal or the total, and it was not answered. Weston's
 * own example — *"the total was $74, add 20%"* — reads as the total, and that is
 * the default everywhere else in this folder.
 *
 * Here the same sale is tipped on a $69.16 subtotal instead: 20% is **$13.83**
 * rather than $14.80. Just under a dollar a ticket, every ticket — which is
 * worth a decision rather than a default.
 */
export const OnSubtotal: Story = {
    name: "Open question — tipped on the subtotal",
    render: () => <TipSelect total={74} subtotal={69.16} tipBasis="subtotal" />,
};
