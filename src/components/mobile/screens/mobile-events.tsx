import { useState } from "react";

import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import GridViewIcon from "@mui/icons-material/GridView";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import { eventRows } from "@/components/screens/operations/events-list";
import { eventCategoryTiles, eventOrderLines } from "@/components/screens/operations/events-order";
import { posImage } from "@/data/pos-inventory";
import { appColors } from "@/theme/app-replica-tokens";
import { storeImage } from "@/utils/asset-url";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileRow, MobileSectionHeading } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobileBottomNav, MobilePrimary, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 15-events.** Laid out against `App Screens → 15-events`.
 *
 * Two screens on tablet, two screens here — but they narrow for opposite
 * reasons. The picker is a table that has to stack; the order screen is the
 * order-panel-beside-content layout that has to split.
 *
 * ## The picker: two centred columns become one left-aligned list
 *
 * `EventsList` draws 46px rows with ID and name each taking `flex: 1` and both
 * **centred** — ~645px per column at the tablet's width, which is why
 * `A Awesome Service Charge Test II (Electric Bugaloo)` (50 characters) fits
 * without truncating.
 *
 * Split 402px the same way and the name gets 201px, or roughly 24 characters,
 * and six of the fifteen events truncate. So the ID drops to the secondary line
 * and the name takes the full width: ~370px after padding, ~44 characters, and
 * only the one 50-character row clips. Centring goes with it — centred text in
 * a narrow column fights its own ellipsis, and a left rag is what a phone list
 * reads down.
 *
 * **The absence of a search field is preserved.** The shipping list is
 * unfiltered, unsorted by date, and mixes a 2026 member-guest with a row
 * literally named `asdf`; operators find events by scrolling. That is a real
 * problem and it is a *worse* problem on a phone, but inventing a filter here
 * would be a product change wearing a layout change's clothes. It is flagged
 * rather than fixed — the same treatment `5-quickorder` gives the defects it
 * inherited.
 *
 * ## The order screen: the third instance of the panel-beside-grid split
 *
 * The tablet screen is the Pro Shop selling surface rebound to an event tab —
 * a 390px order panel holding 8 lines on the left, a 12-tile category grid on
 * the right, the Scan Mode switch above it. Same break as `5-quickorder`, same
 * resolution: **Categories** and **Tab** become two bottom-nav destinations.
 *
 * **The category tiles become rows.** A 96×96 tile plus its label is ~96px
 * wide; four across 402px is technically possible and gives a label column of
 * 88px, in which `Japanese Cuisine` and `Miscellaneous` both wrap to three
 * lines. The row gives each label the full width with the photograph as a 44dp
 * thumbnail, and a `>` because a category drills into its products rather than
 * adding to the tab.
 *
 * **The quantity badge moves off the thumbnail.** On tablet each order line
 * pins a 22×20 dark chip to the corner of a 52×44 product image. At 44dp the
 * thumbnail is smaller than the chip's tablet footprint, so the quantity moves
 * to the row's secondary line as `Qty 11` — legible instead of decorative.
 *
 * **BACK / ADD PAYMENT becomes one primary.** Back is the app bar's job, and
 * ADD PAYMENT — the only one of the two that commits anything — takes the full
 * width. It stays `ADD PAYMENT` rather than `PAY`, because an event tab is
 * settled in instalments, and it deliberately carries **no amount** even though
 * `MobilePrimary` can hold one: the tablet screen shows no running total for
 * the tab, and putting one on the button would be inventing a figure.
 */

const navItems = [
    { key: "categories", label: "Categories", icon: <GridViewIcon sx={{ fontSize: 20 }} /> },
    { key: "tab", label: "Tab", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

/* ------------------------------------------------------------- the picker */

export const MobileEventsList = ({ drawerOpen = false }: { drawerOpen?: boolean }) => {
    const [drawer, setDrawer] = useState(drawerOpen);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Events" leading="menu" onLeading={() => setDrawer(true)} showOverflow />}
            overlay={
                drawer ? <MobileNavDrawer active="events" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} /> : undefined
            }
        >
            {eventRows.map((row) => (
                <MobileRow key={row.id} title={row.name} subtitle={`ID ${row.id}`} drills onClick={() => {}} />
            ))}
        </MobileScreen>
    );
};

/* -------------------------------------------------------- the order screen */

type EventTab = "categories" | "tab";

export interface MobileEventOrderProps {
    /** Which bottom-nav destination is showing. */
    tab?: EventTab;
    /** Scan Mode, which on tablet is a switch floating above the grid. */
    scanMode?: boolean;
}

/** `"$535.92"` → `535.92`, so `MobileRow` can set it in its own price slot. */
const amount = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

export const MobileEventOrder = ({ tab: tab0 = "categories", scanMode = false }: MobileEventOrderProps) => {
    const [tab, setTab] = useState<EventTab>(tab0);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="1 Trevor Event Test" subtitle="Event 7379" leading="back" showOverflow />}
            actions={
                <MobileActionArea>
                    <MobilePrimary icon={<AddIcon sx={{ fontSize: 20 }} />}>Add Payment</MobilePrimary>
                </MobileActionArea>
            }
            bottomNav={<MobileBottomNav items={navItems} active={tab} onChange={(k) => setTab(k as EventTab)} />}
        >
            {tab === "categories" ? (
                <>
                    {/* Scan Mode was floated above the grid's top-right corner.
                        There is no corner to float into at 402px, so it becomes
                        the first row of the list — still above the categories,
                        still the first thing read. */}
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: "center",
                            px: 1.5,
                            minHeight: 52,
                            bgcolor: appColors.surface,
                            borderBottom: `1px solid ${appColors.divider}`,
                        }}
                    >
                        <Typography sx={{ flex: 1, fontSize: 16 }}>Scan Mode</Typography>
                        <Switch defaultChecked={scanMode} />
                    </Stack>
                    {eventCategoryTiles.map((tile) => (
                        <MobileRow
                            key={tile.label}
                            title={tile.label}
                            image={tile.image ? storeImage(tile.image) : (posImage(tile.label) ?? "")}
                            drills
                            onClick={() => {}}
                        />
                    ))}
                </>
            ) : (
                <>
                    <MobileSectionHeading>Event tab</MobileSectionHeading>
                    {eventOrderLines.map((line) => (
                        <MobileRow
                            key={line.id}
                            title={line.name}
                            subtitle={`Qty ${line.qty}`}
                            price={amount(line.price)}
                            image={posImage(line.name) ?? ""}
                            overflow
                        />
                    ))}
                </>
            )}
        </MobileScreen>
    );
};
