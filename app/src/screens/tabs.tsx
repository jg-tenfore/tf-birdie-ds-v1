import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import CategoryIcon from "@mui/icons-material/Category";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { useNavigate, useParams } from "react-router-dom";

import Dialog from "@mui/material/Dialog";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { Shell } from "../pos-shell";
import { TabItemDetail } from "./tab-item-detail";
import { modifierLine } from "@/data/modifiers";
import { lineTotal, money, useActions, useStore, type Line, type Ticket } from "../store";
import { foodByCategory, type FoodCategory } from "@/data/food-catalog";
import { storeImage } from "@/utils/asset-url";

/**
 * Tabs, from `references/072926/6-tabs/`.
 *
 * The folder holds two screens, not one — only the first capture is the tab
 * list; the other four are the **seat-based order editor** a tab opens into,
 * titled with a pipe breadcrumb (`Table Detached 58829 | Order ID 4180595 |
 * Avery Robertson`). Both live here.
 *
 * What the list documents about the shipping screen: no sort, no grouping, no
 * status column, and the identifying detail is split — the tab's own name sits
 * left at 20px while the employee, order id and card are a 12px block far to
 * the right. Every row leads with the same antler mark, so the avatar column
 * carries no information at all.
 */

const SEAT_COLORS = appColors.seat;

/* ------------------------------ list ------------------------------ */

