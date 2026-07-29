import Stack from "@mui/material/Stack";

import { OrderPanel } from "@/components/app-chrome/order-panel";
import { foodImage } from "./quick-order-food-image";
import { AdditionalNotesField, ItemDetailHeader, MenuBrowser, ModifierOptions, ModifierTabs, QuickOrderLineRow } from "./quick-order-parts";

/**
 * Fixtures and shared panes for the Quick Order stories. Every string is
 * transcribed from `references/072926/5-quickorder/`.
 *
 * Screen context: Quick Order is the counter-service path. No table, no seat, no
 * tab — the operator types into search or drills through menu sets (All /
 * Dinner / 19th Hole Menu) into photo tiles, items accumulate in the left panel,
 * and PAY closes the sale immediately.
 *
 * Two things worth noticing across these stories, because they document what
 * the app does today rather than what it should do:
 *   - The bottom bar is not stable. PLAYER SEARCH and COMBOS appear and vanish
 *     between states, so buttons move under the operator's thumb mid-order.
 *   - PAY is grey both when disabled (empty order) and when it is a tertiary
 *     action, and green when confirming — the same control changes meaning by
 *     colour alone.
 *
 * Food photography is not in this repo; tiles and thumbnails draw a labelled
 * placeholder at the real aspect ratio. See `quick-order-food-image.ts`.
 */

export const menuSets = ["All", "Dinner", "19th Hole Menu"];

export const dinnerTiles = [
    { label: "Beer", image: foodImage("Beer") },
    { label: "Appetizers", image: foodImage("Appetizers") },
    { label: "Sandwiches", image: foodImage("Sandwiches") },
    { label: "Hamburgers", image: foodImage("Hamburgers") },
];

export const pearlBeerImage = foodImage("Pearl Beer");
export const potatoSkinsImage = foodImage("Potato Skins");

export const Menu = () => <MenuBrowser categories={menuSets} active="Dinner" tiles={dinnerTiles} />;

/** Item detail pane, shared by the modifier and dialog stories. */
export const PotatoSkinsDetail = ({ activeGroup }: { activeGroup: "Cheeses" | "Toppings" }) => (
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

export const twoLineOrder = (
    <OrderPanel>
        <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage, qty: 1 }} />
        <QuickOrderLineRow line={{ name: "Potato Skins", price: "$13.98", image: potatoSkinsImage, qty: 1 }} />
    </OrderPanel>
);
