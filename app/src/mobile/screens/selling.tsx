import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useNavigate } from "react-router-dom";

import {
    MobileBottomNav,
    MobileActionArea,
    MobileBottomSheet,
    MobilePrimary,
    MobileSecondary,
    MobileSecondaryRow,
} from "@/components/mobile/mobile-shell";
import { MobileRow, MobileSearch } from "@/components/mobile/mobile-parts";
import { appColors } from "@/theme/app-replica-tokens";
import { money, useActions, useStore } from "../../store";
import { proShopCategories, type Sellable } from "../../screens/selling";
import { LiveMobileOrder, MobileShell } from "../mobile-shell";

/**
 * Selling, on a phone. Pro Shop and Quick Order.
 *
 * Both are the same screen with a different catalogue and a different ticket
 * source, which is also true on the terminal — `ProShopScreen` and
 * `QuickOrderScreen` there are two calls into one `Catalog`. Keeping that shape
 * matters: the two must not drift into different interaction models for what an
 * operator experiences as one task.
 *
 * ## What changes from the terminal
 *
 * **The order panel becomes a destination.** The terminal shows a 390px cart
 * beside a tile grid. Here they are two bottom-nav tabs, and the cart's item
 * count rides on the *Order* tab so the operator never has to switch just to
 * see whether something landed.
 *
 * **The tile grid becomes a list.** Six photo tiles across the terminal's
 * content pane is two across a phone, at which point a tile is mostly padding.
 * The list keeps the photograph as a 44dp thumbnail and gives the price a
 * scannable column.
 *
 * **Categories drill rather than filter.** The terminal shows categories and
 * their products at once. There is no room for both, so a category opens its
 * own list with `back` returning — the chevron says which rows go somewhere and
 * which add to the order.
 *
 * **The action bar collapses.** `POP / CLEAR / HOLD / PAY` is four buttons.
 * PAY takes the full width because it is the only one that commits money; the
 * rest move into the overflow, where POP keeps the app's red.
 */

type Tab = "shop" | "order";

const navFor = (shopLabel: string, count: number) => [
    {
        key: "shop",
        label: shopLabel,
        icon: shopLabel === "Menu" ? <RestaurantMenuIcon sx={{ fontSize: 20 }} /> : <StorefrontIcon sx={{ fontSize: 20 }} />,
    },
    {
        key: "order",
        label: count > 0 ? `Order · ${count}` : "Order",
        icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />,
    },
];

const SellingScreen = ({
    title,
    active,
    shopLabel,
    source,
    categories,
}: {
    title: string;
    active: "proshop" | "quickorder";
    shopLabel: string;
    source: "Pro Shop" | "Quick Order";
    categories: { label: string; items: Sellable[] }[];
}) => {
    const [tab, setTab] = useState<Tab>("shop");
    const [drilled, setDrilled] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [sheet, setSheet] = useState(false);

    const navigate = useNavigate();
    const { lines, total } = useStore();
    const { addItem, clearCart, popDrawer, holdTicket, toast } = useActions();

    const count = lines.reduce((s, l) => s + l.qty, 0);
    const category = drilled ? categories.find((c) => c.label === drilled) : null;

    // Search spans every category, because on a phone drilling to find a known
    // item is the slow path and typing is the fast one.
    const q = query.trim().toLowerCase();
    const searched = q.length >= 2 ? categories.flatMap((c) => c.items).filter((i) => i.name.toLowerCase().includes(q)) : null;

    const add = (item: Sellable) => {
        addItem(item, source);
        toast(`${item.name} added`);
    };

    return (
        <MobileShell
            title={category ? category.label : title}
            active={active}
            leading={category ? "back" : "menu"}
            onLeading={category ? () => setDrilled(null) : undefined}
            onOverflow={() => setSheet(true)}
            actions={
                tab === "order" && lines.length > 0 ? (
                    <MobileActionArea>
                        <MobileSecondaryRow>
                            <MobileSecondary onClick={() => holdTicket()}>Hold</MobileSecondary>
                            <MobileSecondary onClick={() => navigate("/customersearch")}>Customer</MobileSecondary>
                        </MobileSecondaryRow>
                        <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />} onClick={() => navigate("/pay")}>
                            Pay {money(total)}
                        </MobilePrimary>
                    </MobileActionArea>
                ) : undefined
            }
            bottomNav={<MobileBottomNav items={navFor(shopLabel, count)} active={tab} onChange={(k) => setTab(k as Tab)} />}
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            {
                                label: "POP — open cash drawer",
                                icon: <PointOfSaleIcon sx={{ fontSize: 20 }} />,
                                destructive: true,
                                onClick: () => {
                                    popDrawer();
                                    setSheet(false);
                                },
                            },
                            {
                                label: "Hold ticket",
                                icon: <PauseCircleOutlineIcon sx={{ fontSize: 20 }} />,
                                onClick: () => {
                                    holdTicket();
                                    setSheet(false);
                                },
                            },
                            {
                                label: "Clear order",
                                icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,
                                destructive: true,
                                onClick: () => {
                                    clearCart();
                                    setSheet(false);
                                },
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            {tab === "order" ? (
                <LiveMobileOrder />
            ) : (
                <>
                    <MobileSearch placeholder={`Search ${shopLabel.toLowerCase()}`} value={query} onChange={setQuery} />

                    {searched ? (
                        searched.length === 0 ? (
                            <Typography sx={{ px: 1.5, py: 3, fontSize: 15, color: appColors.textSecondary }}>
                                Nothing matches &ldquo;{query}&rdquo;.
                            </Typography>
                        ) : (
                            searched.map((item) => (
                                <MobileRow
                                    key={item.id}
                                    title={item.name}
                                    price={item.price}
                                    image={item.image ?? ""}
                                    onClick={() => add(item)}
                                />
                            ))
                        )
                    ) : category ? (
                        category.items.map((item) => (
                            <MobileRow
                                key={item.id}
                                title={item.name}
                                price={item.price}
                                image={item.image ?? ""}
                                onClick={() => add(item)}
                            />
                        ))
                    ) : (
                        categories.map((c) => (
                            <MobileRow
                                key={c.label}
                                title={c.label}
                                subtitle={`${c.items.length} ${c.items.length === 1 ? "item" : "items"}`}
                                image={c.items.find((i) => i.image)?.image ?? ""}
                                drills
                                onClick={() => setDrilled(c.label)}
                            />
                        ))
                    )}

                    {/* Clearance so the last row is never under the nav. */}
                    <Box sx={{ height: 8 }} />
                </>
            )}
        </MobileShell>
    );
};

export const MobileProShopScreen = () => (
    <SellingScreen title="Pro Shop" active="proshop" shopLabel="Shop" source="Pro Shop" categories={proShopCategories} />
);

/**
 * Quick Order — the counter-service path.
 *
 * The same screen against the food half of the catalogue. On the terminal these
 * differ only by which categories are passed and which `source` the ticket
 * carries, and that stays true here.
 */
export const MobileQuickOrderScreen = () => {
    const food = proShopCategories.filter((c) =>
        ["Beer", "Beverages", "Sandwiches", "Hamburgers", "Snacks", "Appetizers", "19th Hole", "Combos", "Grill"].includes(c.label),
    );
    return (
        <SellingScreen
            title="Quick Order"
            active="quickorder"
            shopLabel="Menu"
            source="Quick Order"
            categories={food.length > 0 ? food : proShopCategories}
        />
    );
};

/** Exported for the payment screen's "keep selling" path. */
export const sellingIcons = { bolt: BoltIcon };