const TabRow = ({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) => {
    const total = ticket.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06;

    return (
        <ButtonBase
            onClick={onOpen}
            sx={{
                display: "flex",
                width: "100%",
                textAlign: "left",
                px: 2,
                py: 2.25,
                minHeight: 118,
                bgcolor: "#fff",
                borderBottom: "1px solid",
                borderColor: appColors.divider,
                "&:hover": { bgcolor: "#F7F9FA" },
            }}
        >
            <Box component="img" src={assetUrl("logos/tf-square-black.svg")} alt="" sx={{ width: 62, height: 58, mr: 3, flexShrink: 0 }} />

            <Typography sx={{ flex: 1, fontSize: 25, minWidth: 0 }} noWrap>
                {ticket.name}
            </Typography>

            {/* Deliberately far right and small — this is how the app splits it. */}
            <Stack sx={{ width: 260, flexShrink: 0 }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{ticket.server}</Typography>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                    {ticket.number.replace("#", "")} - {ticket.opened}
                </Typography>
                {ticket.source === "Table" && (
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                        (detached table - {ticket.seats ?? 4} guests)
                    </Typography>
                )}
            </Stack>

            <Typography sx={{ width: 120, textAlign: "right", fontSize: 25, flexShrink: 0 }}>{money(total)}</Typography>
        </ButtonBase>
    );
};

export const TabsScreen = () => {
    const { heldTickets } = useStore();
    const { openTicket, popDrawer } = useActions();
    const navigate = useNavigate();
    const [q, setQ] = useState("");

    const rows = heldTickets.filter(
        (t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.server.toLowerCase().includes(q.toLowerCase()),
    );

    return (
        <Shell
            title="Tabs"
            active="tabs"
            showOverflow={false}
            subBar={
                <InputBase
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Start typing a customer or employee name to filter..."
                    sx={{ width: "100%", bgcolor: appColors.filterBar, px: 2, py: 2, fontSize: 20 }}
                />
            }
            actionBar={
                <>
                    <ActionButton tone="disabled">Back</ActionButton>
                    <ActionButton tone="danger" icon={<SaveAltIcon />} onClick={popDrawer}>
                        Pop
                    </ActionButton>
                    <ActionButton icon={<BoltIcon />} onClick={() => navigate("/quickorder")}>
                        Quick Order
                    </ActionButton>
                    <ActionButton icon={<RestaurantIcon />} onClick={() => navigate("/tables")}>
                        Tables
                    </ActionButton>
                    <ActionButton tone="primary" icon={<AddIcon />} onClick={() => navigate("/proshop")}>
                        Create a Tab
                    </ActionButton>
                </>
            }
        >
            {rows.length === 0 ? (
                <Box sx={{ p: 4 }}>
                    <Typography sx={{ fontSize: 22 }}>No open tabs</Typography>
                    <Typography sx={{ color: appColors.textSecondary, mt: 0.5 }}>
                        Hold a ticket from the register and it will appear here.
                    </Typography>
                </Box>
            ) : (
                <Box>
                    {rows.map((t) => (
                        <TabRow
                            key={t.id}
                            ticket={t}
                            onOpen={() => {
                                openTicket(t.id);
                                navigate(`/tabs/${t.id}`);
                            }}
                        />
                    ))}
                </Box>
            )}
        </Shell>
    );
};

/* --------------------------- order editor -------------------------- */

/** The seat editor sells the restaurant menu, not the retail catalogue. */
/** Menu sets, as the device groups them on this screen. */
const TAB_MENU_SETS: Record<string, FoodCategory[]> = {
    All: ["Sandwiches", "Hamburgers", "Grill", "Beer", "Wine", "Beverages", "Snacks", "Combos"],
    "19th Hole Menu": ["Beer", "Wine", "Beverages"],
};

/** One tile shape for both levels of the hierarchy — categories and products. */
const ProductTile = ({ name, price, image, onClick }: { name: string; price?: string; image?: string; onClick: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            flexDirection: "column",
            alignItems: "stretch",
            bgcolor: "#fff",
            border: `1px solid ${appColors.divider}`,
            borderRadius: `${appRadius.tile}px`,
            overflow: "hidden",
            transition: "border-color 100ms linear",
            "&:hover": { borderColor: appColors.green },
        }}
    >
        <Box sx={{ position: "relative", width: "100%", height: 120, flexShrink: 0, overflow: "hidden" }}>
            {image && (
                <Box
                    component="img"
                    src={image}
                    alt=""
                    loading="lazy"
                    sx={{ position: "absolute", inset: 6, width: "calc(100% - 12px)", height: "calc(100% - 12px)", objectFit: "contain" }}
                />
            )}
        </Box>
        <Stack sx={{ px: 0.75, height: 66, flexShrink: 0, justifyContent: "center", borderTop: `1px solid ${appColors.divider}` }}>
            <Typography
                sx={{
                    fontSize: 13,
                    textAlign: "center",
                    lineHeight: 1.25,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}
            >
                {name}
            </Typography>
            {price && <Typography sx={{ fontSize: 13, fontWeight: 500, textAlign: "center" }}>{price}</Typography>}
        </Stack>
    </ButtonBase>
);

/**
 * A seat band.
 *
 * Tapping it chooses which seat receives the next item — it does not collapse
 * anything. Lines are always visible: a server reading a table needs to see the
 * whole check at once, and hiding three seats to look at one is how the wrong
 * plate gets carried out. The chevron marks the *active* seat rather than an
 * expanded one.
 */
const SeatBandRow = ({ seat, active, onSelect }: { seat: number; active: boolean; onSelect: () => void }) => (
    <ButtonBase
        onClick={onSelect}
        aria-label={`Seat ${seat}`}
        aria-pressed={active}
        sx={{
            width: "100%",
            justifyContent: "space-between",
            bgcolor: SEAT_COLORS[(seat - 1) % SEAT_COLORS.length],
            color: "#fff",
            px: 2,
            py: 1.25,
            // The active seat is picked out by a white left edge rather than a
            // different fill, so the seat's own colour survives.
            borderLeft: active ? "5px solid #fff" : "5px solid transparent",
        }}
    >
        <Typography sx={{ fontSize: 16, fontWeight: active ? 700 : 400 }}>Seat {seat}</Typography>
        {active && <Typography sx={{ fontSize: 20, lineHeight: 1 }}>‹</Typography>}
    </ButtonBase>
);

/**
 * An order line inside a seat.
 *
 * Four stacked pieces of information under the name, and only the first is
 * labelled: the on-hand / available pair, the modifier run, and any note. The pair
 * is printed with the second figure in orange and nothing to say what either
 * means — it is the item's stock, and reading it takes knowing that.
 */
const SeatLine = ({ line, onMenu }: { line: Line; onMenu: (e: React.MouseEvent<HTMLElement>) => void }) => (
    <Stack direction="row" spacing={1.5} sx={{ px: 1.5, py: 1.25, alignItems: "flex-start", bgcolor: "#fff" }}>
        <Box sx={{ position: "relative", width: 52, height: 46, flexShrink: 0, mt: 0.5, bgcolor: "#fff", overflow: "hidden" }}>
            {line.image && <Box component="img" src={line.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    minWidth: 22,
                    height: 22,
                    px: 0.4,
                    bgcolor: appColors.greenTee,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    lineHeight: 1,
                }}
            >
                {line.qty}
            </Box>
        </Box>

        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>
                {line.name}
            </Typography>

            {line.stock && (
                <Stack direction="row" sx={{ gap: 1.5 }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{line.stock[0]}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.orange }}>{line.stock[1]}</Typography>
                </Stack>
            )}

            {line.modifiers?.length ? (
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary, lineHeight: 1.35 }}>
                    {modifierLine(line.modifiers)}
                </Typography>
            ) : null}

            {line.note && <Typography sx={{ fontSize: 13, color: appColors.textPrimary }}>{line.note}</Typography>}

            {line.fired && <Typography sx={{ fontSize: 12, color: appColors.greenTee, letterSpacing: "0.06em" }}>FIRED</Typography>}
            {line.discountPct ? <Typography sx={{ fontSize: 12, color: appColors.orange }}>{line.discountPct}% off</Typography> : null}
        </Stack>

        <Typography sx={{ fontSize: 15, mt: 0.5 }}>{money(lineTotal(line))}</Typography>

        <ButtonBase
            onClick={onMenu}
            aria-label={`Options for ${line.name}`}
            sx={{ width: 32, height: 44, fontSize: 20, color: appColors.textSecondary }}
        >
            ⋮
        </ButtonBase>
    </Stack>
);

