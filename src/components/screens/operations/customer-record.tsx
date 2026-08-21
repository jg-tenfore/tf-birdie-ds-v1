import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CUSTOMER_TYPES, customers, type CrmTeeTime, type Customer } from "@/data/crm";
import { rainchecks as allRainchecks, type Raincheck } from "@/data/rainchecks";
import { bookingsForCustomer, may12Sheet, todaySheet } from "@/data/tee-sheet";
import { appColors } from "@/theme/app-replica-tokens";
import { CustomerRecordFields, CustomerSection, GeneralInfoList, RainChecksTable, raincheckOwed } from "./customer-search-panel";

/**
 * The customer profile, whole.
 *
 * From `references/072926/11-customerSearch/`. Grey contact and address fields
 * at the top, then a stack of navy section bars, then a read-only General Info
 * footer. Everything below the fields collapses — see `CustomerSection` for why
 * that matters on a record carrying thirty rounds of history.
 *
 * Six sections, and they are not six views of one thing. Memberships and
 * Customer Types are *what this person is entitled to*; Gift Cards, Rain Checks
 * and Punch Cards are *money and rounds the course already owes them*; Tee Time
 * History is *what they have done*. The device gives all six the same bar, which
 * is why the balance a counter is being asked about is as buried as the audit
 * trail nobody reads. Putting the owed figure on the bar is a first cut at
 * separating them — a closed section still answers its question.
 *
 * Rendering only. The record, the raincheck ledger and the type list are all
 * defaulted fixtures, so the prototype hands the same component live store data.
 * See Foundations → Prototype Seam.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const TEE_COLUMNS = "120px 1fr 90px 120px 150px";

/**
 * The credit a round produced, on the round's own row.
 *
 * Rainchecks are anchored to the reservation, not to the person, so this is the
 * honest direction of the relationship: the round has a credit, and the customer
 * sees it only because the round was theirs. Showing it here as well as in its
 * own section means a counter arguing about one round does not have to hold two
 * tables in their head.
 */
const RaincheckCell = ({ credit }: { credit?: Raincheck }) =>
    credit ? (
        <Typography sx={{ fontSize: 14, textAlign: "right", color: appColors.greenTee, fontWeight: 700 }}>
            {credit.id} · {usd(credit.balance)}
        </Typography>
    ) : (
        <Typography sx={{ fontSize: 14, textAlign: "right", color: appColors.textDisabled }}>—</Typography>
    );

export interface CustomerRecordPanelProps {
    customer?: Customer;
    /** This customer's credits. Filtered by the caller — the panel does not query. */
    rainchecks?: Raincheck[];
    /**
     * Rounds on the tee sheets the terminal is currently holding.
     *
     * Separate from `customer.teeTimes`, which is the archive. The caller reads
     * these off the live sheets with `bookingsForCustomer` — the panel does not
     * know what day it is or which courses are loaded.
     */
    booked?: CrmTeeTime[];
    /** Every type the course has configured, checked or not. */
    types?: readonly string[];
    selectedTypes?: string[];
    onToggleType?: (type: string) => void;
    /** Opens every section closed, which is how a long record should arrive. */
    startCollapsed?: boolean;
    /** Makes the Rain Checks rows tappable. Omit for the read-only record. */
    onSelectRaincheck?: (id: string) => void;
}

const defaultCustomer = customers.find((c) => c.displayName === "Weston Senior") ?? customers[0];

