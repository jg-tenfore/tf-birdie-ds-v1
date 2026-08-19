import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CloseIcon from "@mui/icons-material/Close";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CloudIcon from "@mui/icons-material/Cloud";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import NoteIcon from "@mui/icons-material/Note";
import SearchIcon from "@mui/icons-material/Search";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";

import type { Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { checkoutCustomer, checkoutLines, checkoutPoints, checkoutTotals } from "./checkout-fixtures";

/**
 * Checkout, from `references/072926/checkoutScreens/`.
 *
 * Two panes that answer two different questions. The left is *what is owed* —
 * lines, then who owes it, then the totals stack ending in a green TOTAL OWED
 * band. The right is *how it is being paid*: seven icon tabs over a body that
 * changes completely per tender, with nothing shared between them but the amount
 * field at the top.
 *
 * Seven tenders is the fact worth carrying into a redesign. Two are keyed
 * amounts (cash, check), one is a terminal handoff (credit), and four are
 * lookups against a stored balance (gift card, raincheck, member, room). The
 * device gives all seven the same weight in the strip even though a course rings
 * up cash and cards all day and a room charge almost never.
 *
 * A few things in here look like mistakes because they are — they are in the
 * shipping app and this is a replica of it:
 *
 *   - the button reads NAY WITH CARD, not PAY WITH CARD;
 *   - MEMBER and ROOM both head their amount field "Raincheck Amount", because
 *     the heading is not swapped when the tab changes;
 *   - MEMBER's third result column reads "Csutomer Balance".
 *
 * They are left alone deliberately. Quietly fixing them would make the replica
 * disagree with the device it is supposed to represent, and these are exactly
 * the kind of thing a redesign is meant to surface.
 *
 * Rendering only. Every fixture is a default and every interaction is an
 * optional callback, so the prototype can hand the same components live store
 * data. See Foundations → Prototype Seam.
 */

export type TenderTab = "CREDIT" | "CASH" | "GIFT CARD" | "RAIN" | "CHECK" | "MEMBER" | "ROOM";

export interface CheckoutLine {
    id: string;
    name: string;
    qty: number;
    unitPrice: number;
    seat?: number;
    image?: string;
    note?: string;
    /** On-hand / available, printed as a bare pair under the name. */
    stock?: [number, number];
}

const TABS: { key: TenderTab; Icon: typeof CreditCardIcon }[] = [
    { key: "CREDIT", Icon: CreditCardIcon },
    { key: "CASH", Icon: AttachMoneyIcon },
    { key: "GIFT CARD", Icon: CardGiftcardIcon },
    { key: "RAIN", Icon: CloudIcon },
    { key: "CHECK", Icon: NoteIcon },
    { key: "MEMBER", Icon: GroupsIcon },
    { key: "ROOM", Icon: HotelIcon },
];

/** Fixed quick-cash keys — not derived from the total, as the device is. */
const QUICK_CASH = [0, 5, 10, 20, 100];

const PANE_BG = "#F4F6F8";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/* --------------------------------------------------------------- tab strip */

export const TenderTabs = ({ active, onChange }: { active: TenderTab; onChange?: (tab: TenderTab) => void }) => (
    <Stack direction="row" sx={{ bgcolor: "#fff" }}>
        {TABS.map(({ key, Icon }) => {
            const isActive = key === active;
            return (
                <ButtonBase
                    key={key}
                    onClick={() => onChange?.(key)}
                    sx={{
                        flex: 1,
                        flexDirection: "column",
                        gap: 0.5,
                        pt: 1.75,
                        pb: 1.25,
                        // Inactive tabs are washed out rather than hidden — every
                        // tender stays visible so staff can see what is on offer.
                        color: isActive ? appColors.textPrimary : "#BFC4C9",
                        borderBottom: "3px solid",
                        borderColor: isActive ? appColors.textPrimary : "transparent",
                    }}
                >
                    <Icon sx={{ fontSize: 34 }} />
                    <Typography sx={{ fontSize: 13, letterSpacing: "0.06em" }}>{key}</Typography>
                </ButtonBase>
            );
        })}
    </Stack>
);

/* ------------------------------------------------------------ ticket pane */

const TotalRow = ({ label, value, green }: { label: string; value: string; green?: boolean }) => (
    <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.6 }}>
        <Typography sx={{ fontSize: 20, color: green ? appColors.greenTee : appColors.textPrimary }}>{label}</Typography>
        <Typography sx={{ fontSize: 20, color: green ? appColors.greenTee : appColors.textPrimary }}>{value}</Typography>
    </Stack>
);

/**
 * A tender already taken against this ticket.
 *
 * The shipping pane has a `Total Payments` row and nothing behind it: a ticket
 * settled by two credits and a card shows one number and no way back. Naming
 * each payment — and letting it be lifted off again — is what makes a
 * part-payment reversible instead of a mistake somebody has to void the whole
 * sale to fix.
 */
