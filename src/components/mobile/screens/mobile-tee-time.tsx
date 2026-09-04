import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BoltIcon from "@mui/icons-material/Bolt";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryIcon from "@mui/icons-material/History";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import {
    cartSignOut,
    detailEmpty,
    detailFoursome,
    detailPaidPair,
    editReservation,
    reservationHistory,
    type DetailPlayer,
    type PlayerAction,
    type TeeTimeDetail,
} from "@/components/screens/tee-sheet/tee-sheet-data";
import { holesPlayedOptions, raincheckPercentLabel, raincheckValue } from "@/data/rainchecks";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { MobileEmpty, MobileSectionHeading } from "../mobile-parts";
import {
    MobileActionArea,
    MobileAppBar,
    MobileBottomSheet,
    MobilePrimary,
    MobileScreen,
    MobileSecondary,
    MobileSecondaryRow,
} from "../mobile-shell";

/**
 * **Mobile Screens — 2-teesheet, the tee time.** Detail, dialogs and forms.
 *
 * ## The detail screen's real problem is the action row
 *
 * On tablet each player carries **up to seven action buttons in a row** —
 * Cancel, No Show, History, Edit, Cart Signout, Cart Key, Add to Cart. Seven
 * buttons need roughly 700px; a phone has 402 and a player row also has to hold
 * a name, an amount and a meta line.
 *
 * So the actions move into a **per-player bottom sheet**, opened by the row.
 * The set is not trimmed — every action the tablet offers that player is in the
 * sheet, in the same order — because which actions a reservation has is
 * meaningful: a paid round offers Clone and Print, an unpaid one offers Cancel
 * and No Show, and losing that would hide the state of the booking.
 *
 * ## The meta line
 *
 * `18 holes   Group Pricing : $1.00   Dunes Cart Old : $26.82   ID:10390147
 * +125   -1250` is one grey line on tablet. It is six facts in a row and it does
 * not fit. It wraps to two lines here rather than truncating, because the fee
 * names are how a starter checks that the right rate was applied — the part
 * worth losing is the horizontal alignment, not the content.
 *
 * ## Dialogs become screens
 *
 * The four dialogs — reservation history, customer notes, group notes, tee time
 * notes — are centred cards on tablet. A notes dialog whose whole purpose is a
 * text area cannot afford to be a card inside 402px, so each takes the screen,
 * with `X` to abandon and the commit as the full-width primary.
 */

/* ---------------------------------------------------------------- detail */

const ACTION_ICON: Partial<Record<PlayerAction, React.ReactNode>> = {
    Cancel: <CancelOutlinedIcon sx={{ fontSize: 20 }} />,
    "No Show": <PersonOffIcon sx={{ fontSize: 20 }} />,
    Raincheck: <BoltIcon sx={{ fontSize: 20 }} />,
    Clone: <ContentCopyIcon sx={{ fontSize: 20 }} />,
    History: <HistoryIcon sx={{ fontSize: 20 }} />,
    Edit: <EditOutlinedIcon sx={{ fontSize: 20 }} />,
    "Cart Signout": <DirectionsCarIcon sx={{ fontSize: 20 }} />,
    "Print Starter": <PrintOutlinedIcon sx={{ fontSize: 20 }} />,
    "Print Receipt": <PrintOutlinedIcon sx={{ fontSize: 20 }} />,
    "Cart Key": <VpnKeyIcon sx={{ fontSize: 20 }} />,
    "Add to Cart": <AddShoppingCartIcon sx={{ fontSize: 20 }} />,
};

