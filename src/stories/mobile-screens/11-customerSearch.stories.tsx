import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileCustomerProfile, MobileCustomerSearch } from "@/components/mobile/screens/mobile-customer-search";
import { customers } from "@/data/crm";

/**
 * **Mobile Screens — 11-customerSearch.** Compare against
 * `App Screens → 11-customerSearch`.
 *
 * The tablet is a **master-detail**: results on the left, the record filling the
 * pane on the right. Master-detail is the most common layout to break on a
 * phone, and it breaks the same way every time — neither half is usable at half
 * of 402px.
 *
 * So it unfolds into a stack: search → results → record. One extra tap, and a
 * screen that can actually be read.
 */
const meta = {
    title: "Mobile Screens/11-customerSearch",
    parameters: { layout: "fullscreen", replica: true },
    /**
     * Portrait, only here.
     *
     * Storybook 10 reads the viewport from **globals**, not from
     * `parameters.viewport.defaultViewport` — that is the Storybook 7 API and is
     * silently ignored, which is how every one of these stories was opening on
     * the 1280x800 tablet while rendering a 402px frame inside it.
     *
     * Set on the meta rather than in `preview.tsx` so it stays scoped to this
     * category: `initialGlobals` there keeps every other story on `tablet10`,
     * and the POS has no portrait mode outside these screens.
     */
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before a query. */
export const EmptySearch: Story = { name: "Empty search", render: () => <MobileCustomerSearch view="empty" /> };

/**
 * **Search results**, with the Customer / Member toggle.
 *
 * The two searches return different things, and the tablet's version — two
 * fields side by side — needs 500px it does not have here.
 */
export const SearchResults: Story = { name: "Search results", render: () => <MobileCustomerSearch view="results" /> };

/**
 * **Customer record.** The one part that needed almost no work: a vertical
 * accordion is already a one-column layout.
 */
export const CustomerRecord: Story = { name: "Customer record", render: () => <MobileCustomerSearch view="record" /> };

/** Every section open. */
export const CustomerRecordExpanded: Story = {
    name: "Customer record — sections expanded",
    render: () => <MobileCustomerSearch view="record" expanded />,
};

/* ----------------------------------------------------------------- profile */

/** Randy Orton holds eight positions across the two seeded days. */
const randy = customers.find((c) => c.displayName.startsWith("Randy Orton"))!;

/**
 * **Customer profile** — the composed record on real `customers.json` data,
 * against `App Screens → 11-customerSearch/Customer profile`.
 *
 * The accordion narrows without argument. What breaks is what is *inside* it:
 * Rain Checks is seven columns on the tablet and Tee Time History is five, and
 * seven columns at 402px is 57px each. So every table row becomes a list row —
 * identity and its context on two lines, the number that matters on the right.
 *
 * **Awarded and Spent are what get dropped.** The balance is what a counter is
 * asked for; the ledger behind it stays a terminal job. A partly-spent credit
 * therefore looks like a small one here, which is a real loss.
 *
 * The tablet's twelve contact fields fold into a `Details` section, with phone
 * and email pinned above it — stacked, twelve fields would put every bar below
 * the fold on arrival, which is the problem collapsing them was meant to fix.
 */
export const CustomerProfile: Story = { name: "Customer profile", render: () => <MobileCustomerProfile /> };

/**
 * How the record should arrive: every section shut, every balance still legible.
 *
 * This matters more on a phone than on the tablet — a closed section is most of
 * what you ever see, so the summary on the bar is doing nearly all the work.
 */
export const Collapsed: Story = { name: "Sections collapsed", render: () => <MobileCustomerProfile startCollapsed /> };

/**
 * A customer who is actually playing. Rounds on the sheet lead the section with
 * their live status — Paid, Checked in, Booked — and carry the same reservation
 * ids the tee sheet prints.
 */
export const OnTheSheet: Story = { name: "On the sheet today", render: () => <MobileCustomerProfile customer={randy} /> };
