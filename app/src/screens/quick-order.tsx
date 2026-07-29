import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CategoryIcon from "@mui/icons-material/Category";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type Line } from "../store";

/**
 * Quick Order, from `references/072926/5-quickorder/`.
 *
 * Differs from Pro Shop in a way that is easy to miss: the tiles are menu
 * **categories**, not products. Tapping one replaces the entire browsing
 * surface — search field, menu-set chips and grid all disappear — with a tall
 * header card naming the category over a list of its products. The only way
 * back is the BACK button, which is greyed until you have drilled in.
 *
 * The order panel rows are also lighter here than on the retail side: a small
 * thumbnail, name and price, with no quantity stepper. Quantity is edited from
 * the item detail pane, not the cart.
 */

import { foodByCategory, foodCategories, type FoodCategory } from "@/data/food-catalog";
import { storeImage } from "@/utils/asset-url";

/** Menu sets, as the reference device groups them. */
const MENU_SETS: Record<string, FoodCategory[]> = {
    All: foodCategories,
    Dinner: ["Sandwiches", "Hamburgers", "Grill", "Beer", "Wine"],
    "19th Hole Menu": ["Beer", "Wine", "Beverages", "Snacks"],
};

/** Quick Order's compact cart row — thumbnail, name, price. No stepper. */
const QuickLine = ({ line }: { line: Line }) => (
    <Stack direction="row" spacing={1.5} sx={{ px: 1.5, py: 1.25, alignItems: "center" }}>
        <Box sx={{ position: "relative", width: 46, height: 46, flexShrink: 0, bgcolor: "#fff", overflow: "hidden" }}>
            {line.image && <Box component="img" src={line.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    minWidth: 20,
                    height: 20,
                    px: 0.4,
                    bgcolor: appColors.greenTee,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    lineHeight: 1,
                }}
            >
                {line.qty}
            </Box>
        </Box>
        <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 500 }} noWrap>
            {line.name}
        </Typography>
        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{money(line.qty * line.unitPrice)}</Typography>
    </Stack>
);

const QuickOrderPanel = () => {
    const { lines } = useStore();
    if (lines.length === 0) return <OrderPanelEmpty />;
    return (
        <Box sx={{ flex: 1, overflowY: "auto" }}>
            <Stack divider={<Divider />}>
                {lines.map((l) => (
                    <QuickLine key={`${l.id}-${l.seat ?? "x"}`} line={l} />
                ))}
            </Stack>
        </Box>
    );
};

export const QuickOrderScreen = () => {
    const { lines, total } = useStore();
    const { addItem } = useActions();
    const navigate = useNavigate();

    const [menuSet, setMenuSet] = useState("Dinner");
    const [drilled, setDrilled] = useState<FoodCategory | null>(null);
    const [query, setQuery] = useState("");

    const hasLines = lines.length > 0;

    return (
        <Shell
            title="Quick Order"
            active="quickorder"
            orderPanel={<QuickOrderPanel />}
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
                        {foodByCategory(drilled).map((p) => (
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
                        {(MENU_SETS[menuSet] ?? foodCategories)
                            .filter((c) => !query || c.toLowerCase().includes(query.toLowerCase()))
                            .map((c) => {
                                // The tile art is the category's first product.
                                const hero = foodByCategory(c)[0];
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
