import { useMemo, useState } from "react";

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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";

import { CustomerLookupResults } from "@/components/screens/operations/customer-lookup";
import { searchCustomers, type Customer } from "@/data/crm";
import { TODAY, useActions, useStore } from "../store";

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

const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const DOW = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const longDate = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
};

/** Orange means you are not looking at today — the same rule as every sheet. */
const DateBar = () => {
    const { state } = useStore();
    const { setCourtDate, shiftCourtDate } = useActions();
    const isToday = state.courtDate === TODAY;

    return (
        <Stack direction="row" sx={{ gap: "6px", p: "6px", bgcolor: appColors.canvas }}>
            <ButtonBase
                aria-label="Previous day"
                onClick={() => shiftCourtDate(-1)}
                sx={{ bgcolor: appColors.green, width: 190, color: "#fff", fontSize: 26, lineHeight: 1, py: 1.75 }}
            >
                ‹
            </ButtonBase>
            <Box
                sx={{
                    flex: 3,
                    bgcolor: isToday ? appColors.slate : appColors.orange,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    letterSpacing: "0.08em",
                }}
            >
                {longDate(state.courtDate)}
            </Box>
            <ButtonBase
                disabled={isToday}
                onClick={() => setCourtDate(TODAY)}
                sx={{ flex: 2, bgcolor: isToday ? appColors.grey : appColors.slate, color: "#fff", fontSize: 14, letterSpacing: "0.08em" }}
            >
                GO TO TODAY
            </ButtonBase>
            <ButtonBase
                aria-label="Next day"
                onClick={() => shiftCourtDate(1)}
                sx={{ bgcolor: appColors.green, width: 190, color: "#fff", fontSize: 26, lineHeight: 1 }}
            >
                ›
            </ButtonBase>
        </Stack>
    );
};

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

const Field = ({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (next: string) => void }) => (
    <Stack
        direction="row"
        sx={{ alignItems: "center", border: "1px solid", borderColor: "#B9BEC4", borderRadius: "3px", px: 2, height: 66, flex: 1 }}
    >
        <InputBase
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            sx={{ flex: 1, fontSize: 19 }}
        />
        <SearchIcon sx={{ color: appColors.textPrimary }} />
    </Stack>
);

const NewReservationDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { addBayBooking } = useActions();
    const { state } = useStore();
    const customers = state.customers;
    const [bayIndex, setBayIndex] = useState(0);
    const [party, setParty] = useState(1);
    const [start, setStart] = useState(11 * 60 + 30);
    const [duration, setDuration] = useState(90);
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [email, setEmail] = useState("");
    const [picked, setPicked] = useState<Customer | null>(null);
    const [emailQuery, setEmailQuery] = useState("");
    const emailHits = useMemo(() => searchCustomers(emailQuery, 5, customers), [emailQuery, customers]);

    // Either field searches — a member is as likely to be found by surname.
    const lookup = useMemo(() => searchCustomers(`${first} ${last}`.trim() || first || last, 5, customers), [first, last, customers]);

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

                {/*
                 * The layout is the device's — two name fields side by side with a
                 * magnifier in each, then Email — but the magnifiers now do
                 * something. Typing in either searches the customer database and
                 * picking a result fills all three, so a bay booking names a real
                 * record instead of whatever was typed. A booking against free text
                 * can never be matched back to a customer.
                 */}
                <Stack direction="row" spacing={2} sx={{ mb: 2, position: "relative" }}>
                    {(
                        [
                            ["First Name", first, setFirst],
                            ["Last Name", last, setLast],
                        ] as const
                    ).map(([placeholder, value, set]) => (
                        <Stack
                            key={placeholder}
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
                                value={value}
                                onChange={(e) => {
                                    set(e.target.value);
                                    setPicked(null);
                                }}
                                placeholder={placeholder}
                                sx={{ flex: 1, fontSize: 19 }}
                            />
                            <SearchIcon />
                        </Stack>
                    ))}

                    {!picked && lookup.length > 0 && (
                        <Box sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, mt: "2px" }}>
                            <CustomerLookupResults
                                results={lookup}
                                query={`${first} ${last}`.trim()}
                                onPick={(c) => {
                                    setFirst(c.firstName);
                                    setLast(c.lastName);
                                    setEmail(c.email);
                                    setPicked(c);
                                }}
                            />
                        </Box>
                    )}
                </Stack>
                <Box sx={{ position: "relative" }}>
                    <Field
                        placeholder="Email"
                        value={email}
                        onChange={(v) => {
                            setEmail(v);
                            setPicked(null);
                            setEmailQuery(v);
                        }}
                    />
                    {!picked && emailQuery.trim().length >= 2 && emailHits.length > 0 && (
                        <Box sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, mt: "2px" }}>
                            <CustomerLookupResults
                                results={emailHits}
                                onPick={(c) => {
                                    setFirst(c.firstName);
                                    setLast(c.lastName);
                                    setEmail(c.email);
                                    setEmailQuery("");
                                    setPicked(c);
                                }}
                            />
                        </Box>
                    )}
                </Box>

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
                                                // Orange, not navy — a bay booking is
                                                // its own colour on this sheet, and
                                                // the block's height is its duration.
                                                bgcolor: appColors.orange,
                                                color: "#fff",
                                                flexDirection: "column",
                                                alignItems: "stretch",
                                                justifyContent: "flex-start",
                                                px: 1.25,
                                                py: 0.75,
                                                textAlign: "left",
                                                borderRadius: "3px",
                                            }}
                                        >
                                            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                                                <PersonIcon sx={{ fontSize: 17 }} />
                                                <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600 }} noWrap>
                                                    {b.name}
                                                </Typography>
                                                <GroupsIcon sx={{ fontSize: 17 }} />
                                                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{b.party}</Typography>
                                            </Stack>

                                            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                <Typography sx={{ fontSize: 13 }}>{fmt(b.start)}</Typography>
                                            </Stack>

                                            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                                                <GolfCourseIcon sx={{ fontSize: 16 }} />
                                                <Typography sx={{ fontSize: 13 }} noWrap>
                                                    {b.fee}
                                                </Typography>
                                            </Stack>

                                            {/*
                                             * UNPAID is bold italic with a struck-out
                                             * bolt — the block says what it owes but
                                             * never what it costs, so the amount is
                                             * only knowable by opening it.
                                             */}
                                            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                                                <FlashOffIcon sx={{ fontSize: 16 }} />
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, fontStyle: "italic" }}>
                                                    {b.paid ? "PAID" : "UNPAID"}
                                                </Typography>
                                            </Stack>
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
