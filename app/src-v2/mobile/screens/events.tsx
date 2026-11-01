import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GridViewIcon from "@mui/icons-material/GridView";
import RemoveIcon from "@mui/icons-material/Remove";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useNavigate, useParams } from "react-router-dom";

import { eventRows } from "@/components/screens/operations/events-list";
import { eventOrderLines } from "@/components/screens/operations/events-order";
import { MobileRow, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomNav, MobileBottomSheet, MobilePrimary } from "@/components/mobile/mobile-shell";
import { posCategories, posImage } from "@/data/pos-inventory";
import { appColors } from "@/theme/app-replica-tokens";
import { money, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Events, on a phone — the picker and the event's order screen.
 *
 * Two screens on the terminal, two here, narrowing for opposite reasons: the
 * picker is a table that has to stack, the order screen is the
 * panel-beside-grid layout that has to split.
 *
 * ## The picker: two centred columns become one left-aligned list
 *
 * `EventsListRow` is a 46px row with ID and name each `flex: 1` and both
 * **centred** — ~645px per column on the counter, which is why
 * `A Awesome Service Charge Test II (Electric Bugaloo)` (50 characters) fits.
 * Split 402px the same way and the name gets 201px, about 24 characters, and
 * six of the fifteen events truncate.
 *
 * So the ID drops to the secondary line and the name takes the full width —
 * ~370px after padding, ~44 characters, and only that one 50-character row
 * clips. Centring goes with it: centred text in a narrow column fights its own
 * ellipsis.
 *
 * **The absence of a search field is preserved.** The shipping list is
 * unfiltered, unsorted by date, and mixes a 2026 member-guest with a row
 * literally named `asdf`; operators find events by scrolling. That is a real
 * problem and a worse one on a phone, but inventing a filter here would be a
 * product change wearing a layout change's clothes.
 *
 * ## The order screen: the panel-beside-grid split, for the third time
 *
 * The terminal is the Pro Shop selling surface rebound to an event: a 390px
 * ledger on the left, a 12-tile category grid on the right, Scan Mode floating
 * above it. Same break as the selling screens, same resolution — **Categories**
 * and **Tab** become two bottom-nav destinations.
 *
 * **The 12 event tiles become the POS catalogue.** `eventCategoryTiles` is
 * faithful to the screenshot, but six of its labels — Rental Clubs, Japanese
 * Cuisine, Punch Cards, Memberships, Liquor, Events — resolve to no products at
 * all. On the terminal an empty category is one dead tile among twelve; here it
 * is a full-width row that drills into nothing. So the categories come from
 * `posCategories`, which carries real photography and real prices, and every
 * row leads somewhere.
 *
 * **The tiles become rows.** A 96×96 tile plus its label is ~96px wide; four
 * across 402px gives an 88px label column, in which `Japanese Cuisine` and
 * `Miscellaneous` both wrap to three lines. The row gives the label its full
 * width with the photograph as a 44dp thumbnail, and a `>` because a category
 * drills rather than adds.
 *
 * **Scan Mode is given a meaning.** It floats above the grid's top-right corner
 * on the terminal, doing nothing that the screenshot can show. There is no
 * corner to float into at 402px, so it becomes the first row of the list — and
 * it switches what a category row does: on, tapping the row charges that
 * category's first product straight to the tab, the way a barcode would. Off,
 * it drills. Documented as an interpretation, not a transcription.
 *
 * **The quantity badge moves off the thumbnail.** The terminal pins a 22×20
 * dark chip to the corner of a 52×44 image. At 44dp the thumbnail is smaller
 * than that chip's tablet footprint, so quantity moves to the secondary line as
 * `Qty 11` — legible instead of decorative.
 *
 * **BACK / ADD PAYMENT becomes one primary, and it now carries an amount.**
 * Back is the app bar's job. The Storybook mobile version deliberately shows no
 * figure on ADD PAYMENT because the terminal shows no running total for the
 * tab, and inventing one would be worse than omitting it. Here the figure is
 * not invented: what you add in this session is real cart state, so the button
 * carries `money(total)` and is dead when the cart is empty.
 *
 * ## What is live
 *
 * Every add is `addItem(..., "Tab")` — the store's own action, on a real
 * ticket, at the store's own tax. ADD PAYMENT routes to `/pay`, which settles
 * that ticket through the same reducer the counter uses. The eight fixture
 * ledger lines stay below as what was already charged to the event; they are
 * marked as such rather than blended, because nothing in the store put them
 * there.
 */

type EventTab = "categories" | "tab";

const navFor = (count: number) => [
    { key: "categories", label: "Categories", icon: <GridViewIcon sx={{ fontSize: 20 }} /> },
    { key: "tab", label: count > 0 ? `Tab · ${count}` : "Tab", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

/** `"$535.92"` → `535.92`, so a fixture line can use `MobileRow`'s price slot. */
const amount = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

/* ------------------------------------------------------------- the picker */

export const MobileEventsScreen = () => {
    const navigate = useNavigate();

    return (
        <MobileShell title="Events" active="events" showOverflow={false}>
            {eventRows.map((row) => (
                <MobileRow key={row.id} title={row.name} subtitle={`ID ${row.id}`} drills onClick={() => navigate(`/events/${row.id}`)} />
            ))}
            <Box sx={{ height: 8 }} />
        </MobileShell>
    );
};

/* -------------------------------------------------------- the order screen */

export const MobileEventDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { lines, total } = useStore();
    const { addItem, changeQty, removeLine, toast } = useActions();

    const [tab, setTab] = useState<EventTab>("categories");
    const [drilled, setDrilled] = useState<string | null>(null);
    const [scanMode, setScanMode] = useState(false);
    const [lineSheet, setLineSheet] = useState<string | null>(null);

    const event = eventRows.find((r) => r.id === id);
    // The drill only owns the app bar while the Categories destination is
    // showing — switching to Tab must not leave a category name over the tab.
    const category = tab === "categories" && drilled ? (posCategories.find((c) => c.label === drilled) ?? null) : null;
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const sheetLine = lines.find((l) => l.id === lineSheet);

    // Charged to the event before this session — the terminal's own ledger.
    const charged = eventOrderLines.reduce((s, l) => s + amount(l.price), 0);

    const add = (item: { id: string; name: string; price: number; image?: string }) => {
        addItem(item, "Tab");
        toast(`${item.name} charged to the event`);
    };

    return (
        <MobileShell
            title={category ? category.label : (event?.name ?? "Event")}
            subtitle={category ? undefined : `Event ${event?.id ?? id}`}
            active="events"
            leading="back"
            onLeading={category ? () => setDrilled(null) : () => navigate("/events")}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary icon={<AddIcon sx={{ fontSize: 20 }} />} disabled={lines.length === 0} onClick={() => navigate("/pay")}>
                        {lines.length > 0 ? `Add payment ${money(total)}` : "Add payment"}
                    </MobilePrimary>
                </MobileActionArea>
            }
            bottomNav={<MobileBottomNav items={navFor(count)} active={tab} onChange={(k) => setTab(k as EventTab)} />}
            overlay={
                sheetLine ? (
                    <MobileBottomSheet
                        onDismiss={() => setLineSheet(null)}
                        items={[
                            {
                                label: "Add one",
                                icon: <AddIcon sx={{ fontSize: 20 }} />,
                                onClick: () => changeQty(sheetLine.id, 1, sheetLine.seat),
                            },
                            {
                                label: "Remove one",
                                icon: <RemoveIcon sx={{ fontSize: 20 }} />,
                                onClick: () => changeQty(sheetLine.id, -1, sheetLine.seat),
                            },
                            {
                                label: "Take off the tab",
                                icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,
                                destructive: true,
                                onClick: () => {
                                    removeLine(sheetLine.id, sheetLine.seat);
                                    setLineSheet(null);
                                },
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            {tab === "categories" ? (
                <>
                    {!category && (
                        // Scan Mode was floated above the grid's top-right corner;
                        // there is no corner at 402px, so it becomes the first row
                        // — still above the categories, still read first.
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
                            <Stack sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 16 }}>Scan Mode</Typography>
                                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                    {scanMode ? "A category charges its first item" : "A category opens its products"}
                                </Typography>
                            </Stack>
                            <Switch
                                checked={scanMode}
                                onChange={(e) => setScanMode(e.target.checked)}
                                slotProps={{ input: { "aria-label": "Scan Mode" } }}
                            />
                        </Stack>
                    )}

                    {category
                        ? category.items.map((item) => (
                              <MobileRow
                                  key={item.id}
                                  title={item.name}
                                  price={item.price}
                                  image={item.image ?? ""}
                                  onClick={() => add(item)}
                              />
                          ))
                        : posCategories.map((c) => (
                              <MobileRow
                                  key={c.label}
                                  title={c.label}
                                  subtitle={`${c.items.length} ${c.items.length === 1 ? "item" : "items"}`}
                                  image={c.image ?? posImage(c.label) ?? ""}
                                  drills={!scanMode}
                                  onClick={() => {
                                      if (!scanMode) return setDrilled(c.label);
                                      const first = c.items[0];
                                      if (first) add(first);
                                  }}
                              />
                          ))}
                    <Box sx={{ height: 8 }} />
                </>
            ) : (
                <>
                    <MobileSectionHeading>{count > 0 ? `Adding now · ${money(total)}` : "Nothing added yet"}</MobileSectionHeading>
                    {lines.map((line) => (
                        <MobileRow
                            key={`${line.id}-${line.seat ?? "x"}`}
                            title={line.name}
                            subtitle={`Qty ${line.qty} · ${money(line.unitPrice)} each`}
                            price={line.qty * line.unitPrice}
                            image={line.image ?? ""}
                            overflow
                            onOverflow={() => setLineSheet(line.id)}
                        />
                    ))}

                    {/* The terminal's own ledger. Below, and labelled, because
                        the store did not put these here and cannot change them. */}
                    <MobileSectionHeading>Already charged · {money(charged)}</MobileSectionHeading>
                    {eventOrderLines.map((line) => (
                        <MobileRow
                            key={line.id}
                            title={line.name}
                            subtitle={`Qty ${line.qty}`}
                            price={amount(line.price)}
                            image={posImage(line.name) ?? ""}
                        />
                    ))}
                    <Box sx={{ height: 8 }} />
                </>
            )}
        </MobileShell>
    );
};
