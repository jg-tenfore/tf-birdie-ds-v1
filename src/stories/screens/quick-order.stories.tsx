import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CategoryIcon from "@mui/icons-material/Category";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { foodImage } from "@/components/screens/restaurant/quick-order-food-image";
import {
    AdditionalNotesField,
    CategoryHeaderCard,
    ItemDetailHeader,
    MenuBrowser,
    MenuCanvas,
    MenuProductList,
    ModifierOptions,
    ModifierTabs,
    PopoverMenu,
    QuickOrderLineRow,
    StatusBanner,
} from "@/components/screens/restaurant/quick-order-parts";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Quick Order** — the counter-service path through the restaurant.
 *
 * No table, no seat, no tab: the operator either types into the search field or
 * drills through menu sets (All / Dinner / 19th Hole Menu) into photo tiles,
 * items accumulate in the left panel, and PAY closes the sale immediately.
 *
 * Reproduced as-is from `references/072926/5-quickorder/`. Two things worth
 * noticing while reading these stories, because they are what the app does
 * today rather than what it should do:
 *
 *   - The bottom bar is not stable. PLAYER SEARCH and COMBOS appear and
 *     disappear between states, so button positions move under the operator's
 *     thumb mid-order.
 *   - PAY is grey both when it is disabled (empty order) and when it is a
 *     tertiary action, and green when it is the confirming one — the same
 *     control changes meaning by colour alone.
 *
 * Food photography is not in this repo. Every tile and thumbnail draws a
 * labelled placeholder at the real aspect ratio instead; see
 * `quick-order-food-image.ts`.
 */
const meta = {
    title: "App Screens/5-quickorder",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ *
 * Fixtures — every string is transcribed from the reference screenshots.
 * ------------------------------------------------------------------ */

const menuSets = ["All", "Dinner", "19th Hole Menu"];

const dinnerTiles = [
    { label: "Beer", image: foodImage("Beer") },
    { label: "Appetizers", image: foodImage("Appetizers") },
    { label: "Sandwiches", image: foodImage("Sandwiches") },
    { label: "Hamburgers", image: foodImage("Hamburgers") },
];

const pearlBeerImage = foodImage("Pearl Beer");
const potatoSkinsImage = foodImage("Potato Skins");

const Menu = () => <MenuBrowser categories={menuSets} active="Dinner" tiles={dinnerTiles} />;

/** Item detail pane, shared by the modifier and dialog stories. */
const PotatoSkinsDetail = ({ activeGroup }: { activeGroup: "Cheeses" | "Toppings" }) => (
    <Stack spacing={2} sx={{ px: 1.5, pt: 2.5 }}>
        <ItemDetailHeader
            name="Potato Skins"
            description="These potato skins are glazed in a silky butter sauce"
            image={potatoSkinsImage}
            total="$16.00"
            qty={1}
        />
        <AdditionalNotesField />
        <ModifierTabs groups={["Cheeses", "Toppings"]} active={activeGroup} />
        <ModifierOptions
            options={activeGroup === "Cheeses" ? ["MOZARELLA", "BLUE CHEESE"] : ["ADD BACON", "EXTRA CHEESE", "NO LETTUCE", "ADD ONIONS"]}
        />
    </Stack>
);

const twoLineOrder = (
    <OrderPanel>
        <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage, qty: 1 }} />
        <QuickOrderLineRow line={{ name: "Potato Skins", price: "$13.98", image: potatoSkinsImage, qty: 1 }} />
    </OrderPanel>
);

/* ------------------------------------------------------------------ *
 * Stories
 * ------------------------------------------------------------------ */

/**
 * The landing state: nothing rung up yet.
 *
 * The order panel is an antler watermark over "No items in order.", the menu
 * opens on the Dinner set, and both BACK and PAY are greyed. COMBOS is present
 * here — it is the only state in the reference set that shows PLAYER SEARCH and
 * COMBOS at the same time, which is why the bar carries five buttons.
 */
export const EmptyOrder: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            orderPanel={
                <OrderPanel>
                    <OrderPanelEmpty />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton tone="disabled">Back</ActionButton>
                    <ActionButton>Player Search</ActionButton>
                    <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="disabled">Pay</ActionButton>
                </>
            }
        >
            <Menu />
        </AppShell>
    ),
};

/**
 * Drilled into a category.
 *
 * Tapping a menu tile replaces the whole browsing surface — search field, menu
 * chips, and grid all disappear — with a narrow single column: the category
 * name over its products. There is no visible way back other than the BACK
 * button, which has now turned from grey to active.
 */
