import { useMemo, useState } from "react";

import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams } from "react-router-dom";

import { MobileEmpty, MobileRow, MobileSearch, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { searchCustomers, type Customer } from "@/data/crm";
import { appColors } from "@/theme/app-replica-tokens";
import { longDate } from "../../screens/court-sheet";
import { useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";
import { courtKey } from "./court-sheet";

/**
 * Reserving a court slot, on a phone.
 *
 * The same one screen for a named person against a named resource at a named
 * time, writing the same `date|resource|time` key through the same
 * `reserveResource` / `cancelResource` actions. Book a slot here and it is on
 * the sheet when you come back — and on the counter terminal's sheet too,
 * because it is one reducer.
 *
 * ## What changed from the landscape screen, and why
 *
 * **The day is named.** The landscape title is
 * `Weekday Court Schedule - 7:20 AM` and the resource appears again on the card
 * below, so the thing being booked is named twice and the *day* not at all —
 * the file says so itself. At 402px there is no room to name anything twice, so
 * the resource takes the title, and `7:20 AM · WEDNESDAY, JULY 29 2026` takes
 * the subtitle. The 20 characters spent on "Weekday Court Schedule" buy the
 * date instead.
 *
 * **Two search fields became one.** The landscape header runs a 2fr customer
 * field beside a 1fr `Member Number…` field on a 1290px band. At 402px that is
 * 268px and 134px, and `Member Number…` is ~120px of placeholder in a 134px
 * box. The member-number path is dropped rather than shrunk: every record it
 * would find is already findable by name, email or phone in the field beside
 * it.
 *
 * **Results are a list, not a dropdown.** The landscape results hang off the
 * field in a 69%-wide absolute layer over the bands below. Floating a menu over
 * a 402px screen covers the whole screen, so the results simply *are* the body
 * until one is picked — which is also what the phone's Customer Search does.
 *
 * **RESERVE no longer doubles as "create this person".** On the terminal an
 * empty RESERVE navigates to Add a New Customer. There is no `/customers/new`
 * on the phone build, so rather than route to a dead end the primary stays
 * disabled and says what it wants — `Pick a customer`. That is a real
 * capability the phone does not have, and it is stated here rather than faked.
 *
 * **CANCEL and RESERVE stop sharing a row.** They are 1290px apart on the
 * terminal, where confusing them is impossible. Stacked at 402px they would be
 * two 52dp buttons a thumb-width apart, so only one of them is ever the
 * primary: an open slot gets green `Reserve`, a booked slot gets red
 * `Cancel reservation`, and the harmless escape lives on the app bar's ✕.
 */

const RESULT_LIMIT = 6;

/** `(617) 470-7879` — the reserved card formats, the search results do not. */
const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, "");
    return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw;
};

export const MobileResourceReservationScreen = () => {
    const { resource = "", time = "" } = useParams();
    const decodedResource = decodeURIComponent(resource);
    const decodedTime = decodeURIComponent(time);

    const navigate = useNavigate();
    const { state } = useStore();
    const { reserveResource, cancelResource } = useActions();

    const [query, setQuery] = useState("");
    const [picked, setPicked] = useState<Customer | null>(null);

    const results = useMemo(() => searchCustomers(query, RESULT_LIMIT, state.customers), [query, state.customers]);

    const booked = state.resourceBookings[courtKey(state.courtDate, decodedResource, decodedTime)];
    // The slot stores a display name, so the record is looked back up to print
    // the contact lines — exactly as the landscape card does.
    const holder = booked ? (state.customers.find((c) => c.displayName === booked) ?? null) : null;

    const back = () => navigate("/coursheet");

    return (
        <MobileShell
            title={decodedResource}
            subtitle={`${decodedTime} · ${longDate(state.courtDate)}`}
            active="courtsheet"
            leading="close"
            onLeading={back}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    {booked ? (
                        <>
                            <MobileSecondaryRow>
                                <MobileSecondary onClick={back}>Back to sheet</MobileSecondary>
                            </MobileSecondaryRow>
                            <MobilePrimary
                                tone="destructive"
                                icon={<CloseIcon sx={{ fontSize: 20 }} />}
                                onClick={() => {
                                    cancelResource(state.courtDate, decodedResource, decodedTime);
                                    back();
                                }}
                            >
                                Cancel reservation
                            </MobilePrimary>
                        </>
                    ) : (
                        <>
                            {picked && (
                                <MobileSecondaryRow>
                                    <MobileSecondary tone="muted" onClick={() => setPicked(null)}>
                                        Choose someone else
                                    </MobileSecondary>
                                </MobileSecondaryRow>
                            )}
                            <MobilePrimary
                                disabled={!picked}
                                icon={<CheckIcon sx={{ fontSize: 20 }} />}
                                onClick={() => {
                                    if (!picked) return;
                                    reserveResource(state.courtDate, decodedResource, decodedTime, picked.displayName);
                                    back();
                                }}
                            >
                                {picked ? `Reserve for ${picked.firstName}` : "Pick a customer"}
                            </MobilePrimary>
                        </>
                    )}
                </MobileActionArea>
            }
        >
            {booked ? (
                <>
                    <MobileSectionHeading>Reserved</MobileSectionHeading>
                    <MobileRow title={holder?.displayName ?? booked} subtitle={holder?.email} />
                    {holder?.phone && <MobileRow title="Phone" trailing={formatPhone(holder.phone)} dense />}
                    {holder?.memberships[0] && <MobileRow title="Membership" trailing={holder.memberships[0].name} dense />}
                    {holder && <MobileRow title="Rewards balance" trailing={String(holder.rewardsBalance)} dense />}
                    <Typography sx={{ px: 1.5, py: 2, fontSize: 13, color: appColors.textSecondary }}>
                        Cancelling releases {decodedTime} on {decodedResource} and returns you to the sheet.
                    </Typography>
                </>
            ) : picked ? (
                <>
                    <MobileSectionHeading>Booking for</MobileSectionHeading>
                    <MobileRow title={picked.displayName} subtitle={picked.email} />
                    {/* The landscape SummaryBand's three cells, stacked. Three
                        across at 402px is 134px a cell and
                        `Current Membership(s)` alone is ~150px at 13px. */}
                    <MobileRow title="Membership" trailing={picked.memberships[0]?.name ?? "None"} dense />
                    <MobileRow title="Rewards balance" trailing={String(picked.rewardsBalance)} dense />
                    {picked.phone && <MobileRow title="Phone" trailing={formatPhone(picked.phone)} dense />}
                </>
            ) : (
                <>
                    <MobileSearch placeholder="Customer name, email, or phone" value={query} onChange={setQuery} />
                    {query.trim().length < 2 ? (
                        <MobileEmpty message={`${decodedTime} is open. Search for the person it is for.`} />
                    ) : results.length === 0 ? (
                        <Typography sx={{ px: 1.5, py: 2, fontSize: 15 }}>
                            No customer matches &ldquo;{query.trim()}&rdquo;. New customers are created at the counter terminal.
                        </Typography>
                    ) : (
                        results.map((c) => (
                            <MobileRow key={c.id} title={c.displayName} subtitle={c.email} drills onClick={() => setPicked(c)} />
                        ))
                    )}
                </>
            )}
        </MobileShell>
    );
};
