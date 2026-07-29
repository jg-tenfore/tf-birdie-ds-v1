import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius, teeSlotColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type Position, type TeeTimeBooking } from "../store";

/**
 * The tee sheet, reproduced from `references/072926/2-teesheet/`.
 *
 * The layout that matters: each row is one tee time — the time in a white cell
 * on the left, **four playing positions** across the middle, and a gear at the
 * right that operates on the whole time. A position holds a whole party, which
 * is why a slot reads "(4) Oda Brennevin" rather than one name per golfer.
 *
 * Colour carries the state: purple booked, green paid, white open, grey
 * blocked. Two purple shades alternate across a row with no rule behind it, so
 * they are assigned by position index, as the app appears to do.
 */

const TIME_COL = 146;
const GEAR_COL = 130;

const SubBar = () => (
    <Stack direction="row" sx={{ gap: "6px", p: "6px", bgcolor: appColors.sheetCanvas }}>
        <Box
            sx={{ bgcolor: appColors.green, width: 116, display: "grid", placeItems: "center", color: "#fff", fontSize: 26, lineHeight: 1 }}
        >
            ‹
        </Box>
        <Box sx={{ flex: 1.4, bgcolor: appColors.slate, color: "#fff", display: "grid", placeItems: "center", py: 1.75, fontSize: 15 }}>
            The Dunes of Delgado PROD
        </Box>
        <Box
            sx={{
                flex: 2.4,
                bgcolor: appColors.orange,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                letterSpacing: "0.08em",
            }}
        >
            SATURDAY, JULY 29 2026
        </Box>
        <Box
            sx={{
                flex: 1.6,
                bgcolor: appColors.slate,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                letterSpacing: "0.08em",
            }}
        >
            GO TO TODAY
        </Box>
        <Box
            sx={{ bgcolor: appColors.green, width: 116, display: "grid", placeItems: "center", color: "#fff", fontSize: 26, lineHeight: 1 }}
        >
            ›
        </Box>
    </Stack>
);

