import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Bay Sheet, from `references/072926/4-baysheet/`.
 *
 * Structurally different from Court Sheet, despite both being resource
 * schedulers: this is a **continuous time-axis calendar** — a left time gutter
 * with ruled lines across all bays — where Court Sheet is a stack of discrete
 * cards with the time printed inside each. A booking here occupies a height
 * proportional to its duration, which is why the reservation dialog has a
 * duration stepper and Court Sheet has none.
 *
 * The app bar also differs: it keeps the account cluster and adds ZOOM OUT
 * (the time axis is zoomable), and carries no cart or overflow.
 */

const BAYS = ["Red Bay", "Orange Bay", "Green Bay", "Blue Bay", "Magenta Bay", "White Bay"];

const START_HOUR = 10;
const END_HOUR = 14;
/** Pixels per minute. 30 minutes ≈ 99px in the reference at 1290 CSS px wide. */
const PPM = 3.3;
const GUTTER = 112;

const fmt = (mins: number) => {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const h = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};

const DateBar = () => (
    <Stack direction="row" sx={{ gap: "6px", p: "6px", bgcolor: appColors.canvas }}>
        <Box
            sx={{
                bgcolor: appColors.green,
                width: 190,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontSize: 26,
                lineHeight: 1,
                py: 1.75,
            }}
        >
            ‹
        </Box>
        <Box
            sx={{
                flex: 3,
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
                flex: 2,
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
            sx={{ bgcolor: appColors.green, width: 190, display: "grid", placeItems: "center", color: "#fff", fontSize: 26, lineHeight: 1 }}
        >
            ›
        </Box>
    </Stack>
);

/** A labelled stepper — the dialog's own control, not an MUI one. */
const Stepper = ({
    label,
    value,
    onDown,
    onUp,
    downLabel = "-",
    upLabel = "+",
}: {
    label: string;
    value: string;
    onDown: () => void;
    onUp: () => void;
    downLabel?: string;
    upLabel?: string;
}) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>{label}</Typography>
        <ButtonBase onClick={onDown} sx={{ fontSize: 22, px: 1, minWidth: 40, color: appColors.textPrimary }}>
            {downLabel}
        </ButtonBase>
        <Typography sx={{ fontSize: 22, fontWeight: 500, minWidth: 96, textAlign: "center" }}>{value}</Typography>
        <ButtonBase onClick={onUp} sx={{ fontSize: 22, px: 1, minWidth: 40, color: appColors.textPrimary }}>
            {upLabel}
        </ButtonBase>
    </Stack>
);

const Field = ({ placeholder }: { placeholder: string }) => (
    <Stack
        direction="row"
        sx={{ alignItems: "center", border: "1px solid", borderColor: "#B9BEC4", borderRadius: "3px", px: 2, height: 66, flex: 1 }}
    >
        <InputBase placeholder={placeholder} sx={{ flex: 1, fontSize: 19 }} />
        <SearchIcon sx={{ color: appColors.textPrimary }} />
    </Stack>
);

const NewReservationDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { addBayBooking } = useActions();
    const [bayIndex, setBayIndex] = useState(0);
    const [party, setParty] = useState(1);
    const [start, setStart] = useState(11 * 60 + 30);
    const [duration, setDuration] = useState(90);
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            slotProps={{ paper: { sx: { m: 4, borderRadius: 0, height: "auto", maxHeight: "88vh" } } }}
        >
            <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 4 }}>MAKE A NEW RESERVATION</Typography>

                <Stack direction="row" spacing={6} sx={{ alignItems: "center", mb: 3, flexWrap: "wrap", rowGap: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Typography sx={{ fontSize: 19 }}>Bay:</Typography>
                        <ButtonBase onClick={() => setBayIndex((i) => (i + 1) % BAYS.length)}>
                            <Typography sx={{ fontSize: 22, fontWeight: 500, color: "#5B7189" }}>{BAYS[bayIndex]}</Typography>
                        </ButtonBase>
                    </Stack>

                    <Stepper
                        label="Party Size:"
                        value={String(party)}
                        onDown={() => setParty((p) => Math.max(1, p - 1))}
                        onUp={() => setParty((p) => p + 1)}
                    />

                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Typography sx={{ fontSize: 19 }}>Fee:</Typography>
                        <Typography sx={{ fontSize: 22, fontWeight: 500, color: "#5B7189" }}>Sim Hour</Typography>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={6} sx={{ alignItems: "center", mb: 4, flexWrap: "wrap", rowGap: 2 }}>
                    <Stepper
                        label="Start at:"
                        value={fmt(start)}
                        onDown={() => setStart((s) => s - 15)}
                        onUp={() => setStart((s) => s + 15)}
                    />
                    <Stepper
                        label="Duration:"
                        value={String(duration)}
                        downLabel="-15"
                        upLabel="+15"
                        onDown={() => setDuration((d) => Math.max(15, d - 15))}
                        onUp={() => setDuration((d) => d + 15)}
                    />
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Typography sx={{ fontSize: 19 }}>Date:</Typography>
                        <Typography sx={{ fontSize: 22, fontWeight: 500, color: "#5B7189" }}>Saturday, July 29</Typography>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: "center",
                            border: "1px solid",
                            borderColor: "#B9BEC4",
                            borderRadius: "3px",
                            px: 2,
                            height: 66,
                            flex: 1,
                        }}
                    >
                        <InputBase
                            value={first}
                            onChange={(e) => setFirst(e.target.value)}
                            placeholder="First Name"
                            sx={{ flex: 1, fontSize: 19 }}
                        />
                        <SearchIcon />
                    </Stack>
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: "center",
                            border: "1px solid",
                            borderColor: "#B9BEC4",
                            borderRadius: "3px",
                            px: 2,
                            height: 66,
                            flex: 1,
                        }}
                    >
                        <InputBase
                            value={last}
                            onChange={(e) => setLast(e.target.value)}
                            placeholder="Last Name"
                            sx={{ flex: 1, fontSize: 19 }}
                        />
                        <SearchIcon />
                    </Stack>
                </Stack>
                <Field placeholder="Email" />

                <Box sx={{ flex: 1, minHeight: 40 }} />

                <Stack direction="row" spacing={2}>
                    <ButtonBase
                        onClick={onClose}
                        sx={{ flex: 1, height: 66, bgcolor: "#5F7692", color: "#fff", fontSize: 16, letterSpacing: "0.08em" }}
                    >
                        CANCEL
                    </ButtonBase>
                    <ButtonBase
                        onClick={() => {
                            addBayBooking({
                                bay: BAYS[bayIndex],
                                start,
                                duration,
                                name: [first, last].filter(Boolean).join(" ") || "Walk-up",
                                party,
                                fee: "Sim Hour",
                                price: (duration / 60) * 45,
                            });
                            onClose();
                        }}
                        sx={{ flex: 1, height: 66, bgcolor: appColors.green, color: "#fff", fontSize: 16, letterSpacing: "0.08em" }}
                    >
                        CREATE
                    </ButtonBase>
                </Stack>
            </Box>
        </Dialog>
    );
};

