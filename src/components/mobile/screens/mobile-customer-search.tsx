import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import { raincheckOwed } from "@/components/screens/operations/customer-search-panel";
import { CUSTOMER_TYPES, type CrmTeeTime, type Customer, customers } from "@/data/crm";
import { type Raincheck, rainchecks as allRainchecks } from "@/data/rainchecks";
import { bookingsForCustomer, may12Sheet, todaySheet } from "@/data/tee-sheet";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileEmpty, MobileRow, MobileSearch, MobileSectionHeading, mobileUsd } from "../mobile-parts";
import { MobileAppBar, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 11-customerSearch.** From `references/090426/`, laid out
 * against `App Screens → 11-customerSearch`.
 *
 * ## Three screens where the tablet has one
 *
 * On tablet, Customer Search is a **master-detail**: a results list on the left,
 * the selected customer's record filling the pane on the right, both visible at
 * once. Master-detail is the single most common layout to break on a phone, and
 * it breaks the same way every time — neither half is usable at half of 402px.
 *
 * So it unfolds into a stack: **search → results → record**, each a full
 * screen, `back` returning one step. That costs a tap and gains a screen that
 * can actually be read.
 *
 * ## The customer / member toggle
 *
 * The references show a two-up segmented control above the results. It is kept
 * because the two searches return different things and the tablet's version —
 * two separate fields side by side — needs 500px it does not have here.
 *
 * ## The record's sections stay collapsible
 *
 * The tablet record shows Memberships, Gift Cards, Tee Times, Punch Cards and
 * Rain Checks as stacked expandable sections. That pattern survives the
 * narrowing unchanged, which is why the record needed the least work of the
 * three: a vertical accordion is already a one-column layout.
 */

const results = [
    { name: "Macey West", email: "justin@gmail.com" },
    { name: "Brigid West", email: "justin@gmail.com" },
    { name: "Joaquin West", email: "justin@gmail.com", phone: "(617) 450-4133" },
    { name: "Eli West", email: "justin@gmail.com", phone: "(617) 450-4133" },
    { name: "Tod West", email: "justin@gmail.com" },
    { name: "Weston Farnsworth", email: "weston.farnsworth@tenfore.golf", phone: "5437964523" },
];

const recordSections = [
    { label: "Memberships", count: 1 },
    { label: "Gift Cards", count: 2 },
    { label: "Rain Checks", count: 3 },
    { label: "Tee Times", count: 4 },
    { label: "Punch Cards", count: 1 },
];

/** The segmented control from the references — two states, one row. */
const SegmentedToggle = ({ active }: { active: "Customer" | "Member" }) => (
    <Stack
        direction="row"
        sx={{ mx: 1.5, mb: 1, border: `1px solid ${appColors.divider}`, borderRadius: `${appRadius.button}px`, overflow: "hidden" }}
    >
        {(["Customer", "Member"] as const).map((k) => (
            <ButtonBase
                key={k}
                sx={{
                    flex: 1,
                    minHeight: 44,
                    gap: 0.75,
                    fontSize: 14,
                    bgcolor: k === active ? appColors.canvasAlt : appColors.surface,
                    color: appColors.textPrimary,
                }}
            >
                {k === active && <CheckIcon sx={{ fontSize: 16 }} />}
                {k}
            </ButtonBase>
        ))}
    </Stack>
);

/**
 * One accordion bar.
 *
 * Shared by the transcribed record and the composed profile below, because they
 * are the same control — a second copy would drift the moment either changed.
 * The tablet draws these bars navy with white text; at this width the bar is
 * full-bleed and a navy band every 52dp turns the record into stripes, so it
 * keeps the surface and the divider the rest of the category uses.
 */
const SectionBar = ({ label, summary, open, onClick }: { label: string; summary?: string; open: boolean; onClick?: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{ width: "100%", px: 1.5, minHeight: 52, gap: 1, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}
    >
        <Typography sx={{ fontSize: 16, flex: 1, textAlign: "left" }}>{label}</Typography>
        {summary && <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{summary}</Typography>}
        <ExpandMoreIcon sx={{ fontSize: 22, color: appColors.textSecondary, transform: open ? "rotate(180deg)" : undefined }} />
    </ButtonBase>
);

export interface MobileCustomerSearchProps {
    /** `empty` before a query, `results` after, `record` on a picked customer. */
    view?: "empty" | "results" | "record";
    /** Expands every section on the record. */
    expanded?: boolean;
    drawerOpen?: boolean;
}

export const MobileCustomerSearch = ({ view = "empty", expanded = false, drawerOpen = false }: MobileCustomerSearchProps) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    const [open, setOpen] = useState<string | null>(expanded ? "Rain Checks" : null);

    if (view === "record") {
        return (
            <MobileScreen
                appBar={<MobileAppBar title="Weston Farnsworth" subtitle="weston.farnsworth@tenfore.golf" leading="back" showOverflow />}
            >
                <Stack sx={{ p: 1.5, gap: 0.5, bgcolor: appColors.surface }}>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                        <PhoneOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                        <Typography sx={{ fontSize: 14 }}>5437964523</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                        <EmailOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                        <Typography sx={{ fontSize: 14 }}>weston.farnsworth@tenfore.golf</Typography>
                    </Stack>
                </Stack>

                <MobileSectionHeading>On file</MobileSectionHeading>
                {recordSections.map((s) => {
                    const isOpen = expanded || open === s.label;
                    return (
                        <Box key={s.label}>
                            <SectionBar
                                label={s.label}
                                summary={String(s.count)}
                                open={isOpen}
                                onClick={() => setOpen(isOpen ? null : s.label)}
                            />
                            {isOpen && (
                                <Stack sx={{ px: 1.5, py: 1, bgcolor: appColors.canvas, gap: 0.5 }}>
                                    {Array.from({ length: s.count }, (_, i) => (
                                        <Stack key={i} direction="row" sx={{ justifyContent: "space-between" }}>
                                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                                                {s.label.slice(0, -1)} {i + 1}
                                            </Typography>
                                            <Typography sx={{ fontSize: 14 }}>—</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    );
                })}
            </MobileScreen>
        );
    }

    return (
        <MobileScreen
            appBar={
                <MobileAppBar title="Customer Lookup" leading={view === "results" ? "close" : "menu"} onLeading={() => setDrawer(true)} />
            }
            overlay={
                drawer ? (
                    <MobileNavDrawer active="customersearch" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : undefined
            }
        >
            <MobileSearch placeholder="Search Customers" value={view === "results" ? "West" : ""} trailing="tune" />
            {view === "results" && <SegmentedToggle active="Customer" />}
            {view === "empty" ? (
                <MobileEmpty message="No open tabs." />
            ) : (
                results.map((r) => (
                    <MobileRow
                        key={r.name}
                        title={r.name}
                        subtitle={[r.email, r.phone].filter(Boolean).join(" · ")}
                        image={undefined}
                        onClick={() => {}}
                    />
                ))
            )}
        </MobileScreen>
    );
};

/* ----------------------------------------------------------------- profile */

/**
 * **The composed profile**, against `App Screens → 11-customerSearch/Customer
 * profile`.
 *
 * The record above transcribes the device. This is the version the prototype
 * runs, on real `customers.json` data, and it is where the tablet's wide tables
 * stop fitting.
 *
 * ## The accordion survives; the tables inside it do not
 *
 * Every section bar narrows without argument — a vertical accordion is already
 * one column. What breaks is what is *inside* them, because those are
 * spreadsheets: Rain Checks is seven columns
 * (`Raincheck ID · Tee time · Reservation · Holes · Awarded · Spent · Balance`)
 * and Tee Time History is five. Seven columns at 402px is 57px each, which
 * cannot hold `$190.88` next to a date, and side-scrolling a table is the one
 * thing this category never does.
 *
 * So **each table row becomes a list row**: identity and its context on the
 * left over two lines, the number that matters on the right.
 *
 * | Tablet row | Mobile row |
 * | :-- | :-- |
 * | `51381 · 5/12/2026 7:10 AM · 9024813 · 13/18 · $100 · $27.78 · $72.22` | `51381` / `5/12/2026 7:10 AM` → `$72.22` |
 * | `10420001 · 7/29/2026 8:10 AM · 2 · Paid · —` | `10420001` / `7/29/2026 8:10 AM · 2 players` → `Paid` |
 *
 * **Awarded and Spent are what get dropped.** The balance is what a counter is
 * asked for; the ledger behind it is a terminal job. That is a real loss — a
 * partly-spent credit now looks like a small one — and the row opens the credit
 * on the tablet rather than pretending the columns are here.
 *
 * ## The contact grid becomes a section of its own
 *
 * The tablet opens with twelve fields in a 3-across then 4-across grid. Stacked,
 * those are twelve rows before the first bar, which would put every section
 * below the fold on arrival — the exact problem collapsing the bars was meant to
 * fix. So the two a counter reads out loud, **phone and email**, pin under the
 * app bar, and the other ten fold into a `Details` section like everything else.
 *
 * ## What is kept exactly
 *
 * The bar summaries. A closed `Rain Checks` reading `$190.88` and a closed
 * `Tee Time History` reading `8 on the sheet · 6 played` are the whole argument
 * of the tablet story, and they matter more here than there: on a phone a closed
 * section is most of what you ever see.
 */

/** The two days the terminal holds — the same seeds the tablet story uses. */
const SHEETS = { "2026-05-12": may12Sheet, "2026-07-29": todaySheet };

const defaultCustomer = customers.find((c) => c.displayName === "Weston Senior") ?? customers[0];

/** A line of body text inside an open section — "No gift cards.", "Earlier rounds". */
const Note = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ px: 1.5, py: 1.25, fontSize: 14, color: appColors.textSecondary }}>{children}</Typography>
);

/**
 * A customer-type row.
 *
 * The tablet checkbox is a 20px MUI control in a four-column grid. One column of
 * 48dp rows, with the whole row as the target, is the same list at a size a
 * thumb can hit — the box is drawn rather than instantiated so the row stays one
 * control instead of a control inside a control.
 */
const TypeRow = ({ label, checked, onToggle }: { label: string; checked: boolean; onToggle?: () => void }) => (
    <ButtonBase
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
        sx={{ width: "100%", px: 1.5, minHeight: 48, gap: 1.5, justifyContent: "flex-start", bgcolor: appColors.surface }}
    >
        {checked ? (
            <CheckBoxIcon sx={{ fontSize: 22, color: appColors.textPrimary }} />
        ) : (
            <CheckBoxOutlineBlankIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
        )}
        <Typography sx={{ fontSize: 16 }}>{label}</Typography>
    </ButtonBase>
);

const ProfileSection = ({
    label,
    summary,
    open,
    onToggle,
    children,
}: {
    label: string;
    summary?: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) => (
    <Box>
        <SectionBar label={label} summary={summary} open={open} onClick={onToggle} />
        {open && <Box sx={{ bgcolor: appColors.canvas }}>{children}</Box>}
    </Box>
);

export interface MobileCustomerProfileProps {
    customer?: Customer;
    /** This customer's credits. Defaulted from the ledger, as the tablet story does. */
    rainchecks?: Raincheck[];
    /** Rounds on the sheets the terminal is holding — not the archive. */
    booked?: CrmTeeTime[];
    /** Opens every section shut, which is how a long record should arrive. */
    startCollapsed?: boolean;
}

export const MobileCustomerProfile = ({
    customer = defaultCustomer,
    rainchecks = allRainchecks.filter((r) => r.customerId === customer.id),
    booked = bookingsForCustomer(customer.id, SHEETS),
    startCollapsed = false,
}: MobileCustomerProfileProps) => {
    const [types, setTypes] = useState<string[]>(customer.customerTypes);
    const [open, setOpen] = useState<Record<string, boolean>>({});

    const isOpen = (key: string) => open[key] ?? !startCollapsed;
    const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !(prev[key] ?? !startCollapsed) }));

    const owed = raincheckOwed(rainchecks);
    const archive = customer.teeTimes;
    const giftTotal = customer.giftCards.reduce((s, g) => s + g.balance, 0);

    const details = [
        { label: "First Name", value: customer.firstName },
        { label: "Last Name", value: customer.lastName },
        { label: "Birthday", value: customer.birthday },
        { label: "Notes", value: customer.notes },
        { label: "Street Address", value: customer.street },
        { label: "City", value: customer.city },
        { label: "State", value: customer.state },
        { label: "Zip Code", value: customer.zip },
    ];

    return (
        <MobileScreen appBar={<MobileAppBar title={customer.displayName} subtitle={customer.email} leading="back" showOverflow />}>
            {/* The two fields a counter reads out loud, pinned above everything
                that collapses. */}
            <Stack sx={{ p: 1.5, gap: 0.5, bgcolor: appColors.surface }}>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 14 }}>{customer.phone ?? "—"}</Typography>
                </Stack>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <EmailOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 14 }}>{customer.email}</Typography>
                </Stack>
            </Stack>

            <ProfileSection label="Details" open={isOpen("Details")} onToggle={() => toggle("Details")}>
                {details.map((d) => (
                    <MobileRow key={d.label} title={d.label} trailing={d.value ?? "—"} dense />
                ))}
            </ProfileSection>

            <ProfileSection
                label="Memberships"
                summary={customer.memberships.length ? String(customer.memberships.length) : "None"}
                open={isOpen("Memberships")}
                onToggle={() => toggle("Memberships")}
            >
                {customer.memberships.length === 0 ? (
                    <Note>No memberships.</Note>
                ) : (
                    customer.memberships.map((m) => <MobileRow key={m.name} title={m.name} subtitle={`Expires ${m.expires}`} dense />)
                )}
            </ProfileSection>

            <ProfileSection
                label="Customer Types"
                summary={`${types.length} of ${CUSTOMER_TYPES.length}`}
                open={isOpen("Customer Types")}
                onToggle={() => toggle("Customer Types")}
            >
                {CUSTOMER_TYPES.map((t) => (
                    <TypeRow
                        key={t}
                        label={t}
                        checked={types.includes(t)}
                        onToggle={() => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                    />
                ))}
            </ProfileSection>

            <ProfileSection
                label="Gift Cards"
                summary={mobileUsd(giftTotal)}
                open={isOpen("Gift Cards")}
                onToggle={() => toggle("Gift Cards")}
            >
                {customer.giftCards.length === 0 ? (
                    <Note>No gift cards.</Note>
                ) : (
                    customer.giftCards.map((g) => (
                        <MobileRow
                            key={g.id}
                            title={g.upc || g.id}
                            subtitle={`${g.type} · expires ${g.expires}`}
                            price={g.balance}
                            dense
                            onClick={() => {}}
                        />
                    ))
                )}
            </ProfileSection>

            {/* Directly under Gift Cards, because the two are the same kind of
                thing: money the course is holding on this person's behalf. */}
            <ProfileSection
                label="Rain Checks"
                summary={mobileUsd(owed)}
                open={isOpen("Rain Checks")}
                onToggle={() => toggle("Rain Checks")}
            >
                {rainchecks.length === 0 ? (
                    <Note>No rain checks.</Note>
                ) : (
                    rainchecks.map((r) => (
                        <MobileRow
                            key={r.id}
                            title={r.id}
                            subtitle={r.teeTime ?? `Reservation ${r.reservation}`}
                            price={r.balance}
                            dense
                            onClick={() => {}}
                        />
                    ))
                )}
            </ProfileSection>

            <ProfileSection
                label="Tee Time History"
                summary={booked.length ? `${booked.length} on the sheet · ${archive.length} played` : `${archive.length} played`}
                open={isOpen("Tee Time History")}
                onToggle={() => toggle("Tee Time History")}
            >
                {booked.length === 0 && archive.length === 0 ? (
                    <Note>No rounds on record.</Note>
                ) : (
                    <>
                        {booked.map((t) => (
                            <MobileRow
                                key={`live-${t.id}`}
                                title={t.id}
                                subtitle={`${t.date} · ${t.players} ${t.players === 1 ? "player" : "players"}`}
                                trailing={t.status}
                                accent={appColors.greenTee}
                                dense
                                onClick={() => {}}
                            />
                        ))}
                        {booked.length > 0 && archive.length > 0 && <Note>Earlier rounds</Note>}
                        {archive.map((t) => (
                            <MobileRow
                                key={t.id}
                                title={t.id}
                                subtitle={`${t.date} · ${t.players} ${t.players === 1 ? "player" : "players"}`}
                                trailing="—"
                                dense
                            />
                        ))}
                    </>
                )}
            </ProfileSection>

            <ProfileSection
                label="Punch Cards"
                summary={customer.punchCards.length ? String(customer.punchCards.length) : "None"}
                open={isOpen("Punch Cards")}
                onToggle={() => toggle("Punch Cards")}
            >
                {customer.punchCards.length === 0 ? (
                    <Note>No punch cards.</Note>
                ) : (
                    customer.punchCards.map((p) => (
                        <MobileRow
                            key={p.name}
                            title={p.name}
                            subtitle={`Expires ${p.expires}`}
                            trailing={`${p.remaining} of ${p.total} left`}
                            dense
                        />
                    ))
                )}
            </ProfileSection>

            <MobileSectionHeading>General Info</MobileSectionHeading>
            {[
                { label: "Customer ID", value: customer.id },
                { label: "Golf Course Customer ID", value: customer.courseId },
                { label: "Rewards Balance", value: String(customer.rewardsBalance) },
                { label: "Customer Balance", value: mobileUsd(customer.balance) },
                // What the course owes, alongside what the customer owes.
                { label: "Raincheck Balance", value: mobileUsd(owed) },
                { label: "Card on File", value: customer.cardOnFile ?? "—" },
                { label: "Card on File Expires", value: customer.cardExpires ?? "—" },
            ].map((row) => (
                <MobileRow key={row.label} title={row.label} trailing={row.value} dense />
            ))}
            <Box sx={{ height: 16 }} />
        </MobileScreen>
    );
};
