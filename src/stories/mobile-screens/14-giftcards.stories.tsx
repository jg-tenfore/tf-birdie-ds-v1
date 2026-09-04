import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileGiftCards } from "@/components/mobile/screens/mobile-gift-cards";
import { westonGiftCards } from "@/components/screens/operations/gift-cards-table";

/**
 * **Mobile Screens — 14-giftcards.** Look up a customer's cards, laid out for a
 * phone. Compare against `App Screens → 14-giftcards`.
 *
 * The tablet screen is an eight-column table and nothing else. Each column takes
 * `flex: 1` of 1290px — about 161px, enough for `533752807261` and `5/26/2122`
 * to sit centred without wrapping. The same eight columns in 402px get **50px
 * each**, which is narrower than the word "Expiration".
 *
 * So the table stacks rather than scrolls sideways: customer name and balance on
 * line 1, identity on line 2, the audit trail on line 3. Every column is kept.
 * Nothing is behind a horizontal scroll, because putting Balance six columns to
 * the right of the fold would hide the one value the screen exists to show.
 */
const meta = {
    title: "Mobile Screens/14-giftcards",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Empty.** How the screen opens.
 *
 * The second place in this category where mobile has to add a sentence the
 * tablet does not have. On tablet the grey column-header band is already drawn
 * over the empty canvas, so the table reads as present-but-unfilled — that band
 * is the entire empty state. Stacking the columns removes the band, because
 * there are no columns left to head, so the sentence takes over its job.
 *
 * The 200px slate SEARCH button is gone too: 200px is half this screen. The
 * commit collapses into the search field's own trailing glyph, the same
 * affordance every other mobile screen here uses.
 */
export const Empty: Story = {
    render: () => <MobileGiftCards />,
};

/**
 * **Results.** A search for "weston" — the same mismatched fixture the tablet
 * returns, Randy Orton and Tony Finau included.
 *
 * Two things to check against the landscape original. **Dimming survives**: the
 * two zero-balance Tony Finau cards (one fully spent, one issued at $0.00) go
 * light grey across all three lines, because the shipping app carries "spent
 * out" by contrast alone and nothing else. That is why these rows are built
 * from `Stack`/`Typography` at `MobileRow`'s metrics rather than from
 * `MobileRow` itself — a dim state on a shared primitive for one screen would
 * be a restyle.
 *
 * **Winnings cards carry no UPC**, and the segment is dropped rather than left
 * empty. A blank cell in a table reads as "no value"; a dangling `·` in a
 * sentence reads as a bug.
 */
export const Results: Story = {
    render: () => <MobileGiftCards query="weston" rows={westonGiftCards} />,
};
