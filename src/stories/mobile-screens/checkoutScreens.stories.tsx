import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileCheckoutTender, MobileCheckoutTicket, MobileOrderComplete } from "@/components/mobile/screens/mobile-checkout";

/**
 * **Mobile Screens — checkoutScreens.** Compare against
 * `App Screens → checkoutScreens`.
 *
 * **The hardest narrowing in the app.** Checkout is two panes that both have to
 * be visible — the ticket (what is owed) and the tender (how it is paid) — with
 * seven tender tabs and a six-button action bar.
 *
 * The references split them into two screens. You land on the ticket, because
 * *what is owed* is the question that comes before *how it is paid*.
 */
const meta = {
    title: "Mobile Screens/checkoutScreens",
    parameters: { layout: "centered", replica: true, viewport: { defaultViewport: "mobile" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** **The ticket.** Lines, customer, totals, the green band — all at full width. */
export const Ticket: Story = { render: () => <MobileCheckoutTicket /> };

/**
 * **Credit.** The seven tender tabs **scroll horizontally** rather than shrink —
 * seven equal tabs would give each 57px, which fits neither `GIFT CARD` nor
 * `MEMBER`. A partially visible fifth tab is what tells you the row scrolls.
 *
 * The order is unchanged from the counter terminal, so an operator finds the
 * tenders in the sequence they already know.
 */
export const Credit: Story = { render: () => <MobileCheckoutTender tab="CREDIT" /> };

/**
 * **Cash.** Fast Pay is five equal buttons in a row on tablet; five at 402px is
 * 74px each, so they stack — which also puts the commonest amount nearest the
 * thumb.
 */
export const Cash: Story = { render: () => <MobileCheckoutTender tab="CASH" /> };

/** **Gift card.** */
export const GiftCard: Story = { name: "Gift card", render: () => <MobileCheckoutTender tab="GIFT CARD" /> };

/** **Rain check** — the shipping behaviour at phone width. */
export const RainCheck: Story = { name: "Rain check", render: () => <MobileCheckoutTender tab="RAIN" /> };

/**
 * **Order Complete.** The tablet renders a full receipt preview beside three
 * delivery actions. A receipt preview is a document — it does not narrow, it
 * just gets unreadable — so it collapses to its totals and the three actions
 * become the screen.
 */
export const OrderComplete: Story = { name: "Order complete", render: () => <MobileOrderComplete /> };
