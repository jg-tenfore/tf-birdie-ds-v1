import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CategoryIcon from "@mui/icons-material/Category";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { useNavigate, useParams } from "react-router-dom";

import {
    MobileActionArea,
    MobileBottomNav,
    MobileBottomSheet,
    MobilePrimary,
    MobileSecondary,
    MobileSecondaryRow,
    type MobileSheetItem,
} from "@/components/mobile/mobile-shell";
import {
    MobileEmpty,
    MobileFab,
    MobileFilterTabs,
    MobileRow,
    MobileSearch,
    MobileSeatBand,
    MobileSectionHeading,
} from "@/components/mobile/mobile-parts";
import { foodByCategory, type FoodCategory } from "@/data/food-catalog";
import { modifierGroups, modifierLine, modifierSurcharge } from "@/data/modifiers";
import { appColors } from "@/theme/app-replica-tokens";
import { storeImage } from "@/utils/asset-url";
import { lineTotal, money, subtotalOf, taxOf, totalOf, useActions, useStore, type Line, type Ticket } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Tabs and the seat editor, on a phone.
 *
 * The terminal's pair (`app/src/screens/tabs.tsx`) is a 1290px table over a
 * five-button action bar, and a detail screen that shows the **seat column and
 * the menu grid side by side** — a 390px order panel on the left, an
 * `auto-fill minmax(150px, 1fr)` tile grid filling the rest. Neither survives
 * 402px, and they break for different reasons.
 *
 * ## The listing: four columns become two lines
 *
 * The terminal row is 118px tall and splits its identity across the width — the
 * tab name at 25px hard left, then a 260px block of server / order id / opened,
 * then a 120px amount hard right. At 402 that is 402 minus 62 of avatar minus
 * 120 of amount = 220px for a name and three metadata lines.
 *
 * So the row stacks, exactly as the Storybook `mobile-tabs` listing does: name
 * on top, **the whole metadata block joined into one 13px secondary line**,
 * amount still hard right. Nothing is dropped — the reading order turns from
 * left-to-right into top-to-bottom.
 *
 * ## The detail: the seat column becomes a destination, and the selector moves
 *
 * On the terminal the seat bands are permanently on screen, so tapping one both
 * *shows* a seat and *targets* it — one control, two jobs. Here the order and
 * the menu are two bottom-nav destinations, which means that while you are
 * browsing the menu the seat bands are not on screen at all.
 *
 * A hidden target is a wrong plate. So the target seat moves into the menu view
 * as its own 44dp `MobileFilterTabs` row — `Seat 1 · Seat 2 · Seat 3 · Seat 4` —
 * and the Order tab's bands go back to being purely a grouping, which is what
 * the Storybook version draws them as.
 *
 * That costs a second 44dp strip on the Menus tab. It is paid for by hiding the
 * menu-set strip once a category is drilled into, which is what the terminal
 * does too (`{!drilled && …}` there), so the deepest level shows one strip and
 * not two.
 *
 * ## The line kebab becomes a bottom sheet
 *
 * Same six entries in the same order — Fire, Move, Split, Edit, Discount,
 * Delete — because they are the same six actions on the same reducer. An
 * anchored 300px menu at this width would cover the line it acts on, so it
 * comes up from the bottom where the thumb already is. Delete keeps the app's
 * red rather than being greyed or moved.
 *
 * ## Five action buttons become one primary
 *
 * `DONE / COMBOS / OPEN FOOD / SAVE CHANGES / PAY` at 402px is 78px a button.
 * PAY takes the full width because it is the only one that commits money; SAVE
 * and ADD ITEMS take the secondary row; COMBOS and OPEN FOOD move into the
 * overflow sheet, alongside attaching a customer.
 */

/* ------------------------------------------------------------------ list */