export interface AppliedPayment {
    id: string;
    /** How the receipt would name it, e.g. `Rain Check 51381`. */
    label: string;
    amount: number;
    /** Where it came from, in a phrase the customer would recognise. */
    note?: string;
}

export interface CheckoutTicketPaneProps {
    lines?: CheckoutLine[];
    customer?: string;
    /** The unlabelled figure beside the name. Read as loyalty points. */
    points?: number;
    subtotal?: number;
    tax?: number;
    total?: number;
    payments?: number;
    /**
     * Payments already applied. When given, `Total Payments` is their sum and
     * each gets its own removable row — omit for the shipping pane, which has
     * neither.
     */
    applied?: AppliedPayment[];
    /** Offered per payment. Without it the rows are read-only. */
    onRemovePayment?: (id: string) => void;
    fallbackImage?: string;
}

export const CheckoutTicketPane = ({
    lines = checkoutLines,
    customer = checkoutCustomer,
    points = checkoutPoints,
    subtotal = checkoutTotals.subtotal,
    tax = checkoutTotals.tax,
    total = checkoutTotals.total,
    payments,
    applied,
    onRemovePayment,
    fallbackImage,
}: CheckoutTicketPaneProps) => {
    const taken = applied?.reduce((sum, p) => sum + p.amount, 0) ?? payments ?? checkoutTotals.payments;
    const owed = Math.max(0, +(total - taken).toFixed(2));
    return (
    <Stack sx={{ width: "42%", minWidth: 0, bgcolor: "#fff", borderRight: `1px solid ${appColors.divider}` }}>
        <Stack sx={{ flex: 1, overflowY: "auto" }} divider={<Divider />}>
            {lines.map((l) => (
                <Stack key={`${l.id}-${l.seat ?? "x"}`} direction="row" spacing={2} sx={{ px: 2, py: 1.75, alignItems: "center" }}>
                    {(l.image ?? fallbackImage) && (
                        <Box
                            component="img"
                            src={l.image ?? fallbackImage}
                            alt=""
                            sx={{ width: 62, height: 62, objectFit: "contain", flexShrink: 0 }}
                        />
                    )}
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 19, fontWeight: 500 }} noWrap>
                            {l.name}
                        </Typography>
                        {l.stock ? (
                            // Two bare numbers, the second orange. Nothing on the
                            // device labels them; read as on-hand / available.
                            <Stack direction="row" spacing={1.5}>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{l.stock[0]}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.orange }}>{l.stock[1]}</Typography>
                            </Stack>
                        ) : (
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }} noWrap>
                                {l.note ?? `Qty ${l.qty} · ${usd(l.unitPrice)} each`}
                            </Typography>
                        )}
                    </Stack>
                    <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{usd(l.qty * l.unitPrice)}</Typography>
                </Stack>
            ))}
        </Stack>

        {/* A heavy rule, not a hairline — it separates ticket from money. */}
        <Box sx={{ borderTop: `2px solid ${appColors.textPrimary}`, px: 2, pt: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: "center" }}>
                <Typography sx={{ fontSize: 17 }}>{customer}</Typography>
                <BusinessCenterOutlinedIcon sx={{ fontSize: 18, color: appColors.textSecondary }} />
                <Typography sx={{ fontSize: 17 }}>{points}</Typography>
            </Stack>
            <TotalRow label="SubTotal" value={usd(subtotal)} />
            <TotalRow label="Taxes" value={usd(tax)} />
            <TotalRow label="Grand Total" value={usd(total)} />
            <TotalRow label="Total Payments" value={usd(taken)} green />

            {/* Each payment on its own line, under the total it contributes to,
                with the way to take it back off. */}
            {applied?.map((p) => (
                <Stack key={p.id} direction="row" sx={{ alignItems: "center", gap: 1, py: 0.5, pl: 1.5 }}>
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 16, color: appColors.greenTee }}>{p.label}</Typography>
                        {p.note && <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{p.note}</Typography>}
                    </Stack>
                    <Typography sx={{ fontSize: 16, color: appColors.greenTee }}>−{usd(p.amount)}</Typography>
                    {onRemovePayment && (
                        <IconButton
                            aria-label={`Remove ${p.label}`}
                            onClick={() => onRemovePayment(p.id)}
                            sx={{ width: 40, height: 40, color: appColors.textSecondary }}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    )}
                </Stack>
            ))}
        </Box>
        <Stack direction="row" sx={{ justifyContent: "space-between", bgcolor: appColors.greenTee, color: "#fff", px: 2, py: 2, mt: 1.5 }}>
            <Typography sx={{ fontSize: 22 }}>{owed === 0 && taken > 0 ? "Paid in full" : "Total Owed"}</Typography>
            <Typography sx={{ fontSize: 22 }}>{usd(owed)}</Typography>
        </Stack>
    </Stack>
    );
};