const Counts = ({ times }: { times: TeeTimeBooking[] }) => {
    const all = times.flatMap((t) => t.positions);
    const booked = all.filter(Boolean).length;
    const paid = all.filter((p) => p?.paid).length;

    return (
        <Stack direction="row" spacing={3} sx={{ px: 2, py: 0.75, bgcolor: appColors.sheetCanvas, alignItems: "center" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>Main Course</Typography>
            {[
                ["Total", all.length],
                ["Booked", booked],
                ["Paid", paid],
                ["No Shows", 0],
                ["Available", all.length - booked],
            ].map(([label, n]) => (
                <Typography key={label as string} sx={{ fontSize: 15, color: "#3a4046" }}>
                    {label} <b>{n}</b>
                </Typography>
            ))}
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>10:14 AM</Typography>
        </Stack>
    );
};

/** One of the four playing positions. */
const Slot = ({ position, index, onOpen }: { position: Position | null; index: number; onOpen: () => void }) => {
    if (!position) return <Box sx={{ flex: 1, bgcolor: "#fff", borderLeft: "1px solid", borderColor: "#e4e4e4" }} />;

    const fill = position.paid ? teeSlotColors.paid : index % 2 === 0 ? teeSlotColors.booked : teeSlotColors.bookedAlt;

    return (
        <ButtonBase
            onClick={onOpen}
            sx={{
                flex: 1,
                bgcolor: fill,
                color: "#fff",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "space-between",
                px: 1.25,
                py: 1,
                position: "relative",
            }}
        >
            <Typography sx={{ fontSize: 14, textAlign: "left" }} noWrap>
                ({position.party}) {position.name}
            </Typography>

            {position.balance && (
                <Typography
                    sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-40%)", fontSize: 30, opacity: 0.9 }}
                >
                    $
                </Typography>
            )}

            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                {position.cart && <AirportShuttleIcon sx={{ fontSize: 17 }} />}
                {position.keyed && <VpnKeyIcon sx={{ fontSize: 15 }} />}
                {position.raincheck && <BoltIcon sx={{ fontSize: 16 }} />}
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{money(position.price)}</Typography>
            </Stack>
        </ButtonBase>
    );
};

/** The gear menu — six operations, all on the tee time rather than a player. */
const SlotMenu = ({ onClose }: { onClose: () => void }) => (
    <ClickAwayListener onClickAway={onClose}>
        <Box sx={{ position: "absolute", right: 8, top: "100%", zIndex: 20, bgcolor: "#fff", boxShadow: 6, width: 300 }}>
            {["Squeeze Before", "Squeeze After", "Clear Time", "Clone Before", "Clone After", "Move Player(s)"].map((label, i) => (
                <Box
                    key={label}
                    sx={{
                        px: 3,
                        py: 2,
                        fontSize: 19,
                        borderTop: i ? "1px solid" : 0,
                        borderColor: "#e4e4e4",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#f2f4f6" },
                    }}
                    onClick={onClose}
                >
                    {label}
                </Box>
            ))}
        </Box>
    </ClickAwayListener>
);

export const TeeSheetScreen = () => {
    const { state } = useStore();
    const navigate = useNavigate();
    const [menuFor, setMenuFor] = useState<string | null>(null);

    return (
        <Shell
            title="Tee Sheet"
            active="teesheet"
            topActions={["HIDE BACK"]}
            showCart
            subBar={<SubBar />}
            actionBarBg={appColors.sheetCanvas}
            actionBar={
                <>
                    <ActionButton onClick={() => navigate("/proshop")}>Pro Shop</ActionButton>
                    <ActionButton preserveCase>North Course</ActionButton>
                    <ActionButton>Grid</ActionButton>
                    <ActionButton tone="active">List</ActionButton>
                    <ActionButton>Multi</ActionButton>
                    <ActionButton onClick={() => navigate("/coursheet")}>Court Sheet</ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.sheetCanvas, minHeight: "100%" }}>
                <Counts times={state.teeTimes} />

                <Stack spacing="6px" sx={{ px: "6px", pb: "6px" }}>
                    {state.teeTimes.map((slot) => (
                        <Box
                            key={slot.time}
                            sx={{
                                position: "relative",
                                display: "flex",
                                minHeight: 92,
                                bgcolor: "#fff",
                                borderRadius: `${appRadius.tile}px`,
                                overflow: "visible",
                            }}
                        >
                            <Box sx={{ width: TIME_COL, display: "flex", alignItems: "center", pl: 2.5, flexShrink: 0 }}>
                                <Typography sx={{ fontSize: 21 }}>{slot.time}</Typography>
                            </Box>

                            <Box sx={{ flex: 1, display: "flex", minWidth: 0 }}>
                                {slot.blocked
                                    ? [0, 1, 2, 3].map((i) => (
                                          <Box
                                              key={i}
                                              sx={{
                                                  flex: 1,
                                                  bgcolor: teeSlotColors.blocked,
                                                  borderLeft: "1px solid",
                                                  borderColor: "#b0b0b0",
                                                  display: "grid",
                                                  placeItems: "center",
                                              }}
                                          >
                                              <Typography sx={{ fontSize: 13, color: "#4a4a4a" }}>BLOCKED</Typography>
                                          </Box>
                                      ))
                                    : slot.positions.map((p, i) => (
                                          <Slot
                                              key={i}
                                              position={p}
                                              index={i}
                                              onOpen={() => navigate(`/teesheet/${encodeURIComponent(slot.time)}`)}
                                          />
                                      ))}
                            </Box>

                            <Box sx={{ width: GEAR_COL, flexShrink: 0, display: "grid", placeItems: "center" }}>
                                <ButtonBase
                                    aria-label={`Options for ${slot.time}`}
                                    onClick={() => setMenuFor(menuFor === slot.time ? null : slot.time)}
                                    sx={{ p: 1.5, borderRadius: "50%" }}
                                >
                                    <SettingsIcon sx={{ fontSize: 30 }} />
                                </ButtonBase>
                            </Box>

                            {menuFor === slot.time && <SlotMenu onClose={() => setMenuFor(null)} />}
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Shell>
    );
};

/* ------------------------------------------------------------------ *
 * Tee time detail — a LIGHT screen, not dark.
 * ------------------------------------------------------------------ */

const SummaryBand = () => (
    <Stack direction="row" sx={{ bgcolor: appColors.slate, color: "#fff", px: 3, py: 2, alignItems: "center", gap: 4 }}>
        {["Customer", "Current Membership(s)", "Rounds", "Rewards Balance:"].map((label) => (
            <Stack key={label} sx={{ flex: 1, alignItems: "center" }}>
                <Typography sx={{ fontSize: 13 }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>--------</Typography>
            </Stack>
        ))}
        <Box sx={{ bgcolor: "#8f9296", color: "#fff", px: 3, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <CheckIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, letterSpacing: "0.06em" }}>RESERVE</Typography>
        </Box>
    </Stack>
);

const PlayerAction = ({ label, tone = "dark", onClick }: { label: string; tone?: "dark" | "red" | "green"; onClick?: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            flex: 1,
            minHeight: 52,
            px: 1,
            fontSize: 14,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#fff",
            bgcolor: tone === "red" ? "#E53935" : tone === "green" ? appColors.green : appColors.slate,
            "&:hover": { filter: "brightness(1.1)" },
        }}
    >
        {label}
    </ButtonBase>
);

export const TeeTimeDetailScreen = () => {
    const { time = "" } = useParams();
    const decoded = decodeURIComponent(time);
    const { state } = useStore();
    const { chargeTeeTime } = useActions();
    const navigate = useNavigate();

    const slot = state.teeTimes.find((t) => t.time === decoded);
    const booked = slot?.positions.map((p, i) => ({ p, i })).filter((x): x is { p: Position; i: number } => Boolean(x.p)) ?? [];
    const total = booked.reduce((s, { p }) => s + p.price, 0);

    return (
        <Shell
            title={`The Dunes of Delgado PROD - North Course - ${decoded} - FRONT`}
            active="teesheet"
            showCart
            showLogOut={false}
            accountLabel=""
            actionBar={
                <>
                    <ActionButton onClick={() => navigate("/teesheet")}>Tee Sheet</ActionButton>
                    <ActionButton onClick={() => navigate("/proshop")}>Pro Shop</ActionButton>
                    <ActionButton
                        tone={booked.length ? "default" : "disabled"}
                        onClick={() => {
                            if (!booked.length) return;
                            chargeTeeTime(decoded);
                            navigate("/proshop");
                        }}
                    >
                        Add all to cart
                    </ActionButton>
                    <ActionButton>Tee time notes</ActionButton>
                    <ActionButton tone={booked.length ? "primary" : "disabled"} onClick={() => booked.length && navigate("/pay")}>
                        {booked.length ? `Pay ${money(total)}` : "Pay"}
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: "#fff", minHeight: "100%" }}>
                <Stack direction="row" sx={{ bgcolor: "#E3E3E3", px: 3, py: 2.5, gap: 4 }}>
                    <InputBase placeholder="Search by customer name, email, or phone…" sx={{ flex: 2, fontSize: 20 }} />
                    <InputBase placeholder="Member Number…" sx={{ flex: 1, fontSize: 20 }} />
                </Stack>

                <SummaryBand />

                <Stack spacing={1.5} sx={{ p: 1.5 }}>
                    {booked.length === 0 && (
                        <Typography sx={{ p: 3, fontSize: 18, color: appColors.textSecondary }}>
                            This time is open. Search for a customer above to reserve it.
                        </Typography>
                    )}

                    {booked.map(({ p, i }) => (
                        <Box key={i} sx={{ bgcolor: appColors.detailCard, p: 2 }}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 30 }}>{p.name}</Typography>
                                    {p.balance && <Typography sx={{ fontSize: 22 }}>$</Typography>}
                                    {p.raincheck && <BoltIcon sx={{ fontSize: 22 }} />}
                                </Stack>
                                <Typography sx={{ fontSize: 26 }}>{money(p.price)}</Typography>
                            </Stack>

                            <Typography sx={{ fontSize: 13, color: "#5a6068", mb: 1.5 }}>
                                {p.holes} holes &nbsp; {p.rate} : {money(p.price)} &nbsp; ID:1039014{i} &nbsp;{" "}
                                {p.checkedIn ? "Checked in" : "Not checked in"}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                {p.paid ? (
                                    <>
                                        <PlayerAction label="Raincheck" tone="red" />
                                        <PlayerAction label="History" />
                                        <PlayerAction label="Edit" />
                                        <PlayerAction label="Print starter" />
                                        <PlayerAction label="Print receipt" />
                                        <PlayerAction label="Cart key" />
                                    </>
                                ) : (
                                    <>
                                        <PlayerAction label="Cancel" tone="red" />
                                        <PlayerAction label="No show" tone="red" />
                                        <PlayerAction label="History" />
                                        <PlayerAction label="Edit" />
                                        <PlayerAction label="Cart signout" />
                                        <PlayerAction
                                            label="Add to cart"
                                            tone="green"
                                            onClick={() => {
                                                chargeTeeTime(decoded, i);
                                                navigate("/proshop");
                                            }}
                                        />
                                    </>
                                )}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Shell>
    );
};
