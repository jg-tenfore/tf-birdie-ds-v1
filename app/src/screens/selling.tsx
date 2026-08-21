import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { foodByCategory } from "@/data/food-catalog";
import { menuItems } from "@/data/steakhouse-menu";
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

/** Food catalogue entry → sellable, since half the categories come from there. */
const sellableFood = (f: { id: string; name: string; price: number; path: string }): Sellable => ({
    id: f.id,
    name: f.name,
    price: f.price,
    image: storeImage(f.path),
});

/**
 * The Pro Shop's categories, in the device's own order.
 *
 * Twenty-four tiles, which is the point: the operator is scanning a wall of
 * photographs, not reading a list, and the categories are as granular as the
 * course's own reporting. Coarse buckets like "F & B" were an earlier
 * simplification and they made the grid unrecognisable.
 *
 * Photography comes from the real catalogues where it exists; the rest get a
 * tinted plate rather than a placeholder that pretends to be a photo.
 */
export const proShopCategories: { label: string; items: Sellable[] }[] = [
    {
        label: "Gift Card",
        items: [
            { id: "gift-25", name: "Gift card — $25", price: 25, image: plate("Gift card", appColors.green) },
            { id: "gift-50", name: "Gift card — $50", price: 50, image: plate("Gift card", appColors.green) },
            { id: "gift-100", name: "Gift card — $100", price: 100, image: plate("Gift card", appColors.green) },
        ],
    },
    {
        label: "Clinics",
        items: [
            { id: "clinic-jr", name: "Clinic — junior", price: 45, image: plate("Junior clinic", appColors.navy) },
            { id: "clinic-adult", name: "Clinic — adult", price: 65, image: plate("Adult clinic", appColors.navy) },
            { id: "clinic-short", name: "Short game school", price: 120, image: plate("Short game", appColors.navy) },
        ],
    },
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
        label: "Accessories",
        items: pick(accessoriesAndTraining, 8).map((p, i) => ({
            id: `acc-${i}`,
            name: p.title,
            price: [24, 32, 18][i % 3],
            image: storeImage(p.path),
        })),
    },
    {
        label: "Hats",
        items: pick(accessoriesAndTraining.slice(8), 4).map((p, i) => ({
            id: `hat-${i}`,
            name: p.title,
            price: [32, 38, 28][i % 3],
            image: storeImage(p.path),
        })),
    },
    {
        label: "Rental Clubs",
        items: [
            { id: "rental-full", name: "Club rental — full set", price: 45, image: plate("Rental set", appColors.slate) },
            { id: "rental-prem", name: "Club rental — premium", price: 75, image: plate("Premium set", appColors.slate) },
            { id: "rental-jr", name: "Club rental — junior", price: 25, image: plate("Junior set", appColors.slate) },
        ],
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
        label: "Gloves",
        items: pick(accessoriesAndTraining.slice(4), 4).map((p, i) => ({
            id: `glove-${i}`,
            name: p.title,
            price: [26, 22, 34][i % 3],
            image: storeImage(p.path),
        })),
    },
    {
        label: "Clubs",
        items: [
            { id: "club-driver", name: "Driver", price: 549, image: plate("Driver", appColors.navy) },
            { id: "club-irons", name: "Iron set", price: 899, image: plate("Irons", appColors.navy) },
            { id: "club-putter", name: "Putter", price: 249, image: plate("Putter", appColors.navy) },
            { id: "club-wedge", name: "Wedge", price: 159, image: plate("Wedge", appColors.navy) },
        ],
    },
    {
        label: "Range Balls",
        items: [
            { id: "range-s", name: "Range bucket — S", price: 8, image: plate("Range S", appColors.greenTee) },
            { id: "range-m", name: "Range bucket — M", price: 11, image: plate("Range M", appColors.greenTee) },
            { id: "range-l", name: "Range bucket — L", price: 14, image: plate("Range L", appColors.greenTee) },
        ],
    },
    {
        label: "Miscellaneous",
        items: [
            { id: "misc-tee", name: "Lost ball fee", price: 5, image: plate("Lost ball", appColors.grey) },
            { id: "misc-repair", name: "Regrip — per club", price: 18, image: plate("Regrip", appColors.grey) },
            { id: "misc-locker", name: "Locker — day", price: 6, image: plate("Locker", appColors.grey) },
        ],
    },
    { label: "Beer", items: foodByCategory("Beer").map(sellableFood) },
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
        label: "Punch Cards",
        items: [
            { id: "punch-10", name: "Punch card — 10 rounds", price: 320, image: plate("10 rounds", appColors.navy) },
            { id: "punch-20", name: "Punch card — 20 rounds", price: 600, image: plate("20 rounds", appColors.navy) },
            { id: "punch-cart", name: "Cart punch card", price: 180, image: plate("Cart card", appColors.navy) },
        ],
    },
    { label: "Sandwiches", items: foodByCategory("Sandwiches").map(sellableFood) },
    { label: "Beverages", items: foodByCategory("Beverages").map(sellableFood) },
    { label: "Hamburgers", items: foodByCategory("Hamburgers").map(sellableFood) },
    {
        label: "Memberships",
        items: [
            { id: "mem-monthly", name: "Membership — monthly", price: 189, image: plate("Monthly", appColors.navy) },
            { id: "mem-annual", name: "Membership — annual", price: 1990, image: plate("Annual", appColors.navy) },
            { id: "mem-social", name: "Membership — social", price: 49, image: plate("Social", appColors.navy) },
        ],
    },
    { label: "Snacks", items: foodByCategory("Snacks").map(sellableFood) },
    {
        label: "Simulator",
        items: [
            { id: "sim-hour", name: "Sim Hour", price: 45, image: plate("Sim hour", appColors.slate) },
            { id: "sim-half", name: "Sim half hour", price: 25, image: plate("Sim 30m", appColors.slate) },
            { id: "sim-league", name: "Sim league night", price: 30, image: plate("League", appColors.slate) },
        ],
    },
    {
        label: "Tees",
        items: [
            { id: "tee-wood", name: "Wooden tees — 50", price: 6, image: plate("Wood tees", appColors.greenTee) },
            { id: "tee-plastic", name: "Plastic tees — 20", price: 9, image: plate("Plastic tees", appColors.greenTee) },
        ],
    },
    { label: "Appetizers", items: foodByCategory("Grill").map(sellableFood) },
    {
        label: "Liquor",
        items: [
            ...foodByCategory("Wine").map(sellableFood),
            { id: "liq-vodka", name: "Vodka — well", price: 9, image: plate("Vodka", appColors.slate) },
            { id: "liq-whiskey", name: "Whiskey — well", price: 10, image: plate("Whiskey", appColors.slate) },
        ],
    },
    {
        label: "Green Fees",
        items: [
            { id: "gf-18", name: "Green fee — 18", price: 62, image: plate("18 holes", appColors.greenTee) },
            { id: "gf-9", name: "Green fee — 9", price: 38, image: plate("9 holes", appColors.greenTee) },
            { id: "gf-mem", name: "Green fee — Member", price: 34, image: plate("Member", appColors.greenTee) },
            { id: "gf-twi", name: "Twilight", price: 44, image: plate("Twilight", appColors.orange) },
            { id: "cart-18", name: "Cart — 18", price: 22, image: plate("Cart 18", appColors.slate) },
        ],
    },
    {
        label: "19th Hole",
        items: menuItems.map((m) => ({ id: m.id, name: m.name, price: m.price, image: storeImage(m.path) })),
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

/**
 * The browsing surface, from `references/072926/1-proshop/` and
 * `references/072926/createGiftCard/`.
 *
 * Six category tiles across, each a photograph with its name beneath — not a chip
 * row over a product grid, which is what an earlier pass built. Tapping a
 * category replaces the whole grid with its products; BACK in the bottom bar is
 * the only way out.
 *
 * Some categories are not lists at all. **Gift Card** opens a configuration
 * screen, because a gift card has no price until somebody types one and no
 * meaning until it has a sender and a recipient. That is the convention worth
 * naming: a tile is a *destination*, and only most of them happen to be lists.
 */
export const Catalog = ({
    source,
    drilled,
    onDrill,
}: {
    source: "Pro Shop" | "Quick Order";
    drilled: string | null;
    onDrill: (category: string | null) => void;
}) => {
    const { addItem } = useActions();
    const navigate = useNavigate();
    const [scanMode, setScanMode] = useState(false);

    const categories =
        source === "Quick Order"
            ? proShopCategories.filter((c) => ["Sandwiches", "Hamburgers", "Beverages", "Snacks", "Beer", "Appetizers"].includes(c.label))
            : proShopCategories;
    const items = drilled ? (categories.find((c) => c.label === drilled)?.items ?? []) : [];

    if (drilled) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: 26, mb: 2 }}>{drilled}</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 1.5 }}>
                    {items.map((item) => (
                        <Tile key={item.id} item={item} onAdd={() => addItem(item, source)} />
                    ))}
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {/*
             * Scan Mode. On the device this switches the tiles out for a barcode
             * prompt; here it only reports its state, since the prototype has no
             * scanner to listen to.
             */}
            <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Typography sx={{ fontSize: 17 }}>Scan Mode</Typography>
                <Switch checked={scanMode} onChange={(e) => setScanMode(e.target.checked)} />
            </Stack>

            {scanMode ? (
                <Stack sx={{ height: 320, alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 22 }}>Scan a barcode</Typography>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                        The tiles are replaced while the scanner has focus.
                    </Typography>
                </Stack>
            ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2 }}>
                    {categories.map((c) => {
                        const hero = c.items[0];
                        return (
                            <ButtonBase
                                key={c.label}
                                onClick={() => (c.label === "Gift Card" ? navigate("/giftcards/new") : onDrill(c.label))}
                                sx={{
                                    flexDirection: "column",
                                    bgcolor: "#fff",
                                    boxShadow: 1,
                                    overflow: "hidden",
                                    transition: "box-shadow 100ms linear",
                                    "&:hover": { boxShadow: 4 },
                                }}
                            >
                                <Box sx={{ position: "relative", width: "100%", height: 150, bgcolor: "#fff", overflow: "hidden" }}>
                                    {hero && (
                                        <Box
                                            component="img"
                                            src={hero.image}
                                            alt=""
                                            loading="lazy"
                                            sx={{
                                                position: "absolute",
                                                inset: 4,
                                                width: "calc(100% - 8px)",
                                                height: "calc(100% - 8px)",
                                                objectFit: "contain",
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography sx={{ py: 1.25, fontSize: 15 }} noWrap>
                                    {c.label}
                                </Typography>
                            </ButtonBase>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

/** Bottom bar shared by the selling screens. PAY only lights up with lines. */
export const SellActionBar = ({
    source,
    drilled,
    onBack,
}: {
    source: "Pro Shop" | "Quick Order";
    drilled?: string | null;
    onBack?: () => void;
}) => {
    const { lines, total } = useStore();
    const { clearCart, popDrawer } = useActions();
    const navigate = useNavigate();
    const hasLines = lines.length > 0;

    return (
        <>
            {/* Drilled into a category, the first button backs out of it rather
                than leaving the screen. */}
            {drilled ? (
                <ActionButton icon={<ArrowBackIosNewIcon />} onClick={onBack}>
                    Back
                </ActionButton>
            ) : source === "Pro Shop" ? (
                <ActionButton icon={<CalendarMonthIcon />} onClick={() => navigate("/teesheet")}>
                    Tee Sheet
                </ActionButton>
            ) : (
                <ActionButton onClick={() => navigate("/proshop")}>Pro Shop</ActionButton>
            )}
            <ActionButton icon={<ReplayIcon />} onClick={clearCart}>
                Reset
            </ActionButton>
            {/* Opens the cash drawer — it does not touch the ticket. */}
            <ActionButton icon={<SaveAltIcon />} onClick={popDrawer}>
                Pop
            </ActionButton>
            <ActionButton icon={<PersonIcon />} onClick={() => navigate("/customersearch")}>
                Anonymous
            </ActionButton>
            <ActionButton icon={<CategoryIcon />} onClick={() => navigate("/combos")}>
                Combos
            </ActionButton>
            <ActionButton icon={<ShoppingCartIcon />} tone={hasLines ? "primary" : "disabled"} onClick={() => hasLines && navigate("/pay")}>
                {`Pay ${money(total)}`}
            </ActionButton>
        </>
    );
};

export const ProShopScreen = () => {
    const navigate = useNavigate();
    const { holdTicket } = useActions();
    const [drilled, setDrilled] = useState<string | null>(null);

    return (
        <Shell
            title="Pro Shop Order"
            active="proshop"
            orderPanel={<LiveOrderPanel />}
            actionBar={<SellActionBar source="Pro Shop" drilled={drilled} onBack={() => setDrilled(null)} />}
            // The register's own overflow menu, from
            // references/072926/1-proshop/. Three items, no icons, full-bleed
            // rules between them.
            overflowItems={[
                { label: "Refresh", onClick: () => navigate(0) },
                { label: "Add Cash Payout", onClick: () => navigate("/pay") },
                {
                    label: "Quick Tab",
                    onClick: () => {
                        holdTicket();
                        navigate("/tabs");
                    },
                },
            ]}
        >
            <Catalog source="Pro Shop" drilled={drilled} onDrill={setDrilled} />
        </Shell>
    );
};
