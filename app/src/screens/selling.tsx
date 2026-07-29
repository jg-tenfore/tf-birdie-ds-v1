import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { foodByCategory } from "@/data/food-catalog";
import { golfBalls, mens, womens, golfShoes, accessoriesAndTraining } from "@/data/store-catalog";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { storeImage } from "@/utils/asset-url";
import { LiveOrderPanel, Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * The selling screens — Pro Shop and Quick Order.
 *
 * These are the two paths that put money in the drawer, so they are the fullest
 * implementation: tapping a tile really adds a line, quantities really change,
 * HOLD really moves the ticket to the tab list, and PAY really routes to tender.
 */

export interface Sellable {
    id: string;
    name: string;
    price: number;
    image?: string;
}

/** A tinted SVG plate for anything with no photograph — food, services, fees. */
export const plate = (label: string, tint: string = appColors.slate) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="${tint}"/><circle cx="150" cy="128" r="62" fill="rgba(255,255,255,.13)"/><text x="150" y="240" font-family="Roboto,sans-serif" font-size="24" fill="rgba(255,255,255,.92)" text-anchor="middle">${label.slice(0, 18)}</text></svg>`,
    )}`;

const pick = (list: { title: string; path: string }[], n: number) => list.slice(0, n);

/** Retail catalogue, built from the real product photography where it exists. */
export const proShopCategories: { label: string; items: Sellable[] }[] = [
    {
        label: "Golf Balls",
        items: pick(golfBalls, 8).map((p, i) => ({
            id: `ball-${i}`,
            name: p.title,
            price: [54.99, 49.99, 42.99][i % 3],
            image: storeImage(p.path),
        })),
    },
    {
        label: "Shirts",
        items: [...pick(mens, 5), ...pick(womens, 5)].map((p, i) => ({
            id: `shirt-${i}`,
            name: p.title,
            price: [78, 84, 68][i % 3],
            image: storeImage(p.path),
        })),
    },
    {
        label: "Shoes",
        items: pick(golfShoes, 6).map((p, i) => ({
            id: `shoe-${i}`,
            name: p.title,
            price: [145, 129, 189][i % 3],
            image: storeImage(p.path),
        })),
    },
    {
        label: "Accessories",
        items: pick(accessoriesAndTraining, 6).map((p, i) => ({
            id: `acc-${i}`,
            name: p.title,
            price: [24, 32, 18][i % 3],
            image: storeImage(p.path),
        })),
    },
    {
        label: "Green Fees",
        items: [
            { id: "gf-18", name: "Green fee — 18", price: 62, image: plate("18 holes", appColors.greenTee) },
            { id: "gf-9", name: "Green fee — 9", price: 38, image: plate("9 holes", appColors.greenTee) },
            { id: "gf-mem", name: "Green fee — Member", price: 34, image: plate("Member", appColors.greenTee) },
            { id: "gf-twi", name: "Twilight", price: 44, image: plate("Twilight", appColors.orange) },
            { id: "cart-18", name: "Cart — 18", price: 22, image: plate("Cart 18", appColors.slate) },
            { id: "range-l", name: "Range bucket — L", price: 14, image: plate("Range L", appColors.slate) },
        ],
    },
    {
        label: "F & B",
        items: [...foodByCategory("Grill"), ...foodByCategory("Sandwiches"), ...foodByCategory("Hamburgers")].map((f) => ({
            id: f.id,
            name: f.name,
            price: f.price,
            image: storeImage(f.path),
        })),
    },
    {
        label: "Drinks",
        items: [...foodByCategory("Beer"), ...foodByCategory("Wine"), ...foodByCategory("Beverages")].map((f) => ({
            id: f.id,
            name: f.name,
            price: f.price,
            image: storeImage(f.path),
        })),
    },
    {
        label: "Snacks",
        items: foodByCategory("Snacks").map((f) => ({ id: f.id, name: f.name, price: f.price, image: storeImage(f.path) })),
    },
    {
        label: "Other",
        items: [
            { id: "gift-25", name: "Gift card — $25", price: 25, image: plate("Gift card", appColors.green) },
            { id: "gift-50", name: "Gift card — $50", price: 50, image: plate("Gift card", appColors.green) },
            { id: "punch", name: "Punch card — 10", price: 320, image: plate("Punch card", appColors.navy) },
            { id: "clinic", name: "Clinic — junior", price: 45, image: plate("Clinic", appColors.navy) },
            { id: "rental", name: "Club rental", price: 45, image: plate("Rental clubs", appColors.slate) },
            { id: "member", name: "Membership — monthly", price: 189, image: plate("Membership", appColors.navy) },
        ],
    },
];

/** A tappable product tile. The whole tile is the target. */
export const Tile = ({ item, onAdd }: { item: Sellable; onAdd: () => void }) => (
    <ButtonBase
        onClick={onAdd}
        sx={{
            flexDirection: "column",
            alignItems: "stretch",
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: appColors.divider,
            borderRadius: `${appRadius.tile}px`,
            overflow: "hidden",
            transition: "border-color 100ms linear",
            "&:hover": { borderColor: appColors.green },
        }}
    >
        {/*
         * Absolutely positioned rather than max-height constrained. A percentage
         * max-height resolves against an auto-sized row and computes to `none`,
         * so `maxHeight: "100%"` here did nothing and tall product shots
         * overflowed onto the label below.
         */}
        <Box sx={{ position: "relative", height: 118, flexShrink: 0, bgcolor: "#fff", overflow: "hidden" }}>
            <Box
                component="img"
                src={item.image}
                alt=""
                loading="lazy"
                sx={{ position: "absolute", inset: 4, width: "calc(100% - 8px)", height: "calc(100% - 8px)", objectFit: "contain" }}
            />
        </Box>
        <Stack sx={{ px: 1, py: 0.75, borderTop: "1px solid", borderColor: appColors.divider, minHeight: 56, justifyContent: "center" }}>
            <Typography sx={{ fontSize: 12, lineHeight: 1.25, textAlign: "center" }} noWrap={false}>
                {item.name.length > 42 ? `${item.name.slice(0, 42)}…` : item.name}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, textAlign: "center", mt: 0.25 }}>{money(item.price)}</Typography>
        </Stack>
    </ButtonBase>
);