export const BaySheetScreen = () => {
    const { state } = useStore();
    const { addItem } = useActions();
    const navigate = useNavigate();
    const [dialog, setDialog] = useState(false);

    const totalMins = (END_HOUR - START_HOUR) * 60;
    const height = totalMins * PPM;
    // Heavy rule on the half hour, light rule at the quarter between.
    const rules = Array.from({ length: totalMins / 15 + 1 }, (_, i) => i * 15);

    return (
        <Shell
            title="Bay Sheet"
            active="baysheet"
            // Keeps the account cluster, drops cart/overflow, adds ZOOM OUT.
            topActions={["ZOOM OUT"]}
            showOverflow={false}
            subBar={<DateBar />}
            actionBar={
                <>
                    <ActionButton icon={<StorefrontIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton icon={<RestaurantIcon />} onClick={() => navigate("/tables")}>
                        Tables
                    </ActionButton>
                    <ActionButton icon={<ReplayIcon />}>Refresh</ActionButton>
                    <ActionButton tone="primary" icon={<AddIcon />} onClick={() => setDialog(true)}>
                        New Booking
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%", pb: 2 }}>
                {/* Column headers, offset by the time gutter. */}
                <Stack direction="row" sx={{ pl: `${GUTTER}px` }}>
                    {BAYS.map((bay) => (
                        <Typography key={bay} sx={{ flex: 1, textAlign: "center", py: 1.25, fontSize: 19, fontWeight: 700 }}>
                            {bay}
                        </Typography>
                    ))}
                </Stack>

                <Box sx={{ position: "relative", height, mr: "6px" }}>
                    {/* Time gutter + horizontal rules spanning every bay. */}
                    {rules.map((offset) => {
                        const mins = START_HOUR * 60 + offset;
                        const onHalf = mins % 30 === 0;
                        return (
                            <Box key={offset} sx={{ position: "absolute", top: offset * PPM, left: 0, right: 0, height: 0 }}>
                                {onHalf && (
                                    <Typography
                                        sx={{ position: "absolute", left: 8, top: -11, fontSize: 17, color: appColors.textPrimary }}
                                    >
                                        {fmt(mins)}
                                    </Typography>
                                )}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        left: GUTTER,
                                        right: 0,
                                        borderTop: onHalf ? "1px solid #2b3138" : "1px solid #D8DCE0",
                                    }}
                                />
                            </Box>
                        );
                    })}

                    {/* Bay columns: vertical rules plus any bookings. */}
                    <Stack direction="row" sx={{ position: "absolute", inset: 0, left: GUTTER }}>
                        {BAYS.map((bay) => (
                            <Box key={bay} sx={{ flex: 1, position: "relative", borderLeft: "1px solid #C7CCD1" }}>
                                {state.bayBookings
                                    .filter((b) => b.bay === bay)
                                    .map((b) => (
                                        <ButtonBase
                                            key={b.id}
                                            onClick={() =>
                                                addItem({ id: `bay-${b.id}`, name: `${b.bay} — ${b.fee}`, price: b.price }, "Pro Shop")
                                            }
                                            sx={{
                                                position: "absolute",
                                                top: (b.start - START_HOUR * 60) * PPM,
                                                height: b.duration * PPM,
                                                left: 3,
                                                right: 3,
                                                bgcolor: appColors.navy,
                                                color: "#fff",
                                                flexDirection: "column",
                                                alignItems: "flex-start",
                                                justifyContent: "flex-start",
                                                px: 1.25,
                                                py: 0.75,
                                                textAlign: "left",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 13, fontWeight: 500 }} noWrap>
                                                ({b.party}) {b.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: 12, opacity: 0.8 }}>
                                                {fmt(b.start)} · {b.duration}m · {money(b.price)}
                                            </Typography>
                                        </ButtonBase>
                                    ))}
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>

            <NewReservationDialog open={dialog} onClose={() => setDialog(false)} />
        </Shell>
    );
};
