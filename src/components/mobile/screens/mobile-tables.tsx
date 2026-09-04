import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import GridViewIcon from "@mui/icons-material/GridView";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

import { foodImage } from "@/components/screens/restaurant/quick-order-food-image";
import { seatBandColors } from "@/components/screens/restaurant/tabs-parts";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileAttachedCustomer, MobileFab, MobileFilterTabs, MobileRow, MobileSearch, MobileSeatBand } from "../mobile-parts";
import {
    MobileActionArea,
    MobileAppBar,
    MobileBottomNav,
    MobilePrimary,
    MobileScreen,
    MobileSecondary,
    MobileSecondaryRow,
} from "../mobile-shell";

/**
 * **Mobile Screens — 7-tables.** From `references/090426/`, laid out against
 * `App Screens → 7-tables`.
 *
 * ## The one screen that could not simply narrow
 *
 * The tablet's Tables screen is a **floor plan** — tables positioned in a room,
 * drawn to scale, with seats around each one. That is a spatial view, and a
 * spatial view does not narrow: shrinking a room to 402px makes every table too
 * small to hit, and cropping it hides the half of the room you were not looking
 * at.
 *
 * So the references do not try. The mobile Tables screen is the **product
 * browser and the order**, reached from a table rather than drawn on one, and
 * the floor plan stays a tablet view. That is a real gap and it is worth stating
 * plainly rather than pretending a list is a floor plan: **choosing which table
 * you are serving is not something this layout does.** It assumes you arrived
 * with a table already in hand — which is what happens when the phone is a
 * runner's device and the terminal is the host's.
 *
 * Everything downstream of that — the seated order, the drill-down, the
 * per-line actions, PAY — is the same as `6-tabs`, and shares its components.
 */

const MENU_SETS = ["All", "Dinner", "19th Hole Menu", "Blue Sky"];

const categories = [
    { name: "Beers", image: foodImage("Beer") },
    { name: "Golf Balls", image: foodImage("Golf Balls") },
    { name: "Accessories", image: foodImage("Accessories") },
    { name: "Hats", image: foodImage("Hats") },
    { name: "Japanese Cuisine", image: foodImage("Japanese Cuisine") },
];

const products = [
    { name: "Combo", price: 100 },
    { name: "Golf Balls", price: 34.99 },
    { name: "Accessories", price: 14.99 },
    { name: "Hats", price: 29.99 },
    { name: "Japanese Cuisine", price: 18.99 },
    { name: "Miscellaneous", price: 19.99 },
];

const seatedLines = [
    { seat: 1, name: "Busch Prod", price: 5 },
    { seat: 1, name: "Busch Prod", price: 5 },
    { seat: 1, name: "Carlsberg Pilsner", price: 5 },
    { seat: 2, name: "Full Grown Man", price: 5 },
    { seat: 2, name: "Full Grown Man", price: 5 },
    { seat: 3, name: "Miller Lite", price: 5 },
];

const navItems = [
    { key: "menus", label: "Menus", icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} /> },
    { key: "combos", label: "Combos", icon: <GridViewIcon sx={{ fontSize: 20 }} /> },
];

const orderNav = [
    { key: "menus", label: "Menus", icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} /> },
    { key: "order", label: "Order", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

/** The product browser for a table — categories, or a drilled-in list. */
export const MobileTables = ({
    drilled = false,
    flat = false,
    drawerOpen = false,
}: {
    drilled?: boolean;
    flat?: boolean;
    drawerOpen?: boolean;
}) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    const [menuSet, setMenuSet] = useState("All");

    if (drilled) {
        return (
            <MobileScreen
                appBar={<MobileAppBar title="Beers" leading="back" showSearch />}
                bottomNav={
                    <>
                        <MobileAttachedCustomer name="Weston Farnsworth" count={2} />
                        <MobileBottomNav items={navItems} active="menus" />
                    </>
                }
            >
                <MobileSearch placeholder="Search Beers" />
                {[
                    { name: "Combo", price: 9.5 },
                    { name: "Stella Artois", price: 10.25 },
                    { name: "Corona", price: 9.0 },
                    { name: "Blue Moon", price: 11.0 },
                    { name: "Sapporo", price: 12.25 },
                    { name: "Heineken", price: 15.75 },
                    { name: "Anchor Steam", price: 22.75 },
                ].map((b) => (
                    <MobileRow key={b.name} title={b.name} price={b.price} image={foodImage(b.name)} onClick={() => {}} />
                ))}
            </MobileScreen>
        );
    }

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Tables" leading="menu" onLeading={() => setDrawer(true)} showSearch />}
            fab={<MobileFab label="Create Order" />}
            bottomNav={
                <>
                    <MobileAttachedCustomer name="Weston Farnsworth" count={2} />
                    <MobileBottomNav items={navItems} active="menus" />
                </>
            }
            overlay={
                drawer ? <MobileNavDrawer active="tables" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} /> : undefined
            }
        >
            <MobileFilterTabs tabs={MENU_SETS} active={menuSet} onChange={setMenuSet} />
            <MobileSearch placeholder="Search Items" />
            {/* Flat rows add straight to the order; chevron rows go somewhere.
                With no room for a second visual convention, the chevron is the
                only thing distinguishing the two. */}
            {(flat ? products : categories).map((c) =>
                flat ? (
                    <MobileRow
                        key={c.name}
                        title={c.name}
                        price={"price" in c ? (c.price as number) : undefined}
                        image={foodImage(c.name)}
                        onClick={() => {}}
                    />
                ) : (
                    <MobileRow key={c.name} title={c.name} image={"image" in c ? (c.image as string) : ""} drills onClick={() => {}} />
                ),
            )}
            <Box sx={{ height: 64 }} />
        </MobileScreen>
    );
};

/**
 * The seated table order.
 *
 * Identical in structure to `6-tabs`' detail — same seat bands, same rows, same
 * per-line kebab — because on the device they are the same screen with a
 * different title. Sharing the components is the point: a second implementation
 * would drift.
 */
export const MobileTableOrder = ({ fired = false }: { fired?: boolean }) => {
    const total = seatedLines.reduce((s, l) => s + l.price, 0);
    const seats = [...new Set(seatedLines.map((l) => l.seat))];
    return (
        <MobileScreen
            appBar={<MobileAppBar title="Table Order" subtitle="Table 55 | Order ID 3846547" leading="close" action="Save" showOverflow />}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary>Re-Fire</MobileSecondary>
                        <MobileSecondary>Add Items</MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Pay ${total.toFixed(2)}</MobilePrimary>
                </MobileActionArea>
            }
            bottomNav={
                <>
                    <MobileAttachedCustomer name="Weston Farnsworth" count={seatedLines.length} />
                    <MobileBottomNav items={orderNav} active="order" />
                </>
            }
        >
            {fired && (
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "center", bgcolor: appColors.green, py: 1 }}>
                    <Typography sx={{ fontSize: 15, color: "#fff" }}>Table Fired!</Typography>
                </Stack>
            )}
            {seats.map((seat) => (
                <Box key={seat}>
                    <MobileSeatBand label={`Seat ${seat}`} color={seatBandColors[(seat - 1) % seatBandColors.length]} />
                    {seatedLines
                        .filter((l) => l.seat === seat)
                        .map((l, i) => (
                            <MobileRow key={`${l.name}-${i}`} title={l.name} price={l.price} image={foodImage(l.name)} overflow />
                        ))}
                </Box>
            ))}
        </MobileScreen>
    );
};