export const MobileTabsScreen = () => {
    const { heldTickets } = useStore();
    const { openTicket, popDrawer } = useActions();
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [sheet, setSheet] = useState(false);

    const q = query.trim().toLowerCase();
    const rows = heldTickets.filter((t) => t.name.toLowerCase().includes(q) || t.server.toLowerCase().includes(q));

    return (
        <MobileShell
            title="Tabs"
            active="tabs"
            onOverflow={() => setSheet(true)}
            fab={<MobileFab label="Create a Tab" onClick={() => navigate("/proshop")} />}
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            {
                                label: "POP — open cash drawer",
                                icon: <PointOfSaleIcon sx={{ fontSize: 20 }} />,
                                destructive: true,
                                onClick: () => {
                                    popDrawer();
                                    setSheet(false);
                                },
                            },
                            {
                                label: "Tables",
                                icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} />,
                                onClick: () => navigate("/tables"),
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            <MobileSearch placeholder="Filter by customer or employee" value={query} onChange={setQuery} />

            {rows.length === 0 ? (
                <MobileEmpty message={q ? `No open tab matches “${query.trim()}”.` : "No open tabs. Hold a ticket and it lands here."} />
            ) : (
                rows.map((t) => (
                    <MobileRow
                        key={t.id}
                        title={t.name}
                        // The terminal's 260px metadata column, joined.
                        subtitle={[
                            t.server,
                            `${t.number.replace("#", "")} · ${t.opened}`,
                            t.source === "Table" ? `${t.seats ?? 4} guests` : null,
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                        trailing={money(totalOf(t.lines))}
                        onClick={() => {
                            openTicket(t.id);
                            navigate(`/tabs/${t.id}`);
                        }}
                    />
                ))
            )}

            {/* Clearance so the last row is never under the floating pill. */}
            <Box sx={{ height: 64 }} />
        </MobileShell>
    );
};

/* ---------------------------------------------------------------- detail */

/** The menu sets the terminal groups this screen by, unchanged. */
const TAB_MENU_SETS: Record<string, FoodCategory[]> = {
    All: ["Sandwiches", "Hamburgers", "Grill", "Beer", "Wine", "Beverages", "Snacks", "Combos"],
    "19th Hole Menu": ["Beer", "Wine", "Beverages"],
};

/** Everything under the name on an order line, on one 13px run. */
const lineSubtitle = (line: Line) =>
    [
        line.modifiers?.length ? modifierLine(line.modifiers) : null,
        line.note,
        line.fired ? "FIRED" : null,
        line.discountPct ? `${line.discountPct}% off` : null,
    ]
        .filter(Boolean)
        .join(" · ");

/**
 * The line editor, as a full screen.
 *
 * `tab-item-detail.tsx` lays this out at 34px type across a content pane: a
 * 118px photo beside the name, a 220px stepper and the running total in the
 * top-right, then modifier options in a **5-column grid**. Five columns at
 * 402px is 80px a cell, which cannot hold `MEDIUM WELL`, so the options become
 * one column of 52dp rows — the same control at a size a thumb can hit.
 *
 * The group strip already scrolled horizontally on the terminal, so it needed
 * no adaptation; it is `MobileFilterTabs` here for the same reason it was a
 * scrolling strip there.
 *
 * The mismatch the terminal documents is kept: the options look like radios and
 * behave like checkboxes. That is the device's behaviour and hiding it here
 * would hide the finding.
 */
const LineEditor = ({
    line,
    onQty,
    onNote,
    onModifiers,
}: {
    line: Line;
    onQty: (qty: number) => void;
    onNote: (note: string) => void;
    onModifiers: (names: string[]) => void;
}) => {
    const [group, setGroup] = useState(modifierGroups[1].name);
    const selected = line.modifiers ?? [];
    const active = modifierGroups.find((g) => g.name === group) ?? modifierGroups[0];
    const total = line.qty * (line.unitPrice + modifierSurcharge(selected));

    return (
        <>
            <Stack direction="row" sx={{ p: 1.5, gap: 1.5, alignItems: "center", bgcolor: appColors.surface }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                        bgcolor: appColors.canvasAlt,
                        backgroundImage: line.image ? `url(${line.image})` : undefined,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                    }}
                />
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 17 }}>{line.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{money(line.unitPrice)} each</Typography>
                </Stack>
                <Typography sx={{ fontSize: 20, color: appColors.green }}>{money(total)}</Typography>
            </Stack>

            <Stack direction="row" sx={{ mx: 1.5, my: 1.5, border: `1px solid ${appColors.textPrimary}`, alignItems: "center" }}>
                <ButtonBase
                    aria-label="Decrease quantity"
                    onClick={() => onQty(line.qty - 1)}
                    sx={{ flex: 1, minHeight: 52, fontSize: 24 }}
                >
                    −
                </ButtonBase>
                <Typography sx={{ flex: 1, textAlign: "center", fontSize: 20 }}>{line.qty}</Typography>
                <ButtonBase
                    aria-label="Increase quantity"
                    onClick={() => onQty(line.qty + 1)}
                    sx={{ flex: 1, minHeight: 52, fontSize: 24, color: appColors.green }}
                >
                    +
                </ButtonBase>
            </Stack>

            <Box sx={{ mx: 1.5, mb: 1.5, bgcolor: appColors.fieldFill, px: 1.5, py: 1 }}>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Enter Additional Notes…</Typography>
                <Box
                    component="input"
                    value={line.note ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNote(e.target.value)}
                    aria-label="Additional notes"
                    sx={{
                        width: "100%",
                        minHeight: 40,
                        border: "none",
                        outline: "none",
                        bgcolor: "transparent",
                        fontFamily: "inherit",
                        fontSize: 16,
                        color: appColors.textPrimary,
                    }}
                />
            </Box>

            <MobileFilterTabs tabs={modifierGroups.map((g) => g.name)} active={group} onChange={setGroup} />

            {active.options.map((option) => {
                const on = selected.includes(option.name);
                return (
                    <MobileRow
                        key={option.name}
                        title={option.name}
                        subtitle={on ? "Selected" : undefined}
                        trailing={option.price ? `+${money(option.price)}` : undefined}
                        accent={on ? appColors.green : undefined}
                        image={undefined}
                        dense
                        onClick={() => onModifiers(on ? selected.filter((n) => n !== option.name) : [...selected, option.name])}
                    />
                );
            })}
            <Box sx={{ height: 16 }} />
        </>
    );
};

