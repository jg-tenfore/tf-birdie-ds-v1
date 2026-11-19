import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";

import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileEmpty, MobileFab, MobileSeatBand, MobileSectionHeading } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobilePrimary, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 8-reservations.** Laid out against `App Screens →
 * 8-reservations`.
 *
 * The restaurant's book for one day: a dark date band, a grey column header,
 * and the day's bookings underneath. Two screens, and both narrow the same way
 * — by giving up columns.
 *
 * ## The six-column header band is removed, not shrunk
 *
 * `ColumnHeaderBand` spreads `Time / Party / First Name / Last Name / Email /
 * Phone` evenly across the width. At 402px that is **67px per column**, in
 * which `First Name` itself does not fit at the band's own 17px, let alone the
 * value under it — `weston.farnsworth@tenfore.golf` needs ~230px.
 *
 * A header band exists to label columns. Once the row stacks — **time and party
 * size leading, the name / email / phone joined into the line beneath** — there
 * are no columns left to label, so the band goes rather than being kept as
 * decoration. The tablet keeps it visible on an empty day so the shape of the
 * list is legible before any rows exist; on a phone that argument dies with the
 * columns.
 *
 * ## The date band stays, and it is the reason
 *
 * `DateBand` is a 58px slate band under the app bar reading
 * `WEDNESDAY, JULY 29 2026`. It is tempting to fold that into the app bar's
 * subtitle and buy back 58 of the 725dp canvas — and it is kept anyway, because
 * this screen is *one day at a time* and the date is the only thing telling you
 * which. It also has to survive onto Create a Reservation, where the form
 * inherits the date rather than asking for it, and a subtitle on a form's app
 * bar would read as a screen description instead of as a value.
 *
 * It is rendered with `MobileSeatBand` in `appColors.slate` — the system's
 * full-bleed coloured label band, which is what `DateBand` is once its 8px
 * margin is dropped.
 *
 * ## ADD RESERVATION comes out of the app bar
 *
 * The tablet bar carries `ADD RESERVATION`, `TEST TEST ACCOUNT` and `LOG OUT`
 * as three text actions. The account and log-out live in the drawer on a phone
 * — that is already true of every screen in this category — and
 * `ADD RESERVATION` at 13px with its letterspacing measures ~135px, which is a
 * third of the bar. It becomes the floating pill instead, where a create action
 * belongs on Android and where it does not compete with the title.
 *
 * `BACK`, the sole button in the list screen's action bar, is the app bar's
 * leading affordance here — so the list screen has no action tray at all and
 * the empty state gets the full canvas.
 */

const referenceDate = "WEDNESDAY, JULY 29 2026";

/** One booking on the restaurant's book. */
export interface Reservation {
    time: string;
    party: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    /** The optional note from the create form, shown as a short tag. */
    note?: string;
}

/**
 * A booked day — the same Wednesday as the empty one, so the two stories read
 * as before and after rather than as two different screens.
 *
 * Names, emails and phones come from the shared customer seed so they match
 * what Customer Search shows for the same people.
 */
