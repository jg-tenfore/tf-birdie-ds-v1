import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

import type { NavKey } from "@/components/app-chrome/nav-items";
import { MobileNavDrawer } from "@/components/mobile/mobile-drawer";
import { MobileEmpty } from "@/components/mobile/mobile-parts";
import { MobileAppBar, MobileScreen, type MobileAppBarProps } from "@/components/mobile/mobile-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { money, useActions, useStore, type Line } from "../store";

/**
 * The phone prototype's shell.
 *
 * ## Why this is a second app rather than a responsive one
 *
 * The counter terminal and the phone share **everything below the screen** —
 * the same reducer, the same cart, the same tee sheet, the same sales — and
 * almost nothing above it. `app.tsx` composes a 390px order panel beside a
 * content pane; there is no set of breakpoints that turns that into a
 * bottom-nav phone layout without both versions fighting each other in every
 * component.
 *
 * So `mobile.html` is its own entry with its own routes and its own screens,
 * and `store.tsx` is imported unchanged. A sale rung up here is the same object
 * a sale rung up on the terminal is, because it is the same reducer — which is
 * the only way the two prototypes can be compared at all.
 *
 * ## What it composes
 *
 * The Storybook primitives, directly: `MobileScreen`, `MobileAppBar`,
 * `MobileNavDrawer` from `@/components/mobile/`. Those are rendering-only with
 * optional callbacks — the repo's "Prototype Seam" — so this shell's job is to
 * hand them live state and a real `navigate`. Nothing here re-implements a
 * layout that Storybook documents.
 */

/** Drawer destination → route. Log Out is an action, not a route. */
export const MOBILE_ROUTES: Record<NavKey, string> = {
    proshop: "/proshop",
    teesheet: "/teesheet",
    courtsheet: "/coursheet",
    baysheet: "/baysheet",
    quickorder: "/quickorder",
    tabs: "/tabs",
    tables: "/tables",
    reservations: "/reservations",
    orderstips: "/orderstips",
    tablechart: "/tablechart",
    customersearch: "/customersearch",
    orderlookup: "/orderlookup",
    timeclock: "/timeclock",
    giftcards: "/giftcards",
    events: "/events",
    inventory: "/inventory",
    shift: "/shift",
    settings: "/settings",
    logout: "/signin",
};

/**
 * The device frame, centred on a desk-sized browser.
 *
 * The prototype is opened on a laptop far more often than on a phone, and a
 * 402px column pinned to the top-left of a 1440px window reads as broken rather
 * than as a phone. Centring it and putting a neutral ground behind makes the
 * canvas legible as a device — the same thing Storybook's viewport does, done
 * here because a deployed prototype has no Storybook chrome to do it.
 *
 * On an actual phone the ground is never seen: the frame is the viewport.
 */
export const MobileViewport = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#ECEFF1",
            // No padding under 440px — on a real phone the frame IS the viewport
            // and a gutter would just shrink the app.
            p: { xs: 0, sm: 2 },
        }}
    >
        {children}
    </Box>
);

export interface MobileShellProps {
    title: string;
    subtitle?: string;
    /** Which drawer row reads as current. */
    active?: NavKey;
    leading?: MobileAppBarProps["leading"];
    /** Defaults to opening the drawer for `menu`, and to `history.back()` otherwise. */
    onLeading?: () => void;
    showSearch?: boolean;
    showOverflow?: boolean;
    onOverflow?: () => void;
    action?: string;
    onAction?: () => void;
    children: ReactNode;
    actions?: ReactNode;
    bottomNav?: ReactNode;
    fab?: ReactNode;
    /** Sheets and dialogs. The drawer is handled here and stacks above them. */
    overlay?: ReactNode;
}

/**
 * A screen, with the drawer and the toast wired to the store.
 *
 * The toast is anchored above the bottom bars rather than at the very bottom:
 * at 797px tall with a 48dp nav bar and a 56dp action tray, a default-placed
 * snackbar lands on top of the primary action.
 */
