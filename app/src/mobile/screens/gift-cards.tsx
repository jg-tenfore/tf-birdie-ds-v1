import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { westonGiftCards, type GiftCardRow } from "@/components/screens/operations/gift-cards-table";
import { MobileEmpty, MobileFab, MobileRow, MobileSearch, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobilePrimary } from "@/components/mobile/mobile-shell";
import { searchCustomers, type Customer } from "@/data/crm";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { useNavigate } from "react-router-dom";

import { money, useActions, useStore, type Ticket } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * Gift Cards, on a phone — the lookup and the create form.
 *
 * ## The lookup: an eight-column table stacks
 *
 * `GiftCardsScreen` is a table and nothing else. On the 1290px counter each of
 * its eight columns gets `flex: 1` — ~161px, which is exactly enough for
 * `533752807261` and `5/26/2122` to sit centred without wrapping. Divide the
 * same eight into 402px and each gets **50px**, narrower than the word
 * "Expiration".
 *
 * Every column is kept; they are read top-to-bottom instead of left-to-right:
 *
 * | Line | Columns | Why here |
 * | -- | -- | -- |
 * | 1 | **Customer Name** · **Balance** | The two you are actually looking for. Balance sits right, so a column of balances stays scannable down the list |
 * | 2 | ID · Type · Expiration | Identity and validity — checked once you have found the card |
 * | 3 | Awarded · Spent · UPC | The audit trail, last, because it is never why the screen was opened |
 *
 * A sideways-scrolling table would have kept the columns intact and made
 * Balance — the value the screen exists to show — invisible until you scrolled
 * past six columns. Wrong trade for a lookup.
 *
 * **The row is hand-built rather than a `MobileRow`.** The shipping screen says
 * "no balance left" purely by dimming the whole row to `#C9CDD1` — no badge, no
 * strikethrough. `MobileRow` has no dim state, and adding one to a shared
 * primitive for one screen would be a restyle, so this row is assembled at
 * `MobileRow`'s own metrics: 1.5 horizontal padding, 16px title, 13px secondary
 * lines, a `divider` hairline under it.
 *
 * **The 240px SEARCH button goes.** 240 of 402 is 60% of the screen. The commit
 * collapses into `MobileSearch`'s trailing glyph and the search runs as you
 * type, which also drops the grey column-header band — and that band was doing
 * real work on the terminal, telling you the table exists and is merely
 * unfilled. There are no columns left to head, so the empty sentence does the
 * band's job. Hence an empty state where the terminal deliberately has none.
 *
 * ## What is live
 *
 * **A card created here is findable a second later.** The store models a gift
 * card the way the terminal does — as a non-taxable line on a real ticket, not
 * as a ledger row — so `sessionCards()` reads `state.tickets` back out and
 * lists what this session sold above the seeded results. That is why those rows
 * carry `Ticket #4140 · Open` where a seeded row carries an audit trail: the
 * facts the store actually holds, rather than four columns of invention.
 *
 * ## The create form
 *
 * `CreateGiftCardScreen` is a 1290px form: two parties of four fields laid out
 * `1fr 1fr`, amount and UPC side by side, four spend checkboxes in a centred
 * row, and the order panel beside all of it. Every one of those pairs becomes a
 * single column — a 645px half-field is 201px here, and `Enter UPC Code
 * (optional)` alone measures ~180px at 16px Roboto.
 *
 * **Eight party fields become two lookups.** FROM and TO were four fields each
 * (first, last, email, phone) and *all four searched the same customer
 * database* — eight inputs for two lookups. On a phone that is eight keyboards
 * for a job one takes, so each party is one search field over `state.customers`
 * with the picked person shown as a row. Typing a name that is not in the
 * database still works: the raw text becomes the party name, which is what the
 * terminal's fields do too.
 *
 * **The amount keeps its field, unlike the payment screen's cash keys.** Cash
 * tendered has a right answer and presets prevent a mis-key; a gift card's
 * value is a choice with no correct figure, so the field stays — with $25 /
 * $50 / $100 above it, because those are the cards a shop actually sells.
 *
 * **The UPC dialog becomes a bottom sheet.** Same two options, same wording,
 * same order: continue and let the server mint one, or go back and add it.
 *
 * **All four spend categories still start checked**, which means the
 * out-of-the-box gift card buys alcohol. A policy hiding in a default, carried
 * over rather than fixed.
 */

/* --------------------------------------------------------------- the lookup */

