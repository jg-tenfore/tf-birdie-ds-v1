import type { Meta, StoryObj } from "@storybook/react-vite";

import { RegistrationFlow } from "@/components/concepts/clinics/102226/registration-flow";
import { OptionB, canAdvanceB, nextLabelB, stepCountB, titleB } from "@/components/concepts/clinics/102226/option-b-one-page";

/**
 * **A whole registration, start to finish.**
 *
 * ## The walkthrough
 *
 * 1. Tap the **Clinics** tile.
 * 2. **How many players.** Try **2**.
 * 3. **Who they are** — tap any field on each card; a different person fills in.
 * 4. Pick clinics for the first player. Several at once.
 * 5. Pick their dates.
 * 6. The second player — **SAME AS …** copies everything, then change what differs.
 * 7. Review, and **ADD TO CART**.
 * 8. Pay, and read the receipt.
 *
 * ## What the run shows that a screenshot cannot
 *
 * **The rail never leaves.** Weston reversed the Oct 20 call — *"I was wrong…
 * let's add the rail back then, to keep it consistent"* — so whatever is
 * already in the order stays on screen through every step of a registration
 * that can run nine screens deep.
 *
 * **The spots count comes down as you assign.** Put both players on a date
 * with two places left and it says so on the row, before anybody is refused at
 * the till.
 *
 * **The discount nudges at the end.** One date short of a threshold, the
 * review screen says which player, which clinic, and what one more date is
 * worth.
 *
 * **It ends at the cart, not the card** — *"is there that 10% where the course
 * comes and complains because they needed to add a dozen golf balls?"*
 */
const meta = {
    title: "Flows/Clinics/102226/Option B — One page per player/End to end",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start on the **Clinics** tile in the Pro Shop grid. */
export const RegisterAFamily: Story = {
    name: "Register a family",
    render: () => (
        <RegistrationFlow
            render={(api) => <OptionB api={api} />}
            stepCount={stepCountB}
            canAdvance={canAdvanceB}
            nextLabel={nextLabelB}
            title={titleB}
        />
    ),
};
