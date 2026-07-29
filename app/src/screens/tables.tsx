import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { FloorElementView, floorColors, floorRoomOrder, statusFill } from "@/components/screens/restaurant/floor-plan";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Restaurant Tables — the live floor.
 *
 * The same floor plan the Table Chart editor writes, rendered with service
 * state: a seated table is warm, everything else is cool. That shared source is
 * the point — before this, the editor and this screen held separate hard-coded
 * layouts, so arranging the room here had no effect anywhere.
 *
 * Tapping a seated table opens its check. Tapping a free one starts a tab on it.
 *
 * The room pill floats over the plan rather than sitting in the bottom bar,
 * because the bottom bar on this screen is already four buttons wide.
 */

const CANVAS_W = 1280;
const CANVAS_H = 760;

export const TablesScreen = () => {
    const { state, heldTickets } = useStore();
    const { setFloorRoom, openTicket } = useActions();
    const navigate = useNavigate();

    const [zoom, setZoom] = useState(0.9);
    const [roomsOpen, setRoomsOpen] = useState(false);

    const room = state.floorRoom;
    const elements = state.floorPlans[room] ?? [];
    const tables = elements.filter((e) => e.kind === "table");
    const seated = tables.filter((t) => t.party);

    const openTable = (num: string | undefined) => {
        // A table with a held ticket of the same name reopens that ticket;
        // anything else drops into the register so a tab can be started.
        const existing = heldTickets.find((t) => t.name === `Table ${num}`);
        if (existing) {
            openTicket(existing.id);
            navigate(`/tabs/${existing.id}`);
            return;
        }
        navigate("/quickorder");
    };

    return (
        <Shell
            title="Restaurant Tables"
            active="tables"
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate(-1)}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<DashboardIcon />} preserveCase onClick={() => navigate("/tablechart")}>
                        FLOOR PLAN
                    </ActionButton>
                    <ActionButton icon={<CreditCardIcon />} onClick={() => navigate("/tabs")}>
                        Tabs
                    </ActionButton>
                    <ActionButton icon={<BoltIcon />} onClick={() => navigate("/quickorder")}>
                        Quick Order
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ position: "relative", height: "100%", minHeight: 0, overflow: "auto", bgcolor: floorColors.canvas }}>
                <Box
                    sx={{
                        position: "relative",
                        width: CANVAS_W,
                        height: CANVAS_H,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                    }}
                >
                    {elements.map((el) => (
                        <FloorElementView
                            key={el.id}
                            element={el}
                            fill={statusFill(el.status)}
                            onSelect={el.kind === "table" ? () => openTable(el.num) : undefined}
                        />
                    ))}
                </Box>

                {elements.length === 0 && (
                    <Stack sx={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: 20, color: appColors.textSecondary }}>{room} has no tables laid out.</Typography>
                        <ButtonBase onClick={() => navigate("/tablechart")} sx={{ fontSize: 15, color: appColors.green }}>
                            Open Table Chart to set it up
                        </ButtonBase>
                    </Stack>
                )}

                {/* Room pill + a live count, which the editor does not need. */}
                <Stack
                    direction="row"
                    sx={{
                        position: "absolute",
                        top: 12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <ButtonBase
                        onClick={() => setRoomsOpen((o) => !o)}
                        sx={{ bgcolor: "#fff", boxShadow: 2, borderRadius: 999, px: 2.5, py: 1, gap: 1.5 }}
                    >
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>Floor plan</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{room}</Typography>
                    </ButtonBase>
                    <Box sx={{ bgcolor: "#fff", boxShadow: 2, borderRadius: 999, px: 2, py: 1 }}>
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                            {seated.length} of {tables.length} seated · {money(seated.reduce((s, t) => s + (t.party?.tab ?? 0), 0))} open
                        </Typography>
                    </Box>
                </Stack>

                {roomsOpen && (
                    <ClickAwayListener onClickAway={() => setRoomsOpen(false)}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: 58,
                                left: "50%",
                                transform: "translateX(-50%)",
                                bgcolor: "#fff",
                                boxShadow: 6,
                                borderRadius: 1,
                                minWidth: 240,
                                zIndex: 20,
                            }}
                        >
                            {floorRoomOrder.map((r) => (
                                <ButtonBase
                                    key={r}
                                    onClick={() => {
                                        setFloorRoom(r);
                                        setRoomsOpen(false);
                                    }}
                                    sx={{
                                        display: "block",
                                        width: "100%",
                                        textAlign: "left",
                                        px: 2.5,
                                        py: 1.75,
                                        fontSize: 15,
                                        fontWeight: r === room ? 600 : 400,
                                    }}
                                >
                                    {r}
                                </ButtonBase>
                            ))}
                        </Box>
                    </ClickAwayListener>
                )}

                <Stack
                    direction="row"
                    sx={{ position: "absolute", right: 16, bottom: 16, alignItems: "center", bgcolor: "#fff", boxShadow: 2, borderRadius: 999, px: 1 }}
                >
                    <IconButton aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}>
                        <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: 14, minWidth: 48, textAlign: "center" }}>{Math.round(zoom * 100)}%</Typography>
                    <IconButton aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(2)))}>
                        <AddIcon />
                    </IconButton>
                </Stack>
            </Box>
        </Shell>
    );
};