/** `MobileRow`'s metrics, plus the dim state the gift-card table needs. */
const GiftCardStackedRow = ({ row }: { row: GiftCardRow }) => {
    const primary = row.dimmed ? "#C9CDD1" : appColors.textPrimary;
    const secondary = row.dimmed ? "#C9CDD1" : appColors.textSecondary;

    const identity = [`ID ${row.id}`, row.type, `Exp ${row.expirationDate}`].join(" · ");
    // A Winnings card has no UPC. Dropped rather than rendered empty — a blank
    // cell in a table reads as "no value", a dangling `·` reads as a bug.
    const audit = [`Awarded ${row.awarded}`, `Spent ${row.spent}`, row.upc && `UPC ${row.upc}`].filter(Boolean).join(" · ");

    return (
        <Stack sx={{ px: 1.5, py: 1, gap: 0.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, color: primary }} noWrap>
                    {row.customerName}
                </Typography>
                <Typography sx={{ fontSize: 16, color: primary, flexShrink: 0 }}>{row.balance}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, color: secondary }} noWrap>
                {identity}
            </Typography>
            <Typography sx={{ fontSize: 13, color: secondary }} noWrap>
                {audit}
            </Typography>
        </Stack>
    );
};

/** How a gift card line names itself on the ticket. Kept in one place. */
const GIFT_LINE_PREFIX = "giftcard-";

interface SessionCard {
    lineId: string;
    /** Who the card is for, or plain "Gift Card" when nobody was named. */
    name: string;
    value: number;
    ticket: string;
    status: Ticket["status"];
    /** Type, UPC, expiry and spend rules, as the create form wrote them. */
    detail?: string;
}

/**
 * Gift cards sold in this session, read back out of the tickets they are on.
 *
 * Not a separate ledger, because the store has none — the terminal treats a
 * card as a non-taxable line and so does this. The consequence is honest: a
 * session card can show its value and where it is, and cannot show a spent
 * total, because nothing has spent it.
 */
const sessionCards = (tickets: Ticket[]): SessionCard[] =>
    tickets.flatMap((t) =>
        t.lines
            .filter((l) => l.id.startsWith(GIFT_LINE_PREFIX))
            .map((l) => ({
                lineId: l.id,
                name: l.name,
                value: l.qty * l.unitPrice,
                ticket: t.number,
                status: t.status,
                detail: l.note,
            })),
    );

const SessionCardRow = ({ card }: { card: SessionCard }) => (
    <Stack sx={{ px: 1.5, py: 1, gap: 0.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16 }} noWrap>
                {card.name}
            </Typography>
            <Typography sx={{ fontSize: 16, flexShrink: 0 }}>{money(card.value)}</Typography>
        </Stack>
        <Typography sx={{ fontSize: 13, color: card.status === "paid" ? appColors.greenTee : appColors.textSecondary }} noWrap>
            Ticket {card.ticket} · {card.status === "paid" ? "Paid" : card.status === "held" ? "Held" : "On the open order"}
        </Typography>
        {card.detail && (
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }} noWrap>
                {card.detail}
            </Typography>
        )}
    </Stack>
);

export const MobileGiftCardsScreen = () => {
    const { state } = useStore();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const mine = useMemo(() => sessionCards(state.tickets), [state.tickets]);

    const q = query.trim().toLowerCase();
    // The terminal's own quirk is preserved: "weston" is the reference query and
    // returns the device's test data, which is why it matches cards belonging to
    // two other people.
    const seeded = !q
        ? []
        : q === "weston"
          ? westonGiftCards
          : westonGiftCards.filter((r) => r.customerName.toLowerCase().includes(q) || r.upc.includes(q) || r.id.includes(q));
    const found = !q ? mine : mine.filter((c) => `${c.name} ${c.ticket} ${c.detail ?? ""}`.toLowerCase().includes(q));

    const nothing = seeded.length === 0 && found.length === 0;

    return (
        <MobileShell
            title="Gift Cards"
            active="giftcards"
            showOverflow={false}
            fab={<MobileFab label="New card" onClick={() => navigate("/giftcards/new")} />}
        >
            <MobileSearch placeholder="Gift Card Search" value={query} onChange={setQuery} />

            {nothing ? (
                <MobileEmpty message={q ? `Nothing matches “${query}”.` : "Search by customer name, gift card number or UPC."} />
            ) : (
                <>
                    {found.length > 0 && (
                        <>
                            <MobileSectionHeading>Sold on this device</MobileSectionHeading>
                            {found.map((card) => (
                                <SessionCardRow key={card.lineId} card={card} />
                            ))}
                        </>
                    )}
                    {seeded.length > 0 && (
                        <>
                            <MobileSectionHeading>
                                {seeded.length} card{seeded.length === 1 ? "" : "s"} on file
                            </MobileSectionHeading>
                            {seeded.map((row, i) => (
                                <GiftCardStackedRow key={`${row.id}-${i}`} row={row} />
                            ))}
                        </>
                    )}
                </>
            )}

            {/* Clearance for the floating pill, which would otherwise land on
                the last result. */}
            <Box sx={{ height: 64 }} />
        </MobileShell>
    );
};

