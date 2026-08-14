import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import HistoryIcon from "@mui/icons-material/History";
import NotesIcon from "@mui/icons-material/Notes";
import PrintIcon from "@mui/icons-material/Print";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { NotesDialog, ReservationHistoryDialog, TeeTimeNotesDialog } from "@/components/screens/tee-sheet/tee-sheet-dialogs";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore, type Position } from "../store";

/**
 * Tee time detail, from `references/072926/2-teesheet/`.
 *
 * A **light** screen, not dark — an earlier pass read a modal scrim in the
 * screenshot as the screen's own background and built it dark.
 *
 * One card per booked position. The grey line under each name is the whole
 * commercial story of that round in one run of text: holes, the green fee and
 * what it charged, the transportation fee and what it charged, the reservation
 * id, and points earned and redeemed. It is unlabelled and unaligned, so reading
 * it is a matter of knowing the order — which is worth flagging rather than
 * quietly fixing, because it is the densest thing on the screen and the part
 * staff actually need at the counter.
 *
 * The action row differs by state: an unpaid booking can be cancelled, no-showed
 * and added to the cart; a paid one can be rainchecked and reprinted. Both keep
 * History, Edit and a cart action, so the row length stays constant and the
 * buttons do not move under your thumb between cards.
 */

const CardAction = ({
    label,
    icon,
    tone = "dark",
    onClick,
}: {
    label: string;
    icon?: React.ReactNode;
    tone?: "dark" | "red" | "green";
    onClick?: () => void;
}) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            flex: 1,
            minHeight: 52,
            gap: 0.75,
            px: 1,
            fontSize: 14,
            letterSpacing: "0.04em",
            color: "#fff",
            bgcolor: tone === "red" ? "#E53935" : tone === "green" ? appColors.green : appColors.slate,
            "&:hover": { filter: "brightness(1.1)" },
        }}
    >
        {icon}
        {label}
    </ButtonBase>
);

/** The unlabelled meta line, in the app's own order. */
const metaLine = (p: Position) =>
    [
        `${p.holes} holes`,
        p.rateName,
        p.cartLabel,
        `ID:${p.id}`,
        p.pointsEarn ? `+${p.pointsEarn}` : null,
        p.pointsRedeem ? String(p.pointsRedeem) : null,
        p.rounds,
        p.noShow ? "NO SHOW" : null,
    ]
        .filter(Boolean)
        .join("   ");

const SummaryBand = () => (
    <Stack direction="row" sx={{ bgcolor: appColors.slate, color: "#fff", px: 3, py: 2, alignItems: "center", gap: 4 }}>
        {["Customer", "Current Membership(s)", "Rounds", "Rewards Balance:"].map((label) => (
            <Stack key={label} sx={{ flex: 1, alignItems: "center" }}>
                <Typography sx={{ fontSize: 13 }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>--------</Typography>
            </Stack>
        ))}
        {/* RESERVE stays grey until a customer has been picked above. */}
        <Stack direction="row" sx={{ bgcolor: "#8f9296", color: "#fff", px: 3, py: 1.5, alignItems: "center", gap: 1 }}>
            <CheckIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: 14, letterSpacing: "0.06em" }}>RESERVE</Typography>
        </Stack>
    </Stack>
);