/** Category chips + tile grid, shared by both selling screens. */
export const Catalog = ({ source }: { source: "Pro Shop" | "Quick Order" }) => {
    const { addItem } = useActions();
    const categories = source === "Quick Order" ? proShopCategories.filter((c) => ["F & B", "Other"].includes(c.label)) : proShopCategories;
    const [active, setActive] = useState(categories[0].label);
    const items = categories.find((c) => c.label === active)?.items ?? [];

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", rowGap: 1 }}>
                {categories.map((c) => (
                    <ButtonBase
                        key={c.label}
                        onClick={() => setActive(c.label)}
                        sx={{
                            px: 2.5,
                            minHeight: 44,
                            borderRadius: `${appRadius.button}px`,
                            fontSize: 14,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            bgcolor: c.label === active ? appColors.navy : appColors.grey,
                            color: "#fff",
                            borderBottom: c.label === active ? `3px solid ${appColors.green}` : "3px solid transparent",
                        }}
                    >
                        {c.label}
                    </ButtonBase>
                ))}
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 1.5 }}>
                {items.map((item) => (
                    <Tile key={item.id} item={item} onAdd={() => addItem(item, source)} />
                ))}
            </Box>
        </Box>
    );
};

/** Bottom bar shared by the selling screens. PAY only lights up with lines. */
export const SellActionBar = ({ source }: { source: "Pro Shop" | "Quick Order" }) => {
    const { lines, total } = useStore();
    const { clearCart, holdTicket } = useActions();
    const navigate = useNavigate();
    const hasLines = lines.length > 0;

    return (
        <>
            {source === "Pro Shop" ? (
                <ActionButton icon={<CalendarMonthIcon />} onClick={() => navigate("/teesheet")}>
                    Tee Sheet
                </ActionButton>
            ) : (
                <ActionButton onClick={() => navigate("/proshop")}>Pro Shop</ActionButton>
            )}
            <ActionButton icon={<ReplayIcon />} onClick={clearCart}>
                Reset
            </ActionButton>
            <ActionButton icon={<SaveAltIcon />} onClick={holdTicket}>
                Pop
            </ActionButton>
            <ActionButton icon={<PersonIcon />} onClick={() => navigate("/customersearch")}>
                Anonymous
            </ActionButton>
            <ActionButton icon={<CategoryIcon />} onClick={() => navigate("/tabs")}>
                Tabs
            </ActionButton>
            <ActionButton icon={<ShoppingCartIcon />} tone={hasLines ? "primary" : "disabled"} onClick={() => hasLines && navigate("/pay")}>
                {`Pay ${money(total)}`}
            </ActionButton>
        </>
    );
};

export const ProShopScreen = () => (
    <Shell title="Pro Shop Order" active="proshop" orderPanel={<LiveOrderPanel />} actionBar={<SellActionBar source="Pro Shop" />}>
        <Catalog source="Pro Shop" />
    </Shell>
);

export const QuickOrderScreen = () => (
    <Shell title="Quick Order" active="quickorder" orderPanel={<LiveOrderPanel />} actionBar={<SellActionBar source="Quick Order" />}>
        <Catalog source="Quick Order" />
    </Shell>
);
