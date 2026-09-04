import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BoltIcon from "@mui/icons-material/Bolt";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryIcon from "@mui/icons-material/History";
import NotesIcon from "@mui/icons-material/Notes";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import PublicIcon from "@mui/icons-material/Public";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate, useParams } from "react-router-dom";

import { MobileEmpty, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { money, slashDate, useActions, useStore, type Position } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * The tee time, on a phone. Live against the store.
 *
 * ## What changed from `app/src/screens/tee-time-detail.tsx`
 *
 * **The seven-button action row becomes a per-player bottom sheet.** Landscape
 * gives every booking a row of six or seven 52dp buttons — Cancel, No Show,
 * History, Edit, Cart Signout, Add to Cart for an unpaid round; Raincheck,
 * History, Edit, Print Starter, Print Receipt, Cart Key for a paid one. Seven
 * buttons need roughly 700px. A phone has 402, and the row also has to hold a
 * name, an amount and a meta line. So tapping the player opens a sheet.
 *
 * **The set is not trimmed.** Every action the tablet offers that player is in
 * the sheet, in the tablet's own order, because *which* actions a booking has is
 * itself information: a paid round offers Raincheck and reprints, an unpaid one
 * offers Cancel and Add to Cart. Collapsing them to a common five would hide the
 * state of the booking.
 *
 * **The meta line wraps instead of truncating.** `18 holes   Group Pricing :
 * $28.47   Dunes Cart Old : $26.82   ID:10390147   +125   -1250` is one grey
 * line on tablet and six facts wide. Truncating it would cut the fee names,
 * which are exactly how a starter checks the right rate was applied — so the
 * thing given up is the horizontal alignment, not the content.
 *
 * **Four dialogs become four screen states.** Reservation history, customer
 * notes, group notes and tee time notes are centred cards on tablet. A notes
 * dialog whose whole purpose is a text area cannot be a card inside 402px, so
 * each takes the screen with `X` to abandon and the commit as the primary.
 *
 * **The customer search band goes.** Landscape puts a name/email/phone field and
 * a member-number field above a four-column summary, for booking into an open
 * position — a flow the store has no action for on either device. Rather than
 * fake a search that cannot reserve, the open positions are stated and the
 * counter is where a booking gets taken.
 *
 * ## What is actually live
 *
 * Check In writes `checkedIn` onto every position. Add to Cart runs
 * `chargeTeeTime`, which both checks the party in **and creates a real ticket**
 * — the same ticket the phone's `/pay` settles and the terminal's cart shows.
 * Cancel frees the position, No Show marks it, Cart Key signs one out, and the
 * notes screens write through `setPositionNotes` / `setTeeTimeNotes`.
 */

/** One entry in a per-player action sheet, before it is turned into a sheet item. */
interface PlayerSheetAction {
    label: string;
    icon: React.ReactNode;
    destructive?: boolean;
    run: () => void;
}

/** The unlabelled meta line, in the shipping app's own order. */
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

/** A notes chip. Green once there is a note behind it, as the tablet draws it. */
const NoteChip = ({ label, filled, onClick }: { label: string; filled: boolean; onClick: () => void }) => (
    <ButtonBase
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        sx={{
            px: 1,
            minHeight: 28,
            fontSize: 12,
            borderRadius: `${appRadius.button}px`,
            bgcolor: filled ? appColors.green : "transparent",
            color: filled ? "#fff" : appColors.textSecondary,
            border: `1px solid ${filled ? appColors.green : appColors.divider}`,
        }}
    >
        {label}
    </ButtonBase>
);

const PlayerRow = ({
    position,
    onActions,
    onNotes,
}: {
    position: Position;
    onActions: () => void;
    onNotes: (field: "customerNotes" | "groupNotes") => void;
}) => (
    /* The row is a <div>, not a <button>.
       The note chips are buttons of their own and a button cannot contain a
       button — React warns, and on a real device the outer press swallows the
       inner one, so tapping "Customer Notes" would open the actions sheet
       instead. The tappable region is therefore the upper block only, and the
       chips sit outside it. */
    <Box sx={{ bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
        <ButtonBase onClick={onActions} sx={{ display: "block", width: "100%", textAlign: "left" }}>
            <Stack sx={{ px: 1.5, pt: 1.25, gap: 0.25 }}>
                <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.75 }}>
                    <Typography sx={{ fontSize: 16, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        ({position.party}) {position.name}
                    </Typography>
                    {position.balance && <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>$</Typography>}
                    {position.raincheck && <BoltIcon sx={{ fontSize: 15, color: appColors.orange }} />}
                    {position.keyed && <VpnKeyIcon sx={{ fontSize: 15, color: appColors.textSecondary }} />}
                    {position.online && <PublicIcon sx={{ fontSize: 15, color: appColors.textSecondary }} />}
                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: 16, flexShrink: 0 }}>{money(position.price)}</Typography>
                </Stack>

                {position.email && (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: appColors.textSecondary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {position.email}
                    </Typography>
                )}

                {/* Wraps rather than truncates — the fee names are the check. */}
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.5 }}>{metaLine(position)}</Typography>
            </Stack>
        </ButtonBase>

        <Stack direction="row" sx={{ gap: 1, alignItems: "center", px: 1.5, pb: 1.25, pt: 0.5 }}>
            <NoteChip label="Customer Notes" filled={Boolean(position.customerNotes)} onClick={() => onNotes("customerNotes")} />
            <NoteChip label="Group Notes" filled={Boolean(position.groupNotes)} onClick={() => onNotes("groupNotes")} />
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 12, color: position.paid ? appColors.greenTee : appColors.textSecondary }}>
                {position.paid ? "PAID" : position.checkedIn ? "Checked in" : "Unpaid"}
            </Typography>
        </Stack>
    </Box>
);

