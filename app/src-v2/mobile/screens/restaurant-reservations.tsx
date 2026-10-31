import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { MobileEmpty, MobileFab, MobileRow, MobileSearch, MobileSeatBand, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobilePrimary, type MobileSheetItem } from "@/components/mobile/mobile-shell";
import { searchCustomers, type Customer } from "@/data/crm";
import { appColors } from "@/theme/app-replica-tokens";
import { RESERVATIONS } from "../../screens/restaurant-reservations";
import { TODAY, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Restaurant Reservations, on a phone.
 *
 * ## What changed from the landscape screen, and why
 *
 * **The six-column header band is removed, not shrunk.** The landscape screen
 * spreads `Time / Party / First Name / Last Name / Email / Phone` evenly across
 * a 1290px pane — 215px a column. At 402px that is **67px**, in which the words
 * `First Name` do not fit at the band's own 17px, let alone
 * `weston.farnsworth@tenfore.golf` under them, which needs ~230px. A header
 * band exists to label columns; once the row stacks there are no columns left
 * to label, so it goes rather than being kept as decoration.
 *
 * **A row leads with time and party.** `11:30 AM` with `Party 2` trailing it on
 * line 1, and `name · email · phone` joined on line 2 — the ordering the
 * Storybook mobile screen settles on. The name loses the leading position to
 * the time because this list is read *down the day*, not looked up by person.
 *
 * **The date band stays.** It is tempting to fold `WEDNESDAY, JULY 29 2026`
 * into the app bar's subtitle and buy back 30 of the 725dp canvas. It is kept
 * because this screen is one day at a time and the band is the only thing
 * saying which — and because it has to survive onto the compose step, where a
 * subtitle would read as a screen description rather than as an inherited
 * value.
 *
 * **ADD RESERVATION comes out of the app bar.** The landscape bar carries it as
 * a text action beside the account cluster; at 13px with its letterspacing that
 * is ~135px, a third of a 402px bar. It becomes the floating pill, where a
 * create action belongs on Android and where it does not compete with the
 * title. `BACK` — the sole button in the landscape action bar — is the app
 * bar's leading affordance, so the list has no action tray at all and the empty
 * state gets the whole canvas.
 *
 * ## Where the live data comes from
 *
 * The reducer has **no reservations slice**: `RestaurantReservationsScreen`
 * renders a module constant. Rather than fake liveness with component state
 * that dies on navigation, a reservation made here is written through the
 * store's existing `reserveResource` action under the resource
 * `Dining Room` — the same flat `date|resource|time` map the court sheet books
 * into, which the store documents as "a named person against a named resource
 * at a named time". A restaurant cover is exactly that. So a reservation added
 * here survives leaving the screen, and can be cancelled again through
 * `cancelResource`.
 *
 * The ten seeded covers stay a constant, imported from the landscape screen so
 * the two days cannot diverge; they carry no overflow because there is nothing
 * in the store to cancel.
 */

/** The day this screen is, on both devices. `TODAY` is 2026-07-29, a Wednesday. */
const DAY_LABEL = "WEDNESDAY, JULY 29 2026";

/** Covers booked on the phone live under this resource name. */
const RESOURCE = "Dining Room";

/** Half hours from 11:00 AM to 9:00 PM — the span the seeded day covers. */
const TIMES = Array.from({ length: 21 }, (_, i) => 11 * 60 + i * 30);

const PARTIES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

const label = (mins: number) => {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const h = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};

/** `1:00 PM` → 780. Needed only because the seeded rows store display strings. */
const minutesOf = (time: string) => {
    const [, hh, mm, mer] = /^(\d+):(\d+)\s*(AM|PM)$/.exec(time.trim()) ?? [];
    if (!hh) return 0;
    const h = Number(hh) % 12;
    return (mer === "PM" ? h + 12 : h) * 60 + Number(mm);
};

const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, "");
    return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw;
};

interface Row {
    time: string;
    party: number;
    name: string;
    contact: string;
    /** Only store-backed rows can be cancelled. */
    live: boolean;
}

