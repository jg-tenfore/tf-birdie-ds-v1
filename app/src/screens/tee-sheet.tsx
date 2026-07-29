import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius, teeSlotColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type TeeTimeBooking } from "../store";

/**
 * Tee sheet → check-in → ticket.
 *
 * The hand-off this flow exists to prove: checking a tee time in builds a real
 * ticket from the booking's per-player rates and drops the operator into the
 * register with it open. That is the join between the golf side and the
 * selling side of the product.
 */

const statusFill = (s: TeeTimeBooking["status"]) =>
    s === "paid"
        ? teeSlotColors.paid
        : s === "checked-in"
          ? appColors.greenTee
          : s === "booked"
            ? teeSlotColors.booked
            : s === "blocked"
              ? teeSlotColors.blocked
              : "#fff";

const SubBar = () => (
    <Box>
        <Stack direction="row" sx={{ gap: "2px" }}>
            <Box sx={{ bgcolor: appColors.green, width: 84, display: "grid", placeItems: "center", color: "#fff", fontSize: 22 }}>‹</Box>
            <Box sx={{ flex: 1, bgcolor: appColors.slate, color: "#fff", display: "grid", placeItems: "center", py: 1.5, fontSize: 14 }}>
                The Dunes of Delgado PROD
            </Box>
            <Box
                sx={{
                    flex: 2,
                    bgcolor: appColors.orange,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    letterSpacing: "0.06em",
                }}
            >
                SATURDAY, JULY 29 2026
            </Box>
            <Box
                sx={{
                    flex: 1,
                    bgcolor: appColors.slate,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    letterSpacing: "0.06em",
                }}
            >
                GO TO TODAY
            </Box>
            <Box sx={{ bgcolor: appColors.green, width: 84, display: "grid", placeItems: "center", color: "#fff", fontSize: 22 }}>›</Box>
        </Stack>
    </Box>
);

const Counts = ({ times }: { times: TeeTimeBooking[] }) => {
    const booked = times.filter((t) => t.status === "booked").length;
    const checked = times.filter((t) => t.status === "checked-in").length;
    const open = times.filter((t) => t.status === "open").length;

    return (
        <Stack direction="row" spacing={3} sx={{ px: 2, py: 1, bgcolor: "#B9B9B9", alignItems: "center" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Main Course</Typography>
            {[
                ["Total", times.length],
                ["Booked", booked],
                ["Checked in", checked],
                ["Available", open],
            ].map(([label, n]) => (
                <Typography key={label as string} sx={{ fontSize: 14, color: "#33383d" }}>
                    {label} <b>{n}</b>
                </Typography>
            ))}
        </Stack>
    );
};

export const TeeSheetScreen = () => {
    const { state } = useStore();
    const navigate = useNavigate();

    return (
        <Shell
            title="Tee Sheet"
            active="teesheet"
            topActions={["HIDE BACK"]}
            showCart
            subBar={<SubBar />}
            actionBarBg={teeSlotColors.blocked}
            actionBar={
                <>
                    <ActionButton onClick={() => navigate("/proshop")}>Pro Shop</ActionButton>
                    <ActionButton>North Course</ActionButton>
                    <ActionButton tone="active">List</ActionButton>
                    <ActionButton>Grid</ActionButton>
                    <ActionButton onClick={() => navigate("/tabs")}>Tabs</ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.sheetCanvas, minHeight: "100%" }}>
                <Counts times={state.teeTimes} />
                <Stack spacing={"6px"} sx={{ p: 1 }}>
                    {state.teeTimes.map((slot) => (
                        <ButtonBase
                            key={slot.time}
                            onClick={() => navigate(`/teesheet/${encodeURIComponent(slot.time)}`)}
                            sx={{
                                display: "flex",
                                alignItems: "stretch",
                                bgcolor: "#fff",
                                borderRadius: `${appRadius.tile}px`,
                                overflow: "hidden",
                                minHeight: 76,
                            }}
                        >
                            <Box sx={{ width: 140, display: "grid", placeItems: "center", fontSize: 20 }}>{slot.time}</Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    bgcolor: statusFill(slot.status),
                                    color: slot.status === "open" ? appColors.textSecondary : "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    gap: 2,
                                }}
                            >
                                {slot.status === "open" ? (
                                    <Typography sx={{ fontSize: 15 }}>Available</Typography>
                                ) : slot.status === "blocked" ? (
                                    <Typography sx={{ fontSize: 15, color: "#4a4a4a" }}>BLOCKED</Typography>
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: 15, flex: 1, textAlign: "left" }}>
                                            ({slot.players.length}) {slot.players.map((p) => p.name).join(", ")}
                                        </Typography>
                                        <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 18 }} />
                                        <Typography sx={{ fontSize: 15 }}>
                                            {money(slot.players.reduce((s, p) => s + p.price, 0))}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                            <Box sx={{ width: 130, display: "grid", placeItems: "center" }}>
                                {slot.status === "checked-in" && (
                                    <Chip size="small" label="Checked in" sx={{ bgcolor: appColors.greenTee, color: "#fff" }} />
                                )}
                                {slot.status === "booked" && (
                                    <Chip size="small" label="Check in" sx={{ bgcolor: appColors.navy, color: "#fff" }} />
                                )}
                            </Box>
                        </ButtonBase>
                    ))}
                </Stack>
            </Box>
        </Shell>
    );
};