const PlayerRow = ({ player, onActions }: { player: DetailPlayer; onActions?: () => void }) => (
    <ButtonBase
        onClick={onActions}
        disabled={player.actions.length === 0}
        sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            bgcolor: appColors.surface,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        <Stack sx={{ px: 1.5, py: 1.25, gap: 0.25 }}>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.75 }}>
                <Typography sx={{ fontSize: 16, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {player.name}
                </Typography>
                {player.flags?.includes("dollar") && <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>$</Typography>}
                {player.flags?.includes("bolt") && <BoltIcon sx={{ fontSize: 15, color: appColors.orange }} />}
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 16, flexShrink: 0 }}>{player.amount}</Typography>
            </Stack>
            {player.email && (
                <Typography
                    sx={{
                        fontSize: 12,
                        color: appColors.textSecondary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {player.email}
                </Typography>
            )}
            {/* Wraps rather than truncates — the fee names are how a starter
                checks the right rate was applied. */}
            {player.meta && <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.5 }}>{player.meta}</Typography>}
            {player.showNotes && (
                <Stack direction="row" sx={{ gap: 1, pt: 0.5 }}>
                    {["Customer Notes", "Group Notes"].map((n) => (
                        <Box
                            key={n}
                            sx={{
                                fontSize: 12,
                                px: 1,
                                py: 0.25,
                                border: `1px solid ${appColors.divider}`,
                                borderRadius: `${appRadius.button}px`,
                                color: appColors.textSecondary,
                            }}
                        >
                            {n}
                        </Box>
                    ))}
                </Stack>
            )}
        </Stack>
    </ButtonBase>
);

const DETAILS: Record<string, TeeTimeDetail> = {
    foursome: detailFoursome,
    "paid-pair": detailPaidPair,
    "open-time": detailEmpty,
};

export const MobileTeeTimeDetail = ({
    variant = "foursome",
    sheetOpen = false,
}: {
    variant?: "foursome" | "paid-pair" | "open-time";
    /** Seeds the per-player action sheet open for a story. */
    sheetOpen?: boolean;
}) => {
    const detail = DETAILS[variant];
    const [openFor, setOpenFor] = useState<number | null>(sheetOpen ? 0 : null);
    const player = openFor !== null ? detail.players[openFor] : null;

    // The tablet breadcrumb is one long line: facility, course, date, time,
    // reservation, nine. Split so the time — the thing being looked at — leads.
    const [, , when] = detail.title.split(" - ");

    return (
        <MobileScreen
            appBar={
                <MobileAppBar
                    title={when?.trim() ?? "Tee time"}
                    subtitle={detail.title.split(" - ").slice(-2).join(" · ")}
                    leading="back"
                    showOverflow
                />
            }
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary>Book</MobileSecondary>
                        <MobileSecondary>Check In</MobileSecondary>
                    </MobileSecondaryRow>
                </MobileActionArea>
            }
            overlay={
                player ? (
                    <MobileBottomSheet
                        onDismiss={() => setOpenFor(null)}
                        items={player.actions.map((a) => ({
                            label: a,
                            icon: ACTION_ICON[a],
                            destructive: a === "Cancel" || a === "No Show",
                            onClick: () => setOpenFor(null),
                        }))}
                    />
                ) : undefined
            }
        >
            {detail.players.length === 0 ? (
                <MobileEmpty message="Nobody booked on this time. The screen keeps its chrome so a starter can book into it." />
            ) : (
                detail.players.map((p, i) => <PlayerRow key={`${p.name}-${i}`} player={p} onActions={() => setOpenFor(i)} />)
            )}
        </MobileScreen>
    );
};

/* --------------------------------------------------------------- dialogs */

/** Reservation history — a dialog on tablet, a screen here. */
export const MobileReservationHistory = () => (
    <MobileScreen
        appBar={<MobileAppBar title="Reservation History" subtitle={`#${reservationHistory.id}`} leading="close" showOverflow={false} />}
    >
        {reservationHistory.entries.map((e) => (
            <Stack
                key={e.when}
                sx={{ px: 1.5, py: 1.25, gap: 0.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}
            >
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{e.when}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{e.who}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 15 }}>{e.what}</Typography>
            </Stack>
        ))}
    </MobileScreen>
);

/**
 * The three notes dialogs.
 *
 * One component because they differ only by title — the tablet has three
 * dialogs for the same reason, and duplicating that here would be duplicating a
 * quirk rather than a design.
 */
