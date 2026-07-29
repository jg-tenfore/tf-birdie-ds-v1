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
import { plate } from "./selling";

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

interface MenuProduct {
    id: string;
    name: string;
    price: number;
    image: string;
}
interface MenuCategory {
    label: string;
    image: string;
    products: MenuProduct[];
}

const cat = (label: string, tint: string, products: [string, number][]): MenuCategory => ({
    label,
    image: plate(label, tint),
    products: products.map(([name, price]) => ({
        id: `${label}-${name}`.toLowerCase().replace(/\W+/g, "-"),
        name,
        price,
        image: plate(name, tint),
    })),
});

const MENU_SETS = ["All", "Dinner", "19th Hole Menu"];

const CATEGORIES: MenuCategory[] = [
    cat("Beer", "#8a5a2b", [
        ["Pearl Beer", 12.0],
        ["Draft — Domestic", 8.0],
        ["Draft — IPA", 9.5],
        ["Bottled Light", 7.0],
    ]),
    cat("Appetizers", "#7a6a3d", [
        ["Potato Skins", 16.0],
        ["Wings — 10 pc", 14.5],
        ["Chips & Salsa", 8.0],
    ]),
    cat("Sandwiches", "#a3762b", [
        ["Turkey Club Sandwich", 9.15],
        ["Clubhouse BLT", 11.0],
        ["Chicken Wrap", 12.0],
    ]),
    cat("Hamburgers", "#a33d2b", [
        ["Open Burger", 10.32],
        ["Cheeseburger", 13.0],
        ["Double Stack", 16.5],
    ]),
];

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
    const [drilled, setDrilled] = useState<MenuCategory | null>(null);
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
                <Box sx={{ p: 2, maxWidth: 560 }}>
                    <Box sx={{ bgcolor: "#fff", height: 196, display: "grid", placeItems: "center", mb: "1px" }}>
                        <Typography sx={{ fontSize: 34 }}>{drilled.label}</Typography>
                    </Box>
                    <Stack sx={{ gap: "1px" }}>
                        {drilled.products.map((p) => (
                            <ButtonBase
                                key={p.id}
                                onClick={() => addItem({ id: p.id, name: p.name, price: p.price, image: p.image }, "Quick Order")}
                                sx={{ display: "flex", bgcolor: "#fff", alignItems: "stretch", textAlign: "left" }}
                            >
                                <Box
                                    component="img"
                                    src={p.image}
                                    alt=""
                                    sx={{ width: 110, height: 110, objectFit: "cover", flexShrink: 0 }}
                                />
                                <Stack direction="row" sx={{ flex: 1, alignItems: "center", px: 2, gap: 2 }}>
                                    <Typography sx={{ flex: 1, fontSize: 18, fontWeight: 500 }}>{p.name}</Typography>
                                    <Typography sx={{ fontSize: 18 }}>{money(p.price)}</Typography>
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
                        {MENU_SETS.map((set) => (
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
                        {CATEGORIES.filter((c) => !query || c.label.toLowerCase().includes(query.toLowerCase())).map((c) => (
                            <ButtonBase
                                key={c.label}
                                onClick={() => setDrilled(c)}
                                sx={{
                                    width: 148,
                                    flexDirection: "column",
                                    bgcolor: "#fff",
                                    border: "1px solid",
                                    borderColor: appColors.divider,
                                }}
                            >
                                <Box component="img" src={c.image} alt="" sx={{ width: "100%", height: 148, objectFit: "cover" }} />
                                <Typography sx={{ py: 1.25, fontSize: 14 }}>{c.label}</Typography>
                            </ButtonBase>
                        ))}
                    </Stack>
                </Box>
            )}
        </Shell>
    );
};