export const CustomerRecordPanel = ({
    customer = defaultCustomer,
    rainchecks = allRainchecks.filter((r) => r.customerId === defaultCustomer.id),
    booked = bookingsForCustomer(defaultCustomer.id, { "2026-05-12": may12Sheet, "2026-07-29": todaySheet }),
    types = CUSTOMER_TYPES,
    selectedTypes,
    onToggleType,
    startCollapsed = false,
    onSelectRaincheck,
}: CustomerRecordPanelProps) => {
    const checked = selectedTypes ?? customer.customerTypes;
    const owed = raincheckOwed(rainchecks);
    const archive = customer.teeTimes;

    // Which rounds produced a credit. The reservation is the join — the same one
    // the raincheck is anchored to — so a round and its credit can be read off
    // each other rather than each being a separate thing to go and find.
    const raincheckByReservation = new Map(rainchecks.map((r) => [r.reservation, r]));

    return (
        <Box sx={{ bgcolor: "#fff", minHeight: "100%", pb: 4 }}>
            <CustomerRecordFields customer={customer} />

            <CustomerSection title="Memberships" defaultOpen={!startCollapsed} summary={customer.memberships.length ? undefined : "None"}>
                {customer.memberships.length === 0 ? (
                    <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No memberships.</Typography>
                ) : (
                    customer.memberships.map((m) => (
                        <Stack key={m.name} direction="row" sx={{ px: 2, py: 1.5, gap: 2 }}>
                            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{m.name}</Typography>
                            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>Expires</Typography>
                            <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{m.expires}</Typography>
                        </Stack>
                    ))
                )}
            </CustomerSection>

            {/* Every configured type, checked or not — the list is the same on
                every record, which is why it is so long. */}
            <CustomerSection title="Customer Types" defaultOpen={!startCollapsed} summary={`${checked.length} of ${types.length}`}>
                <Box sx={{ px: 1, py: 0.5 }}>
                    {types.map((t) => (
                        <Stack key={t} direction="row" sx={{ alignItems: "center" }}>
                            <Checkbox
                                checked={checked.includes(t)}
                                onChange={() => onToggleType?.(t)}
                                readOnly={!onToggleType}
                                size="small"
                                slotProps={{ input: { "aria-label": t } }}
                            />
                            <Typography sx={{ fontSize: 17 }}>{t}</Typography>
                        </Stack>
                    ))}
                </Box>
            </CustomerSection>

            <CustomerSection
                title="Gift Cards"
                defaultOpen={!startCollapsed}
                summary={usd(customer.giftCards.reduce((s, g) => s + g.balance, 0))}
            >
                {customer.giftCards.length === 0 ? (
                    <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No gift cards.</Typography>
                ) : (
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", mb: 0.5 }}>
                            {["UPC", "Type", "Expires", "Awarded", "Spent", "Balance"].map((h, i) => (
                                <Typography
                                    key={h}
                                    sx={{ fontSize: 15, color: appColors.textSecondary, textAlign: i > 2 ? "right" : "left" }}
                                >
                                    {h}
                                </Typography>
                            ))}
                        </Box>
                        {customer.giftCards.map((g) => (
                            <Box key={g.id} sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", py: 0.4 }}>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{g.upc || g.id}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{g.type}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{g.expires}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, textAlign: "right" }}>
                                    {usd(g.awarded)}
                                </Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, textAlign: "right" }}>
                                    {usd(g.spent)}
                                </Typography>
                                <Typography sx={{ fontSize: 14, textAlign: "right", fontWeight: 700 }}>{usd(g.balance)}</Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </CustomerSection>

            {/* Directly under Gift Cards, because the two are the same kind of
                thing: money the course is holding on this person's behalf. */}
            <CustomerSection title="Rain Checks" defaultOpen={!startCollapsed} summary={usd(owed)}>
                <RainChecksTable rows={rainchecks} onSelect={onSelectRaincheck} />
            </CustomerSection>

            <CustomerSection
                title="Tee Time History"
                defaultOpen={!startCollapsed}
                // Rounds on the sheet lead, because "are they on today" is the
                // question this section is usually opened to answer.
                summary={booked.length ? `${booked.length} on the sheet · ${archive.length} played` : `${archive.length} played`}
            >
                {booked.length === 0 && archive.length === 0 ? (
                    <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No rounds on record.</Typography>
                ) : (
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: TEE_COLUMNS, mb: 0.5 }}>
                            {["TeeTime ID", "Date", "Players", "Status", "Raincheck"].map((h, i) => (
                                <Typography
                                    key={h}
                                    sx={{
                                        fontSize: 15,
                                        color: appColors.textSecondary,
                                        textAlign: i === 4 ? "right" : i >= 2 ? "center" : "left",
                                    }}
                                >
                                    {h}
                                </Typography>
                            ))}
                        </Box>

                        {booked.map((t) => (
                            <Box key={`live-${t.id}`} sx={{ display: "grid", gridTemplateColumns: TEE_COLUMNS, py: 0.3 }}>
                                <Typography sx={{ fontSize: 14 }}>{t.id}</Typography>
                                <Typography sx={{ fontSize: 14 }}>{t.date}</Typography>
                                <Typography sx={{ fontSize: 14, textAlign: "center" }}>{t.players}</Typography>
                                <Typography sx={{ fontSize: 14, textAlign: "center", color: appColors.greenTee, fontWeight: 700 }}>
                                    {t.status}
                                </Typography>
                                <RaincheckCell credit={raincheckByReservation.get(t.id)} />
                            </Box>
                        ))}

                        {booked.length > 0 && archive.length > 0 && (
                            <Typography sx={{ mt: 1.5, mb: 0.5, fontSize: 14, color: appColors.textSecondary }}>Earlier rounds</Typography>
                        )}

                        {archive.map((t) => (
                            <Box key={t.id} sx={{ display: "grid", gridTemplateColumns: TEE_COLUMNS, py: 0.3 }}>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{t.id}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{t.date}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, textAlign: "center" }}>
                                    {t.players}
                                </Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, textAlign: "center" }}>—</Typography>
                                <RaincheckCell credit={raincheckByReservation.get(t.id)} />
                            </Box>
                        ))}
                    </Box>
                )}
            </CustomerSection>

            <CustomerSection
                title="Punch Cards"
                defaultOpen={!startCollapsed}
                summary={customer.punchCards.length ? `${customer.punchCards.length}` : "None"}
            >
                {customer.punchCards.length === 0 ? (
                    <Typography sx={{ px: 2, py: 1.5, fontSize: 17, color: appColors.textSecondary }}>No punch cards.</Typography>
                ) : (
                    customer.punchCards.map((p) => (
                        <Stack key={p.name} direction="row" sx={{ px: 2, py: 1.25, gap: 3 }}>
                            <Typography sx={{ flex: 1, fontSize: 16 }}>{p.name}</Typography>
                            <Typography sx={{ fontSize: 16 }}>
                                {p.remaining} of {p.total} left
                            </Typography>
                            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>Expires {p.expires}</Typography>
                        </Stack>
                    ))
                )}
            </CustomerSection>

            <GeneralInfoList
                rows={[
                    { label: "Customer ID", value: customer.id },
                    { label: "Golf Course Customer ID", value: customer.courseId },
                    { label: "Rewards Balance:", value: String(customer.rewardsBalance) },
                    { label: "Customer Balance", value: usd(customer.balance) },
                    // What the course owes, alongside what the customer owes.
                    // They were never on the same screen before.
                    { label: "Raincheck Balance", value: usd(owed) },
                    { label: "Card on File", value: customer.cardOnFile ?? "—" },
                    { label: "Card on File Expires", value: customer.cardExpires ?? "—" },
                ]}
            />
        </Box>
    );
};