/** The shared text area behind all three notes screens. */
const NotesBody = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
    <Box
        component="textarea"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        sx={{
            m: 1.5,
            p: 1.5,
            minHeight: 200,
            border: `1px solid ${appColors.divider}`,
            bgcolor: appColors.surface,
            color: appColors.textPrimary,
            // 16px is the size below which a mobile browser zooms on focus.
            fontSize: 16,
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
        }}
    />
);

type Panel =
    | null
    | { kind: "actions"; index: number }
    | { kind: "screenMenu" }
    | { kind: "notes"; index: number; field: "customerNotes" | "groupNotes" }
    | { kind: "teeNotes" }
    | { kind: "history"; index: number };

export const MobileTeeTimeDetailScreen = () => {
    const { time = "" } = useParams();
    const decoded = decodeURIComponent(time);

    const navigate = useNavigate();
    const { state, teeTimes, lines, total } = useStore();
    const { checkIn, chargeTeeTime, cancelPosition, markNoShow, signOutCart, setPositionNotes, setTeeTimeNotes, toast } = useActions();

    const [panel, setPanel] = useState<Panel>(null);
    const [draft, setDraft] = useState("");

    const booking = teeTimes.find((t) => t.time === decoded);
    const booked = booking?.positions.map((p, i) => ({ p, i })).filter((x): x is { p: Position; i: number } => Boolean(x.p)) ?? [];
    const open = (booking?.positions.length ?? 4) - booked.length;
    const teeTotal = booked.reduce((sum, { p }) => sum + p.price, 0);

    const subtitle = `${state.course} · ${slashDate(state.sheetDate)} · ${booking?.confirmation ?? "—"} · ${booking?.nine ?? "FRONT"}`;
    const back = () => navigate("/teesheet");

    /* --------------------------------------------------- the notes screens */

    if (panel?.kind === "notes" || panel?.kind === "teeNotes") {
        const isTee = panel.kind === "teeNotes";
        const title = isTee ? "Tee Time Notes" : panel.field === "customerNotes" ? "Customer Notes" : "Group Notes";
        return (
            <MobileShell
                title={title}
                subtitle={decoded}
                active="teesheet"
                leading="close"
                onLeading={() => setPanel(null)}
                showOverflow={false}
                actions={
                    <MobileActionArea>
                        <MobileSecondaryRow>
                            <MobileSecondary tone="muted" onClick={() => setPanel(null)}>
                                Cancel
                            </MobileSecondary>
                            <MobileSecondary
                                onClick={() => {
                                    if (isTee) setTeeTimeNotes(decoded, draft);
                                    else setPositionNotes(decoded, panel.index, panel.field, draft);
                                    setPanel(null);
                                }}
                            >
                                Save
                            </MobileSecondary>
                        </MobileSecondaryRow>
                    </MobileActionArea>
                }
            >
                <NotesBody value={draft} onChange={setDraft} placeholder={`Enter ${title.toLowerCase()}…`} />
            </MobileShell>
        );
    }

    /* ------------------------------------------------- the history screen */

    if (panel?.kind === "history") {
        const position = booked.find((b) => b.i === panel.index)?.p;
        return (
            <MobileShell
                title="Reservation History"
                subtitle={`#${position?.id ?? "—"}`}
                active="teesheet"
                leading="close"
                onLeading={() => setPanel(null)}
                showOverflow={false}
            >
                {!position || position.history.length === 0 ? (
                    <MobileEmpty message="Nothing has happened to this reservation yet." />
                ) : (
                    position.history.map((e, i) => (
                        <Stack
                            key={`${e.at}-${i}`}
                            sx={{
                                px: 1.5,
                                py: 1.25,
                                gap: 0.25,
                                bgcolor: appColors.surface,
                                borderBottom: `1px solid ${appColors.divider}`,
                            }}
                        >
                            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{e.at}</Typography>
                                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{e.by}</Typography>
                            </Stack>
                            <Typography sx={{ fontSize: 15 }}>{e.what}</Typography>
                        </Stack>
                    ))
                )}
            </MobileShell>
        );
    }

    /* --------------------------------------------------------- not found */

    if (!booking) {
        return (
            <MobileShell title="Tee time" active="teesheet" leading="back" showOverflow={false}>
                <MobileEmpty message={`${decoded} is not on this day's sheet.`} />
                <Box sx={{ p: 1.5 }}>
                    <MobilePrimary onClick={back}>Back to the sheet</MobilePrimary>
                </Box>
            </MobileShell>
        );
    }

    /* --------------------------------------------- the per-player actions */

    const actionsFor = (position: Position, index: number): PlayerSheetAction[] => {
        const go = (to: string) => () => navigate(`/teesheet/${encodeURIComponent(decoded)}/${index}/${to}`);
        const openNotes = (field: "customerNotes" | "groupNotes") => () => {
            setDraft(position[field] ?? "");
            setPanel({ kind: "notes", index, field });
        };
        const shared: PlayerSheetAction[] = [
            { label: "History", icon: <HistoryIcon sx={{ fontSize: 20 }} />, run: () => setPanel({ kind: "history", index }) },
            { label: "Edit", icon: <EditOutlinedIcon sx={{ fontSize: 20 }} />, run: go("edit") },
            { label: "Customer Notes", icon: <NotesIcon sx={{ fontSize: 20 }} />, run: openNotes("customerNotes") },
            { label: "Group Notes", icon: <NotesIcon sx={{ fontSize: 20 }} />, run: openNotes("groupNotes") },
        ];

        // Same split, same order as the landscape card's action row.
        return position.paid
            ? [
                  { label: "Raincheck", icon: <BoltIcon sx={{ fontSize: 20 }} />, destructive: true, run: go("raincheck") },
                  ...shared,
                  { label: "Print Starter", icon: <PrintOutlinedIcon sx={{ fontSize: 20 }} />, run: () => toast("Starter ticket sent") },
                  { label: "Print Receipt", icon: <PrintOutlinedIcon sx={{ fontSize: 20 }} />, run: () => toast("Receipt sent") },
                  { label: "Cart Key", icon: <VpnKeyIcon sx={{ fontSize: 20 }} />, run: () => signOutCart(decoded, index) },
              ]
            : [
                  {
                      label: "Cancel",
                      icon: <CancelOutlinedIcon sx={{ fontSize: 20 }} />,
                      destructive: true,
                      run: () => cancelPosition(decoded, index),
                  },
                  {
                      label: "No Show",
                      icon: <PersonOffIcon sx={{ fontSize: 20 }} />,
                      destructive: true,
                      run: () => markNoShow(decoded, index),
                  },
                  ...shared,
                  { label: "Cart Signout", icon: <CreditCardIcon sx={{ fontSize: 20 }} />, run: go("cartsignout") },
                  {
                      label: "Add to Cart",
                      icon: <AddShoppingCartIcon sx={{ fontSize: 20 }} />,
                      run: () => {
                          chargeTeeTime(decoded, index);
                          navigate("/proshop");
                      },
                  },
              ];
    };

    const active = panel?.kind === "actions" ? (booked.find((b) => b.i === panel.index) ?? null) : null;

    const overlay =
        active !== null ? (
            <MobileBottomSheet
                onDismiss={() => setPanel(null)}
                items={actionsFor(active.p, active.i).map(({ label, icon, destructive, run }) => ({
                    label,
                    icon,
                    destructive,
                    onClick: () => {
                        // Cleared first, so a handler that opens another panel
                        // is not immediately overwritten by this one closing.
                        setPanel(null);
                        run();
                    },
                }))}
            />
        ) : panel?.kind === "screenMenu" ? (
            <MobileBottomSheet
                onDismiss={() => setPanel(null)}
                items={[
                    {
                        label: "Tee time notes",
                        icon: <NotesIcon sx={{ fontSize: 20 }} />,
                        onClick: () => {
                            setDraft(booking.teeTimeNotes ?? "");
                            setPanel({ kind: "teeNotes" });
                        },
                    },
                    {
                        label: "Back to tee sheet",
                        icon: <ShoppingCartIcon sx={{ fontSize: 20 }} />,
                        onClick: () => {
                            setPanel(null);
                            back();
                        },
                    },
                    {
                        label: "Pro Shop",
                        icon: <StorefrontIcon sx={{ fontSize: 20 }} />,
                        onClick: () => {
                            setPanel(null);
                            navigate("/proshop");
                        },
                    },
                ]}
            />
        ) : undefined;

    return (
        <MobileShell
            title={decoded}
            subtitle={subtitle}
            active="teesheet"
            leading="back"
            onLeading={back}
            onOverflow={() => setPanel({ kind: "screenMenu" })}
            overlay={overlay}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary disabled={booked.length === 0} onClick={() => booked.length > 0 && checkIn(decoded)}>
                            Check In
                        </MobileSecondary>
                        <MobileSecondary
                            onClick={() => {
                                setDraft(booking.teeTimeNotes ?? "");
                                setPanel({ kind: "teeNotes" });
                            }}
                        >
                            Notes
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    {/*
                     * One primary that advances: with nothing on the ticket it
                     * charges the whole time, and once it has it pays. The
                     * landscape bar could afford both plus three more; this one
                     * is the last 52dp above the OS nav bar.
                     */}
                    <MobilePrimary
                        disabled={booked.length === 0 && lines.length === 0}
                        icon={lines.length > 0 ? <ShoppingCartIcon sx={{ fontSize: 20 }} /> : <AddShoppingCartIcon sx={{ fontSize: 20 }} />}
                        onClick={() => {
                            if (lines.length > 0) return navigate("/pay");
                            if (booked.length === 0) return;
                            chargeTeeTime(decoded);
                        }}
                    >
                        {lines.length > 0 ? `Pay ${money(total)}` : `Add all to cart · ${money(teeTotal)}`}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            {booking.blocked && (
                <Stack sx={{ px: 1.5, py: 1, bgcolor: appColors.blocked }}>
                    <Typography sx={{ fontSize: 15, color: "#fff" }}>{booking.blockLabel ?? "BLOCKED"}</Typography>
                </Stack>
            )}

            {booked.length === 0 ? (
                <MobileEmpty message="Nothing booked on this time. Reservations are taken at the counter — the phone shows and works the sheet." />
            ) : (
                booked.map(({ p, i }) => (
                    <PlayerRow
                        key={`${p.id}-${i}`}
                        position={p}
                        onActions={() => setPanel({ kind: "actions", index: i })}
                        onNotes={(field) => {
                            setDraft(p[field] ?? "");
                            setPanel({ kind: "notes", index: i, field });
                        }}
                    />
                ))
            )}

            {open > 0 && !booking.blocked && (
                <Typography sx={{ px: 1.5, py: 1.5, fontSize: 14, color: appColors.textSecondary }}>
                    {open} open {open === 1 ? "position" : "positions"} on this time.
                </Typography>
            )}

            {booking.teeTimeNotes && (
                <>
                    <MobileSectionHeading>Tee time notes</MobileSectionHeading>
                    <Typography sx={{ px: 1.5, pb: 2, fontSize: 15, whiteSpace: "pre-wrap" }}>{booking.teeTimeNotes}</Typography>
                </>
            )}

            <Box sx={{ height: 8 }} />
        </MobileShell>
    );
};
