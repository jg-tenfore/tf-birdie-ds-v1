import { useState } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { CartSignOutScreen, EditReservationScreen } from "@/components/screens/tee-sheet/tee-time-edit";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * The two screens a reservation's Edit and Cart Signout buttons push onto.
 *
 * Both bodies are the Storybook components; these wrappers supply live data, the
 * app chrome and the bottom bars. Neither is a dialog — the device takes over the
 * whole canvas and returns via an explicit BACK.
 */

/** Green-fee rates the course sells, and what each charges for 18 holes. */
/** Exported so the phone build's Edit screen prices from the same table. */
export const GREEN_FEES: Record<string, number> = {
    "Birdie (25%)": 46.5,
    Cheapos: 19,
    "Course Level Fee": 58,
    "Dunes Rack Prime": 62,
    "Gold Fee (50%)": 31,
    "Hamlet's Super Fee": 74,
    "Online Discount": 52,
    "Senior Weekday": 34,
};

export const TRANSPORT_FEES: Record<string, number> = {
    "Dune Cart Plus": 32,
    "Dunes Cart": 26.82,
    "Dunes Member Cart": 0,
    "Dunes Walking": 8.58,
    "Jeremy Week Day Mem Trans": 0,
};

/** `Name : $0.00` — the format both the detail line and this screen use. */
export const feeLabel = (name: string, amount: number) => `${name} : ${money(amount)}`;
export const nameOf = (label: string | undefined) => (label ?? "").split(" : ")[0];

export const TeeTimeEditScreen = () => {
    const { time = "", index = "0" } = useParams();
    const decoded = decodeURIComponent(time);
    const slot = Number(index);

    const { state, teeTimes } = useStore();
    const { editPositionFees } = useActions();
    const navigate = useNavigate();

    const position = teeTimes.find((t) => t.time === decoded)?.positions[slot] ?? null;

    const [green, setGreen] = useState(() => nameOf(position?.rateName) || "Birdie (25%)");
    const [transport, setTransport] = useState(() => nameOf(position?.cartLabel) || "Dunes Cart");
    const [eighteen, setEighteen] = useState(position?.holes !== 9);

    const back = () => navigate(`/teesheet/${encodeURIComponent(decoded)}`);

    if (!position) {
        return (
            <Shell title="Edit reservation" active="teesheet" actionBar={<ActionButton onClick={back}>Back</ActionButton>}>
                <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 20 }}>That position is no longer booked.</Typography>
                </Stack>
            </Shell>
        );
    }

    // Nine holes halves the green fee but not the cart — the cart goes out either
    // way, which is why the two totals are kept apart on this screen.
    const greenAmount = +((GREEN_FEES[green] ?? 0) / (eighteen ? 1 : 2)).toFixed(2);
    const transportAmount = TRANSPORT_FEES[transport] ?? 0;

    const save = (toAll: boolean) => {
        const rateName = feeLabel(green, greenAmount);
        const cartLabel = feeLabel(transport, transportAmount);
        const price = +(greenAmount + transportAmount).toFixed(2);
        const targets = toAll
            ? (teeTimes
                  .find((t) => t.time === decoded)
                  ?.positions.map((p, i) => (p ? i : null))
                  .filter((i): i is number => i !== null) ?? [])
            : [slot];
        for (const i of targets) editPositionFees(decoded, i, rateName, cartLabel, price);
        back();
    };

    return (
        <Shell
            title={`${state.facility} - ${state.course} - ${decoded}`}
            active="teesheet"
            topBarRight={null}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={back}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<AddIcon />} onClick={() => navigate("/customersearch")}>
                        Add customer
                    </ActionButton>
                    <ActionButton icon={<EmailIcon />}>Send email</ActionButton>
                    {/* Applies this selection to every player in the time, which is
                        why it sits beside SAVE rather than inside it. */}
                    <ActionButton icon={<DoneAllIcon />} tone="primary" onClick={() => save(true)}>
                        Save fees to all
                    </ActionButton>
                    <ActionButton icon={<CheckIcon />} tone="primary" onClick={() => save(false)}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <EditReservationScreen
                guest={{
                    name: position.name,
                    when: `${state.sheetDate === "2026-05-12" ? "5/12/2026" : state.sheetDate} ${decoded}`,
                    email: position.email ?? "—",
                }}
                holesLabel={eighteen ? "18 holes" : "9 holes"}
                holesOn={eighteen}
                onToggleHoles={() => setEighteen((v) => !v)}
                greenFees={{
                    options: Object.keys(GREEN_FEES),
                    selected: green,
                    subTotal: money(+(greenAmount * 0.94).toFixed(2)),
                    grandTotal: money(greenAmount),
                }}
                transportFees={{
                    options: Object.keys(TRANSPORT_FEES),
                    selected: transport,
                    subTotal: money(+(transportAmount * 0.883).toFixed(2)),
                    grandTotal: money(transportAmount),
                }}
                onSelectGreenFee={setGreen}
                onSelectTransport={setTransport}
            />
        </Shell>
    );
};

export const TeeTimeCartSignOutScreen = () => {
    const { time = "", index = "0" } = useParams();
    const decoded = decodeURIComponent(time);
    const slot = Number(index);

    const { teeTimes } = useStore();
    const { signOutCart } = useActions();
    const navigate = useNavigate();

    const position = teeTimes.find((t) => t.time === decoded)?.positions[slot] ?? null;
    const [cartNumber, setCartNumber] = useState("");
    const [consented, setConsented] = useState(false);

    const back = () => navigate(`/teesheet/${encodeURIComponent(decoded)}`);

    return (
        <Shell
            title="Cart Sign Out"
            active="teesheet"
            topBarRight={null}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={back}>
                        Back
                    </ActionButton>
                    {/* Both gates have to be met: a cart number and the waiver. The
                        device lets you sign out a cart without either, which is how
                        a cart leaves with nobody's name against it. */}
                    <ActionButton
                        icon={<CheckIcon />}
                        tone={cartNumber && consented ? "primary" : "disabled"}
                        grow={2}
                        onClick={() => {
                            if (!cartNumber || !consented) return;
                            signOutCart(decoded, slot);
                            back();
                        }}
                    >
                        Sign out cart
                    </ActionButton>
                </>
            }
        >
            <CartSignOutScreen
                reservation={`Reservation #${position?.id ?? "—"}`}
                customer={position?.name ?? "—"}
                cartNumber={cartNumber}
                onCartNumber={setCartNumber}
                consented={consented}
                onConsent={setConsented}
            />
        </Shell>
    );
};
