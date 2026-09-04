import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";

import { posCategories } from "@/data/pos-inventory";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileAttachedCustomer, MobileEmpty, MobileRow, MobileSearch, MobileSectionHeading, MobileTotals } from "../mobile-parts";
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
 * **Mobile Screens — 1-proshop.** From `references/090426/`, laid out against
 * `App Screens → 1-proshop`.
 *
 * The golf-merchandise register. On tablet: a 390px order panel, a 24-tile
 * category grid, and a five-button action bar.
 *
 * ## What changed
 *
 * **The 24-tile grid becomes a 24-row list.** Six across on the tablet becomes
 * two across here, which turns a one-screen browse into four screens of
 * scrolling and shrinks each label to the point of wrapping. As a list it is
 * still one scroll, the photograph survives as a thumbnail, and every category
 * name gets its full width.
 *
 * **Scan Mode keeps its own row.** It is the one control that changes what the
 * whole screen does — barcode input routes straight to the order instead of the
 * grid — so it stays visible above the list rather than moving into the
 * overflow. Same switch, same slate track: the app never overrode
 * `colorAccent`, and that is transcribed rather than corrected.
 *
 * **POP does not move into the overflow.** On tablet it is a red button in the
 * action bar; here it is the first row of the overflow sheet, still red. It
 * opens the cash drawer and touches nothing else, which is exactly the kind of
 * action that should cost a deliberate second tap on a device you can drop.
 */

/**
 * Real categories, from `@/data/pos-inventory`.
 *
 * The tablet grid prints 24 labels and had photography for six of them — the
 * rest drew an empty tile, because the labels were a hardcoded list and the
 * photographs were hand-picked one at a time. These come from the catalogue, so
 * every category on screen has a picture behind it and an item count that is
 * true.
 */
const categories = posCategories;

/** Two real products on the order, priced from the catalogue. */
const orderLines = posCategories
    .flatMap((c) => c.items)
    .filter((i) => !i.isSynthetic && i.image)
    .slice(0, 2);

type Tab = "shop" | "order";

const navItems = [
    { key: "shop", label: "Shop", icon: <StorefrontIcon sx={{ fontSize: 20 }} /> },
    { key: "order", label: "Order", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

export interface MobileProShopProps {
    tab?: Tab;
    withOrder?: boolean;
    scanMode?: boolean;
    sheet?: null | "overflow" | "line";
    drawerOpen?: boolean;
}

export const MobileProShop = ({
    tab: tab0 = "shop",
    withOrder = false,
    scanMode = false,
    sheet: sheet0 = null,
    drawerOpen = false,
}: MobileProShopProps) => {
    const [tab, setTab] = useState<Tab>(tab0);
    const [sheet, setSheet] = useState(sheet0);
    const [drawer, setDrawer] = useState(drawerOpen);

    const lines = withOrder ? orderLines : [];
    const subtotal = lines.reduce((s, l) => s + l.price, 0);
    const tax = +(subtotal * 0.06).toFixed(2);

    const overlay = drawer ? (
        <MobileNavDrawer active="proshop" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
    ) : sheet === "overflow" ? (
        <MobileBottomSheet
            onDismiss={() => setSheet(null)}
            items={[
                {
                    label: "POP — open cash drawer",
                    icon: <CancelOutlinedIcon sx={{ fontSize: 20 }} />,
                    destructive: true,
                    onClick: () => setSheet(null),
                },
                { label: "Player Search", icon: <PersonSearchIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                { label: "Print Receipt", icon: <PrintOutlinedIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
            ]}
        />
    ) : sheet === "line" ? (
        <MobileBottomSheet
            onDismiss={() => setSheet(null)}
            items={[
                { label: "Edit", icon: <EditOutlinedIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                { label: "Discount", icon: <LocalOfferOutlinedIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(null) },
                { label: "Delete", icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />, destructive: true, onClick: () => setSheet(null) },
            ]}
        />
    ) : undefined;

    return (
        <MobileScreen
            appBar={
                <MobileAppBar
                    title="Pro Shop Order"
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
                            <MobileSecondary>Discount</MobileSecondary>
                        </MobileSecondaryRow>
                        <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Pay ${(subtotal + tax).toFixed(2)}</MobilePrimary>
                    </MobileActionArea>
                ) : undefined
            }
            bottomNav={
                <>
                    <MobileAttachedCustomer name="Weston Farnsworth" count={lines.length || undefined} />
                    <MobileBottomNav items={navItems} active={tab} onChange={(k) => setTab(k as Tab)} />
                </>
            }
            overlay={overlay}
        >
            {tab === "shop" ? (
                <>
                    {/* Kept above the list rather than in the overflow: it changes
                        what every subsequent tap means. */}
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: "center",
                            px: 1.5,
                            py: 0.5,
                            bgcolor: appColors.surface,
                            borderBottom: `1px solid ${appColors.divider}`,
                        }}
                    >
                        <Typography sx={{ fontSize: 15, flex: 1 }}>Scan Mode</Typography>
                        <Switch
                            checked={scanMode}
                            readOnly
                            slotProps={{ input: { "aria-label": "Scan Mode" } }}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: appColors.slate },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: appColors.slate },
                            }}
                        />
                    </Stack>
                    {scanMode ? (
                        <MobileEmpty message="Scan Mode is on. Barcode input goes straight to the order — the category list is off until it is switched back." />
                    ) : (
                        <>
                            <MobileSearch placeholder="Search categories" />
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
                        </>
                    )}
                </>
            ) : lines.length === 0 ? (
                <MobileEmpty message="No items in order." />
            ) : (
                <>
                    <MobileSectionHeading>Order</MobileSectionHeading>
                    {lines.map((l) => (
                        <MobileRow
                            key={l.id}
                            title={l.name}
                            subtitle={l.description}
                            price={l.price}
                            image={l.image ?? ""}
                            overflow
                            onOverflow={() => setSheet("line")}
                        />
                    ))}
                    <Box sx={{ flex: 1 }} />
                    <MobileTotals
                        rows={[
                            { label: "SubTotal", value: subtotal },
                            { label: "Taxes", value: tax },
                            { label: "Total Payments", value: 0, green: true },
                        ]}
                        owed={subtotal + tax}
                    />
                </>
            )}
        </MobileScreen>
    );
};
