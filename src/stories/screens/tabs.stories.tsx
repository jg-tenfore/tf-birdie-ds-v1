import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, SeatBand } from "@/components/app-chrome/order-panel";
import { foodImage } from "@/components/screens/restaurant/quick-order-food-image";
import { MenuBrowser, PopoverMenu } from "@/components/screens/restaurant/quick-order-parts";
import { ComboTileGrid, OpenFoodForm, TabList, TabsFilterBar, seatBandColors } from "@/components/screens/restaurant/tabs-parts";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Tabs** — every open check in the restaurant, in one flat list.
 *
 * Detached tables, named walk-up tabs, and card-on-file tabs all share the same
 * row shape and the same list. Tapping a row opens the seat-based order editor,
 * which is the same surface the Tables screen uses.
 *
 * Reproduced as-is from `references/072926/6-tabs/`. What the reference set
 * documents about the current screen:
 *
 *   - The list has no sort control, no grouping, and no status column. A
 *     $0.00 pre-auth tab from four days ago sits between two live ones, and
 *     nothing on the row says which is which.
 *   - The identifying information is split: the tab's own name is on the left
 *     at 20px, while the employee, order id, timestamp, and card are a 12px
 *     block 900px away on the right.
 *   - The bottom bar changes between the list and the editor, and again
 *     between the editor's sub-screens — DONE becomes BACK, COMBOS drops out.
 *
 * Food photography is not in this repo; menu tiles and line thumbnails draw a
 * labelled placeholder at the real aspect ratio. Combos are faithful — the app
 * itself falls back to the antler mark for every one of them.
 */
const meta = {
    title: "App Screens/6-tabs",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ *
 * Fixtures — every string is transcribed from the reference screenshots.
 * ------------------------------------------------------------------ */

const openTabs = [
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

const dinnerTiles = [
    { label: "Beer", image: foodImage("Beer") },
    { label: "Appetizers", image: foodImage("Appetizers") },
    { label: "Sandwiches", image: foodImage("Sandwiches") },
    { label: "Hamburgers", image: foodImage("Hamburgers") },
];

const combos = [
    { name: "Beer Deal", price: "$5.64" },
    { name: "Turn Special", price: "$0.00" },
    { name: "KG Test Combo #2", price: "$0.00" },
    { name: "Friday Night Event", price: "$32.00" },
    { name: "hot dog chips bottled drink", price: "$5.00" },
    { name: "Test 1", price: "$10.00" },
];

/** The breadcrumb title the editor uses in place of a screen name. */
const editorTitle = "Table Detached 58829 | Order ID 4180595 | Avery Robertson";

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
const SeatPanel = ({ expandedSeat = 1, pearlBeerOnSeat3 = false }: { expandedSeat?: 1 | 3; pearlBeerOnSeat3?: boolean }) => (
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

/* ------------------------------------------------------------------ *
 * Stories
 * ------------------------------------------------------------------ */

/**
 * The tab list.
 *
 * A tinted filter band sits directly under the app bar — it is a band, not a
 * field, with no input chrome or search icon to say it is typeable. Below it,
 * full-bleed rows every one of which leads with the same antler mark, so the
 * avatar column carries no information at all.
 *
 * POP is the only red control in the app's restaurant flows; it pops the
 * drawer.
 */
export const TabListing: Story = {
    render: () => (
        <AppShell
            title="Tabs"
            active="tabs"
            showOverflow={false}
            subBar={<TabsFilterBar />}
            actionBar={
                <>
                    <ActionButton tone="disabled">Back</ActionButton>
                    <ActionButton tone="danger" icon={<SaveAltIcon />}>
                        Pop
                    </ActionButton>
                    <ActionButton icon={<BoltIcon />}>Quick Order</ActionButton>
                    <ActionButton icon={<RestaurantIcon />}>Tables</ActionButton>
                    <ActionButton tone="primary" icon={<AddIcon />}>
                        Create a Tab
                    </ActionButton>
                </>
            }
        >
            <TabList rows={openTabs} />
        </AppShell>
    ),
};

/**
 * A tab opened into the order editor.
 *
 * The screen title becomes a pipe-delimited breadcrumb —
 * table, order id, customer — and the canvas is the same menu browser Quick
 * Order uses. The bar now carries two green buttons at once: SAVE CHANGES and
 * PAY are equally weighted, though only one of them ends the transaction.
 */
export const TabDetail: Story = {
    render: () => (
        <AppShell
            title={editorTitle}
            active="tabs"
            orderPanel={<SeatPanel />}
            actionBar={
                <>
                    <ActionButton>Done</ActionButton>
                    <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Save Changes</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <MenuBrowser categories={["All", "Dinner", "19th Hole Menu"]} active="Dinner" tiles={dinnerTiles} />
        </AppShell>
    ),
};

/**
 * The per-line menu inside a tab.
 *
 * Six commands, where Quick Order's equivalent menu offers three. Fire, Move,
 * and Split are the seat-and-kitchen operations that only exist once an order
 * belongs to a table. The menu spills over the menu grid and covers the first
 * category tile, and has no scrim.
 */
export const TabDetailLineMenu: Story = {
    render: () => (
        <AppShell
            title={editorTitle}
            active="tabs"
            orderPanel={<SeatPanel />}
            actionBar={
                <>
                    <ActionButton>Done</ActionButton>
                    <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Save Changes</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <MenuBrowser categories={["All", "Dinner", "19th Hole Menu"]} active="Dinner" tiles={dinnerTiles} />
            <PopoverMenu items={["Fire", "Move", "Split", "Edit", "Discount", "Delete"]} sx={{ top: 208, left: 326, width: 196 }} />
        </AppShell>
    ),
};

/**
 * COMBOS, with an item added to seat 3.
 *
 * Combos replace the entire menu browser — search field, chips, and grid all
 * go. Every combo falls back to the antler mark, which is what the app itself
 * shows; several are priced at $0.00 and read as configuration left in the
 * live menu rather than sellable items.
 */
export const TabDetailCombos: Story = {
    render: () => (
        <AppShell
            title={editorTitle}
            active="tabs"
            orderPanel={<SeatPanel expandedSeat={3} pearlBeerOnSeat3 />}
            actionBar={
                <>
                    <ActionButton>Back</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Save Changes</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.surface, minHeight: "100%" }}>
                <ComboTileGrid combos={combos} />
            </Box>
        </AppShell>
    ),
};

/**
 * OPEN FOOD — ringing up something that is not on the menu.
 *
 * A green SAVE with a back-chevron sits alone at the top-left of the canvas,
 * above the form it saves, while SAVE CHANGES for the whole order sits in the
 * bottom bar. Two differently-scoped saves are on screen simultaneously.
 *
 * Every field is placeholder-only, so the labels vanish as soon as the operator
 * types.
 */
export const TabDetailOpenFood: Story = {
    render: () => (
        <AppShell
            title={editorTitle}
            active="tabs"
            orderPanel={<SeatPanel expandedSeat={3} pearlBeerOnSeat3 />}
            actionBar={
                <>
                    <ActionButton>Back</ActionButton>
                    <ActionButton tone="primary">Save Changes</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.surface, minHeight: "100%", pt: "20px", px: 2 }}>
                <Button color="primary" startIcon={<ChevronLeftIcon />} sx={{ width: 148, minHeight: 44 }}>
                    Save
                </Button>
                <OpenFoodForm />
            </Box>
        </AppShell>
    ),
};
