import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import { foodImage } from "@/components/screens/restaurant/quick-order-food-image";
import { seatBandColors } from "@/components/screens/restaurant/tabs-parts";
import { openTabs } from "@/components/screens/restaurant/tabs-story-parts";
import { posCategory, posItem } from "@/data/pos-inventory";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileAttachedCustomer, MobileFab, MobileFilterTabs, MobileRow, MobileSearch, MobileSeatBand } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobileBottomNav, MobileBottomSheet, MobilePrimary, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 6-tabs.** From `references/090426/`, laid out against
 * `App Screens → 6-tabs`.
 *
 * ## The listing
 *
 * The tablet lists open tabs in a wide table — name, then a metadata column of
 * operator, order id, timestamp and card, then an amount hard right. Four
 * columns do not survive 402px, so the row stacks: **name on top, the metadata
 * joined into one secondary line beneath, amount still hard right.** Nothing is
 * dropped; the reading order simply turns from left-to-right into
 * top-to-bottom, which is the one reliable move when a table has to narrow.
 *
 * ## The tab detail
 *
 * The seat bands are unchanged — same `seatBandColors`, same full-width
 * treatment as `order-panel.tsx` draws them on tablet. They are the one element
 * that needed no adaptation at all, because a coloured full-width band is
 * already the narrowest possible way to group a list.
 *
 * What changed is the product browser beside it: on tablet the menu sits to the
 * right of the seats and both are visible at once. Here they are the two
 * bottom-nav destinations, and the count on the attached-customer row is what
 * keeps the order legible from the menu side.
 *
 * ## Drill-down replaces the tile grid
 *
 * `Beers ›` opens a sub-list rather than a tile grid swapping in place. The
 * chevron is doing real work: on this screen a row either **adds to the order**
 * or **goes somewhere**, and there is no room for a visual convention that
 * distinguishes those other than the chevron.
 */

const MENU_SETS = ["All", "Dinner", "19th Hole Menu", "Blue Sky"];

/**
 * Real categories, from `@/data/pos-inventory`.
 *
 * A tab is rung against the kitchen and the bar, so these are the F&B
 * categories rather than the shipping grid's merchandise mix — and each one now
 * carries a photograph from the catalogue instead of a tinted placeholder.
 */
const categories = ["Beer & Wine", "Snacks", "Beverages", "Grill", "Sandwiches"]
    .map((label) => posCategory(label))
    .filter((c) => c !== undefined);

/** The drilled-in list, real stock at real prices. */
export const beerList = (posCategory("Beer & Wine")?.items ?? []).slice(0, 8);

const seatedLines = [
    { seat: 1, name: "Busch Prod", price: 5 },
    { seat: 1, name: "Busch Prod", price: 5 },
    { seat: 1, name: "Carlsberg Pilsner", price: 5 },
    { seat: 2, name: "Full Grown Man", price: 5 },
    { seat: 2, name: "Full Grown Man", price: 5 },
    { seat: 3, name: "Miller Lite", price: 5 },
];

const combos = [
    { name: "6 Pack Combo", price: 17.53 },
    { name: "Beer Deal", price: 5.64 },
    { name: "Turn Special", price: 0 },
    { name: "KG Test Combo #2", price: 0 },
    { name: "Friday Night Event", price: 32 },
];

const navItems = [
    { key: "menus", label: "Menus", icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} /> },
    { key: "order", label: "Order", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

/* ----------------------------------------------------------- tab listing */

export const MobileTabListing = ({ drawerOpen = false }: { drawerOpen?: boolean }) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    return (
        <MobileScreen
            appBar={<MobileAppBar title="Tabs" leading="menu" onLeading={() => setDrawer(true)} showSearch />}
            fab={<MobileFab label="Create a Tab" />}
            overlay={
                drawer ? <MobileNavDrawer active="tabs" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} /> : undefined
            }
        >
            <MobileSearch placeholder="Filter by customer or employee" />
            {openTabs.map((t) => (
                <MobileRow
                    key={t.id}
                    title={t.title}
                    // Four table columns joined into one secondary line — the
                    // only way to keep every fact without a horizontal scroll.
                    subtitle={t.meta.join(" · ")}
                    trailing={t.amount}
                    onClick={() => {}}
                />
            ))}
            <Box sx={{ height: 64 }} />
        </MobileScreen>
    );
};

/* ------------------------------------------------------------- tab detail */

export interface MobileTabDetailProps {
    /** `menus` browses, `order` shows the seated lines. */
    tab?: "menus" | "order";
    /** A drilled-in category, which replaces the category list. */
    drilled?: boolean;
    combos?: boolean;
    sheet?: null | "line" | "overflow";
    openFood?: boolean;
}