export const MobileShell = ({
    title,
    subtitle,
    active,
    leading = "menu",
    onLeading,
    showSearch,
    showOverflow = true,
    onOverflow,
    action,
    onAction,
    children,
    actions,
    bottomNav,
    fab,
    overlay,
}: MobileShellProps) => {
    const navigate = useNavigate();
    const { state } = useStore();
    const { signOut, toast } = useActions();
    const [drawer, setDrawer] = useState(false);

    const handleLeading =
        onLeading ??
        (leading === "menu"
            ? () => setDrawer(true)
            : () => {
                  navigate(-1);
              });

    return (
        <MobileViewport>
            <MobileScreen
                appBar={
                    <MobileAppBar
                        title={title}
                        subtitle={subtitle}
                        leading={leading}
                        onLeading={handleLeading}
                        showSearch={showSearch}
                        showOverflow={showOverflow}
                        onOverflow={onOverflow}
                        action={action}
                        onAction={onAction}
                    />
                }
                actions={actions}
                bottomNav={bottomNav}
                fab={fab}
                overlay={
                    <>
                        {overlay}
                        {drawer && (
                            <MobileNavDrawer
                                active={active}
                                onDismiss={() => setDrawer(false)}
                                onPick={(key) => {
                                    setDrawer(false);
                                    if (key === "logout") {
                                        signOut();
                                        navigate("/signin");
                                        return;
                                    }
                                    navigate(MOBILE_ROUTES[key]);
                                }}
                            />
                        )}
                        {/* Inside the frame, not the page — a snackbar at the
                            window's bottom would float outside the device. */}
                        <Snackbar
                            open={Boolean(state.toast)}
                            message={state.toast ?? ""}
                            autoHideDuration={2200}
                            onClose={() => toast(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            sx={{ position: "absolute", bottom: 96, left: 8, right: 8, "& .MuiPaper-root": { minWidth: 0, width: "100%" } }}
                        />
                    </>
                }
            >
                {children}
            </MobileScreen>
        </MobileViewport>
    );
};

/* ------------------------------------------------------------------ order */

/**
 * One line on the live cart.
 *
 * The terminal's row is a 64px thumbnail, a name, a unit price, a stepper and a
 * total on one 390px line. That fits at 402 too — but only just, so the stepper
 * moves under the name rather than competing with the total for the right edge.
 */
const MobileLineRow = ({ line }: { line: Line }) => {
    const { changeQty } = useActions();
    return (
        <Stack direction="row" sx={{ gap: 1.25, px: 1.5, py: 1, alignItems: "flex-start", borderBottom: `1px solid ${appColors.divider}` }}>
            <Box
                sx={{
                    position: "relative",
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    bgcolor: line.image ? "#fff" : appColors.canvasAlt,
                    border: `1px solid ${appColors.divider}`,
                    overflow: "hidden",
                }}
            >
                {line.image && (
                    <Box
                        component="img"
                        src={line.image}
                        alt=""
                        sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                )}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        minWidth: 20,
                        height: 20,
                        px: 0.4,
                        bgcolor: appColors.greenTee,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                    }}
                >
                    {line.qty}
                </Box>
            </Box>

            <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {line.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>{money(line.unitPrice)} each</Typography>
                <Stack direction="row" sx={{ gap: 0.5, mt: 0.5 }}>
                    {[
                        { label: "Decrease", delta: -1, Icon: RemoveIcon },
                        { label: "Increase", delta: 1, Icon: AddIcon },
                    ].map(({ label, delta, Icon }) => (
                        <ButtonBase
                            key={label}
                            aria-label={`${label} ${line.name}`}
                            onClick={() => changeQty(line.id, delta, line.seat)}
                            sx={{ width: 36, height: 36, border: `1px solid ${appColors.divider}`, borderRadius: 0.5 }}
                        >
                            <Icon sx={{ fontSize: 18 }} />
                        </ButtonBase>
                    ))}
                </Stack>
            </Stack>

            <Typography sx={{ fontSize: 15, flexShrink: 0 }}>{money(line.qty * line.unitPrice)}</Typography>
        </Stack>
    );
};

/**
 * The live cart, as a full screen body.
 *
 * On the terminal this is a permanently visible column. Here it is the *Order*
 * destination, so it has to carry its own header — the ticket number and the
 * attached customer, which the terminal keeps at the top of the panel.
 */
export const LiveMobileOrder = () => {
    const { ticket, lines, subtotal, tax, total } = useStore();
    const navigate = useNavigate();

    if (lines.length === 0) return <MobileEmpty message="No items in order." />;

    return (
        <>
            <Stack
                direction="row"
                sx={{
                    px: 1.5,
                    py: 1,
                    alignItems: "center",
                    gap: 1,
                    bgcolor: appColors.surface,
                    borderBottom: `1px solid ${appColors.divider}`,
                }}
            >
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 16 }}>Ticket {ticket?.number}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                        {ticket?.customer ?? ticket?.name ?? "No customer"}
                    </Typography>
                </Stack>
                <ButtonBase
                    aria-label="Attach customer"
                    onClick={() => navigate("/customersearch")}
                    sx={{ width: 44, height: 44, borderRadius: "50%", color: appColors.textSecondary }}
                >
                    <PersonAddAltOutlinedIcon sx={{ fontSize: 22 }} />
                </ButtonBase>
            </Stack>

            {lines.map((line) => (
                <MobileLineRow key={`${line.id}-${line.seat ?? "x"}`} line={line} />
            ))}

            <Stack sx={{ px: 1.5, py: 1.25, gap: 0.4, bgcolor: appColors.surface, borderTop: `1px solid ${appColors.divider}` }}>
                {[
                    ["Subtotal", subtotal],
                    ["Tax", tax],
                ].map(([label, amount]) => (
                    <Stack key={label as string} direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{money(amount as number)}</Typography>
                    </Stack>
                ))}
                <Stack direction="row" sx={{ justifyContent: "space-between", mt: 0.25 }}>
                    <Typography sx={{ fontSize: 18 }}>Total</Typography>
                    <Typography sx={{ fontSize: 18 }}>{money(total)}</Typography>
                </Stack>
            </Stack>
        </>
    );
};