/* ------------------------------------------------------------ tender pane */

const AmountField = ({ heading, value, onChange }: { heading: string; value: string; onChange?: (v: string) => void }) => (
    <>
        <Typography sx={{ fontSize: 24, textAlign: "center", mt: 4, mb: 2 }}>{heading}</Typography>
        <InputBase
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={!onChange}
            inputProps={{ "aria-label": heading }}
            sx={{
                display: "block",
                width: 344,
                mx: "auto",
                bgcolor: "#fff",
                border: "1px solid",
                borderColor: appColors.divider,
                "& input": { textAlign: "center", fontSize: 17, py: 1.75 },
            }}
        />
    </>
);

/**
 * The grey lookup field the account-style tenders share.
 *
 * Static on the tenders whose lookup is not wired; live wherever `onChange` is
 * supplied. Same field either way, because the difference is what the screen can
 * do, not what it looks like.
 */
const LookupField = ({ label, value = "---", onChange }: { label: string; value?: string; onChange?: (v: string) => void }) => (
    <Box sx={{ mx: 3, mt: 3, bgcolor: "#E4E6E8", px: 2, pt: 1.25, pb: 1, borderBottom: `1px solid ${appColors.textSecondary}` }}>
        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
        {onChange ? (
            <InputBase
                value={value}
                onChange={(e) => onChange(e.target.value)}
                inputProps={{ "aria-label": label }}
                sx={{ width: "100%", "& input": { fontSize: 16, p: 0 } }}
            />
        ) : (
            <Typography sx={{ fontSize: 16 }}>{value}</Typography>
        )}
    </Box>
);

/** The green result band. Three columns whose headings differ per tender. */
const ResultBand = ({ columns, values }: { columns: string[]; values?: string[] }) => (
    <Stack direction="row" sx={{ mx: 3, mt: 2, bgcolor: appColors.greenTee, color: "#fff", px: 2, py: 2.5 }}>
        {columns.map((c, i) => (
            <Stack key={c} sx={{ flex: 1, gap: 1 }}>
                <Typography sx={{ fontSize: 16 }}>{c}</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: values?.[i] ? 700 : 400 }}>{values?.[i] ?? "---"}</Typography>
            </Stack>
        ))}
    </Stack>
);

/** The two greyed buttons pinned above the action bar on the keyed tenders. */
const CardButtons = () => (
    <Stack direction="row" spacing={1} sx={{ mt: "auto", px: 1.5, pb: 1.5 }}>
        {/* "NAY" is the shipping app's typo — see the note at the top of the file. */}
        {["NAY WITH CARD", "MANUAL PAYMENT"].map((label) => (
            <Box
                key={label}
                sx={{ flex: 1, bgcolor: "#DCDEE0", color: "#8A9096", textAlign: "center", py: 2.5, fontSize: 15, letterSpacing: "0.06em" }}
            >
                {label}
            </Box>
        ))}
    </Stack>
);

/**
 * What the RAIN tab needs from its caller.
 *
 * The lookup returns credits, not customers — one person can be holding two, and
 * which one is being spent is the operator's call, not something a name can
 * settle. That is why the results are a row of amount chips rather than the
 * customer sheet every other lookup in the app uses.
 */
export interface RaincheckLookupProps {
    query: string;
    onQuery?: (query: string) => void;
    results: Raincheck[];
    selectedId?: string;
    onSelect?: (id: string) => void;
}

const RaincheckPanel = ({
    amount,
    onAmount,
    lookup,
}: {
    amount: string;
    onAmount?: (v: string) => void;
    lookup: RaincheckLookupProps;
}) => {
    const selected = lookup.results.find((r) => r.id === lookup.selectedId);
    return (
        <>
            <AmountField heading="Raincheck Amount" value={amount} onChange={onAmount} />
            <LookupField label="Enter Raincheck id, customer name, or email" value={lookup.query} onChange={lookup.onQuery} />

            {lookup.results.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ px: 3, mt: 2, flexWrap: "wrap", rowGap: 1 }}>
                    {lookup.results.map((r) => {
                        const isSelected = r.id === lookup.selectedId;
                        return (
                            <ButtonBase
                                key={r.id}
                                onClick={() => lookup.onSelect?.(r.id)}
                                sx={{
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    minWidth: 84,
                                    px: 1.25,
                                    py: 0.75,
                                    borderRadius: 0.5,
                                    // The device gives the chips no selected state
                                    // at all — the only feedback is the amount
                                    // field changing. Green here is an addition,
                                    // because a tap with no acknowledgement on a
                                    // money screen is worth fixing.
                                    bgcolor: isSelected ? appColors.greenTee : appColors.navy,
                                    color: "#fff",
                                }}
                            >
                                <Typography sx={{ fontSize: 12 }}>ID : {r.id}</Typography>
                                <Typography sx={{ fontSize: 12 }}>{usd(r.balance)}</Typography>
                            </ButtonBase>
                        );
                    })}
                </Stack>
            )}

            {lookup.query.trim().length >= 2 && lookup.results.length === 0 && (
                <Typography sx={{ px: 3, mt: 2, fontSize: 16, color: appColors.textSecondary }}>
                    No rainchecks match “{lookup.query.trim()}”.
                </Typography>
            )}

            <ResultBand
                columns={["Customer Name", "TenFore Raincheck ID", "Raincheck Balance"]}
                values={selected ? [selected.customerName, selected.id, usd(selected.balance)] : undefined}
            />
        </>
    );
};

