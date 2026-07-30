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

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type Line, type Ticket } from "../store";
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
const MENU_CATEGORIES: FoodCategory[] = ["Sandwiches", "Hamburgers", "Grill", "Beer", "Wine", "Beverages", "Snacks"];

const SeatBandRow = ({ seat, expanded, onToggle }: { seat: number; expanded: boolean; onToggle: () => void }) => (
    <ButtonBase
        onClick={onToggle}
        sx={{
            width: "100%",
            justifyContent: "space-between",
            bgcolor: SEAT_COLORS[(seat - 1) % SEAT_COLORS.length],
            color: "#fff",
            px: 2,
            py: 1.25,
        }}
    >
        <Typography sx={{ fontSize: 16 }}>Seat {seat}</Typography>
        <Typography sx={{ fontSize: 20, lineHeight: 1 }}>{expanded ? "‹" : "›"}</Typography>
    </ButtonBase>
);

const SeatLine = ({ line, onRemove }: { line: Line; onRemove: () => void }) => (
    <Stack direction="row" spacing={1.5} sx={{ px: 1.5, py: 1.25, alignItems: "center" }}>
        <Box sx={{ position: "relative", width: 52, height: 46, flexShrink: 0, bgcolor: "#fff", overflow: "hidden" }}>
            {line.image && <Box component="img" src={line.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    minWidth: 20,
                    height: 20,
                    px: 0.4,
                    bgcolor: appColors.greenTee,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    lineHeight: 1,
                }}
            >
                {line.qty}
            </Box>
        </Box>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500 }} noWrap>
                {line.name}
            </Typography>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{money(line.unitPrice)}</Typography>
        </Stack>
        <Typography sx={{ fontSize: 15 }}>{money(line.qty * line.unitPrice)}</Typography>
        <ButtonBase onClick={onRemove} aria-label={`Remove ${line.name}`} sx={{ px: 1, fontSize: 18, color: appColors.textSecondary }}>
            ⋮
        </ButtonBase>
    </Stack>
);

export const TabDetailScreen = () => {
    const { id = "" } = useParams();
    const { state, lines } = useStore();
    const { addItem, removeLine, holdTicket } = useActions();
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
    const [expanded, setExpanded] = useState<number | null>(1);

    const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06;

    return (
        <Shell
            title={`Table ${ticket?.name ?? "—"} | Order ID ${ticket?.number.replace("#", "") ?? "—"} | ${ticket?.server ?? "—"}`}
            active="tabs"
            orderPanel={
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                    {Array.from({ length: seats }, (_, i) => i + 1).map((seat) => (
                        <Box key={seat}>
                            <SeatBandRow
                                seat={seat}
                                expanded={expanded === seat}
                                onToggle={() => {
                                    setExpanded(expanded === seat ? null : seat);
                                    setActiveSeat(seat);
                                }}
                            />
                            {expanded === seat && (
                                <Stack divider={<Divider />}>
                                    {lines
                                        .filter((l) => l.seat === seat)
                                        .map((l) => (
                                            <SeatLine key={`${l.id}-${seat}`} line={l} onRemove={() => removeLine(l.id, seat)} />
                                        ))}
                                </Stack>
                            )}
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
                    <ActionButton onClick={() => navigate(fromTable ? "/tables" : "/tabs")}>Done</ActionButton>
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
            <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 1.5 }}>
                    Adding to <b>Seat {activeSeat}</b> — tap a seat band on the left to change which seat receives items.
                </Typography>

                <InputBase
                    placeholder="Start typing product name or SKU…"
                    sx={{ width: "100%", fontSize: 20, borderBottom: `1px solid ${appColors.textPrimary}`, pb: 1, mb: 3 }}
                />

                <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", rowGap: 2 }}>
                    {MENU_CATEGORIES.flatMap((c) => foodByCategory(c)).map((item) => (
                        <ButtonBase
                            key={item.id}
                            onClick={() =>
                                addItem(
                                    { id: item.id, name: item.name, price: item.price, image: storeImage(item.path) },
                                    "Table",
                                    activeSeat,
                                )
                            }
                            sx={{
                                width: 148,
                                flexDirection: "column",
                                bgcolor: "#fff",
                                border: "1px solid",
                                borderColor: appColors.divider,
                                borderRadius: `${appRadius.tile}px`,
                            }}
                        >
                            <Box sx={{ width: "100%", height: 128, display: "grid", placeItems: "center", overflow: "hidden", p: 0.75 }}>
                                <Box
                                    component="img"
                                    src={storeImage(item.path)}
                                    alt=""
                                    loading="lazy"
                                    sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                />
                            </Box>
                            <Stack sx={{ py: 1, px: 0.5, minHeight: 52, justifyContent: "center" }}>
                                <Typography sx={{ fontSize: 13, textAlign: "center" }}>{item.name}</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, textAlign: "center" }}>{money(item.price)}</Typography>
                            </Stack>
                        </ButtonBase>
                    ))}
                </Stack>
            </Box>
        </Shell>
    );
};
