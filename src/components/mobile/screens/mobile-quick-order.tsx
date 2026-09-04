import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";

import { foodImage } from "@/components/screens/restaurant/quick-order-food-image";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import {
    MobileAttachedCustomer,
    MobileEmpty,
    MobileFab,
    MobileFilterTabs,
    MobileRow,
    MobileSearch,
    MobileSectionHeading,
} from "../mobile-parts";
import {
    MobileActionArea,
    MobileAppBar,
    MobileBottomNav,
    MobileBottomSheet,
    MobilePrimary,
    MobileScreen,
    MobileSecondary,
    MobileSecondaryRow,
} from "../mobile-shell";

/**
 * **Mobile Screens — 5-quickorder.** From `references/090426/`, laid out against
 * `App Screens → 5-quickorder`.
 *
 * Quick Order is the counter-service path: no table, no seat, no tab. On tablet
 * it is a 390px order panel beside a six-across photo-tile grid, with a
 * five-button action bar underneath.
 *
 * ## What had to change, and why
 *
 * **The tile grid becomes a list.** Six tiles across a 890px pane is a
 * comfortable browse; two across 402px is a tile that is mostly padding and a
 * name that wraps. The list keeps the photograph as a 44dp thumbnail, gives the
 * name its full width, and puts the price where a column of prices can be
 * scanned. Ten rows fit where four tiles did.
 *
 * **The order panel becomes a bottom-nav destination.** There is no second
 * column, so *Menus* and *Order* are two tabs. What stops that from hiding the
 * order is the attached-customer row pinned above the nav, which carries the
 * item count — the operator never has to switch tabs to know what is on it.
 *
 * **The five-button action bar becomes one primary.** `BACK / PLAYER SEARCH /
 * COMBOS / OPEN FOOD / PAY` at 402px would give each button 78px, and
 * `PLAYER SEARCH` does not fit in 78px. BACK is the app bar's job, COMBOS is a
 * nav destination, PLAYER SEARCH and OPEN FOOD move into the overflow, and PAY
 * — the only one that commits anything — takes the full width.
 *
 * **Anchored menus become bottom sheets.** The line kebab and the screen
 * overflow both opened small menus next to whatever was tapped. At this width
 * that covers the thing being acted on, so they come up from the bottom
 * instead, with the same rows in the same order.
 *
 * ## What deliberately did not change
 *
 * The two defects the tablet transcription documents are **kept**: the action
 * bar's contents still shift between states, and PAY is still grey when
 * disabled and green when confirming. A mobile layout is not the place to
 * quietly fix them — see `App Screens → 5-quickorder` for the note.
 */

const MENU_SETS = ["All", "Dinner", "19th Hole Menu", "Blue Sky"];

/** The list the references show, in their order, at their prices. */
export const quickOrderProducts = [
    { name: "Gift Card", price: 100, image: foodImage("Gift Card") },
    { name: "Golf Balls", price: 34.99, image: foodImage("Golf Balls") },
    { name: "Accessories", price: 14.99, image: foodImage("Accessories") },
    { name: "Hats", price: 29.99, image: foodImage("Hats") },
    { name: "Japanese Cuisine", price: 18.99, image: foodImage("Japanese Cuisine") },
    { name: "Miscellaneous", price: 19.99, image: foodImage("Miscellaneous") },
    { name: "Beer", price: 8.5, image: foodImage("Beer") },
    { name: "Punch Cards", price: 45, image: foodImage("Punch Cards") },
    { name: "Sandwiches", price: 12.5, image: foodImage("Sandwiches") },
];

export const quickOrderCombos = [
    { name: "6 Pack Combo", price: 17.53 },
    { name: "Beer Deal", price: 5.64 },
    { name: "Turn Special", price: 0 },
    { name: "KG Test Combo #2", price: 0 },
    { name: "Friday Night Event", price: 32 },
    { name: "hot dog chips bottled drink", price: 5 },
    { name: "Test 1", price: 10 },
];

const orderLines = [
    { name: "Pearl Beer", price: 12, image: foodImage("Pearl Beer") },
    { name: "Potato Skins", price: 16.65, image: foodImage("Potato Skins") },
];

type Tab = "menus" | "order";
type Sheet = null | "line" | "overflow";

