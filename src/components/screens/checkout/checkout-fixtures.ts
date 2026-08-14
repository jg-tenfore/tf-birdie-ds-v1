/**
 * The ticket the checkout stories are paid against.
 *
 * One golfer's round from `references/072926/checkoutScreens/` — a green fee and
 * a cart, $50.09 plus $3.39 tax. Small on purpose: the tender panes are what
 * these stories are about, and a ten-line ticket would push the totals stack off
 * the bottom of every one of them.
 *
 * Defaults live here rather than inside the component so the prototype can pass
 * real store data through the same props. See Foundations → Prototype Seam.
 */

import type { CheckoutLine } from "./checkout-panes";

export const checkoutLines: CheckoutLine[] = [
    { id: "greenfee", name: "Senior Weekday", qty: 1, unitPrice: 26.99, stock: [27, 350] },
    { id: "cart", name: "Dunes Cart", qty: 1, unitPrice: 23.1, stock: [20, 100] },
];

export const checkoutTotals = {
    subtotal: 50.09,
    tax: 3.39,
    total: 53.48,
    payments: 0,
};

export const checkoutCustomer = "Weston Senior";

/** The unlabelled figure beside the customer. Read as loyalty points. */
export const checkoutPoints = 50;