export const reservationsDay: Reservation[] = [
    { time: "11:30 AM", party: 2, firstName: "Oda", lastName: "Brennevin", email: "oda.brennevin@att.net", phone: "(801) 708-4153" },
    {
        time: "12:00 PM",
        party: 4,
        firstName: "Weston",
        lastName: "Farnsworth",
        email: "weston.farnsworth@tenfore.golf",
        phone: "(801) 708-4153",
        note: "Patio",
    },
    { time: "12:15 PM", party: 3, firstName: "Igor", lastName: "Kuznetsov", email: "igor.kuznetsov@gmail.com", phone: "(801) 554-0982" },
    {
        time: "1:00 PM",
        party: 6,
        firstName: "Tony",
        lastName: "Finau",
        email: "tony.finau@tenfore.golf",
        phone: "(801) 375-8144",
        note: "Birthday",
    },
    { time: "1:45 PM", party: 2, firstName: "Marissa", lastName: "Chen", email: "marissa.chen@tenfore.golf", phone: "(801) 440-2219" },
    { time: "5:30 PM", party: 4, firstName: "Tom", lastName: "Watson", email: "tom.watson@yahoo.com", phone: "(801) 263-0392" },
    {
        time: "6:00 PM",
        party: 8,
        firstName: "Priya",
        lastName: "Raman",
        email: "priya.raman@att.net",
        phone: "(801) 887-1046",
        note: "Member dinner",
    },
    { time: "6:30 PM", party: 2, firstName: "Chris", lastName: "Moreno", email: "chris.moreno@aol.com", phone: "(801) 332-0765" },
    { time: "7:15 PM", party: 5, firstName: "Kelsey", lastName: "Sutton", email: "kelsey.sutton@att.net", phone: "(801) 660-4417" },
];

/**
 * One booking, stacked the way the column band had to go: **time and party
 * size leading, the name / email / phone in the lines beneath.**
 *
 * The party size is right-aligned on the first line so the eye can run down the
 * covers for the day; the email and phone share the last line and give way to
 * an ellipsis before the name ever does, because the name is what a host reads
 * out at the stand.
 */