const navItems = [
    { key: "menus", label: "Menus", icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} /> },
    { key: "order", label: "Order", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

export interface MobileQuickOrderProps {
    /** Which bottom-nav destination is showing. */
    tab?: Tab;
    /** Seeds a sheet open, so a story can show one without a click. */
    sheet?: Sheet;
    /** An order with lines on it, rather than the empty opening state. */
    withOrder?: boolean;
    /** The Combos destination, which replaces the product list. */
    combos?: boolean;
    drawerOpen?: boolean;
}

export const MobileQuickOrder = ({
    tab: tab0 = "menus",
    sheet: sheet0 = null,
    withOrder = false,
    combos = false,
    drawerOpen = false,
}: MobileQuickOrderProps) => {
    const [tab, setTab] = useState<Tab>(tab0);
    const [sheet, setSheet] = useState<Sheet>(sheet0);
    const [drawer, setDrawer] = useState(drawerOpen);
    const [menuSet, setMenuSet] = useState("All");

    const lines = withOrder ? orderLines : [];
    const total = lines.reduce((s, l) => s + l.price, 0);

    const overlay = drawer ? (
        <MobileNavDrawer active="quickorder" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
    ) : sheet === "line" ? (
        <MobileBottomSheet
            onDismiss={() => setSheet(null)}
            items={[
                { label: "Edit", icon: <EditOutlinedIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                { label: "Discount", icon: <LocalOfferOutlinedIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                { label: "Delete", icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />, destructive: true, onClick: () => setSheet(null) },
            ]}
        />
    ) : sheet === "overflow" ? (
        <MobileBottomSheet
            onDismiss={() => setSheet(null)}
            items={[
                { label: "Quick Tab", icon: <BoltIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                { label: "Refresh Menu", icon: <RefreshIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                { label: "Remove All Discounts", icon: <MoneyOffIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                {
                    label: "Cancel Quick Order",
                    icon: <CancelOutlinedIcon sx={{ fontSize: 20 }} />,
                    destructive: true,
                    onClick: () => setSheet(null),
                },
            ]}
        />
    ) : undefined;

    return (
        <MobileScreen
            appBar={
                <MobileAppBar
                    title="Quick Order"
                    leading="menu"
                    onLeading={() => setDrawer(true)}
                    showSearch
                    onOverflow={() => setSheet("overflow")}
                />
            }
            actions={
                tab === "order" && lines.length > 0 ? (
                    <MobileActionArea>
                        <MobileSecondaryRow>
                            <MobileSecondary>Player Search</MobileSecondary>
                            <MobileSecondary>Open Food</MobileSecondary>
                        </MobileSecondaryRow>
                        <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Pay ${total.toFixed(2)}</MobilePrimary>
                    </MobileActionArea>
                ) : undefined
            }
            bottomNav={
                <>
                    <MobileAttachedCustomer name="Weston Farnsworth" count={lines.length || undefined} />
                    <MobileBottomNav items={navItems} active={tab} onChange={(k) => setTab(k as Tab)} />
                </>
            }
            fab={tab === "menus" ? <MobileFab label={combos ? "Create Tab" : "Create Order"} /> : undefined}
            overlay={overlay}
        >
            {tab === "menus" ? (
                <>
                    <MobileFilterTabs tabs={MENU_SETS} active={menuSet} onChange={setMenuSet} />
                    <MobileSearch placeholder={combos ? "Search Combos" : "Search Items"} />
                    {(combos ? quickOrderCombos : quickOrderProducts).map((p) => (
                        <MobileRow
                            key={p.name}
                            title={p.name}
                            price={p.price}
                            image={"image" in p ? (p.image as string) : ""}
                            onClick={() => {}}
                        />
                    ))}
                    {/* The list ends with clearance for the floating pill, which
                        would otherwise sit on top of the last row. */}
                    <Box sx={{ height: 64 }} />
                </>
            ) : lines.length === 0 ? (
                <MobileEmpty message="No items in order." />
            ) : (
                <>
                    <MobileSectionHeading>Drafts</MobileSectionHeading>
                    {lines.map((l) => (
                        <MobileRow
                            key={l.name}
                            title={l.name}
                            price={l.price}
                            image={l.image}
                            overflow
                            onOverflow={() => setSheet("line")}
                        />
                    ))}
                    <Stack sx={{ px: 1.5, py: 1.5, gap: 0.5 }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>Subtotal</Typography>
                            <Typography sx={{ fontSize: 14 }}>${total.toFixed(2)}</Typography>
                        </Stack>
                    </Stack>
                </>
            )}
        </MobileScreen>
    );
};

/* ------------------------------------------------------------ item detail */

/**
 * The item detail screen — what the tablet's right-hand detail pane becomes.
 *
 * On tablet, tapping a line swaps the content pane for an editor while the
 * order panel stays put. Here there is nothing to stay put beside, so it is a
 * screen: `X` to abandon, `Save` to commit, both in the app bar where the
 * references put them.
 *
 * The modifier groups were horizontal tabs over a chip grid. Chips at this
 * width would wrap to one per line anyway, so they are checkbox rows under a
 * heading — same options, same groups, in the order the tablet lists them.
 */
export const MobileItemDetail = ({ group = "Cheeses" }: { group?: "Cheeses" | "Toppings" }) => {
    const options = group === "Cheeses" ? ["Mozarella", "Blue Cheese"] : ["Add Bacon", "Extra Cheese", "No Lettuce", "Add Onions"];
    return (
        <MobileScreen
            appBar={<MobileAppBar title="Potato Skins" subtitle="$16.00" leading="close" showOverflow={false} action="Save" />}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary>Refire</MobileSecondary>
                        <MobileSecondary tone="destructive">Remove</MobileSecondary>
                    </MobileSecondaryRow>
                </MobileActionArea>
            }
        >
            <Stack direction="row" sx={{ gap: 1.5, p: 1.5, bgcolor: appColors.surface }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        borderRadius: `${appRadius.tile}px`,
                        backgroundImage: `url(${foodImage("Potato Skins")})`,
                        backgroundSize: "cover",
                    }}
                />
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 16 }}>Potato Skins</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                        These potato skins are glazed in a silky butter sauce
                    </Typography>
                </Stack>
            </Stack>

            <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, px: 1.5, py: 1.5, bgcolor: appColors.surface, mt: 1 }}>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, flex: 1 }}>Quantity</Typography>
                <RemoveCircleOutlineIcon sx={{ fontSize: 26, color: appColors.textSecondary }} />
                <Typography sx={{ fontSize: 18, minWidth: 28, textAlign: "center" }}>1</Typography>
                <AddCircleOutlineIcon sx={{ fontSize: 26, color: appColors.textSecondary }} />
            </Stack>

            <MobileSectionHeading>{group}</MobileSectionHeading>
            <Box sx={{ bgcolor: appColors.surface }}>
                {options.map((o) => (
                    <Stack
                        key={o}
                        direction="row"
                        sx={{ alignItems: "center", gap: 1.5, px: 1.5, minHeight: 48, borderBottom: `1px solid ${appColors.divider}` }}
                    >
                        <Box sx={{ width: 18, height: 18, border: `2px solid ${appColors.textSecondary}`, borderRadius: 0.5 }} />
                        <Typography sx={{ fontSize: 16 }}>{o}</Typography>
                    </Stack>
                ))}
            </Box>

            <MobileSectionHeading>Notes</MobileSectionHeading>
            <Box sx={{ mx: 1.5, mb: 2, p: 1.5, bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Notes</Typography>
                <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>
                    Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.
                </Typography>
            </Box>
        </MobileScreen>
    );
};

/* -------------------------------------------------------------- open food */

/**
 * Open Food — a tablet dialog that became a screen.
 *
 * The tablet renders this as a centred card over the catalog. A 640px card does
 * not fit in 402px, and shrinking it to fit would leave a form with no room for
 * its own fields, so it takes the whole screen. `X` abandons, and the commit is
 * the full-width primary the references show.
 */
export const MobileOpenFood = () => (
    <MobileScreen
        appBar={<MobileAppBar title="Open Food" leading="back" showSearch showOverflow />}
        actions={
            <MobileActionArea>
                <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Save Open Food</MobilePrimary>
            </MobileActionArea>
        }
    >
        <MobileSectionHeading>Fees</MobileSectionHeading>
        <Box sx={{ mx: 1.5, bgcolor: appColors.canvasAlt, px: 1.5, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Enter Food Name</Typography>
            <Typography sx={{ fontSize: 16 }}>Food Name</Typography>
        </Box>

        <Stack sx={{ px: 1.5, pt: 1.5, gap: 1 }}>
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

        <MobileSectionHeading>Notes</MobileSectionHeading>
        <Box sx={{ mx: 1.5, p: 1.5, bgcolor: appColors.canvasAlt }}>
            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Notes</Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>
                Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.
            </Typography>
        </Box>

        <MobileSectionHeading>Enter Price</MobileSectionHeading>
        <Box sx={{ mx: 1.5, mb: 2, bgcolor: appColors.canvasAlt, px: 1.5, py: 1 }}>
            <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Food Price</Typography>
            <Typography sx={{ fontSize: 16 }}>$0.00</Typography>
        </Box>
    </MobileScreen>
);
