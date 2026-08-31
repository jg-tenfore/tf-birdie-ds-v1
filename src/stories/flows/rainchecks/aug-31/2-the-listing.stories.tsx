import type { Meta, StoryObj } from "@storybook/react-vite";

import { RaincheckListingScreen } from "@/components/concepts/rainchecks/raincheck-listing-screen";

/**
 * **Aug 31 — the chosen solution. The searchable listing.**
 *
 * > *"Add a searchable raincheck listing, including filters like expired.
 * > Ability to see raincheck issuance date/course and any activities on that
 * > raincheck."*
 *
 * The written half of the feedback, and it is **not** replaced by the tender's
 * History tab. The two answer different questions:
 *
 * | | Question | Who asks it |
 * | :-- | :-- | :-- |
 * | **HISTORY tab** | *Can this person pay, and if not, why not?* | An operator, mid-sale, ticket open |
 * | **This listing** | *Find me this raincheck* | Whoever currently opens Buck |
 *
 * Choosing Option B does not change this screen — it is the surface behind the
 * escalation rather than the one in front of the customer — so it is **carried
 * forward from Aug 24 unchanged**, and appears here because it is part of the
 * solution being built, not because it was redrawn.
 *
 * **Start with "Getting there"**: a screen with no way in is a screen nobody
 * uses.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/2 — The searchable listing",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Getting there.**
 *
 * The app's own drawer, with one row added: **Rain Checks, directly under Gift
 * Cards.** The drawer's third block is the "not a sheet, not a sale" list —
 * Customer Search, Order Lookup, Time Clock, Gift Cards, Events, Inventory,
 * Shift. A raincheck is the same kind of object as a gift card: **money the
 * course is holding on a customer's behalf**, redeemable later, needing to be
 * found by somebody who was not there when it was issued.
 *
 * It is the argument the customer record already makes — the project puts
 * `Rain Checks` directly beneath `Gift Cards` there for the same reason.
 *
 * **Tap it** and the drawer closes onto the listing. One new nav row: no new
 * pattern, no new component, no new level of hierarchy.
 */
export const GettingThere: Story = {
    name: "Getting there — where it lives in the drawer",
    render: () => <RaincheckListingScreen startOpen />,
};

/**
 * **Live.** Every credit across all four courses.
 *
 * - **Tap a row** for every activity on that credit — issued, each redemption
 *   with its own course, and the void if it has one. That is the *"any
 *   activities on that raincheck"* half of the ask.
 * - **Filter by state.** Each chip carries a count, so `expired` says how many
 *   there are before you commit to looking.
 * - **Filter by course** — the filter that exists only because the model gained
 *   `course`. Without it, *"used at a different course"* is unrecordable and
 *   therefore unsearchable.
 * - The band above the list totals what is **still owed in the current view**,
 *   so narrowing to one course answers "what do we owe out of this shop"
 *   without exporting anything.
 */
export const Default: Story = {
    name: "Every credit, all courses",
    render: () => <RaincheckListingScreen />,
};

/**
 * The filter the feedback named by name.
 *
 * Expired credits are the ones customers turn up holding. Listing them, with
 * what was still on each when it lapsed, makes the retention question
 * answerable rather than theoretical: how much value are we letting quietly
 * lapse, and would honouring it cost less than the argument does?
 */
export const Expired: Story = {
    name: "Filtered to expired",
    render: () => <RaincheckListingScreen state="expired" />,
};

/**
 * **The credit from the incident, opened.**
 *
 * `#29115` — issued at **The Dunes of Delgado**, then spent twice at **Falls
 * Road**. This row is the answer the manager went to Buck for, and it is the
 * same fact the tender's History tab now states at the counter. One record,
 * two surfaces.
 */
export const OneCreditOpen: Story = {
    name: "One credit, every activity",
    render: () => <RaincheckListingScreen query="29115" expandedId="29115" />,
};

/**
 * Narrowed to one course.
 *
 * Still open, and worth settling before build: should a shop see every course's
 * credits by default, or its own first with the rest behind a toggle? Showing
 * everything is what makes the cross-course case answerable at all — but a shop
 * may reasonably want its own numbers first.
 */
export const OneCourse: Story = {
    name: "Filtered to one course",
    render: () => <RaincheckListingScreen course="Falls Road" />,
};

/**
 * A search that genuinely finds nothing — the one case where "nothing" is the
 * true answer. Even here the screen says what to try next rather than stopping
 * at an empty list.
 */
export const NoMatch: Story = {
    name: "Nothing matches",
    render: () => <RaincheckListingScreen query="zzzz" />,
};