const BookingRow = ({ r }: { r: Reservation }) => (
    <Stack sx={{ px: 1.5, py: 1.25, gap: 0.25, borderBottom: `1px solid ${appColors.divider}`, bgcolor: appColors.surface }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: appColors.textPrimary }}>{r.time}</Typography>
            {r.note && (
                <Box
                    sx={{
                        px: 0.75,
                        py: 0.125,
                        borderRadius: 0.5,
                        bgcolor: appColors.canvas,
                        color: appColors.textSecondary,
                        fontSize: 12,
                    }}
                >
                    {r.note}
                </Box>
            )}
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>Party of {r.party}</Typography>
        </Stack>
        <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>
            {r.firstName} {r.lastName}
        </Typography>
        <Typography
            sx={{ fontSize: 13, color: appColors.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
            {r.email} · {r.phone}
        </Typography>
    </Stack>
);

/**
 * The day's book. Empty by default — the shipped story — or filled from
 * `bookings`, which is opt-in so the empty-day story renders unchanged.
 *
 * Reached from the drawer, so the leading is the hamburger rather than the
 * tablet's BACK.
 */
export const MobileReservationsDay = ({ drawerOpen = false, bookings }: { drawerOpen?: boolean; bookings?: Reservation[] }) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    return (
        <MobileScreen
            appBar={<MobileAppBar title="Restaurant Reservations" leading="menu" onLeading={() => setDrawer(true)} showOverflow={false} />}
            fab={<MobileFab label="Add reservation" />}
            overlay={
                drawer ? (
                    <MobileNavDrawer active="reservations" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : undefined
            }
        >
            <MobileSeatBand label={referenceDate} color={appColors.slate} />
            {/* The tablet's AntlerEmptyState draws the mark at 216×200 — over a
                quarter of the phone's 725dp canvas. `MobileEmpty` is the same
                mark and the same sentence at 88px. */}
            {bookings && bookings.length > 0 ? (
                <>
                    <MobileSectionHeading>
                        {bookings.length} reservations · {bookings.reduce((n, r) => n + r.party, 0)} guests
                    </MobileSectionHeading>
                    {bookings.map((r) => (
                        <BookingRow key={`${r.time}-${r.lastName}`} r={r} />
                    ))}
                    {/* Clear of the floating pill, so the last booking is never under it. */}
                    <Box sx={{ height: 88 }} />
                </>
            ) : (
                <MobileEmpty message="No reservations for this date." />
            )}
        </MobileScreen>
    );
};

/* ---------------------------------------------------------------- the form */

/**
 * The app's MD2 filled field, at full width.
 *
 * Same `fieldFill` grey, same underline, same placeholder-only content as
 * `FilledField` in `reservations-form.tsx`. What changes is that it no longer
 * shares a row with anything.
 */
const FilledField = ({
    placeholder,
    /** A chosen value, which prints in `textPrimary` where a placeholder does not. */
    value,
    icon,
    caret,
}: {
    placeholder: string;
    value?: string;
    icon?: boolean;
    caret?: boolean;
}) => (
    <Stack
        direction="row"
        sx={{
            gap: 1.5,
            minHeight: 54,
            px: 2,
            alignItems: "center",
            bgcolor: appColors.fieldFill,
            borderBottom: `1px solid ${appColors.textSecondary}`,
        }}
    >
        {icon && <SearchIcon sx={{ fontSize: 22, color: appColors.textPrimary }} />}
        <Typography sx={{ flex: 1, fontSize: 17, color: value ? appColors.textPrimary : appColors.textSecondary }}>
            {value ?? placeholder}
        </Typography>
        {caret && <ArrowDropDownIcon sx={{ color: appColors.textPrimary }} />}
    </Stack>
);

/**
 * Create a Reservation.
 *
 * ## Every field takes the full width
 *
 * The tablet pairs them: time beside guests, then First beside Last and Email
 * beside Phone. At 402px minus the form's own 8px insets, a pair gives each
 * field **~185px** — and the placeholders it has to hold are
 * `Enter number of guests` (~180px at 17px, before the field's 32px of padding)
 * and `Email` behind a 22px magnifier. The first overflows on day one; the
 * second wastes half a screen.
 *
 * So the six fields stack into six rows. That is 6 × 54dp plus gaps against a
 * 725dp canvas — it fits with the customer section heading and still leaves the
 * action tray pinned, which is why no field needed to be cut.
 *
 * ## The customer header splits into two lines
 *
 * The tablet prints `Customer Info --------` and
 * `Golf Course Customer ID 0` side by side. Together they measure ~330px at
 * 15px, which fits — but only just, and the trailing dashes on the first are a
 * rule drawn in text that has nothing left to rule off once the pairs stack. So
 * the label becomes the section heading and the resolved ID sits under it,
 * still above the four lookups it describes.
 *
 * ## Two buttons become one
 *
 * `BACK` + `SAVE RESERVATION`. Back is the app bar's leading arrow, so
 * `SAVE RESERVATION` takes the full width — the only thing on this screen that
 * commits anything.
 */
export const MobileCreateReservation = ({ time = "12:00 PM", customerId = 0 }: { time?: string; customerId?: number }) => (
    <MobileScreen
        appBar={<MobileAppBar title="Create a Reservation" leading="back" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Save Reservation</MobilePrimary>
            </MobileActionArea>
        }
    >
        {/* Inherited from the day list, not asked for again — the same band on
            both screens is what makes that read as inheritance. */}
        <MobileSeatBand label={referenceDate} color={appColors.slate} />

        <Stack sx={{ p: 1, gap: 1 }}>
            <FilledField placeholder="Reservation time" value={time} caret />
            <FilledField placeholder="Enter number of guests" />
            <FilledField placeholder="Enter notes (optional)" />
        </Stack>

        <MobileSectionHeading>Customer Info</MobileSectionHeading>
        <Typography sx={{ px: 1.5, pb: 1, fontSize: 14, color: appColors.textSecondary }}>Golf Course Customer ID {customerId}</Typography>

        {/* Four lookups against the golf course record, which is why each keeps
            its magnifier rather than reading as a text input. */}
        <Stack sx={{ p: 1, pt: 0, gap: 1 }}>
            <FilledField placeholder="First Name" icon />
            <FilledField placeholder="Last Name" icon />
            <FilledField placeholder="Email" icon />
            <FilledField placeholder="Phone" icon />
        </Stack>
        <Box sx={{ height: 16 }} />
    </MobileScreen>
);
