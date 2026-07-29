import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Restaurant Tables, from `references/072926/7-tables/`.
 *
 * The floor is a free-positioned canvas of table tokens rather than a grid —
 * managers place them in Table Chart and this screen renders them where they
 * were dropped. An open table is teal and carries its label, server and running
 * total, all of which clip rather than wrap, which is why real tables are
 * normally numbered rather than named.
 *
 * The room selector is the middle bottom-bar button. It opens a dark sheet
 * **upward** — the same pattern as the tee sheet's course picker, and for the
 * same reason: the button it belongs to already sits on the bottom edge.
 */

/** The eleven rooms configured on the reference device, in its own order. */
const ROOMS = [
    "[Detached Tables]",
    "smallroom",
    "bigroom",
    "Private Hall",
    "banquet",
    "Lounge",
    "Trivia Pub/Bar",
    "Astor Creek Test Room",
    "Big Bar",
    "Open Tabs",
    "New Table Designer Room",
];

/** Where each seeded token sits on the canvas, in CSS px from the top-left. */
const POSITIONS: Record<string, { x: number; y: number }> = {
    "t-4128": { x: 8, y: 8 },
    "t-4131": { x: 190, y: 96 },
    "t-4133": { x: 372, y: 8 },
};

const RoomMenu = ({ selected, onPick, onClose }: { selected: string; onPick: (room: string) => void; onClose: () => void }) => (
    <ClickAwayListener onClickAway={onClose}>
        <Box
            sx={{
                position: "fixed",
                // Anchored above the action bar and centred on the second of the
                // four bottom-bar buttons, which is the room selector.
                bottom: 78,
                left: "37.3%",
                transform: "translateX(-50%)",
                width: 308,
                maxHeight: "68vh",
                overflowY: "auto",
                bgcolor: appColors.sheetFill,
                zIndex: 1300,
                boxShadow: 8,
                py: 1,
            }}
        >
            {ROOMS.map((room) => (
                <ButtonBase
                    key={room}
                    onClick={() => {
                        onPick(room);
                        onClose();
                    }}
                    sx={{
                        display: "block",
                        width: "100%",
                        py: 2.25,
                        px: 2,
                        fontSize: 16,
                        color: "#fff",
                        textAlign: "center",
                        opacity: room === selected ? 1 : 0.92,
                        fontWeight: room === selected ? 600 : 400,
                        "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                    }}
                >
                    {room}
                </ButtonBase>
            ))}
        </Box>
    </ClickAwayListener>
);

export const TablesScreen = () => {
    const { heldTickets } = useStore();
    const { openTicket } = useActions();
    const navigate = useNavigate();

    const [room, setRoom] = useState(ROOMS[0]);
    const [menuOpen, setMenuOpen] = useState(false);

    // Only the detached room holds the seeded tables; every other room is empty
    // on the reference device, which is worth showing rather than faking.
    const tables = room === "[Detached Tables]" ? heldTickets.filter((t) => t.source === "Table" || t.source === "Tab") : [];

    return (
        <Shell
            title="Restaurant Tables"
            active="tables"
            actionBar={
                <>
                    <ActionButton tone="disabled" onClick={() => navigate(-1)}>
                        Back
                    </ActionButton>
                    <ActionButton preserveCase onClick={() => setMenuOpen((o) => !o)}>
                        {room}
                    </ActionButton>
                    <ActionButton icon={<CreditCardIcon />} onClick={() => navigate("/tabs")}>
                        Tabs
                    </ActionButton>
                    <ActionButton icon={<BoltIcon />} onClick={() => navigate("/quickorder")}>
                        Quick Order
                    </ActionButton>
                </>
            }
            overlay={menuOpen ? <RoomMenu selected={room} onPick={setRoom} onClose={() => setMenuOpen(false)} /> : undefined}
        >
            <Box sx={{ position: "relative", minHeight: "100%", bgcolor: "#E8E8E8" }}>
                {tables.length === 0 && (
                    <Stack sx={{ height: 300, alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: 20, color: appColors.textSecondary }}>No active tables.</Typography>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                            {room === "[Detached Tables]" ? "Hold a ticket to see it here." : `${room} has no tables laid out.`}
                        </Typography>
                    </Stack>
                )}

                {tables.map((t, i) => {
                    const at = POSITIONS[t.id] ?? { x: 8 + (i % 6) * 182, y: 8 + Math.floor(i / 6) * 110 };
                    const total = t.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06;

                    return (
                        <ButtonBase
                            key={t.id}
                            onClick={() => {
                                openTicket(t.id);
                                navigate(`/tabs/${t.id}`);
                            }}
                            sx={{
                                position: "absolute",
                                left: at.x,
                                top: at.y,
                                width: 146,
                                height: 116,
                                bgcolor: appColors.tableOpen,
                                color: "#fff",
                                borderRadius: `${appRadius.tile}px`,
                                flexDirection: "column",
                                justifyContent: "center",
                                // Labels clip rather than wrap, as the app does.
                                overflow: "hidden",
                                px: 1,
                            }}
                        >
                            <Typography sx={{ fontSize: 19, whiteSpace: "nowrap" }}>{t.name}</Typography>
                            <Typography sx={{ fontSize: 15, whiteSpace: "nowrap" }}>{t.server}</Typography>
                            <Typography sx={{ fontSize: 15 }}>{money(total)}</Typography>
                        </ButtonBase>
                    );
                })}
            </Box>
        </Shell>
    );
};