export const MobileReservationsScreen = () => {
    const { state } = useStore();
    const { reserveResource, cancelResource, toast } = useActions();

    const [composing, setComposing] = useState(false);
    const [time, setTime] = useState(TIMES[2]);
    const [party, setParty] = useState(2);
    const [query, setQuery] = useState("");
    const [picked, setPicked] = useState<Customer | null>(null);
    const [field, setField] = useState<"time" | "party" | null>(null);
    const [cancelling, setCancelling] = useState<Row | null>(null);

    const results = useMemo(() => searchCustomers(query, 6, state.customers), [query, state.customers]);

    const rows: Row[] = useMemo(() => {
        const seeded: Row[] = RESERVATIONS.map((r) => ({
            time: r.time,
            party: r.party,
            name: `${r.firstName} ${r.lastName}`,
            contact: `${r.email} · ${formatPhone(r.phone)}`,
            live: false,
        }));

        // `date|resource|time` → `Name · party`. See the note at the top.
        const live: Row[] = Object.entries(state.resourceBookings)
            .filter(([key]) => key.startsWith(`${TODAY}|${RESOURCE}|`))
            .map(([key, value]) => {
                const slot = key.split("|")[2];
                const [name, size] = value.split(" · ");
                return { time: slot, party: Number(size) || 1, name, contact: "Booked on the phone", live: true };
            });

        return [...seeded, ...live].sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
    }, [state.resourceBookings]);

    const taken = (mins: number) => rows.some((r) => minutesOf(r.time) === mins);

    /* --------------------------------------------------------- compose */

    if (composing) {
        const options: Record<"time" | "party", MobileSheetItem[]> = {
            time: TIMES.map((t) => ({ label: taken(t) ? `${label(t)} — already booked` : label(t), onClick: () => setTime(t) })),
            party: PARTIES.map((p) => ({ label: `${p} ${p === 1 ? "guest" : "guests"}`, onClick: () => setParty(p) })),
        };

        return (
            <MobileShell
                title="Create a Reservation"
                active="reservations"
                leading="close"
                onLeading={() => setComposing(false)}
                showOverflow={false}
                actions={
                    <MobileActionArea>
                        <MobilePrimary
                            disabled={!picked}
                            icon={<CheckIcon sx={{ fontSize: 20 }} />}
                            onClick={() => {
                                if (!picked) return;
                                reserveResource(TODAY, RESOURCE, label(time), `${picked.displayName} · ${party}`);
                                setComposing(false);
                                setQuery("");
                                setPicked(null);
                                toast(`${label(time)} booked for ${party}`);
                            }}
                        >
                            {picked ? "Save reservation" : "Pick a customer"}
                        </MobilePrimary>
                    </MobileActionArea>
                }
                overlay={
                    field ? (
                        <MobileBottomSheet
                            onDismiss={() => setField(null)}
                            items={options[field].map((item) => ({
                                ...item,
                                onClick: () => {
                                    item.onClick?.();
                                    setField(null);
                                },
                            }))}
                        />
                    ) : undefined
                }
            >
                {/* Inherited from the day list, not asked for again — the same
                    band on both steps is what makes that read as inheritance. */}
                <MobileSeatBand label={DAY_LABEL} color={appColors.slate} />

                <MobileSectionHeading>Reservation</MobileSectionHeading>
                {/* The landscape form pairs time beside guests. At 402px minus
                    the form's own insets a pair gives each ~185px, and
                    `Enter number of guests` is ~180px at 17px before the
                    field's padding. So they stack, and each is picked rather
                    than typed. */}
                <MobileRow title="Time" trailing={label(time)} drills dense onClick={() => setField("time")} />
                <MobileRow title="Guests" trailing={String(party)} drills dense onClick={() => setField("party")} />
                {taken(time) && (
                    <Typography sx={{ px: 1.5, pt: 1, fontSize: 13, color: appColors.orange }}>
                        {label(time)} already has a cover. The landscape screen has no table assignment either, so nothing stops a double
                        booking but the host.
                    </Typography>
                )}

                <MobileSectionHeading>Customer Info</MobileSectionHeading>
                {picked ? (
                    <>
                        <MobileRow title={picked.displayName} subtitle={picked.email} />
                        {picked.phone && <MobileRow title="Phone" trailing={formatPhone(picked.phone)} dense />}
                        <Typography sx={{ px: 1.5, pt: 1, fontSize: 13, color: appColors.textSecondary }}>
                            Golf Course Customer ID {picked.courseId}
                        </Typography>
                    </>
                ) : (
                    <>
                        {/* The landscape form's four lookups — first, last,
                            email, phone — all search one customer list, so the
                            phone runs one field over the same `searchCustomers`
                            rather than four fields over the same results. */}
                        <MobileSearch placeholder="Name, email, or phone" value={query} onChange={setQuery} />
                        {query.trim().length < 2 ? (
                            <Typography sx={{ px: 1.5, fontSize: 13, color: appColors.textSecondary }}>
                                Golf Course Customer ID 0 until a record is picked.
                            </Typography>
                        ) : results.length === 0 ? (
                            <Typography sx={{ px: 1.5, fontSize: 15 }}>
                                No customer matches &ldquo;{query.trim()}&rdquo;. New customers are created at the counter terminal.
                            </Typography>
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

    /* ------------------------------------------------------------ day */

    return (
        <MobileShell
            title="Restaurant Reservations"
            active="reservations"
            showOverflow={false}
            fab={<MobileFab label="Add reservation" onClick={() => setComposing(true)} />}
            overlay={
                cancelling ? (
                    <MobileBottomSheet
                        onDismiss={() => setCancelling(null)}
                        items={[
                            {
                                label: `Cancel ${cancelling.time} · ${cancelling.name}`,
                                icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,
                                destructive: true,
                                onClick: () => {
                                    cancelResource(TODAY, RESOURCE, cancelling.time);
                                    setCancelling(null);
                                },
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            <MobileSeatBand label={DAY_LABEL} color={appColors.slate} />

            {rows.length === 0 ? (
                <MobileEmpty message="No reservations for this date." />
            ) : (
                <>
                    <MobileSectionHeading>
                        {rows.length} covers · {rows.reduce((n, r) => n + r.party, 0)} guests
                    </MobileSectionHeading>
                    {rows.map((r) => (
                        <MobileRow
                            key={`${r.time}-${r.name}`}
                            title={r.time}
                            subtitle={`${r.name} · ${r.contact}`}
                            trailing={`Party ${r.party}`}
                            accent={r.live ? appColors.greenTee : undefined}
                            // Only a store-backed cover is tappable, because it
                            // is the only one there is anything to do to. A
                            // nested overflow button inside a row button would
                            // also be a button inside a button.
                            onClick={r.live ? () => setCancelling(r) : undefined}
                        />
                    ))}
                    <Box sx={{ height: 72 }} />
                </>
            )}
        </MobileShell>
    );
};