export const TeeTimeDetailScreen = () => {
    const { time = "" } = useParams();
    const decoded = decodeURIComponent(time);
    const { state } = useStore();
    const { chargeTeeTime, checkIn } = useActions();
    const navigate = useNavigate();

    const slot = state.teeTimes.find((t) => t.time === decoded);
    if (!slot) return <TeeSheetScreen />;

    const totalDue = slot.players.reduce((s, p) => s + p.price, 0);
    const hasPlayers = slot.players.length > 0;

    return (
        <Shell
            title={`The Dunes of Delgado PROD - North Course - ${decoded} - FRONT`}
            active="teesheet"
            showCart
            actionBar={
                <>
                    <ActionButton onClick={() => navigate("/teesheet")}>Tee Sheet</ActionButton>
                    <ActionButton onClick={() => navigate("/proshop")}>Pro Shop</ActionButton>
                    <ActionButton tone={hasPlayers ? "default" : "disabled"} onClick={() => hasPlayers && checkIn(decoded)}>
                        Check in
                    </ActionButton>
                    <ActionButton
                        tone={hasPlayers ? "primary" : "disabled"}
                        grow={2}
                        onClick={() => {
                            if (!hasPlayers) return;
                            chargeTeeTime(decoded);
                            navigate("/proshop");
                        }}
                    >
                        {hasPlayers ? `Add all to ticket — ${money(totalDue)}` : "No players booked"}
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ p: 3, bgcolor: "#1A1A1A", minHeight: "100%" }}>
                {!hasPlayers && (
                    <Typography sx={{ color: "#bbb", fontSize: 18 }}>This time is open. Book a player from the tee sheet.</Typography>
                )}

                <Stack spacing={2}>
                    {slot.players.map((p, i) => (
                        <Box key={i} sx={{ bgcolor: "#2A2A2A", p: 2.5 }}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Stack>
                                    <Typography sx={{ color: "#fff", fontSize: 26 }}>{p.name}</Typography>
                                    <Typography sx={{ color: "#9aa4ae", fontSize: 13 }}>
                                        {p.holes} holes · {p.rate} · {p.checkedIn ? "Checked in" : "Not checked in"}
                                    </Typography>
                                </Stack>
                                <Typography sx={{ color: "#fff", fontSize: 24 }}>{money(p.price)}</Typography>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Shell>
    );
};
