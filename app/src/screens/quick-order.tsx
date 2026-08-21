import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CategoryIcon from "@mui/icons-material/Category";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { LiveOrderPanel, Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Quick Order, from `references/072926/5-quickorder/`.
 *
 * The order rail is the register's own panel, not a lighter variant. An earlier
 * pass read the reference as "no quantity stepper here, quantity is edited from
 * the item detail pane" — but that leaves the one place you are looking at the
 * order unable to change it, and hides the totals until the tender screen. Same
 * panel as Pro Shop: ticket header, per-line steppers, subtotal / tax / total.
 *
 * Differs from Pro Shop in a way that is easy to miss: the tiles are menu
 * **categories**, not products. Tapping one replaces the entire browsing
 * surface — search field, menu-set chips and grid all disappear — with a tall
 * header card naming the category over a list of its products. The only way
 * back is the BACK button, which is greyed until you have drilled in.
 *
 */

import { foodByCategory, foodCategories } from "@/data/food-catalog";
import { menuByCategory, menuCategories } from "@/data/steakhouse-menu";
import { storeImage } from "@/utils/asset-url";

/** The shape both catalogues share once a category has been drilled into. */
interface MenuProduct {
    id: string;
    name: string;
    price: number;
    description: string;
    path: string;
}

/**
 * Categories come from two catalogues: the turn-shack snacks and drinks, and
 * the 19th Hole kitchen menu. They are indexed together here so the drill-down
 * does not need to know which source a category belongs to.
 */
const CATEGORY_ITEMS: Record<string, MenuProduct[]> = {
    ...Object.fromEntries(foodCategories.map((c) => [c, foodByCategory(c) as MenuProduct[]])),
    ...Object.fromEntries(menuCategories.map((c) => [c, menuByCategory(c) as MenuProduct[]])),
};

const itemsIn = (category: string): MenuProduct[] => CATEGORY_ITEMS[category] ?? [];

/** Menu sets, as the reference device groups them. */
const MENU_SETS: Record<string, string[]> = {
    All: [...menuCategories, ...foodCategories],
    Dinner: ["Starters", "Salads", "Steaks", "Chops & Seafood", "Sides", "Desserts"],
    "19th Hole Menu": [...menuCategories, "Beer", "Wine", "Beverages"],
};

export const QuickOrderScreen = () => {
    const { lines, total } = useStore();
    const { addItem, clearCart, holdTicket } = useActions();
    const navigate = useNavigate();

    const [menuSet, setMenuSet] = useState("19th Hole Menu");
    const [drilled, setDrilled] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    const hasLines = lines.length > 0;

    return (
        <Shell
            title="Quick Order"
            active="quickorder"
            orderPanel={<LiveOrderPanel />}
            // Quick Order's own overflow, from
            // references/072926/5-quickorder/. Four order-scoped commands, one of
            // which converts the whole quick order into a tab.
            overflowItems={[
                {
                    label: "Quick Tab",
                    onClick: () => {
                        holdTicket();
                        navigate("/tabs");
                    },
                },
                { label: "Refresh Menu", onClick: () => navigate(0) },
                { label: "Remove All Discounts", onClick: clearCart },
                {
                    label: "Cancel Quick Order",
                    onClick: () => {
                        clearCart();
                        navigate("/proshop");
                    },
                },
            ]}
            actionBar={
                <>
                    <ActionButton tone={drilled ? "default" : "disabled"} onClick={() => setDrilled(null)}>
                        Back
                    </ActionButton>
                    <ActionButton onClick={() => navigate("/customersearch")}>Player Search</ActionButton>
                    {/* COMBOS is only present at the top level in the reference. */}
                    {!drilled && (
                        <ActionButton icon={<CategoryIcon />} onClick={() => navigate("/tabs")}>
                            Combos
                        </ActionButton>
                    )}
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone={hasLines ? "primary" : "disabled"} onClick={() => hasLines && navigate("/pay")}>
                        {hasLines ? `Pay ${money(total)}` : "Pay"}
                    </ActionButton>
                </>
            }
        >
            {drilled ? (
                /* Drilled in: the whole browsing surface is replaced. */
                <Box sx={{ p: 2, maxWidth: 620 }}>
                    <Box sx={{ bgcolor: "#fff", height: 196, display: "grid", placeItems: "center", mb: "1px" }}>
                        <Typography sx={{ fontSize: 34 }}>{drilled}</Typography>
                    </Box>
                    <Stack sx={{ gap: "1px" }}>
                        {itemsIn(drilled).map((p) => (
                            <ButtonBase
                                key={p.id}
                                onClick={() =>
                                    addItem({ id: p.id, name: p.name, price: p.price, image: storeImage(p.path) }, "Quick Order")
                                }
                                sx={{ display: "flex", bgcolor: "#fff", alignItems: "stretch", textAlign: "left" }}
                            >
                                <Box
                                    component="img"
                                    src={storeImage(p.path)}
                                    alt=""
                                    loading="lazy"
                                    sx={{ width: 110, height: 110, objectFit: "contain", bgcolor: "#fff", flexShrink: 0, p: 0.5 }}
                                />
                                <Stack sx={{ flex: 1, px: 2, py: 1, minWidth: 0 }}>
                                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 2 }}>
                                        <Typography sx={{ flex: 1, fontSize: 18, fontWeight: 500 }}>{p.name}</Typography>
                                        <Typography sx={{ fontSize: 18 }}>{money(p.price)}</Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{p.description}</Typography>
                                </Stack>
                            </ButtonBase>
                        ))}
                    </Stack>
                </Box>
            ) : (
                <Box sx={{ p: 2 }}>
                    <InputBase
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Start typing product name or SKU…"
                        sx={{ width: "100%", fontSize: 22, borderBottom: `1px solid ${appColors.textPrimary}`, pb: 1, mb: 3 }}
                    />

                    <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                        {Object.keys(MENU_SETS).map((set) => (
                            <ButtonBase
                                key={set}
                                onClick={() => setMenuSet(set)}
                                sx={{
                                    minWidth: 200,
                                    minHeight: 62,
                                    fontSize: 16,
                                    bgcolor: set === menuSet ? appColors.navy : appColors.grey,
                                    color: "#fff",
                                    borderBottom: set === menuSet ? `4px solid ${appColors.green}` : "4px solid transparent",
                                    borderRadius: `${appRadius.tile}px`,
                                }}
                            >
                                {set}
                            </ButtonBase>
                        ))}
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", rowGap: 2 }}>
                        {(MENU_SETS[menuSet] ?? MENU_SETS.All)
                            .filter((c) => !query || c.toLowerCase().includes(query.toLowerCase()))
                            .map((c) => {
                                // The tile art is the category's first product.
                                const hero = itemsIn(c)[0];
                                return (
                                    <ButtonBase
                                        key={c}
                                        onClick={() => setDrilled(c)}
                                        sx={{
                                            width: 168,
                                            flexDirection: "column",
                                            bgcolor: "#fff",
                                            border: "1px solid",
                                            borderColor: appColors.divider,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: 148,
                                                display: "grid",
                                                placeItems: "center",
                                                overflow: "hidden",
                                                p: 1,
                                            }}
                                        >
                                            {hero && (
                                                <Box
                                                    component="img"
                                                    src={storeImage(hero.path)}
                                                    alt=""
                                                    loading="lazy"
                                                    sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                                />
                                            )}
                                        </Box>
                                        <Typography sx={{ py: 1.25, fontSize: 14 }}>{c}</Typography>
                                    </ButtonBase>
                                );
                            })}
                    </Stack>
                </Box>
            )}
        </Shell>
    );
};