export const TeeTimeDetailScreen = () => {
    const { time = "" } = useParams();
    const decoded = decodeURIComponent(time);
    const { state, teeTimes } = useStore();
    const { chargeTeeTime, cancelPosition, markNoShow, signOutCart, setPositionNotes, setTeeTimeNotes } = useActions();
    const navigate = useNavigate();

    const slot = teeTimes.find((t) => t.time === decoded);
    const booked = slot?.positions.map((p, i) => ({ p, i })).filter((x): x is { p: Position; i: number } => Boolean(x.p)) ?? [];
    const total = booked.reduce((s, { p }) => s + p.price, 0);

    const [historyFor, setHistoryFor] = useState<number | null>(null);
    const [notesFor, setNotesFor] = useState<{ index: number; field: "customerNotes" | "groupNotes" } | null>(null);
    const [noteDraft, setNoteDraft] = useState("");
    const [teeNotesOpen, setTeeNotesOpen] = useState(false);
    const [teeNoteDraft, setTeeNoteDraft] = useState(slot?.teeTimeNotes ?? "");

    const openNotes = (index: number, field: "customerNotes" | "groupNotes") => {
        setNoteDraft((booked.find((b) => b.i === index)?.p[field] as string) ?? "");
        setNotesFor({ index, field });
    };

    const historyPosition = historyFor === null ? null : (booked.find((b) => b.i === historyFor)?.p ?? null);

    return (
        <Shell
            title={`${state.facility} - ${state.course} - ${state.sheetDate === "2026-05-12" ? "Tuesday, May 12 2026" : state.sheetDate} ${decoded} - ${slot?.confirmation ?? "—"} - ${slot?.nine ?? "FRONT"}`}
            active="teesheet"
            showCart
            showLogOut={false}
            accountLabel=""
            actionBar={
                <>
                    <ActionButton icon={<CalendarMonthIcon />} onClick={() => navigate("/teesheet")}>
                        Tee Sheet
                    </ActionButton>
                    <ActionButton icon={<StorefrontIcon />} onClick={() => navigate("/proshop")}>
                        Pro Shop
                    </ActionButton>
                    <ActionButton
                        icon={<AddIcon />}
                        tone={booked.length ? "default" : "disabled"}
                        onClick={() => {
                            if (!booked.length) return;
                            chargeTeeTime(decoded);
                            navigate("/proshop");
                        }}
                    >
                        Add all to cart
                    </ActionButton>
                    <ActionButton icon={<NotesIcon />} onClick={() => setTeeNotesOpen(true)}>
                        Tee time notes
                    </ActionButton>
                    <ActionButton
                        icon={<ShoppingCartIcon />}
                        tone={booked.length ? "primary" : "disabled"}
                        onClick={() => booked.length && navigate("/pay")}
                    >
                        {booked.length ? `Pay ${money(total)}` : "Pay"}
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: "#fff", minHeight: "100%" }}>
                <Stack direction="row" sx={{ bgcolor: "#E3E3E3", px: 3, py: 2.5, gap: 4 }}>
                    <InputBase placeholder="Search by customer name, email, or phone…" sx={{ flex: 2, fontSize: 20 }} />
                    <InputBase placeholder="Member Number…" sx={{ flex: 1, fontSize: 20 }} />
                </Stack>

                <SummaryBand />

                <Stack spacing={1.5} sx={{ p: 1.5 }}>
                    {booked.length === 0 && (
                        <Typography sx={{ p: 3, fontSize: 18, color: appColors.textSecondary }}>
                            This time is open. Search for a customer above to reserve it.
                        </Typography>
                    )}

                    {booked.map(({ p, i }) => (
                        <Box key={`${p.id}-${i}`} sx={{ bgcolor: appColors.detailCard, p: 2 }}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    {/* The name opens the record when there is
                                        one behind it. Leagues and outings are
                                        bookings without a customer, so theirs
                                        stays plain text rather than a dead link. */}
                                    {p.customerId ? (
                                        <ButtonBase
                                            onClick={() => navigate(`/customersearch/${p.customerId}`)}
                                            sx={{ fontSize: 30, textDecoration: "underline", textUnderlineOffset: 5 }}
                                        >
                                            {p.name}
                                        </ButtonBase>
                                    ) : (
                                        <Typography sx={{ fontSize: 30 }}>{p.name}</Typography>
                                    )}
                                    {p.balance && <Typography sx={{ fontSize: 22 }}>$</Typography>}
                                    {p.raincheck && <BoltIcon sx={{ fontSize: 22 }} />}
                                    {p.keyed && <VpnKeyIcon sx={{ fontSize: 20 }} />}
                                </Stack>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                    {/* The two note buttons only appear on some
                                        reservations on the device; here they are on
                                        every card, because a note nobody can reach is
                                        a note nobody writes. */}
                                    <ButtonBase
                                        onClick={() => openNotes(i, "customerNotes")}
                                        sx={{ px: 1.5, py: 0.75, fontSize: 13, bgcolor: p.customerNotes ? appColors.green : "#C9CFD5", color: "#fff" }}
                                    >
                                        CUSTOMER NOTES
                                    </ButtonBase>
                                    <ButtonBase
                                        onClick={() => openNotes(i, "groupNotes")}
                                        sx={{ px: 1.5, py: 0.75, fontSize: 13, bgcolor: p.groupNotes ? appColors.green : "#C9CFD5", color: "#fff" }}
                                    >
                                        GROUP NOTES
                                    </ButtonBase>
                                    <Typography sx={{ fontSize: 26 }}>{money(p.price)}</Typography>
                                </Stack>
                            </Stack>

                            <Typography sx={{ fontSize: 13, color: "#5a6068", mb: 1.5, whiteSpace: "pre-wrap" }}>{metaLine(p)}</Typography>

                            <Stack direction="row" spacing={1}>
                                {p.paid ? (
                                    <>
                                        <CardAction
                                            label="Raincheck"
                                            tone="red"
                                            icon={<BoltIcon sx={{ fontSize: 18 }} />}
                                            // Opens the create screen rather than
                                            // issuing outright — how many holes
                                            // were played is the whole decision,
                                            // and only a human knows it.
                                            onClick={() => navigate(`/teesheet/${encodeURIComponent(decoded)}/${i}/raincheck`)}
                                        />
                                        <CardAction
                                            label="History"
                                            icon={<HistoryIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => setHistoryFor(i)}
                                        />
                                        <CardAction
                                            label="Edit"
                                            icon={<EditIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => navigate(`/teesheet/${encodeURIComponent(decoded)}/${i}/edit`)}
                                        />
                                        <CardAction label="Print starter" icon={<PrintIcon sx={{ fontSize: 18 }} />} />
                                        <CardAction label="Print receipt" icon={<PrintIcon sx={{ fontSize: 18 }} />} />
                                        <CardAction
                                            label="Cart key"
                                            icon={<VpnKeyIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => signOutCart(decoded, i)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <CardAction
                                            label="Cancel"
                                            tone="red"
                                            icon={<CloseIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => cancelPosition(decoded, i)}
                                        />
                                        <CardAction
                                            label="No show"
                                            tone="red"
                                            icon={<ErrorOutlineIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => markNoShow(decoded, i)}
                                        />
                                        <CardAction
                                            label="History"
                                            icon={<HistoryIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => setHistoryFor(i)}
                                        />
                                        <CardAction
                                            label="Edit"
                                            icon={<EditIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => navigate(`/teesheet/${encodeURIComponent(decoded)}/${i}/edit`)}
                                        />
                                        <CardAction
                                            label="Cart signout"
                                            icon={<CreditCardIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => navigate(`/teesheet/${encodeURIComponent(decoded)}/${i}/cartsignout`)}
                                        />
                                        <CardAction
                                            label="Add to cart"
                                            tone="green"
                                            icon={<ShoppingCartIcon sx={{ fontSize: 18 }} />}
                                            onClick={() => {
                                                chargeTeeTime(decoded, i);
                                                navigate("/proshop");
                                            }}
                                        />
                                    </>
                                )}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>

            {historyPosition && (
                <ReservationHistoryDialog
                    open
                    id={historyPosition.id}
                    entries={historyPosition.history.map((h) => ({ when: h.at, who: h.by, what: h.what }))}
                    onClose={() => setHistoryFor(null)}
                />
            )}

            {notesFor && (
                <NotesDialog
                    open
                    title={notesFor.field === "customerNotes" ? "Customer Notes" : "Group Notes"}
                    value={noteDraft}
                    onChange={setNoteDraft}
                    onCancel={() => setNotesFor(null)}
                    onSave={() => {
                        setPositionNotes(decoded, notesFor.index, notesFor.field, noteDraft);
                        setNotesFor(null);
                    }}
                />
            )}

            {teeNotesOpen && (
                <TeeTimeNotesDialog
                    open
                    value={teeNoteDraft}
                    onChange={setTeeNoteDraft}
                    onSave={() => {
                        setTeeTimeNotes(decoded, teeNoteDraft);
                        setTeeNotesOpen(false);
                    }}
                />
            )}
        </Shell>
    );
};
