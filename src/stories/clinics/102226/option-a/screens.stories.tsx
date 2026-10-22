import type { Meta, StoryObj } from "@storybook/react-vite";

import { RegistrationFlow } from "@/components/concepts/clinics/102226/registration-flow";
import { bothBooked, clinicsChosen, datesChosen, twoPlayers } from "@/components/concepts/clinics/102226/registration-fixtures";
import {
    OptionA,
    canAdvanceA,
    nextLabelA,
    pagesA,
    stepCountA,
    titleA,
} from "@/components/concepts/clinics/102226/option-a-clinic-by-clinic";
import type { Registration } from "@/components/concepts/clinics/102226/registration";

/**
 * **A — one clinic at a time.** Weston's literal description: pick the
 * clinics, then take each one's dates on its own page.
 *
 * Every story is live — tap the rows, change the count, open a date.
 */
const meta = {
    title: "Flows/Clinics/102226/Option A — Clinic by clinic/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Screen = ({ seed, at }: { seed: Registration; at: (registration: Registration) => number }) => (
    <RegistrationFlow
        seed={seed}
        startStep={at(seed)}
        render={(api) => <OptionA api={api} />}
        stepCount={stepCountA}
        canAdvance={canAdvanceA}
        nextLabel={nextLabelA}
        title={titleA}
    />
);

/** Find the page index this story wants, rather than counting by hand. */
const pageAt =
    (kind: string, player = 0, clinicId?: string) =>
    (registration: Registration) =>
        Math.max(
            0,
            pagesA(registration).findIndex(
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
 * **Step 4 — one clinic's dates, on their own page.**
 *
 * This is what separates A from B. One clinic fills the screen, so a
 * twelve-session series is read without scrolling past another clinic's dates,
 * and the discount line in view belongs to *this* clinic only.
 *
 * The count on each row is what is left **after the rest of this
 * registration** — put both players on a two-place date and the second row
 * reads 0 left, before anyone is refused at the till.
 *
 * **FINISH PLAYER** appears on the last clinic for this player, which is
 * Weston's word for the moment one person is done and the next begins.
 */
export const Dates: Story = {
    name: "4 — One clinic's dates",
    render: () => <Screen seed={datesChosen()} at={pageAt("dates", 0, "junior-golf-academy")} />,
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