export const CategoryProducts: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            orderPanel={
                <OrderPanel>
                    <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage, qty: 1 }} />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton>Back</ActionButton>
                    <ActionButton>Player Search</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <MenuCanvas>
                <CategoryHeaderCard label="Drafts" />
                <MenuProductList products={[{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage }]} />
            </MenuCanvas>
        </AppShell>
    ),
};

/**
 * Long-pressing an order line.
 *
 * Edit / Discount / Delete, anchored to the line. The menu is a plain popup
 * with no scrim behind it and no header naming the line it acts on, so once it
 * is open there is nothing on screen tying "Delete" to Pearl Beer specifically.
 */
export const LineItemMenu: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            orderPanel={
                <OrderPanel>
                    <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$60.00", image: pearlBeerImage, qty: 5 }} />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton tone="disabled">Back</ActionButton>
                    <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <Menu />
            <PopoverMenu items={["Edit", "Discount", "Delete"]} sx={{ top: 137, left: 305, width: 112 }} />
        </AppShell>
    ),
};

/**
 * Editing an item: modifier groups.
 *
 * Selecting a line swaps the canvas for a detail pane — photo, name,
 * description, a running total, a quantity stepper, a note field, then the
 * modifier groups as underlined tabs. The bottom bar collapses to a single
 * full-width BACK, so there is no way to pay from inside item edit.
 *
 * The green band is the confirmation left over from saving order notes; it
 * stays up rather than auto-dismissing.
 */
export const ItemModifiersCheeses: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            subBar={<StatusBanner message="Order Notes Saved!" />}
            orderPanel={twoLineOrder}
            actionBar={<ActionButton>Back</ActionButton>}
        >
            <PotatoSkinsDetail activeGroup="Cheeses" />
        </AppShell>
    ),
};

/**
 * The second modifier group.
 *
 * Toppings are free-standing toggles, not a single choice, but they are drawn
 * with radio circles — the same control the Cheeses group uses for what is a
 * genuine either/or.
 */
export const ItemModifiersToppings: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            subBar={<StatusBanner message="Order Notes Saved!" />}
            orderPanel={twoLineOrder}
            actionBar={<ActionButton>Back</ActionButton>}
        >
            <PotatoSkinsDetail activeGroup="Toppings" />
        </AppShell>
    ),
};

/**
 * The Order Notes dialog.
 *
 * Opened from the "Enter Additional Notes…" field. The notes apply to the whole
 * order, not the item being edited, even though the dialog is reached from
 * inside item edit and the field that opens it sits under the item's name.
 */
export const OrderNotesDialog: Story = {
    render: () => (
        <>
            <AppShell title="Quick Order" active="quickorder" orderPanel={twoLineOrder} actionBar={<ActionButton>Back</ActionButton>}>
                <PotatoSkinsDetail activeGroup="Cheeses" />
            </AppShell>

            <Dialog open disablePortal={false} slotProps={{ paper: { sx: { width: 540, maxWidth: "none", p: 3 } } }}>
                <Typography sx={{ fontSize: 20, textAlign: "center", color: appColors.textPrimary, mb: 2.5 }}>Order Notes</Typography>

                <Box
                    sx={{
                        bgcolor: "#E1E1E1",
                        borderBottom: `1px solid ${appColors.textSecondary}`,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        mb: 2,
                    }}
                >
                    <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>Enter notes</Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button color="secondary" startIcon={<ChevronLeftIcon />} sx={{ flex: 1, minHeight: 44 }}>
                        Back
                    </Button>
                    <Button color="primary" startIcon={<CheckIcon />} sx={{ flex: 1, minHeight: 44 }}>
                        Save
                    </Button>
                </Stack>
            </Dialog>
        </>
    ),
};

/**
 * The app-bar overflow menu.
 *
 * Four order-scoped commands, one of which — "Quick Tab" — converts the whole
 * quick order into a tab. They sit in the same ⋮ menu as "Refresh Menu", a
 * housekeeping action, with nothing to separate a destructive item like
 * "Cancel Quick Order" from a harmless one.
 */
export const ScreenOverflowMenu: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            orderPanel={
                <OrderPanel>
                    <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage, qty: 1, selected: true }} />
                    <QuickOrderLineRow line={{ name: "Potato Skins", price: "$13.98", image: potatoSkinsImage, qty: 1 }} />
                </OrderPanel>
            }
            actionBar={<ActionButton>Back</ActionButton>}
        >
            <Stack spacing={2} sx={{ px: 1.5, pt: 2.5 }}>
                <ItemDetailHeader name="Pearl Beer" image={pearlBeerImage} total="$12.00" qty={1} />
                <AdditionalNotesField />
            </Stack>

            <PopoverMenu
                items={["Quick Tab", "Refresh Menu", "Remove All Discounts", "Cancel Quick Order"]}
                sx={{ top: 36, right: 32, width: 205 }}
            />
        </AppShell>
    ),
};
