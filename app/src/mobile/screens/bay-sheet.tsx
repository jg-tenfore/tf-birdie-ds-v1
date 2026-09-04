import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { useNavigate } from "react-router-dom";

import {
    MobileFab,
    MobileFilterTabs,
    MobileRow,
    MobileSeatBand,
    MobileSectionHeading,
    MobileSearch,
} from "@/components/mobile/mobile-parts";
import {
    MobileActionArea,
    MobileBottomSheet,
    MobilePrimary,
    MobileSecondary,
    MobileSecondaryRow,
    type MobileSheetItem,
} from "@/components/mobile/mobile-shell";
import { searchCustomers, type Customer } from "@/data/crm";
import { appColors } from "@/theme/app-replica-tokens";
import { BAYS, END_HOUR, START_HOUR, fmt } from "../../screens/bay-sheet";
import { longDate } from "../../screens/court-sheet";
import { TODAY, money, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Bay Sheet, on a phone.
 *
 * Reads `state.bayBookings` and writes through `addBayBooking`, so a booking
 * created here is drawn as a block on the counter terminal's timeline a second
 * later — same array, same reducer.
 *
 * ## What changed from the landscape screen, and why
 *
 * **A true timeline became a list of half hours.** `BaySheetScreen` is a
 * continuous time axis: a 112px gutter, six bay columns, a rule every 15
 * minutes, and bookings drawn as absolutely positioned blocks whose **height is
 * their duration** at 3.3 px/minute. Two things break at 402px. Six columns
 * beside the 112px gutter leaves **48px a bay** — a block that cannot print
 * `Red Bay`, let alone a name, a party size and PAID/UNPAID as the landscape
 * block does on four stacked lines. And height-as-duration stops reading in a
 * 48px strip: a 90-minute block is 297px tall and 48px wide, which looks like a
 * rendering fault rather than an hour and a half.
 *
 * So the axis stays — the same 8 half hours from `START_HOUR` 10 to `END_HOUR`
 * 14 — and the *bays* become a switcher.
 *
 * **`All bays` is the first tab and the important one.** The question this
 * sheet is opened for is almost never *what is Red Bay doing*, it is **what is
 * free at 11:30** — one glance across a row on the tablet. Dropping to one bay
 * at a time would destroy that, so `All bays` keeps it as a single column: one
 * row per half hour with how many of the six are free on the right. It says
 * *four of six free*; it does not say *which four* without a tap. That is the
 * honest limit of one column and the right trade — the count answers the
 * booking question, the tap answers the assignment question.
 *
 * **Duration becomes a word.** `90 min` where the tablet had a block three
 * rules tall. A continuing booking prints `Continues` on the half hours it
 * covers, because a list has no way to show a block spanning rows.
 *
 * **ZOOM OUT is gone.** It exists because the grid is height-bound. A list
 * scrolls, so the control has nothing left to do; drawing it as a button that
 * changes nothing visible would be worse than dropping it.
 *
 * **The full-screen dialog became a step in this route, not a route.**
 * `NewReservationDialog` is a `fullScreen` MUI Dialog with 4 fields laid
 * three-across on two rows. Three across at 402px is 134px a value, and
 * `Start at: - 11:30 AM +` alone needs ~230px. So the rows unfold into one
 * column and each bare `- value +` stepper becomes a **tap-to-pick row**: three
 * targets beside a label all land under the 44dp floor at this width, and a
 * bounded value on a phone is picked, not stepped. It is a screen state rather
 * than a sixth route because it has no URL worth deep-linking — it is a
 * modal that happens to fill the frame.
 *
 * **The date is shown but not stored, and the screen says so.** `BayBooking`
 * carries `start` as minutes-from-midnight and **no date at all**, so the
 * landscape sheet draws every booking on every day. That is the store's shape,
 * not a phone limitation, so it is reproduced rather than papered over — and
 * the compose form's Date row is read-only with the reason on it.
 */

/** The landscape sheet's window, in half hours: 10:00 AM through 1:30 PM. */
const TIMES = Array.from({ length: ((END_HOUR - START_HOUR) * 60) / 30 }, (_, i) => START_HOUR * 60 + i * 30);

const DURATIONS = [30, 60, 90, 120];
const PARTIES = [1, 2, 3, 4, 5, 6, 7, 8];

const ALL = "All bays";

/** The landscape dialog's own arithmetic: a Sim Hour is $45 an hour. */
const priceFor = (duration: number) => (duration / 60) * 45;

type Field = "bay" | "party" | "start" | "duration";

/** Wraps each picker row so choosing a value also closes the sheet. */
const pick = (items: MobileSheetItem[], close: () => void): MobileSheetItem[] =>
    items.map((item) => ({
        ...item,
        onClick: () => {
            item.onClick?.();
            close();
        },
    }));

/* ------------------------------------------------------------------ sheet */

export const MobileBaySheetScreen = () => {
    const navigate = useNavigate();
    const { state } = useStore();
    const { addItem, addBayBooking, setCourtDate, shiftCourtDate, toast } = useActions();

    const [tab, setTab] = useState(ALL);
    const [dateSheet, setDateSheet] = useState(false);

    /* The compose step. `bay` and `start` are seeded by whichever slot was
       tapped, so the form opens already answering two of its six rows. */
    const [composing, setComposing] = useState(false);
    const [bay, setBay] = useState(BAYS[0]);
    const [party, setParty] = useState(1);
    const [start, setStart] = useState(TIMES[0]);
    const [duration, setDuration] = useState(90);
    const [query, setQuery] = useState("");
    const [picked, setPicked] = useState<Customer | null>(null);
    const [field, setField] = useState<Field | null>(null);

    const results = useMemo(() => searchCustomers(query, 6, state.customers), [query, state.customers]);
    const isToday = state.courtDate === TODAY;
    const isAll = tab === ALL;

    /** Every booking covering this half hour, optionally in one bay. */
    const covering = (mins: number, name?: string) =>
        state.bayBookings.filter((b) => b.start <= mins && mins < b.start + b.duration && (name === undefined || b.bay === name));

    const compose = (nextBay: string, nextStart: number) => {
        setBay(nextBay);
        setStart(nextStart);
        setComposing(true);
    };

    /* --------------------------------------------------------- compose */

    if (composing) {
        const options: Record<Field, MobileSheetItem[]> = {
            bay: BAYS.map((b) => ({ label: b, onClick: () => setBay(b) })),
            party: PARTIES.map((p) => ({ label: `${p} ${p === 1 ? "guest" : "guests"}`, onClick: () => setParty(p) })),
            start: TIMES.map((t) => ({ label: fmt(t), onClick: () => setStart(t) })),
            duration: DURATIONS.map((d) => ({ label: `${d} min · ${money(priceFor(d))}`, onClick: () => setDuration(d) })),
        };

        const name = picked?.displayName ?? "";

        return (
            <MobileShell
                title="New Booking"
                subtitle={`${bay} · ${fmt(start)}`}
                active="baysheet"
                leading="close"
                onLeading={() => setComposing(false)}
                showOverflow={false}
                actions={
                    <MobileActionArea>
                        <MobilePrimary
                            icon={<CheckIcon sx={{ fontSize: 20 }} />}
                            onClick={() => {
                                addBayBooking({
                                    bay,
                                    start,
                                    duration,
                                    name: name || "Walk-up",
                                    party,
                                    fee: "Sim Hour",
                                    price: priceFor(duration),
                                });
                                setComposing(false);
                                setTab(bay);
                                setQuery("");
                                setPicked(null);
                                toast(`${bay} booked at ${fmt(start)}`);
                            }}
                        >
                            Create · {money(priceFor(duration))}
                        </MobilePrimary>
                    </MobileActionArea>
                }
                overlay={
                    field ? (
                        <MobileBottomSheet onDismiss={() => setField(null)} items={pick(options[field], () => setField(null))} />
                    ) : undefined
                }
            >
                <MobileSectionHeading>Booking</MobileSectionHeading>
                <MobileRow title="Bay" trailing={bay} drills dense onClick={() => setField("bay")} />
                <MobileRow title="Party size" trailing={String(party)} drills dense onClick={() => setField("party")} />
                <MobileRow title="Start at" trailing={fmt(start)} drills dense onClick={() => setField("start")} />
                <MobileRow title="Duration" trailing={`${duration} min`} drills dense onClick={() => setField("duration")} />
                {/* Fixed on the device too — the landscape dialog prints
                    `Fee: Sim Hour` with no control beside it. */}
                <MobileRow title="Fee" trailing="Sim Hour" dense />
                <MobileRow title="Date" trailing={longDate(state.courtDate)} dense />
                <Typography sx={{ px: 1.5, pt: 0.5, fontSize: 12, color: appColors.textSecondary }}>
                    A bay booking stores a start time and no date, so it shows on every day of the sheet. That is the store&rsquo;s shape,
                    not the phone&rsquo;s.
                </Typography>

                <MobileSectionHeading>Who it is for</MobileSectionHeading>
                {picked ? (
                    <>
                        <MobileRow title={picked.displayName} subtitle={picked.email} />
                        <Box sx={{ px: 1.5, pt: 1 }}>
                            <MobileSecondaryRow>
                                <MobileSecondary
                                    tone="muted"
                                    onClick={() => {
                                        setPicked(null);
                                        setQuery("");
                                    }}
                                >
                                    Choose someone else
                                </MobileSecondary>
                            </MobileSecondaryRow>
                        </Box>
                    </>
                ) : (
                    <>
                        {/* The landscape dialog's two name fields and its email
                            field are three lookups against one customer list, so
                            on a phone they are one. Picking a result is what
                            makes the booking name a record rather than a string. */}
                        <MobileSearch placeholder="Customer name or email" value={query} onChange={setQuery} />
                        {query.trim().length < 2 ? (
                            <Typography sx={{ px: 1.5, fontSize: 13, color: appColors.textSecondary }}>
                                Leave it blank to book a walk-up.
                            </Typography>
                        ) : results.length === 0 ? (
                            <Typography sx={{ px: 1.5, fontSize: 15 }}>No customer matches &ldquo;{query.trim()}&rdquo;.</Typography>
                        ) : (
                            results.map((c) => (
                                <MobileRow key={c.id} title={c.displayName} subtitle={c.email} drills onClick={() => setPicked(c)} />
                            ))
                        )}
                    </>
                )}
                <Box sx={{ height: 16 }} />
            </MobileShell>
        );
    }

    /* ----------------------------------------------------------- sheet */

    return (
        <MobileShell
            title="Bay Sheet"
            subtitle={longDate(state.courtDate)}
            active="baysheet"
            onOverflow={() => setDateSheet(true)}
            fab={<MobileFab label="New Booking" onClick={() => compose(isAll ? BAYS[0] : tab, TIMES[0])} />}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary onClick={() => navigate("/proshop")}>Pro Shop</MobileSecondary>
                        <MobileSecondary onClick={() => navigate("/tables")}>Tables</MobileSecondary>
                    </MobileSecondaryRow>
                </MobileActionArea>
            }
            overlay={
                dateSheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setDateSheet(false)}
                        items={[
                            {
                                label: "Previous day",
                                icon: <ChevronLeftIcon sx={{ fontSize: 22 }} />,
                                onClick: () => {
                                    shiftCourtDate(-1);
                                    setDateSheet(false);
                                },
                            },
                            {
                                label: "Go to today",
                                icon: <TodayIcon sx={{ fontSize: 22 }} />,
                                onClick: () => {
                                    setCourtDate(TODAY);
                                    setDateSheet(false);
                                },
                            },
                            {
                                label: "Next day",
                                icon: <ChevronRightIcon sx={{ fontSize: 22 }} />,
                                onClick: () => {
                                    shiftCourtDate(1);
                                    setDateSheet(false);
                                },
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            {!isToday && <MobileSeatBand label={`NOT TODAY — ${longDate(state.courtDate)}`} color={appColors.orange} />}

            <MobileFilterTabs tabs={[ALL, ...BAYS]} active={tab} onChange={setTab} />

            <MobileSectionHeading>{isAll ? `${BAYS.length} bays · half-hour slots` : tab}</MobileSectionHeading>
            <Typography sx={{ px: 1.5, pb: 1, fontSize: 12, color: appColors.textSecondary }}>
                {isAll
                    ? "How many bays are free, not which — one column can answer the booking question or the assignment question, and this is the one you open the sheet for. Tap a bay above for the other."
                    : "The tablet draws a booking as a block whose height is its duration. A list prints the minutes instead."}
            </Typography>

            {TIMES.map((mins) => {
                if (isAll) {
                    const taken = covering(mins).length;
                    return (
                        <MobileRow
                            key={mins}
                            title={fmt(mins)}
                            trailing={`${BAYS.length - taken} of ${BAYS.length} open`}
                            accent={taken === BAYS.length ? appColors.orange : undefined}
                            dense
                            onClick={() => compose(BAYS.find((b) => covering(mins, b).length === 0) ?? BAYS[0], mins)}
                        />
                    );
                }

                const here = covering(mins, tab);
                const starting = here.find((b) => b.start >= mins && b.start < mins + 30);

                if (starting) {
                    return (
                        <MobileRow
                            key={mins}
                            title={fmt(mins)}
                            subtitle={`${starting.name} · ${starting.party} ${starting.party === 1 ? "guest" : "guests"} · ${starting.fee}`}
                            trailing={`${starting.duration} min · ${starting.paid ? "PAID" : "UNPAID"}`}
                            accent={appColors.orange}
                            dense
                            // The landscape block rings the fee into the cart on
                            // tap. Same action, same line, same price.
                            onClick={() => {
                                addItem(
                                    { id: `bay-${starting.id}`, name: `${starting.bay} — ${starting.fee}`, price: starting.price },
                                    "Pro Shop",
                                );
                                navigate("/pay");
                            }}
                        />
                    );
                }

                if (here.length > 0) {
                    return (
                        <MobileRow key={mins} title={fmt(mins)} trailing={`Continues · ${here[0].name}`} accent={appColors.orange} dense />
                    );
                }

                return <MobileRow key={mins} title={fmt(mins)} trailing="Open" dense onClick={() => compose(tab, mins)} />;
            })}

            {/* The pill floats over the body; the spacer stops it covering the
                last slot. */}
            <Box sx={{ height: 72 }} />
        </MobileShell>
    );
};
