import { useEffect, useMemo, useState } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { CheckoutBody, type TenderTab } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import { searchRainchecks } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { Shell } from "../pos-shell";
import { lineTotal, money, useActions, useStore } from "../store";

/**
 * Checkout, from `references/072926/checkoutScreens/`.
 *
 * The two panes and the seven tenders live in the design system
 * (`components/screens/checkout/`); this screen is the wiring — the open ticket,
 * the raincheck lookup, and what each action bar button does. See Foundations →
 * Prototype Seam for why the split falls here.
 *
 * The RAIN tab is the one tender that does real work. A raincheck is a stored
 * balance that some earlier round created, so paying with one means finding it
 * first: the operator types a name, id or email, gets back the *credits* rather
 * than the customers, and picks which to spend. One person can be holding two,
 * which is why the results are amount chips and not the customer sheet the rest
 * of the app uses for lookups.
 */

const RAIN_MIN_QUERY = 2;

export const PaymentScreen = () => {
    const { ticket, lines, total, subtotal, tax, state } = useStore();
    const { pay } = useActions();
    const navigate = useNavigate();

    const [tab, setTab] = useState<TenderTab>("CASH");
    const [amount, setAmount] = useState(money(0));
    const [authorising, setAuthorising] = useState(false);

    // RAIN lookup state. Kept here rather than in the component so the query
    // survives a tab switch — an operator who taps CASH to check the total and
    // comes back should not have to search again.
    const [rainQuery, setRainQuery] = useState("");
    const [rainId, setRainId] = useState<string | undefined>();

    const sale = state.lastSale;

    const rainResults = useMemo(() => searchRainchecks(rainQuery, state.rainchecks), [rainQuery, state.rainchecks]);
    const selectedRaincheck = rainResults.find((r) => r.id === rainId);

    // Card runs a short fake authorisation so the waiting state is visible.
    useEffect(() => {
        if (!authorising) return;
        const t = setTimeout(() => {
            pay("Card");
            setAuthorising(false);
        }, 1200);
        return () => clearTimeout(t);
    }, [authorising, pay]);

    if (!ticket && sale) return <OrderCompleteScreen sale={sale} />;

    if (!ticket) {
        return (
            <Shell
                title="Payments"
                active="proshop"
                actionBar={<ActionButton onClick={() => navigate("/proshop")}>Back to register</ActionButton>}
            >
                <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 22 }}>No open ticket</Typography>
                    <Typography sx={{ color: appColors.textSecondary }}>Ring something up first.</Typography>
                </Stack>
            </Shell>
        );
    }

    const onRain = tab === "RAIN";

    const tender = () => {
        if (onRain) {
            if (!selectedRaincheck) return;
            // The credit settles the ticket in full; the drawer sees nothing.
            pay("Rain Check", 0, selectedRaincheck.id);
            return;
        }
        if (tab === "CREDIT") return setAuthorising(true);
        // Cash carries the tendered figure so the receipt can print Change Due;
        // every other tender is exact by definition.
        const keyed = Number(amount.replace(/[^0-9.]/g, "")) || 0;
        pay(
            tab === "CASH" ? "Cash" : tab === "GIFT CARD" ? "Gift card" : "Member account",
            tab === "CASH" ? Math.max(keyed, total) : undefined,
        );
    };

    const customer = ticket.customer ?? ticket.name;
    const record = state.customers.find((c) => c.displayName === customer);

    return (
        <Shell
            title="Credit Card Payment"
            active="proshop"
            accountLabel="Join Admin"
            actionBar={
                <>
                    <ActionButton icon={<GolfCourseIcon />} onClick={() => navigate("/teesheet")}>
                        Tee Sheet
                    </ActionButton>
                    <ActionButton icon={<StorefrontIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton icon={<PersonIcon />} onClick={() => navigate("/customersearch")}>
                        {customer}
                    </ActionButton>
                    <ActionButton icon={<NotesIcon />}>Order Notes</ActionButton>
                    {/* The commit renames itself per tender, and goes flat when a
                        raincheck has been searched for but not chosen. */}
                    <ActionButton
                        icon={onRain ? <BoltIcon /> : <CheckIcon />}
                        tone={onRain && !selectedRaincheck ? "disabled" : "primary"}
                        grow={1.6}
                        onClick={tender}
                    >
                        {authorising ? "Authorising…" : onRain ? "Apply Raincheck" : "Pay"}
                    </ActionButton>
                </>
            }
        >
            <CheckoutBody
                lines={lines.map((l) => ({
                    id: l.id,
                    name: l.name,
                    qty: l.qty,
                    unitPrice: lineTotal(l) / Math.max(1, l.qty),
                    seat: l.seat,
                    image: l.image,
                    note: l.note,
                    stock: l.stock,
                }))}
                fallbackImage={assetUrl("logos/tf-square-black.svg")}
                customer={customer}
                points={record?.rewardsBalance ?? lines.reduce((n, l) => n + l.qty, 0)}
                subtotal={subtotal}
                tax={tax}
                total={total}
                payments={0}
                tab={tab}
                onTab={setTab}
                // The chosen credit fills the amount field, as the device does.
                amount={onRain && selectedRaincheck ? money(selectedRaincheck.balance) : amount}
                onAmount={setAmount}
                raincheck={{
                    query: rainQuery,
                    onQuery: (q) => {
                        setRainQuery(q);
                        if (q.trim().length < RAIN_MIN_QUERY) setRainId(undefined);
                    },
                    results: rainResults,
                    selectedId: rainId,
                    onSelect: setRainId,
                }}
            />
        </Shell>
    );
};

/**
 * Order Complete.
 *
 * The screen is a design-system component; this is the wiring — the store's last
 * sale mapped onto it, and what the four exits do.
 */
const OrderCompleteScreen = ({ sale }: { sale: NonNullable<ReturnType<typeof useStore>["state"]["lastSale"]> }) => {
    const { state } = useStore();
    const navigate = useNavigate();
    const [toast, setToast] = useState<string | null>(null);

    const say = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2600);
    };

    return (
        <OrderComplete
            sale={{
                facility: state.facility,
                orderNumber: sale.orderNumber,
                lines: sale.ticket.lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty, total: lineTotal(l), seat: l.seat })),
                tender: sale.tender,
                paid: sale.paid,
                cash: sale.cash,
                change: sale.change,
                subtotal: sale.subtotal,
                tax: sale.tax,
                total: sale.total,
            }}
            email={state.customers[0]?.email ?? ""}
            toast={toast}
            onPrint={() => say("Print job queued up!")}
            onSend={() => say("Email receipt sent!")}
            onExit={(to) => navigate(`/${to}`)}
        />
    );
};