/* ---------------------------------------------------------- the create form */

/** Spend restrictions. All on by default, as the device has them. */
const SPEND = ["Merchandise", "Food and Beverage", "Tee Fees", "Alcohol"] as const;

const GIFT_CARD_TYPES = ["Purchased Gift Card", "Winnings", "Promotional", "Replacement"] as const;

/** A century out. The default is effectively "never" — a policy in a date field. */
const EXPIRES = "MAY 28 2122";

/** The presets a counter actually sells, above the free field. */
const PRESETS = [25, 50, 100];

/** One party — one lookup, not four fields. */
const PartyLookup = ({
    label,
    value,
    picked,
    customers,
    onQuery,
    onPick,
}: {
    label: string;
    value: string;
    picked: Customer | null;
    customers: Customer[];
    onQuery: (v: string) => void;
    onPick: (c: Customer | null) => void;
}) => {
    const hits = useMemo(
        () => (value.trim().length >= 2 && !picked ? searchCustomers(value, 4, customers) : []),
        [value, picked, customers],
    );

    return (
        <>
            <MobileSectionHeading>{label}</MobileSectionHeading>
            {picked ? (
                <MobileRow
                    title={picked.displayName}
                    subtitle={`Golf Course Customer ID ${picked.courseId}`}
                    image=""
                    trailing="Change"
                    onClick={() => {
                        onPick(null);
                        onQuery("");
                    }}
                />
            ) : (
                <>
                    <MobileSearch placeholder={`${label} — name or email`} value={value} onChange={onQuery} />
                    {hits.map((c) => (
                        <MobileRow key={c.id} title={c.displayName} subtitle={c.email} image="" onClick={() => onPick(c)} />
                    ))}
                    {value.trim().length >= 2 && hits.length === 0 && (
                        <Typography sx={{ px: 1.5, pb: 1, fontSize: 13, color: appColors.textSecondary }}>
                            No match — the card will be made out to &ldquo;{value.trim()}&rdquo;.
                        </Typography>
                    )}
                </>
            )}
        </>
    );
};

