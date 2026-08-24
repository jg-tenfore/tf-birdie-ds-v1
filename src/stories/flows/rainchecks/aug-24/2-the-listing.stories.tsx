import type { Meta, StoryObj } from "@storybook/react-vite";

import { RaincheckListing } from "@/components/concepts/rainchecks/raincheck-listing";

/**
 * **Concept — Aug 24. The searchable listing.**
 *
 * > *"Add a searchable raincheck listing, including filters like expired.
 * > Ability to see raincheck issuance date/course and any activities on that
 * > raincheck."*
 *
 * This is the screen the manager currently opens **Buck** for — and that detour
 * is the expensive half of the incident. The escalation exists because the POS
 * cannot answer a question the back office can.
 *
 * It answers a different question from the customer record. The record answers
 * *"what does this person have?"*, which assumes you already know who they are.
 * This answers *"find me this raincheck"* when the name is not matching: a
 * misspelling, a spouse's booking, a company account, or a slip carrying nothing
 * but an id.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 24/2 — The searchable listing",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Live.** Every credit across all four courses.
 *
 * Things to try:
 *
 * - **Tap a row.** It opens every activity on that credit — issued, each
 *   redemption with its own course, and the void if it has one. That is the
 *   *"any activities on that raincheck"* half of the ask.
 * - **Filter by state.** Each chip carries its own count, so `expired` says how
 *   many there are before you commit to looking.
 * - **Filter by course.** The filter that only exists because the model gained
 *   a `course` field on Aug 24 — without it, *"used at a different course"* is
 *   unrecordable and therefore unsearchable.
 * - **Search a course name.** The field matches id, name, email **and** course.
 *
 * The band above the list totals what is still owed **in the current view**, so
 * narrowing to one course answers "what do we owe out of this shop" without
 * exporting anything.
 */
export const Default: Story = {
    name: "Every credit, all courses",
    render: () => <RaincheckListing />,
};

/**
 * The filter the feedback named by name.
 *
 * Expired credits are the ones customers turn up holding. Being able to list
 * them — with what was still on each when it lapsed — is what makes the retention
 * question answerable rather than theoretical: how much value are we letting
 * quietly lapse, and would honouring it cost less than the argument does?
 */
export const Expired: Story = {
    name: "Filtered to expired",
    render: () => <RaincheckListing state="expired" />,
};

/**
 * A credit opened, showing its whole life.
 *
 * `#29115` is the one from the incident: issued at **The Dunes of Delgado**,
 * then spent twice at **Falls Road**. This row is the answer the manager went to
 * Buck for.
 */
export const OneCreditOpen: Story = {
    name: "One credit, every activity",
    render: () => <RaincheckListing query="29115" expandedId="29115" />,
};

/**
 * Narrowed to one course.
 *
 * Worth arguing about: should a course see every course's credits, or only its
 * own with the others behind a toggle? Showing everything is what makes the
 * cross-course case answerable at all — but a shop may reasonably want its own
 * numbers first. Not settled.
 */
export const OneCourse: Story = {
    name: "Filtered to one course",
    render: () => <RaincheckListing course="Falls Road" />,
};

/**
 * A search that genuinely finds nothing.
 *
 * The one case where "nothing" is the true answer — and even here the screen
 * says what to try next rather than stopping at an empty list.
 */
export const NoMatch: Story = {
    name: "Nothing matches",
    render: () => <RaincheckListing query="zzzz" />,
};
