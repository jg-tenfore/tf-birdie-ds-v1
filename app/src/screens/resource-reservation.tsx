import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { CustomerLookupResults } from "@/components/screens/operations/customer-lookup";
import { searchCustomers, type Customer } from "@/data/crm";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { useActions, useStore } from "../store";

/**
 * Reserving a court or a bay, from `references/072926/3-coursheet/`.
 *
 * One screen for both, because the two sheets book identically: a named person
 * against a named resource at a named time. The title is the schedule and the
 * time, and the resource itself only appears on the card below — so the thing you
 * are booking is named twice and the *day* not at all, which is worth flagging.
 *
 * The summary band is the tee sheet's minus the Rounds column, since a court
 * booking is not a round of golf. RESERVE stays dark and inert until a customer
 * has been picked: there is no such thing as an anonymous court reservation, and
 * the device offers no way to make one.
 *
 * Search runs against the store's customer list rather than the imported
 * fixture, so somebody created at the counter is findable a second later.
 */

const RESULT_LIMIT = 6;

/** `(617) 470-7879` — the reserved card formats, the search results do not. */
const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, "");
    return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw;
};

const SummaryBand = ({ customer }: { customer: Customer | null }) => (
    <Stack direction="row" sx={{ bgcolor: appColors.slate, color: "#fff", px: 3, py: 2, alignItems: "center" }}>
        {[
            ["Customer", customer ? customer.displayName : "--------"],
            ["Current Membership(s)", customer?.memberships[0]?.name ?? "--------"],
            ["Rewards Balance:", customer ? String(customer.rewardsBalance) : "--------"],
        ].map(([label, value]) => (
            <Stack key={label} sx={{ flex: 1, alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontSize: 13 }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,.75)" }} noWrap>
                    {value}
                </Typography>
            </Stack>
        ))}
    </Stack>
);

export const ResourceReservationScreen = () => {
    const { resource = "", time = "" } = useParams();
    const decodedResource = decodeURIComponent(resource);
    const decodedTime = decodeURIComponent(time);

    const { state } = useStore();
    const { reserveResource, cancelResource } = useActions();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    // Coming back from "add a new customer" carries the id it just created, so the
    // operator does not have to search for the person they just typed in.
    const [query, setQuery] = useState("");
    const [picked, setPicked] = useState<Customer | null>(() => {
        const id = params.get("customer");
        return id ? state.customers.find((c) => c.id === id) ?? null : null;
    });

    const results = useMemo(() => searchCustomers(query, RESULT_LIMIT, state.customers), [query, state.customers]);
    const booked = state.resourceBookings[`${state.courtDate}|${decodedResource}|${decodedTime}`];
    // The slot stores a display name, so the record is looked back up to print the
    // contact lines the reserved card shows.
    const holder = booked ? (state.customers.find((c) => c.displayName === booked) ?? null) : null;

    const back = () => navigate("/coursheet");

    return (
        <Shell
            // "Weekday Court Schedule" is the schedule's name, not the day's —
            // the date is nowhere on this screen.
            title={`Weekday Court Schedule - ${decodedTime}`}
            active="courtsheet"
            topBarRight={null}
            actionBar={
                <>
                    <ActionButton icon={<SportsTennisIcon />} onClick={back}>
                        Court Sheet
                    </ActionButton>
                    <ActionButton icon={<CalendarMonthIcon />} onClick={() => navigate("/teesheet")}>
                        Tee Sheet
                    </ActionButton>
                    <ActionButton icon={<StorefrontIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%" }}>
                <Stack direction="row" sx={{ bgcolor: "#E3E3E3", px: 3, py: 2.5, gap: 4, position: "relative" }}>
                    <InputBase
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by customer name, email, or phone…"
                        sx={{ flex: 2, fontSize: 20 }}
                    />
                    <InputBase placeholder="Member Number…" sx={{ flex: 1, fontSize: 20 }} />

                    {/* Results hang off the field, over the bands below. */}
                    {query.trim().length >= 2 && (
                        <Box
                            sx={{ position: "absolute", top: "100%", left: 0, width: "69%", zIndex: 20 }}
                        >
                            <CustomerLookupResults
                                results={results}
                                query={query.trim()}
                                onPick={(c) => {
                                    setPicked(c);
                                    setQuery("");
                                }}
                                onCreate={() =>
                                    navigate(
                                        `/customers/new?return=${encodeURIComponent(`/coursheet/${resource}/${time}`)}&name=${encodeURIComponent(query.trim())}`,
                                    )
                                }
                            />
                        </Box>
                    )}
                </Stack>

                <SummaryBand customer={picked} />

                <Box sx={{ m: 1.5, bgcolor: "#fff", border: `1px solid ${appColors.divider}`, borderRadius: 1, p: 2.5 }}>
                    <Typography sx={{ fontSize: 30, mb: 2 }}>{decodedResource}</Typography>

                    {/*
                     * Reserved: the card grows the customer's name, email and
                     * formatted phone, Cancel turns red because it now destroys
                     * something, and Reserve greys out because there is nothing
                     * left to reserve.
                     */}
                    {holder && (
                        <Stack sx={{ mb: 2, gap: 0.25 }}>
                            <Typography sx={{ fontSize: 21, color: appColors.textSecondary }}>{holder.displayName}</Typography>
                            {holder.email && (
                                <Typography sx={{ fontSize: 21, color: appColors.textSecondary }}>{holder.email}</Typography>
                            )}
                            {holder.phone && (
                                <Typography sx={{ fontSize: 21, color: appColors.textSecondary }}>{formatPhone(holder.phone)}</Typography>
                            )}
                        </Stack>
                    )}
                    {booked && !holder && (
                        <Typography sx={{ fontSize: 21, color: appColors.textSecondary, mb: 2 }}>{booked}</Typography>
                    )}

                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <ButtonBase
                            onClick={() => {
                                if (booked) cancelResource(state.courtDate, decodedResource, decodedTime);
                                back();
                            }}
                            sx={{
                                gap: 1,
                                px: 2.5,
                                py: 1.5,
                                // Red only when it will actually undo a booking.
                                bgcolor: booked ? appColors.clockOutRed : appColors.grey,
                                color: "#fff",
                                fontSize: 17,
                                fontWeight: 700,
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                            Cancel
                        </ButtonBase>

                        {/* Inert until a customer is picked — there is no anonymous
                            court reservation. */}
                        <ButtonBase
                            disabled={!picked || Boolean(booked)}
                            onClick={() => {
                                if (!picked || booked) return;
                                reserveResource(state.courtDate, decodedResource, decodedTime, picked.displayName);
                                back();
                            }}
                            sx={{
                                gap: 1,
                                px: 3,
                                py: 1.5,
                                bgcolor: picked && !booked ? appColors.slate : "#DCDEE0",
                                color: picked && !booked ? "#fff" : "#9AA1A9",
                                fontSize: 17,
                                fontWeight: 500,
                            }}
                        >
                            <CheckIcon sx={{ fontSize: 20 }} />
                            Reserve
                        </ButtonBase>
                    </Stack>
                </Box>
            </Box>
        </Shell>
    );
};