export interface TenderPanelProps {
    tab: TenderTab;
    amount: string;
    onAmount?: (value: string) => void;
    /** Required for RAIN to do anything; ignored on every other tab. */
    raincheck?: RaincheckLookupProps;
}

export const TenderPanel = ({ tab, amount, onAmount, raincheck }: TenderPanelProps) => {
    switch (tab) {
        case "CREDIT":
            return (
                <>
                    <AmountField heading="Charge amount" value={amount} onChange={onAmount} />
                    <CardButtons />
                </>
            );
        case "CASH":
            return (
                <>
                    <AmountField heading="Cash Amount" value={amount} onChange={onAmount} />
                    <Typography sx={{ fontSize: 20, px: 3, mt: 3, mb: 1.5 }}>Charge amount</Typography>
                    <Stack direction="row" spacing={1} sx={{ px: 3 }}>
                        {QUICK_CASH.map((v) => (
                            <ButtonBase
                                key={v}
                                onClick={() => onAmount?.(usd(v))}
                                sx={{ flex: 1, bgcolor: appColors.slate, color: "#fff", py: 2.5, fontSize: 16 }}
                            >
                                {usd(v)}
                            </ButtonBase>
                        ))}
                    </Stack>
                    <CardButtons />
                </>
            );
        case "GIFT CARD":
            return (
                <>
                    <AmountField heading="Gift Card Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Enter UPC code or customer name" />
                    <ResultBand columns={["Customer Name", "UPC", "Balance"]} />
                </>
            );
        case "RAIN":
            return raincheck ? (
                <RaincheckPanel amount={amount} onAmount={onAmount} lookup={raincheck} />
            ) : (
                <>
                    <AmountField heading="Raincheck Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Enter Raincheck id, customer name, or email" />
                    <ResultBand columns={["Customer Name", "TenFore Raincheck ID", "Raincheck Balance"]} />
                </>
            );
        case "CHECK":
            return (
                <>
                    <AmountField heading="Cash Amount" value={amount} onChange={onAmount} />
                    <AmountField heading="Check Number" value={usd(0)} />
                    <CardButtons />
                </>
            );
        case "MEMBER":
            return (
                <>
                    {/* Heading is not swapped for this tab on the device. */}
                    <AmountField heading="Raincheck Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Search by customer name, email, or phone...." />
                    <ResultBand columns={["Customer Name", "Customer ID", "Csutomer Balance"]} />
                </>
            );
        case "ROOM":
            return (
                <>
                    <AmountField heading="Raincheck Amount" value={amount} onChange={onAmount} />
                    <LookupField label="Search by room" />
                    <ButtonBase
                        sx={{
                            mx: 3,
                            mt: 2,
                            bgcolor: appColors.slate,
                            color: "#fff",
                            py: 2.5,
                            gap: 1,
                            fontSize: 16,
                            letterSpacing: "0.06em",
                            boxShadow: 2,
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 22 }} />
                        LOOK UP ROOM
                    </ButtonBase>
                    <ResultBand columns={["Customer Name", "UPC", "Balance"]} />
                </>
            );
    }
};

/* ------------------------------------------------------------------- body */

export interface CheckoutBodyProps extends CheckoutTicketPaneProps, TenderPanelProps {
    onTab?: (tab: TenderTab) => void;
}

/** Both panes side by side — the whole screen below the app bar. */
export const CheckoutBody = ({ tab = "CASH", amount = "$0.00", onAmount, onTab, raincheck, ...ticket }: Partial<CheckoutBodyProps>) => (
    <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
        <CheckoutTicketPane {...ticket} />
        <Stack sx={{ flex: 1, minWidth: 0, bgcolor: PANE_BG }}>
            <TenderTabs active={tab} onChange={onTab} />
            <Stack sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <TenderPanel tab={tab} amount={amount} onAmount={onAmount} raincheck={raincheck} />
            </Stack>
        </Stack>
    </Stack>
);
