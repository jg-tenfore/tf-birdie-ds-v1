import type { Meta, StoryObj } from "@storybook/react-vite";

import { RegistrationFlow } from "@/components/concepts/clinics/102226/registration-flow";
import { bothBooked, clinicsChosen, datesChosen, twoPlayers } from "@/components/concepts/clinics/102226/registration-fixtures";
import { OptionC, canAdvanceC, nextLabelC, pagesC, stepCountC, titleC } from "@/components/concepts/clinics/102226/option-c-confirm-first";
import type { Registration } from "@/components/concepts/clinics/102226/registration";

/**
 * **C — the first player steps, the rest are filled in on the summary.**
 *
 * A and B walk every player through the same pages. This one takes Weston's
 * own shortcut literally — *"same as Justin, and it just **skips those
 * steps**"* — and removes the steps for everybody after the first.
 *
 * Steps 1 and 2 are identical to A and B. **Step 4 is the whole difference.**
 */
const meta = {
    title: "Flows/Clinics/102226/Option C — Confirm first/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Screen = ({ seed, at }: { seed: Registration; at: number }) => (
    <RegistrationFlow
        seed={seed}
        startStep={at}
        render={(api) => <OptionC api={api} />}
        stepCount={stepCountC}
        canAdvance={canAdvanceC}
        nextLabel={nextLabelC}
        title={titleC}
    />
);

const pageAt = (kind: string) =>
    Math.max(
        0,
        pagesC().findIndex((page) => page.kind === kind),
    );

/**
 * **Step 1 — how many players.** Identical to A and B: the size of the job,
 * asked before anything else.
 */
export const Count: Story = {
    name: "1 — How many players",
    render: () => <Screen seed={twoPlayers()} at={pageAt("count")} />,
};

/**
 * **Step 2 — who they are, all of them.** Also identical: every name found
 * before a single clinic is picked.
 */
export const Info: Story = {
    name: "2 — Who they are",
    render: () => <Screen seed={twoPlayers()} at={pageAt("info")} />,
};

/**
 * **Step 3 — the first player's clinics.**
 *
 * Only the first player gets this page. Everyone after them is handled on the
 * summary, which is the point of the version.
 */
export const Clinics: Story = {
    name: "3 — First player's clinics",
    render: () => <Screen seed={clinicsChosen()} at={pageAt("clinics")} />,
};

/**
 * **Step 4 — the working summary.**
 *
 * The registration lands here as soon as the first player is done, and this
 * one page finishes the job. Each remaining player is a row with two ways
 * forward:
 *
 * - **SAME AS JUSTIN** copies the whole selection — every clinic, every date —
 *   in one tap. For the common case that is the entire interaction.
 * - **CHOOSE SEPARATELY** opens that player's clinic list and dates **inside
 *   the row**, so the rest of the family stays on screen while you work.
 *
 * Which is Weston's awkward case solved in place: *"he's going to do the Junior
 * Golf Academy, but he actually can't do Tuesdays because he has baseball, so
 * I'm going to put him on Wednesday."* Copy, open, change the one date, close.
 *
 * **Five pages for two players, against A's ten.** The cost is that this page
 * is doing two jobs — reviewing and editing — and on a family of five it gets
 * tall. Tap **CHOOSE SEPARATELY** on the second row to see how tall.
 */
export const Summary: Story = {
    name: "4 — The working summary",
    render: () => <Screen seed={datesChosen()} at={pageAt("confirm")} />,
};

/**
 * **The same summary, with both players booked.**
 *
 * Weston copied and then changed: the second player is on three of the first
 * player's four dates, having dropped one. The discount nudge at the top is
 * live — Justin is one date short of the Junior Golf Academy's five-date
 * threshold, and the screen says so where it can still be acted on.
 *
 * Note the date both players share. It held exactly two places, so the row now
 * reads none left — the capacity count coming down as people are assigned,
 * rather than at the till.
 */
export const Booked: Story = {
    name: "5 — Both players booked",
    render: () => <Screen seed={bothBooked()} at={pageAt("confirm")} />,
};
