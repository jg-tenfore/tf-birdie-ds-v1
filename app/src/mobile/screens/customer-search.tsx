import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { useNavigate, useParams } from "react-router-dom";

import { MobileActionArea, MobileBottomSheet, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { MobileEmpty, MobileFab, MobileRow, MobileSearch, MobileSectionHeading, mobileUsd } from "@/components/mobile/mobile-parts";
import { CUSTOMER_TYPES, customerById, searchCustomers } from "@/data/crm";
import { raincheckOwed } from "@/components/screens/operations/customer-search-panel";
import { bookingsForCustomer } from "@/data/tee-sheet";
import { appColors } from "@/theme/app-replica-tokens";
import { money, useActions, useStore } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Customer Search and the customer record, on a phone.
 *
 * ## Master-detail unfolds into a stack
 *
 * The terminal is a master-detail: a results sheet hanging off a centred field,
 * and the picked customer's whole record filling the pane at
 * `/customersearch/:id` under a five-button action bar. Master-detail is the
 * single most common layout to break on a phone and it breaks the same way
 * every time — neither half is usable at half of 402px.
 *
 * So it becomes **search → results → record**, each a full screen with `back`
 * returning one step. That costs a tap and gains a screen that can be read.
 *
 * ## The terminal's centred field does not survive either
 *
 * There it opens as a 22px centre-aligned rule under a centred heading with
 * `pt: 14` of air above it — a deliberate "this screen does one thing" layout
 * that assumes a keyboard is somewhere else. On a phone the software keyboard
 * takes roughly the bottom 40% the moment the field is focused, so 112px of
 * top padding puts the field under the keyboard. It uses the category's
 * standard `MobileSearch` at the top instead, and the results start immediately
 * underneath.
 *
 * ## The record's accordion needed the least work
 *
 * A vertical accordion is already a one-column layout. What breaks is what is
 * *inside* the sections, because those are spreadsheets: Rain Checks is seven
 * columns on the terminal and Tee Time History is five. Seven columns at 402px
 * is 57px each, which cannot hold `$190.88` beside a date, and side-scrolling a
 * table is the one thing this category never does — so each table row becomes a
 * list row: identity over its context on the left, the number that matters on
 * the right. **Awarded and Spent are what get dropped**; the balance is what a
 * counter is asked for.
 *
 * The twelve-field contact grid folds the same way: phone and email pin under
 * the app bar because they are what a counter reads out loud, and the other
 * eight fold into `Details`.
 *
 * ## Five action buttons become one
 *
 * `BACK / SWIPE CC / KEY CC / PAY ON BALANCE / SAVE` is 78px a button at this
 * width. SAVE — attaching this person to the open ticket — is the only one that
 * changes the sale, so it is the full-width primary; the balance payment and
 * card capture take the secondary row.
 */

const RESULT_LIMIT = 8;

/* ------------------------------------------------------------------ search */

export const MobileCustomerSearchScreen = () => {
    const { ticket, state } = useStore();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    // Live as you type — two characters is the floor, because one returns most
    // of the database and tells you nothing.
    const trimmed = query.trim();
    const results = useMemo(() => searchCustomers(query, RESULT_LIMIT, state.customers), [query, state.customers]);

    return (
        <MobileShell
            title="Customer Lookup"
            subtitle={ticket ? `Attaching to ticket ${ticket.number}` : undefined}
            active="customersearch"
            showOverflow={false}
            action="New"
            onAction={() => navigate("/customers/new")}
            fab={<MobileFab label="New Customer" onClick={() => navigate("/customers/new")} />}
        >
            <MobileSearch placeholder="Name, email, or phone" value={query} onChange={setQuery} trailing="tune" />

            {trimmed.length < 2 ? (
                <MobileEmpty message="Type two characters to search the customer database." />
            ) : results.length === 0 ? (
                <>
                    <Typography sx={{ px: 1.5, py: 2, fontSize: 15 }}>No customers match &ldquo;{trimmed}&rdquo;.</Typography>
                    {/* The terminal has no such affordance — it leaves you to
                        find the + in the app bar. On a phone the dead end is the
                        moment to offer the next step, and the typed name is
                        carried over so it is not retyped. */}
                    <MobileRow
                        title={`Add “${trimmed}” as a new customer`}
                        image={undefined}
                        drills
                        onClick={() => navigate(`/customers/new?name=${encodeURIComponent(trimmed)}`)}
                    />
                </>
            ) : (
                results.map((c) => (
                    <MobileRow
                        key={c.id}
                        title={c.displayName}
                        subtitle={[c.email, c.phone].filter(Boolean).join(" · ")}
                        image={undefined}
                        onClick={() => navigate(`/customersearch/${c.id}`)}
                    />
                ))
            )}

            <Box sx={{ height: 64 }} />
        </MobileShell>
    );
};

/* ------------------------------------------------------------------ record */

/** One accordion bar. The terminal draws these navy; a navy band every 52dp at
    full bleed turns the record into stripes, so it keeps the surface here. */
const SectionBar = ({ label, summary, open, onClick }: { label: string; summary?: string; open: boolean; onClick: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{ width: "100%", px: 1.5, minHeight: 52, gap: 1, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}
    >
        <Typography sx={{ fontSize: 16, flex: 1, textAlign: "left" }}>{label}</Typography>
        {summary && <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{summary}</Typography>}
        <ExpandMoreIcon sx={{ fontSize: 22, color: appColors.textSecondary, transform: open ? "rotate(180deg)" : undefined }} />
    </ButtonBase>
);

const Note = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ px: 1.5, py: 1.25, fontSize: 14, color: appColors.textSecondary }}>{children}</Typography>
);