const navItems = [
    { key: "menus", label: "Menus", icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} /> },
    { key: "order", label: "Order", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

export const MobileTabDetailScreen = () => {
    const { id = "" } = useParams();
    const { state } = useStore();
    const {
        addItem,
        openTicket,
        holdTicket,
        removeLine,
        setLineQty,
        setLineNote,
        setLineModifiers,
        fireLine,
        moveLine,
        splitLine,
        discountLine,
    } = useActions();
    const navigate = useNavigate();

    /**
     * `/tabs/active` resolves to whatever the store just opened.
     *
     * The tables roster navigates here straight after dispatching `openTable`
     * and cannot know the new ticket's id without racing the reducer, so the
     * route asks for "the open one" instead — the same contract the terminal's
     * floor plan uses.
     */
    const ticket: Ticket | undefined =
        id === "active" ? state.tickets.find((t) => t.id === state.activeTicketId) : state.tickets.find((t) => t.id === id);

    /**
     * A tab reached by URL has to become the active ticket.
     *
     * `addItem`, `removeLine` and `changeQty` all write to `activeTicketId`, so
     * a deep link that skipped the listing would render a check that silently
     * refuses every edit. On the terminal the listing always dispatches
     * `openTicket` first; a phone gets hash URLs shared around, so it cannot
     * assume that.
     */
    useEffect(() => {
        if (ticket && ticket.id !== state.activeTicketId) openTicket(ticket.id);
    }, [ticket, state.activeTicketId, openTicket]);

    const [tab, setTab] = useState<"menus" | "order">("order");
    const [activeSeat, setActiveSeat] = useState(1);
    const [menuSet, setMenuSet] = useState("All");
    const [drilled, setDrilled] = useState<FoodCategory | null>(null);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<Line | null>(null);
    const [kebabFor, setKebabFor] = useState<Line | null>(null);
    const [seatPickerFor, setSeatPickerFor] = useState<{ line: Line; mode: "move" | "split" } | null>(null);
    const [discountFor, setDiscountFor] = useState<Line | null>(null);
    const [overflow, setOverflow] = useState(false);

    if (!ticket) {
        return (
            <MobileShell title="Tab" active="tabs" leading="back">
                <MobileEmpty message="That tab is no longer open." />
                <Box sx={{ p: 1.5 }}>
                    <MobilePrimary onClick={() => navigate("/tabs")}>Back to tabs</MobilePrimary>
                </Box>
            </MobileShell>
        );
    }

    const lines = ticket.lines;
    const seats = ticket.seats ?? 4;
    const seatList = Array.from({ length: seats }, (_, i) => i + 1);
    const fromTable = ticket.source === "Table";
    const total = totalOf(lines);

    const q = query.trim().toLowerCase();
    const searched =
        q.length >= 2
            ? (TAB_MENU_SETS[menuSet] ?? []).flatMap((c) => foodByCategory(c)).filter((i) => i.name.toLowerCase().includes(q))
            : null;

    const add = (item: { id: string; name: string; price: number; path: string }) => {
        const image = storeImage(item.path);
        addItem({ id: item.id, name: item.name, price: item.price, image }, "Table", activeSeat);
        // Adding opens the item straight away, as the terminal does: a plate
        // that needs a temperature needs it before it reaches the kitchen.
        setEditing({ id: item.id, name: item.name, qty: 1, unitPrice: item.price, image, seat: activeSeat });
    };

    /** The six kebab entries, in the terminal's order. */
    const kebabItems: MobileSheetItem[] = kebabFor
        ? [
              {
                  label: "Fire",
                  icon: <LocalFireDepartmentIcon sx={{ fontSize: 20 }} />,
                  onClick: () => {
                      fireLine(kebabFor.id, kebabFor.seat);
                      setKebabFor(null);
                  },
              },
              {
                  label: "Move",
                  icon: <OpenWithIcon sx={{ fontSize: 20 }} />,
                  onClick: () => {
                      setSeatPickerFor({ line: kebabFor, mode: "move" });
                      setKebabFor(null);
                  },
              },
              {
                  label: "Split",
                  icon: <CallSplitIcon sx={{ fontSize: 20 }} />,
                  onClick: () => {
                      setSeatPickerFor({ line: kebabFor, mode: "split" });
                      setKebabFor(null);
                  },
              },
              {
                  label: "Edit",
                  icon: <EditOutlinedIcon sx={{ fontSize: 20 }} />,
                  onClick: () => {
                      setEditing(kebabFor);
                      setKebabFor(null);
                  },
              },
              {
                  label: "Discount",
                  icon: <LocalOfferOutlinedIcon sx={{ fontSize: 20 }} />,
                  onClick: () => {
                      setDiscountFor(kebabFor);
                      setKebabFor(null);
                  },
              },
              {
                  label: "Delete",
                  icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,
                  destructive: true,
                  onClick: () => {
                      removeLine(kebabFor.id, kebabFor.seat);
                      setKebabFor(null);
                  },
              },
          ]
        : [];

    /* --------------------------------------------------------- overlays */

    const sheet = kebabFor ? (
        <MobileBottomSheet onDismiss={() => setKebabFor(null)} items={kebabItems} />
    ) : seatPickerFor ? (
        <MobileBottomSheet
            onDismiss={() => setSeatPickerFor(null)}
            items={seatList
                .filter((seat) => seat !== seatPickerFor.line.seat)
                .map((seat) => ({
                    label: `${seatPickerFor.mode === "split" ? "Split one to" : "Move to"} seat ${seat}`,
                    icon: <Box sx={{ width: 16, height: 16, bgcolor: appColors.seat[(seat - 1) % appColors.seat.length] }} />,
                    onClick: () => {
                        const { line, mode } = seatPickerFor;
                        if (mode === "move") moveLine(line.id, seat, line.seat);
                        else splitLine(line.id, seat, line.seat);
                        setSeatPickerFor(null);
                    },
                }))}
        />
    ) : discountFor ? (
        <MobileBottomSheet
            onDismiss={() => setDiscountFor(null)}
            // Fixed percentages, not free entry — the terminal's list exactly.
            items={[10, 20, 25, 50, 100, 0].map((pct) => ({
                label: pct ? `${pct}% off` : "Remove discount",
                destructive: pct === 100,
                onClick: () => {
                    discountLine(discountFor.id, pct, discountFor.seat);
                    setDiscountFor(null);
                },
            }))}
        />
    ) : overflow ? (
        <MobileBottomSheet
            onDismiss={() => setOverflow(false)}
            items={[
                { label: "Combos", icon: <CategoryIcon sx={{ fontSize: 20 }} />, onClick: () => navigate("/combos") },
                { label: "Open Food", icon: <RestaurantMenuIcon sx={{ fontSize: 20 }} />, onClick: () => navigate("/quickorder") },
                {
                    label: "Attach a customer",
                    icon: <PersonAddAltOutlinedIcon sx={{ fontSize: 20 }} />,
                    onClick: () => navigate("/customersearch"),
                },
            ]}
        />
    ) : undefined;

    /* ------------------------------------------------------ line editor */

    if (editing) {
        return (
            <MobileShell
                title={editing.name}
                subtitle={`Seat ${editing.seat ?? activeSeat} · Order ID ${ticket.number.replace("#", "")}`}
                active="tabs"
                leading="back"
                onLeading={() => setEditing(null)}
                showOverflow={false}
                actions={
                    <MobileActionArea>
                        <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />} onClick={() => setEditing(null)}>
                            Save item
                        </MobilePrimary>
                    </MobileActionArea>
                }
            >
                <LineEditor
                    line={editing}
                    onQty={(qty) => {
                        setLineQty(editing.id, qty, editing.seat);
                        setEditing({ ...editing, qty: Math.max(1, qty) });
                    }}
                    onNote={(note) => {
                        setLineNote(editing.id, note, editing.seat);
                        setEditing({ ...editing, note });
                    }}
                    onModifiers={(names) => {
                        setLineModifiers(editing.id, names, editing.seat);
                        setEditing({ ...editing, modifiers: names });
                    }}
                />
            </MobileShell>
        );
    }

    /* ------------------------------------------------------------ screen */

    return (
        <MobileShell
            title={fromTable ? `Table ${ticket.name}` : ticket.name}
            subtitle={`Order ID ${ticket.number.replace("#", "")} · ${ticket.server}`}
            active="tabs"
            leading={drilled ? "back" : "close"}
            onLeading={drilled ? () => setDrilled(null) : () => navigate(fromTable ? "/tables" : "/tabs")}
            onOverflow={() => setOverflow(true)}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary
                            onClick={() => {
                                holdTicket();
                                navigate(fromTable ? "/tables" : "/tabs");
                            }}
                        >
                            Save
                        </MobileSecondary>
                        <MobileSecondary onClick={() => setTab(tab === "order" ? "menus" : "order")}>
                            {tab === "order" ? "Add items" : "View order"}
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary
                        disabled={lines.length === 0}
                        icon={<CheckIcon sx={{ fontSize: 20 }} />}
                        onClick={() => navigate("/pay")}
                    >
                        {lines.length ? `Pay ${money(total)}` : "Pay"}
                    </MobilePrimary>
                </MobileActionArea>
            }
            bottomNav={<MobileBottomNav items={navItems} active={tab} onChange={(k) => setTab(k as "menus" | "order")} />}
            fab={tab === "menus" && !drilled ? <MobileFab label="Combos" onClick={() => navigate("/combos")} /> : undefined}
            overlay={sheet}
        >
            {tab === "order" ? (
                lines.length === 0 ? (
                    <MobileEmpty message="Nothing on this check yet. Switch to Menus to ring something up." />
                ) : (
                    <>
                        {seatList.map((seat) => {
                            const seated = lines.filter((l) => (l.seat ?? 1) === seat);
                            return (
                                <Box key={seat}>
                                    <MobileSeatBand label={`Seat ${seat}`} color={appColors.seat[(seat - 1) % appColors.seat.length]} />
                                    {seated.map((l) => (
                                        <MobileRow
                                            key={`${l.id}-${seat}`}
                                            title={`${l.qty > 1 ? `${l.qty} × ` : ""}${l.name}`}
                                            subtitle={lineSubtitle(l) || undefined}
                                            price={lineTotal(l)}
                                            image={l.image ?? ""}
                                            overflow
                                            onOverflow={() => setKebabFor(l)}
                                            onClick={() => setEditing(l)}
                                        />
                                    ))}
                                </Box>
                            );
                        })}

                        {/* The terminal keeps these in the always-visible order
                            panel; here the check is a destination, so they close
                            the list rather than sitting beside it. */}
                        <Stack
                            sx={{ px: 1.5, py: 1.25, gap: 0.4, bgcolor: appColors.surface, borderTop: `1px solid ${appColors.divider}` }}
                        >
                            {[
                                ["Subtotal", subtotalOf(lines)],
                                ["Tax", taxOf(lines)],
                            ].map(([label, amount]) => (
                                <Stack key={label as string} direction="row" sx={{ justifyContent: "space-between" }}>
                                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
                                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{money(amount as number)}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </>
                )
            ) : (
                <>
                    {/* The target seat. On the terminal the seat column is always
                        on screen and doubles as this control; here it is not, so
                        the target has to be visible from the menu itself. */}
                    <MobileFilterTabs
                        tabs={seatList.map((s) => `Seat ${s}`)}
                        active={`Seat ${activeSeat}`}
                        onChange={(t) => setActiveSeat(Number(t.replace(/\D/g, "")) || 1)}
                    />
                    {!drilled && <MobileFilterTabs tabs={Object.keys(TAB_MENU_SETS)} active={menuSet} onChange={setMenuSet} />}
                    <MobileSearch placeholder="Search items" value={query} onChange={setQuery} />

                    {searched ? (
                        searched.length === 0 ? (
                            <Typography sx={{ px: 1.5, py: 3, fontSize: 15, color: appColors.textSecondary }}>
                                Nothing matches &ldquo;{query.trim()}&rdquo;.
                            </Typography>
                        ) : (
                            searched.map((item) => (
                                <MobileRow
                                    key={item.id}
                                    title={item.name}
                                    price={item.price}
                                    image={storeImage(item.path)}
                                    onClick={() => add(item)}
                                />
                            ))
                        )
                    ) : drilled ? (
                        foodByCategory(drilled).map((item) => (
                            <MobileRow
                                key={item.id}
                                title={item.name}
                                price={item.price}
                                image={storeImage(item.path)}
                                onClick={() => add(item)}
                            />
                        ))
                    ) : (
                        <>
                            <MobileSectionHeading>Adding to seat {activeSeat}</MobileSectionHeading>
                            {(TAB_MENU_SETS[menuSet] ?? []).map((category) => {
                                const items = foodByCategory(category);
                                return (
                                    <MobileRow
                                        key={category}
                                        title={category}
                                        subtitle={`${items.length} ${items.length === 1 ? "item" : "items"}`}
                                        image={items[0] ? storeImage(items[0].path) : ""}
                                        drills
                                        onClick={() => setDrilled(category)}
                                    />
                                );
                            })}
                        </>
                    )}

                    <Box sx={{ height: 64 }} />
                </>
            )}
        </MobileShell>
    );
};