export const MobileNotes = ({ title }: { title: "Customer Notes" | "Group Notes" | "Tee Time Notes" }) => (
    <MobileScreen
        appBar={<MobileAppBar title={title} leading="close" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobileSecondaryRow>
                    <MobileSecondary tone="muted">Cancel</MobileSecondary>
                    <MobileSecondary>Save</MobileSecondary>
                </MobileSecondaryRow>
            </MobileActionArea>
        }
    >
        <Box sx={{ m: 1.5, p: 1.5, minHeight: 180, bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Enter {title.toLowerCase()}…</Typography>
        </Box>
    </MobileScreen>
);

/* ----------------------------------------------------------------- forms */

/** A fee option row. Selected is filled navy, exactly as the tablet draws it. */
const FeeRow = ({ label, selected }: { label: string; selected?: boolean }) => (
    <ButtonBase
        sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            px: 1.5,
            minHeight: 48,
            bgcolor: selected ? appColors.navy : appColors.surface,
            color: selected ? "#fff" : appColors.textPrimary,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        <Typography sx={{ fontSize: 15, lineHeight: "48px" }}>{label}</Typography>
    </ButtonBase>
);

/**
 * Edit reservation — fees.
 *
 * Two fee groups side by side on tablet, each with its own subtotal. Side by
 * side is 2 × 200px here, so they stack — and because they stack, each group's
 * subtotal now sits directly under the options that produce it, which is
 * arguably clearer than the tablet's version.
 *
 * `SAVE FEES TO ALL` stays beside `SAVE` rather than inside it: it applies the
 * selection to every player on the tee time, and that is a different act.
 */
export const MobileEditReservation = () => (
    <MobileScreen
        appBar={<MobileAppBar title="Edit Reservation" subtitle={editReservation.guest.name} leading="close" showOverflow />}
        actions={
            <MobileActionArea>
                <MobileSecondaryRow>
                    <MobileSecondary>Save Fees To All</MobileSecondary>
                </MobileSecondaryRow>
                <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />}>Save</MobilePrimary>
            </MobileActionArea>
        }
    >
        <Stack sx={{ px: 1.5, py: 1.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
            <Typography sx={{ fontSize: 16 }}>{editReservation.guest.name}</Typography>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{editReservation.guest.when}</Typography>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{editReservation.guest.email}</Typography>
        </Stack>

        {(
            [
                ["Green Fees", editReservation.greenFees],
                ["Transportation", editReservation.transportFees],
            ] as const
        ).map(([label, group]) => (
            <Box key={label}>
                <MobileSectionHeading>{label}</MobileSectionHeading>
                {group.options.map((o) => (
                    // The transportation group has no `selected` key at all —
                    // nothing was selected in the capture it was transcribed
                    // from — so this cannot just read `group.selected`.
                    <FeeRow key={o} label={o} selected={"selected" in group && o === group.selected} />
                ))}
                <Stack sx={{ px: 1.5, py: 1, gap: 0.25, bgcolor: appColors.canvas }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>SubTotal</Typography>
                        <Typography sx={{ fontSize: 13 }}>{group.subTotal}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 14 }}>Grand Total</Typography>
                        <Typography sx={{ fontSize: 14 }}>{group.grandTotal}</Typography>
                    </Stack>
                </Stack>
            </Box>
        ))}
    </MobileScreen>
);

/**
 * Cart sign-out.
 *
 * A consent screen, and the one place the phone is arguably *better*: the
 * waiver is 60 words that the tablet sets beside a signature box, and here it
 * gets the full width above one. The commit stays disabled until both the cart
 * number and the tick are in, as the tablet does.
 */
export const MobileCartSignOut = ({ complete = false }: { complete?: boolean }) => (
    <MobileScreen
        appBar={<MobileAppBar title="Cart Sign Out" subtitle={cartSignOut.reservation} leading="close" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobilePrimary disabled={!complete} icon={<CheckIcon sx={{ fontSize: 20 }} />}>
                    {complete ? "Sign Out Cart" : "Cart number and consent required"}
                </MobilePrimary>
            </MobileActionArea>
        }
    >
        <Stack sx={{ px: 1.5, py: 1.5, gap: 2 }}>
            <Box>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Customer</Typography>
                <Typography sx={{ fontSize: 20 }}>{cartSignOut.customer}</Typography>
            </Box>
            <Box sx={{ borderBottom: `1px solid ${appColors.textSecondary}`, pb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Cart Number</Typography>
                <Typography sx={{ fontSize: 20, color: complete ? appColors.textPrimary : appColors.textSecondary }}>
                    {complete ? "42" : "—"}
                </Typography>
            </Box>
            <Stack direction="row" sx={{ gap: 1.25, alignItems: "flex-start" }}>
                <Box
                    sx={{
                        width: 20,
                        height: 20,
                        mt: 0.25,
                        flexShrink: 0,
                        border: `2px solid ${complete ? appColors.green : appColors.textSecondary}`,
                        bgcolor: complete ? appColors.green : "transparent",
                        borderRadius: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {complete && <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />}
                </Box>
                <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: appColors.textPrimary }}>{cartSignOut.consent}</Typography>
            </Stack>
            <Box
                sx={{
                    height: 96,
                    border: `1px dashed ${appColors.textSecondary}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{cartSignOut.signHere}</Typography>
            </Box>
        </Stack>
    </MobileScreen>
);

/**
 * Create raincheck.
 *
 * The tablet lays this out in two columns — the round's facts on the left, and
 * **eighteen hole radios in two ragged rows** on the right. Eighteen ~32px
 * targets do not survive 402px, and this number sets a refund amount.
 *
 * So the holes become a **stepper**, which is the control the Aug 31 work
 * settled on for the same value — see `Flows → Rainchecks → Aug 31 → 5`. The
 * credit and the percentage update under it, so the money is always visible
 * beside the number that produces it.
 */
export const MobileCreateRaincheck = ({ holesPlayed = 5 }: { holesPlayed?: number }) => {
    const [holes, setHoles] = useState(holesPlayed);
    const roundPrice = 100;
    const totalHoles = 18;
    const max = holesPlayedOptions(totalHoles).length - 1;
    const value = raincheckValue(roundPrice, totalHoles, holes);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Raincheck" subtitle="Reservation 10390148" leading="close" showOverflow={false} />}
            actions={
                <MobileActionArea>
                    <MobilePrimary icon={<BoltIcon sx={{ fontSize: 20 }} />}>Create Raincheck · ${value.toFixed(2)}</MobilePrimary>
                </MobileActionArea>
            }
        >
            <Stack sx={{ alignItems: "center", py: 2.5, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>Raincheck value</Typography>
                <Typography sx={{ fontSize: 36, color: appColors.greenTee }}>${value.toFixed(2)}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                    {raincheckPercentLabel(totalHoles, holes)} of ${roundPrice.toFixed(2)}
                </Typography>
            </Stack>

            <MobileSectionHeading>Holes played</MobileSectionHeading>
            <Stack direction="row" sx={{ alignItems: "center", gap: 2, px: 1.5, py: 1.5, bgcolor: appColors.surface }}>
                <ButtonBase
                    onClick={() => setHoles((h) => Math.max(0, h - 1))}
                    disabled={holes === 0}
                    aria-label="One fewer hole"
                    sx={{
                        width: 48,
                        height: 48,
                        border: `1px solid ${appColors.divider}`,
                        borderRadius: `${appRadius.button}px`,
                        fontSize: 24,
                    }}
                >
                    −
                </ButtonBase>
                <Typography sx={{ flex: 1, textAlign: "center", fontSize: 28 }}>{holes}</Typography>
                <ButtonBase
                    onClick={() => setHoles((h) => Math.min(max, h + 1))}
                    disabled={holes === max}
                    aria-label="One more hole"
                    sx={{
                        width: 48,
                        height: 48,
                        border: `1px solid ${appColors.divider}`,
                        borderRadius: `${appRadius.button}px`,
                        fontSize: 24,
                    }}
                >
                    +
                </ButtonBase>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between", px: 1.5, pb: 1.5, bgcolor: appColors.surface }}>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>0 — never teed off</Typography>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>{max} — all but the last</Typography>
            </Stack>

            <MobileSectionHeading>Issue it to</MobileSectionHeading>
            {detailFoursome.players.map((p, i) => (
                <ButtonBase
                    key={p.name}
                    sx={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        px: 1.5,
                        minHeight: 48,
                        bgcolor: i === 1 ? "#EAF3EC" : appColors.surface,
                        borderLeft: "4px solid",
                        borderLeftColor: i === 1 ? appColors.greenTee : "transparent",
                        borderBottom: `1px solid ${appColors.divider}`,
                    }}
                >
                    <Typography sx={{ fontSize: 15, lineHeight: "48px" }}>{p.name}</Typography>
                </ButtonBase>
            ))}
        </MobileScreen>
    );
};