/**
 * A customer-type row.
 *
 * The terminal's is a 20px MUI checkbox in a four-column grid. One column of
 * 48dp rows, with the whole row as the target, is the same list at a size a
 * thumb can hit — the box is drawn rather than instantiated so the row stays
 * one control instead of a control inside a control.
 */
const TypeRow = ({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) => (
    <ButtonBase
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
        sx={{
            width: "100%",
            px: 1.5,
            minHeight: 48,
            gap: 1.5,
            justifyContent: "flex-start",
            bgcolor: appColors.surface,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        {checked ? (
            <CheckBoxIcon sx={{ fontSize: 22, color: appColors.textPrimary }} />
        ) : (
            <CheckBoxOutlineBlankIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
        )}
        <Typography sx={{ fontSize: 16 }}>{label}</Typography>
    </ButtonBase>
);

export const MobileCustomerRecordScreen = () => {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const { ticket, state } = useStore();
    const { attachCustomer } = useActions();

    const customer = customerById(id, state.customers);
    const [types, setTypes] = useState<string[]>(customer?.customerTypes ?? []);
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const [sheet, setSheet] = useState(false);

    if (!customer) {
        return (
            <MobileShell title="Customer" active="customersearch" leading="back" showOverflow={false}>
                <MobileEmpty message="No such customer." />
                <Box sx={{ p: 1.5 }}>
                    <MobilePrimary onClick={() => navigate("/customersearch")}>Back to search</MobilePrimary>
                </Box>
            </MobileShell>
        );
    }

    const isOpen = (key: string) => open[key] ?? false;
    const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));

    // The credits this person holds, from the same ledger the register spends
    // out of — a raincheck cut on the tee sheet shows up here a moment later.
    const rainchecks = state.rainchecks.filter((r) => r.customerId === customer.id);
    const owed = raincheckOwed(rainchecks);
    // Every round on any sheet the terminal is holding, live.
    const booked = bookingsForCustomer(customer.id, state.teeSheets);
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

    const section = (label: string, summary: string | undefined, body: React.ReactNode) => (
        <Box key={label}>
            <SectionBar label={label} summary={summary} open={isOpen(label)} onClick={() => toggle(label)} />
            {isOpen(label) && <Box sx={{ bgcolor: appColors.canvas }}>{body}</Box>}
        </Box>
    );

    return (
        <MobileShell
            title={customer.displayName}
            subtitle={customer.email || undefined}
            active="customersearch"
            leading="back"
            onOverflow={() => setSheet(true)}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary disabled={customer.balance <= 0} onClick={() => customer.balance > 0 && navigate("/pay")}>
                            {customer.balance > 0 ? `Pay ${money(customer.balance)}` : "No balance"}
                        </MobileSecondary>
                        <MobileSecondary onClick={() => setSheet(true)}>Card</MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary
                        icon={<PersonAddAltOutlinedIcon sx={{ fontSize: 20 }} />}
                        onClick={() => {
                            attachCustomer(customer.displayName);
                            navigate(ticket ? "/proshop" : "/customersearch");
                        }}
                    >
                        {ticket ? `Attach to ${ticket.number}` : "Attach to order"}
                    </MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={[
                            { label: "Swipe CC", icon: <CreditCardIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(false) },
                            { label: "Key CC", icon: <CreditCardIcon sx={{ fontSize: 20 }} />, onClick: () => setSheet(false) },
                            {
                                label: "Pay on balance",
                                icon: <AttachMoneyIcon sx={{ fontSize: 20 }} />,
                                onClick: () => navigate("/pay"),
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            {/* The two fields a counter reads out loud, pinned above everything
                that collapses. */}
            <Stack sx={{ p: 1.5, gap: 0.5, bgcolor: appColors.surface }}>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 14 }}>{customer.phone ?? "—"}</Typography>
                </Stack>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <EmailOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 14 }}>{customer.email || "—"}</Typography>
                </Stack>
            </Stack>

            <MobileSectionHeading>On file</MobileSectionHeading>

            {section(
                "Details",
                undefined,
                details.map((d) => <MobileRow key={d.label} title={d.label} trailing={d.value ?? "—"} dense />),
            )}

            {section(
                "Memberships",
                customer.memberships.length ? String(customer.memberships.length) : "None",
                customer.memberships.length === 0 ? (
                    <Note>No memberships.</Note>
                ) : (
                    customer.memberships.map((m) => <MobileRow key={m.name} title={m.name} subtitle={`Expires ${m.expires}`} dense />)
                ),
            )}

            {section(
                "Customer Types",
                `${types.length} of ${CUSTOMER_TYPES.length}`,
                CUSTOMER_TYPES.map((t) => (
                    <TypeRow
                        key={t}
                        label={t}
                        checked={types.includes(t)}
                        onToggle={() => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                    />
                )),
            )}

            {section(
                "Gift Cards",
                mobileUsd(giftTotal),
                customer.giftCards.length === 0 ? (
                    <Note>No gift cards.</Note>
                ) : (
                    customer.giftCards.map((g) => (
                        <MobileRow key={g.id} title={g.upc || g.id} subtitle={`${g.type} · expires ${g.expires}`} price={g.balance} dense />
                    ))
                ),
            )}

            {/* Directly under Gift Cards, because the two are the same kind of
                thing: money the course is holding on this person's behalf. */}
            {section(
                "Rain Checks",
                mobileUsd(owed),
                rainchecks.length === 0 ? (
                    <Note>No rain checks.</Note>
                ) : (
                    rainchecks.map((r) => (
                        <MobileRow key={r.id} title={r.id} subtitle={r.teeTime ?? `Reservation ${r.reservation}`} price={r.balance} dense />
                    ))
                ),
            )}

            {section(
                "Tee Time History",
                booked.length ? `${booked.length} on the sheet · ${archive.length} played` : `${archive.length} played`,
                booked.length === 0 && archive.length === 0 ? (
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
                ),
            )}

            {section(
                "Punch Cards",
                customer.punchCards.length ? String(customer.punchCards.length) : "None",
                customer.punchCards.length === 0 ? (
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
                ),
            )}

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
        </MobileShell>
    );
};
