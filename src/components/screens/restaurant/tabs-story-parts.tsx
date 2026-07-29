import type { ReactNode } from "react";

import Box from "@mui/material/Box";

import { OrderLineRow, OrderPanel, SeatBand } from "@/components/app-chrome/order-panel";
import { appColors } from "@/theme/app-replica-tokens";
import { foodImage } from "./quick-order-food-image";
import { seatBandColors } from "./tabs-parts";

/**
 * Fixtures and shared panels for the Tabs stories. Every string is transcribed
 * from `references/072926/6-tabs/`.
 *
 * Screen context: Tabs is every open check in the restaurant, in one flat list.
 * Detached tables, named walk-up tabs and card-on-file tabs share a row shape.
 * Tapping a row opens the seat-based order editor — the same surface Tables uses.
 *
 * What the reference set documents about the current screen:
 *   - No sort control, no grouping, no status column. A $0.00 pre-auth tab from
 *     four days ago sits between two live ones with nothing to distinguish them.
 *   - Identifying information is split: the tab's name is left at 20px, while
 *     employee, order id, timestamp and card are a 12px block ~900px right.
 *   - The bottom bar changes between the list and the editor, and again between
 *     the editor's sub-screens — DONE becomes BACK, COMBOS drops out.
 */

export const openTabs = [
    {
        id: "detached-4",
        title: "Detached Table - 4 seats - 2 items -",
        meta: ["Avery Robertson", "(detached table - 4 guests)"],
        amount: "$25.24",
    },
    {
        id: "detached-3",
        title: "Detached Table - 3 seats - 2 items -",
        meta: ["Kyler Brooksby", "(detached table - 3 guests)"],
        amount: "$11.94",
    },
    { id: "giftcards", title: "partial giftcards", meta: ["John Admin", "5574962 - Jul 28 1:43 PM"], amount: "$22.86" },
    {
        id: "wride-1",
        title: "Austin Wride",
        meta: ["Kyler Brooksby", "5573831 - Jul 28 12:39 PM", "Mastercard", "0498"],
        amount: "$0.00",
    },
    {
        id: "wride-2",
        title: "Austin Wride",
        meta: ["Kyler Brooksby", "5507510 - Jul 24 12:38 PM", "Mastercard", "0498"],
        amount: "$13.00",
    },
    { id: "brooksby", title: "Kyler Brooksby", meta: ["John Admin", "5277638 - Jul 9 12:55 PM"], amount: "$15.58" },
];

const openBurgerImage = foodImage("Open Burger");
const turkeyClubImage = foodImage("Turkey Club");
const pearlBeerImage = foodImage("Pearl Beer");

export const dinnerTiles = [
    { label: "Beer", image: foodImage("Beer") },
    { label: "Appetizers", image: foodImage("Appetizers") },
    { label: "Sandwiches", image: foodImage("Sandwiches") },
    { label: "Hamburgers", image: foodImage("Hamburgers") },
];

export const combos = [
    { name: "Beer Deal", price: "$5.64" },
    { name: "Turn Special", price: "$0.00" },
    { name: "KG Test Combo #2", price: "$0.00" },
    { name: "Friday Night Event", price: "$32.00" },
    { name: "hot dog chips bottled drink", price: "$5.00" },
    { name: "Test 1", price: "$10.00" },
];

/** The breadcrumb title the editor uses in place of a screen name. */
export const editorTitle = "Table Detached 58829 | Order ID 4180595 | Avery Robertson";

/** The line the detail pane is editing: green rule down the left, tinted row. */
const SelectedLine = ({ children }: { children: ReactNode }) => (
    <Box sx={{ borderLeft: `4px solid ${appColors.greenTee}`, bgcolor: "#F7F9FA" }}>{children}</Box>
);

/**
 * The seat-banded order panel.
 *
 * Seats are separated by solid colour bands rather than headings, and the band
 * colour carries no meaning — it is assigned by seat index. Only the seat whose
 * chevron is showing is expanded.
 */
export const SeatPanel = ({ expandedSeat = 1, pearlBeerOnSeat3 = false }: { expandedSeat?: 1 | 3; pearlBeerOnSeat3?: boolean }) => (
    <OrderPanel>
        <SeatBand label="Seat 1" color={seatBandColors[0]} collapsible={expandedSeat === 1} />
        <OrderLineRow
            line={{
                id: "open-burger",
                name: "Open Burger",
                qty: 1,
                price: "$10.32",
                image: openBurgerImage,
                meta: ["25", "25"],
                note: "Medium Rare Fries Mozarella  +$1.00",
            }}
        />

        <SeatBand label="Seat 2" color={seatBandColors[1]} />
        <OrderLineRow line={{ id: "turkey-club", name: "Turkey Club Sandwich", qty: 1, price: "$9.15", image: turkeyClubImage }} />

        <SeatBand label="Seat 3" color={seatBandColors[2]} collapsible={expandedSeat === 3} />
        {pearlBeerOnSeat3 && (
            <SelectedLine>
                <OrderLineRow line={{ id: "pearl-beer", name: "Pearl Beer", qty: 1, price: "$12.00", image: pearlBeerImage }} />
            </SelectedLine>
        )}

        <SeatBand label="Seat 4" color={seatBandColors[3]} />
    </OrderPanel>
);