export const MobileTabDetail = ({
    tab: tab0 = "order",
    drilled = false,
    combos: showCombos = false,
    sheet: sheet0 = null,
}: MobileTabDetailProps) => {
    const [tab, setTab] = useState(tab0);
    const [sheet, setSheet] = useState(sheet0);
    const [menuSet, setMenuSet] = useState("All");
    const total = seatedLines.reduce((s, l) => s + l.price, 0);

    const overlay =
        sheet === "line" ? (
            <MobileBottomSheet
                onDismiss={() => setSheet(null)}
                items={[
                    { label: "Fire", icon: <LocalFireDepartmentIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                    { label: "Move", icon: <OpenWithIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                    { label: "Split", icon: <CallSplitIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                    { label: "Edit", icon: <EditOutlinedIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                    { label: "Discount", icon: <LocalOfferOutlinedIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                    {
                        label: "Delete",
                        icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,
                        destructive: true,
                        onClick: () => setSheet(null),
                    },
                ]}
            />
        ) : undefined;

    // Rows render under the band for their seat, in seat order — the same
    // grouping the landscape order panel uses, at a different width.
    const seats = [...new Set(seatedLines.map((l) => l.seat))];

    return (
        <MobileScreen
            appBar={
                <MobileAppBar
                    title="Table Order"
                    subtitle="Weston Farnsworth | Order ID 3846547"
                    leading="close"
                    action="Save"
                    showOverflow
                />
            }
            actions={
                tab === "order" ? (
                    <MobileActionArea>
                        <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Pay ${total.toFixed(2)}</MobilePrimary>
                    </MobileActionArea>
                ) : undefined
            }
            fab={tab === "menus" && !drilled && !showCombos ? <MobileFab label="Quick Order" /> : undefined}
            bottomNav={
                <>
                    <MobileAttachedCustomer name="Weston Farnsworth" count={seatedLines.length} />
                    <MobileBottomNav items={navItems} active={tab} onChange={(k) => setTab(k as "menus" | "order")} />
                </>
            }
            overlay={overlay}
        >
            {tab === "order" ? (
                seats.map((seat) => (
                    <Box key={seat}>
                        <MobileSeatBand label={`Seat ${seat}`} color={seatBandColors[(seat - 1) % seatBandColors.length]} />
                        {seatedLines
                            .filter((l) => l.seat === seat)
                            .map((l, i) => (
                                <MobileRow
                                    key={`${l.name}-${i}`}
                                    title={l.name}
                                    price={l.price}
                                    image={posItem(l.name)?.image ?? foodImage(l.name)}
                                    overflow
                                    onOverflow={() => setSheet("line")}
                                />
                            ))}
                    </Box>
                ))
            ) : drilled ? (
                <>
                    <MobileSearch placeholder="Search Beers" />
                    {beerList.map((b) => (
                        <MobileRow
                            key={b.id}
                            title={b.name}
                            subtitle={b.description}
                            price={b.price}
                            image={b.image ?? ""}
                            onClick={() => {}}
                        />
                    ))}
                </>
            ) : showCombos ? (
                <>
                    <MobileFilterTabs tabs={MENU_SETS} active={menuSet} onChange={setMenuSet} />
                    <MobileSearch placeholder="Search Combos" />
                    {combos.map((c) => (
                        <MobileRow key={c.name} title={c.name} price={c.price} image="" onClick={() => {}} />
                    ))}
                </>
            ) : (
                <>
                    <MobileFilterTabs tabs={MENU_SETS} active={menuSet} onChange={setMenuSet} />
                    <MobileSearch placeholder="Search Items" />
                    {categories.map((c) => (
                        <MobileRow
                            key={c.label}
                            title={c.label}
                            subtitle={`${c.items.length} ${c.items.length === 1 ? "item" : "items"}`}
                            image={c.image ?? ""}
                            drills
                            onClick={() => {}}
                        />
                    ))}
                    <Box sx={{ height: 64 }} />
                </>
            )}
        </MobileScreen>
    );
};

/* ------------------------------------------------------------- open food */

/** Open Food from a tab — the same form Quick Order uses, on a tab's chrome. */
export const MobileTabOpenFood = () => (
    <MobileScreen
        appBar={<MobileAppBar title="Open Food" subtitle="Weston Farnsworth | Order ID 3846547" leading="back" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Save Open Food</MobilePrimary>
            </MobileActionArea>
        }
    >
        <Box sx={{ m: 1.5, bgcolor: appColors.canvasAlt, px: 1.5, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Enter Name of open food item</Typography>
            <Typography sx={{ fontSize: 16 }}>Food Name</Typography>
        </Box>
        <Stack sx={{ px: 1.5, gap: 1 }}>
            {["Food and Beverage", "Alcohol"].map((label, i) => (
                <Stack key={label} direction="row" sx={{ alignItems: "center", gap: 1.5, minHeight: 44 }}>
                    <Box
                        sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${i === 0 ? appColors.green : appColors.textSecondary}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {i === 0 && <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: appColors.green }} />}
                    </Box>
                    <Typography sx={{ fontSize: 16 }}>{label}</Typography>
                </Stack>
            ))}
        </Stack>
        <Box sx={{ m: 1.5, bgcolor: appColors.canvasAlt, px: 1.5, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Enter Additional Notes</Typography>
            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>—</Typography>
        </Box>
        <Box sx={{ m: 1.5, bgcolor: appColors.canvasAlt, px: 1.5, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Enter Price</Typography>
            <Typography sx={{ fontSize: 16 }}>$0.00</Typography>
        </Box>
    </MobileScreen>
);