export const TabDetailScreen = () => {
    const { id = "" } = useParams();
    const { state, lines } = useStore();
    const { addItem, removeLine, holdTicket, setLineModifiers, setLineNote, setLineQty, fireLine, moveLine, splitLine, discountLine } =
        useActions();
    const navigate = useNavigate();

    /**
     * `/tabs/active` resolves to whatever the store just opened.
     *
     * The floor plan navigates here straight after dispatching openTable, and it
     * cannot know the new ticket's id without racing the reducer — so the route
     * asks for "the open one" instead.
     */
    const ticket = id === "active" ? state.tickets.find((t) => t.id === state.activeTicketId) : state.tickets.find((t) => t.id === id);
    const seats = ticket?.seats ?? 4;
    const fromTable = ticket?.source === "Table";
    const [activeSeat, setActiveSeat] = useState(1);
    /** Which line's kebab is open, and where to anchor it. */
    const [menuFor, setMenuFor] = useState<{ line: Line; anchor: HTMLElement } | null>(null);
    /** The line being configured. Replaces the menu grid while it is set. */
    const [editing, setEditing] = useState<Line | null>(null);
    /** Move / Split need a target seat, so they open a second step. */
    const [seatPickerFor, setSeatPickerFor] = useState<{ line: Line; mode: "move" | "split" } | null>(null);
    const [discountFor, setDiscountFor] = useState<Line | null>(null);
    const [menuSet, setMenuSet] = useState("All");
    const [drilled, setDrilled] = useState<string | null>(null);

    const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06;

    return (
        <Shell
            title={`Table ${ticket?.name ?? "—"} | Order ID ${ticket?.number.replace("#", "") ?? "—"} | ${ticket?.server ?? "—"}`}
            active="tabs"
            orderPanel={
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                    {Array.from({ length: seats }, (_, i) => i + 1).map((seat) => (
                        <Box key={seat}>
                            <SeatBandRow seat={seat} active={activeSeat === seat} onSelect={() => setActiveSeat(seat)} />
                            {/* Always rendered. An empty seat simply shows nothing
                                under its band, which is information too. */}
                            <Stack divider={<Divider />}>
                                {lines
                                    .filter((l) => l.seat === seat)
                                    .map((l) => (
                                        <SeatLine
                                            key={`${l.id}-${seat}`}
                                            line={l}
                                            onMenu={(e) => setMenuFor({ line: l, anchor: e.currentTarget })}
                                        />
                                    ))}
                            </Stack>
                        </Box>
                    ))}
                </Box>
            }
            actionBar={
                <>
                    {/*
                     * DONE goes back where you came from. A check opened off the
                     * floor plan returns to the floor; one opened off the tab list
                     * returns to the list. Sending a table's check to the tab list
                     * loses the room you were standing in.
                     */}
                    {/* BACK while a line or a category is open; DONE otherwise. */}
                    {editing || drilled ? (
                        <ActionButton
                            onClick={() => {
                                if (editing) setEditing(null);
                                else setDrilled(null);
                            }}
                        >
                            Back
                        </ActionButton>
                    ) : (
                        <ActionButton onClick={() => navigate(fromTable ? "/tables" : "/tabs")}>Done</ActionButton>
                    )}
                    <ActionButton icon={<CategoryIcon />} onClick={() => navigate("/combos")}>
                        Combos
                    </ActionButton>
                    <ActionButton onClick={() => navigate("/quickorder")}>Open Food</ActionButton>
                    <ActionButton
                        tone="primary"
                        onClick={() => {
                            holdTicket();
                            navigate(fromTable ? "/tables" : "/tabs");
                        }}
                    >
                        Save Changes
                    </ActionButton>
                    <ActionButton tone="primary" onClick={() => navigate("/pay")}>
                        {lines.length ? `Pay ${money(total)}` : "Pay"}
                    </ActionButton>
                </>
            }
        >
            {editing ? (
                <TabItemDetail
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
            ) : (
                <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 1.5 }}>
                        Adding to <b>Seat {activeSeat}</b> — tap a seat band on the left to change which seat receives items.
                    </Typography>

                    <InputBase
                        placeholder="Start typing product name or SKU…"
                        sx={{ width: "100%", fontSize: 20, borderBottom: `1px solid ${appColors.textPrimary}`, pb: 1, mb: 3 }}
                    />

                    {/*
                     * Two levels above the products, same as Quick Order: a menu set
                     * narrows which categories show, then a category opens its
                     * items. Tabs was a single flat grid of every product, which is
                     * unusable once the kitchen menu is in it.
                     */}
                    {!drilled && (
                        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                            {Object.keys(TAB_MENU_SETS).map((set) => (
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
                    )}

                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 1.5 }}>
                        {drilled
                            ? foodByCategory(drilled as FoodCategory).map((item) => (
                                  <ProductTile
                                      key={item.id}
                                      name={item.name}
                                      price={money(item.price)}
                                      image={storeImage(item.path)}
                                      onClick={() => {
                                          const id = item.id;
                                          addItem(
                                              { id, name: item.name, price: item.price, image: storeImage(item.path) },
                                              "Table",
                                              activeSeat,
                                          );
                                          // Adding opens the item straight away: a
                                          // plate that needs a temperature needs it
                                          // before it reaches the kitchen, not after.
                                          setEditing({
                                              id,
                                              name: item.name,
                                              qty: 1,
                                              unitPrice: item.price,
                                              image: storeImage(item.path),
                                              seat: activeSeat,
                                          });
                                      }}
                                  />
                              ))
                            : (TAB_MENU_SETS[menuSet] ?? []).map((category) => {
                                  const hero = foodByCategory(category)[0];
                                  return (
                                      <ProductTile
                                          key={category}
                                          name={category}
                                          image={hero ? storeImage(hero.path) : undefined}
                                          onClick={() => setDrilled(category)}
                                      />
                                  );
                              })}
                    </Box>
                </Box>
            )}

            {/* The line kebab. Everything here acts on one line. */}
            <Menu
                anchorEl={menuFor?.anchor ?? null}
                open={Boolean(menuFor)}
                onClose={() => setMenuFor(null)}
                slotProps={{ paper: { sx: { width: 300, borderRadius: 0 } }, list: { sx: { py: 0 } } }}
            >
                {(["Fire", "Move", "Split", "Edit", "Discount", "Delete"] as const).map((item, i) => (
                    <MenuItem
                        key={item}
                        onClick={() => {
                            const line = menuFor!.line;
                            setMenuFor(null);
                            if (item === "Fire") return fireLine(line.id, line.seat);
                            if (item === "Move") return setSeatPickerFor({ line, mode: "move" });
                            if (item === "Split") return setSeatPickerFor({ line, mode: "split" });
                            if (item === "Edit") return setEditing(line);
                            if (item === "Discount") return setDiscountFor(line);
                            removeLine(line.id, line.seat);
                        }}
                        sx={{
                            minHeight: 68,
                            px: 3,
                            fontSize: 21,
                            borderTop: i === 0 ? "none" : `1px solid ${appColors.divider}`,
                            color: item === "Delete" ? "#E53935" : appColors.textPrimary,
                        }}
                    >
                        {item}
                    </MenuItem>
                ))}
            </Menu>

            {/* Move and Split both need a destination seat. */}
            <Dialog
                open={Boolean(seatPickerFor)}
                onClose={() => setSeatPickerFor(null)}
                slotProps={{ paper: { sx: { width: 420, borderRadius: 1 } } }}
            >
                <Typography sx={{ fontSize: 21, px: 3, pt: 3, pb: 1 }}>
                    {seatPickerFor?.mode === "split" ? "Split one to…" : "Move to…"}
                </Typography>
                {Array.from({ length: seats }, (_, i) => i + 1)
                    .filter((seat) => seat !== seatPickerFor?.line.seat)
                    .map((seat) => (
                        <ButtonBase
                            key={seat}
                            onClick={() => {
                                const { line, mode } = seatPickerFor!;
                                if (mode === "move") moveLine(line.id, seat, line.seat);
                                else splitLine(line.id, seat, line.seat);
                                setSeatPickerFor(null);
                            }}
                            sx={{
                                display: "flex",
                                width: "100%",
                                justifyContent: "flex-start",
                                gap: 2,
                                px: 3,
                                py: 2,
                                borderTop: `1px solid ${appColors.divider}`,
                            }}
                        >
                            <Box sx={{ width: 16, height: 16, bgcolor: SEAT_COLORS[(seat - 1) % SEAT_COLORS.length] }} />
                            <Typography sx={{ fontSize: 18 }}>Seat {seat}</Typography>
                        </ButtonBase>
                    ))}
            </Dialog>

            {/* Discounts are fixed percentages, not free entry. */}
            <Dialog
                open={Boolean(discountFor)}
                onClose={() => setDiscountFor(null)}
                slotProps={{ paper: { sx: { width: 420, borderRadius: 1 } } }}
            >
                <Typography sx={{ fontSize: 21, px: 3, pt: 3, pb: 1 }}>Discount {discountFor?.name}</Typography>
                {[10, 20, 25, 50, 100, 0].map((pct) => (
                    <ButtonBase
                        key={pct}
                        onClick={() => {
                            discountLine(discountFor!.id, pct, discountFor!.seat);
                            setDiscountFor(null);
                        }}
                        sx={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            px: 3,
                            py: 2,
                            borderTop: `1px solid ${appColors.divider}`,
                        }}
                    >
                        <Typography sx={{ fontSize: 18 }}>{pct ? `${pct}% off` : "Remove discount"}</Typography>
                    </ButtonBase>
                ))}
            </Dialog>
        </Shell>
    );
};
