import type { Meta, StoryObj } from "@storybook/react-vite";

import { RegistrationFlow } from "@/components/concepts/clinics/102226/registration-flow";
import { bothBooked, clinicsChosen, datesChosen, twoPlayers } from "@/components/concepts/clinics/102226/registration-fixtures";
import { OptionB, canAdvanceB, nextLabelB, pagesB, stepCountB, titleB } from "@/components/concepts/clinics/102226/option-b-one-page";
import type { Registration } from "@/components/concepts/clinics/102226/registration";

/**
 * **B — every clinic for a player, on one page.** The other answer to the
 * question Weston left open: all of a player's chosen clinics stack down one
 * scroll, each with its own dates and its own discount line.
 *
 * Steps 1, 2, 3 and 5 are identical to Option A. **Step 4 is the whole
 * difference** — compare them side by side.
 *
 * Every story is live — tap the rows, change the count, open a date.
 */
const meta = {
    title: "Flows/Clinics/102226/Option B — One page per player/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Screen = ({ seed, at }: { seed: Registration; at: (registration: Registration) => number }) => (
    <RegistrationFlow
        seed={seed}
        startStep={at(seed)}
        render={(api) => <OptionB api={api} />}
        stepCount={stepCountB}
        canAdvance={canAdvanceB}
        nextLabel={nextLabelB}
        title={titleB}
    />
);

/** Find the page index this story wants, rather than counting by hand. */
const pageAt =
    (kind: string, player = 0, clinicId?: string) =>
    (registration: Registration) =>
        Math.max(
            0,
            pagesB(registration).findIndex(
                (page) =>
                    page.kind === kind &&
                    (!("player" in page) || page.player === player) &&
                    (!clinicId || ("clinicId" in page && page.clinicId === clinicId)),
            ),
        );

/**
 * **Step 1 — how many players.**
 *
 * *"Click on clinics and you'd first be asked how many players. Right off the
 * get-go."* No clinic, no date, no price yet — just the size of the job, which
 * is what decides the shape of everything after it.
 */
export const Count: Story = {
    name: "1 — How many players",
    render: () => <Screen seed={twoPlayers()} at={pageAt("count")} />,
};

/**
 * **Step 2 — who they are, all of them.**
 *
 * *"And then I would think you would take in their information. So let's
 * collect all the info for who they are, and then take you to this page."*
 *
 * Every name is found before a single clinic is picked, so the picking is
 * never interrupted by a search. The cost is that the typing is front-loaded:
 * a family of four is four lookups before anything has been chosen.
 *
 * Tap any field — each card finds a different person.
 */
export const Info: Story = {
    name: "2 — Who they are",
    render: () => <Screen seed={twoPlayers()} at={pageAt("info")} />,
};

/**
 * **Step 3 — the clinics, several at once.**
 *
 * *"What if I want to do the putting lab and the junior golf academy? I want
 * them to do both. So if you could select both — it's more of like a
 * multi-select."*
 *
 * The band at the top says whose turn it is. Twenty clinics, so the search
 * stays, and any clinic carrying a quantity discount says so **here** — before
 * the dates are picked, where it can still change how many get picked.
 */
export const Clinics: Story = {
    name: "3 — Pick the clinics",
    render: () => <Screen seed={clinicsChosen()} at={pageAt("clinics", 0)} />,
};

/**
 * **Step 4 — every clinic's dates, on one page.**
 *
 * This is the whole difference from Option A. Justin's two clinics are two
 * sections down one scroll; picking four Junior Golf Academy dates and two
 * Putting Lab dates is **one page and one FINISH**, where A takes two of each.
 *
 * **Two players in two clinics each is six pages here, against A's ten.**
 *
 * The cost is in view as soon as a second clinic is added: the running total
 * at the foot of the page sits below the fold while the first section is being
 * read, and two twelve-session clinics make a long scroll. A keeps every
 * clinic at full screen and pays for it in steps.
 *
 * The count on each row is what is left **after the rest of this
 * registration** — put both players on a two-place date and the second row
 * reads 0 left, before anyone is refused at the till.
 */
export const Dates: Story = {
    name: "4 — All the dates, one page",
    render: () => <Screen seed={datesChosen()} at={pageAt("dates", 0)} />,
};

/**
 * **The last step — review.**
 *
 * *"Hey Justin, yeah, I've got Stevie and Tyler for these dates. Does that all
 * look good? Okay, sweet, I'll add to cart and then let's check out."*
 *
 * Every player, every clinic, every date, with an **EDIT** on each row that
 * jumps back to that player's clinics.
 *
 * At the top, the thing Weston asked for: Justin is one date short of the
 * Junior Golf Academy's five-date discount, and the screen says so **while it
 * can still be acted on** — *"hey, they have 4. Hey, add one more and get 25%
 * off."*
 */
export const Review: Story = {
    name: "5 — Review and add to cart",
    render: () => <Screen seed={bothBooked()} at={pageAt("confirm")} />,
};