export const MobileCreateGiftCardScreen = () => {
    const { state } = useStore();
    const { addItem, setLineNote, toast } = useActions();
    const navigate = useNavigate();

    const [amount, setAmount] = useState("");
    const [upc, setUpc] = useState("");
    const [type, setType] = useState<string>(GIFT_CARD_TYPES[0]);
    const [typeSheet, setTypeSheet] = useState(false);
    const [confirmUpc, setConfirmUpc] = useState(false);
    const [spend, setSpend] = useState<string[]>([...SPEND]);

    const [fromQuery, setFromQuery] = useState("");
    const [from, setFrom] = useState<Customer | null>(null);
    const [toQuery, setToQuery] = useState("");
    const [to, setTo] = useState<Customer | null>(null);

    const value = Number(amount) || 0;
    const recipient = to?.displayName ?? toQuery.trim();

    /** Puts the card on the live order — the same call the terminal makes. */
    const commit = () => {
        const id = `${GIFT_LINE_PREFIX}${Date.now().toString(36)}`;
        addItem({ id, name: recipient ? `Gift Card — ${recipient}` : "Gift Card", price: value, taxable: false }, "Pro Shop");
        // The audit facts the store has nowhere else to put. Written as one
        // readable sentence rather than encoded, because the order panel prints
        // this note verbatim on the counter too.
        setLineNote(id, [type, `UPC ${upc.trim() || "server-assigned"}`, `Exp ${EXPIRES}`, spend.join(", ")].join(" · "));
        toast(`${money(value)} gift card added to the order`);
        // Back to the lookup rather than the terminal's Pro Shop: on the phone
        // this form is reached from Gift Cards, and the card you just made is
        // the first row of the list you land on.
        navigate("/giftcards");
    };

    const save = () => {
        if (value <= 0) return toast("Enter an amount first.");
        // No UPC means the server mints one, and the device says so before it
        // commits rather than after.
        if (!upc.trim()) return setConfirmUpc(true);
        commit();
    };

    return (
        <MobileShell
            title="Create a Gift Card"
            subtitle={recipient || undefined}
            active="giftcards"
            leading="back"
            onLeading={() => navigate("/giftcards")}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />} disabled={value <= 0} onClick={save}>
                        {value > 0 ? `Save ${money(value)}` : "Save"}
                    </MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                typeSheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setTypeSheet(false)}
                        items={GIFT_CARD_TYPES.map((t) => ({
                            label: t,
                            icon: t === type ? <CheckIcon sx={{ fontSize: 20 }} /> : <Box sx={{ width: 20 }} />,
                            onClick: () => {
                                setType(t);
                                setTypeSheet(false);
                            },
                        }))}
                    />
                ) : confirmUpc ? (
                    <MobileBottomSheet
                        onDismiss={() => setConfirmUpc(false)}
                        items={[
                            {
                                label: "UPC was not provided",
                                icon: <WarningAmberIcon sx={{ fontSize: 20 }} />,
                                onClick: () => setConfirmUpc(false),
                            },
                            {
                                label: "Continue — the server assigns one",
                                icon: <CheckIcon sx={{ fontSize: 20 }} />,
                                onClick: () => {
                                    setConfirmUpc(false);
                                    commit();
                                },
                            },
                            { label: "Go back and enter a UPC", destructive: true, onClick: () => setConfirmUpc(false) },
                        ]}
                    />
                ) : undefined
            }
        >
            <MobileSectionHeading>Amount</MobileSectionHeading>
            <Stack direction="row" sx={{ px: 1.5, gap: 1 }}>
                {PRESETS.map((p) => (
                    <ButtonBase
                        key={p}
                        onClick={() => setAmount(String(p))}
                        sx={{
                            flex: 1,
                            minHeight: 48,
                            bgcolor: value === p ? appColors.green : appColors.slate,
                            color: "#fff",
                            borderRadius: `${appRadius.button}px`,
                            fontSize: 15,
                        }}
                    >
                        {money(p)}
                    </ButtonBase>
                ))}
            </Stack>

            {/* The amount is the only required field and keeps the terminal's
                loudest treatment: white, with an orange ring once it has a value. */}
            <Box sx={{ px: 1.5, pt: 1 }}>
                <Box
                    component="input"
                    value={amount}
                    inputMode="decimal"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="0.00"
                    aria-label="Gift card amount"
                    sx={{
                        width: "100%",
                        minHeight: 56,
                        textAlign: "center",
                        bgcolor: appColors.surface,
                        border: `2px solid ${amount ? appColors.orange : appColors.divider}`,
                        borderRadius: `${appRadius.button}px`,
                        outline: "none",
                        fontFamily: "inherit",
                        fontSize: 24,
                        color: appColors.textPrimary,
                    }}
                />
            </Box>

            <MobileSectionHeading>Card</MobileSectionHeading>
            <MobileRow title={type} subtitle="Gift Card Type" trailing="Change" onClick={() => setTypeSheet(true)} />
            <MobileRow title={EXPIRES} subtitle="Expiration Date" />
            <Box sx={{ px: 1.5, pt: 1 }}>
                <Stack
                    sx={{
                        minHeight: 56,
                        px: 1.75,
                        py: 0.75,
                        justifyContent: "center",
                        bgcolor: appColors.canvasAlt,
                        borderBottom: `1px solid ${appColors.grey}`,
                    }}
                >
                    {upc && <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>UPC Code</Typography>}
                    <Box
                        component="input"
                        value={upc}
                        inputMode="numeric"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpc(e.target.value)}
                        placeholder="Enter UPC Code (optional)"
                        aria-label="UPC code"
                        sx={{
                            border: 0,
                            outline: "none",
                            bgcolor: "transparent",
                            fontFamily: "inherit",
                            fontSize: 16,
                            color: appColors.textPrimary,
                            "&::placeholder": { color: appColors.textSecondary, opacity: 1 },
                        }}
                    />
                </Stack>
            </Box>

            <PartyLookup
                label="Gift Card FROM"
                value={fromQuery}
                picked={from}
                customers={state.customers}
                onQuery={setFromQuery}
                onPick={setFrom}
            />
            <PartyLookup label="Gift Card TO" value={toQuery} picked={to} customers={state.customers} onQuery={setToQuery} onPick={setTo} />

            {/* "Same as From" was a slate button under 645px of form. Here it is
                a row where the TO lookup already is, so the two are adjacent. */}
            <MobileRow
                title="Same as From"
                subtitle={from ? from.displayName : "Pick a FROM customer first"}
                image=""
                trailing={from ? "Copy" : undefined}
                onClick={
                    from
                        ? () => {
                              setTo(from);
                              setToQuery(from.displayName);
                          }
                        : undefined
                }
            />

            <MobileSectionHeading>Can be spent on</MobileSectionHeading>
            {SPEND.map((s) => (
                <Stack
                    key={s}
                    direction="row"
                    sx={{
                        alignItems: "center",
                        px: 1,
                        minHeight: 52,
                        bgcolor: appColors.surface,
                        borderBottom: `1px solid ${appColors.divider}`,
                    }}
                >
                    <Checkbox
                        checked={spend.includes(s)}
                        onChange={(e) => setSpend((prev) => (e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)))}
                        slotProps={{ input: { "aria-label": s } }}
                    />
                    <Typography sx={{ fontSize: 16 }}>{s}</Typography>
                </Stack>
            ))}
            <Box sx={{ height: 12 }} />
        </MobileShell>
    );
};
