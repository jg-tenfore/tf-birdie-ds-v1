import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi";
import BatteryStdIcon from "@mui/icons-material/BatteryStd";

import { appColors, appLayout, appRadius } from "@/theme/app-replica-tokens";
import { devices } from "@/theme/tokens";

/**
 * **Mobile Screens — the shell.** From `references/090426/`.
 *
 * The same Birdie POS, laid out for a phone. **This is a re-layout, not a
 * restyle**: every colour, radius, weight and casing comes from
 * `app-replica-tokens` exactly as the landscape screens use them. Nothing here
 * introduces a token, a colour or a component the design system did not already
 * have. What changes is arrangement.
 *
 * ## What the landscape layout assumes, and a phone cannot give it
 *
 * The tablet screens are built from three fixed regions: a **left order panel**
 * (`appLayout.orderPanelWidth`, 390px), a **content pane** beside it, and a
 * **bottom action bar** of four or five equal buttons. At 402px wide, all three
 * assumptions break at once — 390 of 402 is the whole screen, side-by-side is
 * impossible, and five action buttons in a row gives each one 78px.
 *
 * So the references resolve them like this, and these are the four rules every
 * screen in this category follows:
 *
 * | Landscape | Mobile | Why |
 * | -- | -- | -- |
 * | Order panel beside content | Two destinations in a bottom nav — *Menus* and *Order* | Both still one tap away; neither is cut to a sliver |
 * | Product tile grid | A vertical list, thumbnail + name + price | A 6-across grid becomes 2-across, and a tile is mostly padding |
 * | 4–5 action buttons in a row | One full-width primary, secondaries stacked above it | 78px buttons cannot hold `PRINT COMBINED SEATS` |
 * | Centred modal dialog | A full screen, or a bottom sheet for a short menu | A 640px dialog does not fit in 402px |
 *
 * ## The system chrome is drawn on purpose
 *
 * `MobileFrame` renders the Android status bar and the three-button navigation
 * bar, because the references do and because they cost ~72dp of the 797. A
 * design checked against the full height is a design that ships 72dp too tall.
 */

/* ------------------------------------------------------------------ frame */

/** The status bar and nav bar heights, which come off the usable canvas. */
export const mobileChrome = { statusBar: 24, navBar: 48 } as const;

export const MOBILE_WIDTH = devices.mobile.width;
export const MOBILE_HEIGHT = devices.mobile.height;
/** What is actually left for the app. Every screen is built against this. */
export const MOBILE_CANVAS = MOBILE_HEIGHT - mobileChrome.statusBar - mobileChrome.navBar;

const StatusBar = () => (
    <Stack
        direction="row"
        aria-hidden
        sx={{
            height: mobileChrome.statusBar,
            px: 1.5,
            alignItems: "center",
            gap: 0.75,
            bgcolor: appColors.slate,
            color: "rgba(255,255,255,0.9)",
            flexShrink: 0,
        }}
    >
        <Typography sx={{ fontSize: 12 }}>2:46</Typography>
        <Box sx={{ flex: 1 }} />
        {[SignalCellularAltIcon, NetworkWifiIcon, BatteryStdIcon].map((Icon, i) => (
            <Icon key={i} sx={{ fontSize: 13 }} />
        ))}
    </Stack>
);

/**
 * Android's three-button navigation.
 *
 * Drawn rather than assumed. It is the reason a full-width primary button sits
 * where it does — anything within ~48dp of the bottom is a mis-tap waiting to
 * happen, and on this device that band belongs to the OS.
 */
const NavBar = () => (
    <Stack
        direction="row"
        aria-hidden
        sx={{
            height: mobileChrome.navBar,
            alignItems: "center",
            justifyContent: "space-around",
            bgcolor: "#000",
            color: "rgba(255,255,255,0.85)",
            flexShrink: 0,
        }}
    >
        <Box
            sx={{
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderRight: "11px solid currentColor",
            }}
        />
        <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor" }} />
        <Box sx={{ width: 12, height: 12, border: "2px solid currentColor" }} />
    </Stack>
);

/**
 * The device. Fixed 402×797, with both system bars drawn.
 *
 * Fixed rather than fluid because the whole point of this category is to check
 * layouts against a real canvas. A frame that grew with the Storybook window
 * would let a screen look fine here and overflow on the device.
 */
export const MobileFrame = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            width: MOBILE_WIDTH,
            height: MOBILE_HEIGHT,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: appColors.canvas,
            fontFamily: "Roboto, sans-serif",
        }}
    >
        <StatusBar />
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>{children}</Box>
        <NavBar />
    </Box>
);

/* ---------------------------------------------------------------- app bar */

export interface MobileAppBarProps {
    title: string;
    /** The second line — `Table 55 | Order ID 3846547`. */
    subtitle?: string;
    /**
     * `menu` is a root destination, `close` a screen that replaced a dialog,
     * `back` one step down a drill-down. The references use all three and the
     * distinction is load-bearing: `close` abandons, `back` returns.
     */
    leading?: "menu" | "close" | "back" | "none";
    onLeading?: () => void;
    showSearch?: boolean;
    showOverflow?: boolean;
    onOverflow?: () => void;
    /** A text action on the right — `Save`, `Apply`. Replaces nothing else. */
    action?: string;
    onAction?: () => void;
}

/**
 * The top app bar. Slate, 56dp, one line or two.
 *
 * Replaces the landscape bar's whole right-hand cluster — `JOHN ADMIN`,
 * `LOG OUT`, the cart and the overflow — with at most a search glyph, an
 * overflow and one text action. The identity moved into the drawer, which is
 * where a phone keeps it and where this app already put it on tablet.
 */
export const MobileAppBar = ({
    title,
    subtitle,
    leading = "menu",
    onLeading,
    showSearch = false,
    showOverflow = true,
    onOverflow,
    action,
    onAction,
}: MobileAppBarProps) => {
    const LeadingIcon = leading === "menu" ? MenuIcon : leading === "close" ? CloseIcon : ArrowBackIcon;
    return (
        <Stack
            direction="row"
            sx={{
                minHeight: 56,
                px: 0.5,
                alignItems: "center",
                gap: 0.5,
                bgcolor: appColors.slate,
                color: "#fff",
                flexShrink: 0,
            }}
        >
            {leading !== "none" && (
                <ButtonBase onClick={onLeading} aria-label={leading} sx={{ width: 48, height: 48, borderRadius: "50%", color: "#fff" }}>
                    <LeadingIcon sx={{ fontSize: 24 }} />
                </ButtonBase>
            )}
            <Stack sx={{ flex: 1, minWidth: 0, pl: leading === "none" ? 1.5 : 0 }}>
                <Typography sx={{ fontSize: 20, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        sx={{
                            fontSize: 13,
                            lineHeight: 1.3,
                            color: "rgba(255,255,255,0.8)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Stack>
            {action && (
                <ButtonBase onClick={onAction} sx={{ minHeight: 48, px: 1.5, color: "#fff", fontSize: 15 }}>
                    {action}
                </ButtonBase>
            )}
            {showSearch && (
                <ButtonBase aria-label="Search" sx={{ width: 48, height: 48, borderRadius: "50%", color: "#fff" }}>
                    <SearchIcon sx={{ fontSize: 22 }} />
                </ButtonBase>
            )}
            {showOverflow && (
                <ButtonBase
                    onClick={onOverflow}
                    aria-label="More options"
                    sx={{ width: 48, height: 48, borderRadius: "50%", color: "#fff" }}
                >
                    <MoreVertIcon sx={{ fontSize: 22 }} />
                </ButtonBase>
            )}
        </Stack>
    );
};

/* ------------------------------------------------------------- bottom nav */

export interface MobileNavItem {
    key: string;
    label: string;
    icon: ReactNode;
}

/**
 * The bottom navigation — where the landscape order panel went.
 *
 * On tablet the order and the menu are side by side. Here they are two
 * destinations, and the count of items on the order rides on the *Order* tab so
 * the operator never has to switch just to check it.
 *
 * Two or three items only. The references never show more, and a fourth would
 * start competing with the primary action directly above it.
 */
export const MobileBottomNav = ({
    items,
    active,
    onChange,
}: {
    items: MobileNavItem[];
    active: string;
    onChange?: (key: string) => void;
}) => (
    <Stack direction="row" role="tablist" sx={{ bgcolor: appColors.surface, borderTop: `1px solid ${appColors.divider}`, flexShrink: 0 }}>
        {items.map((item) => {
            const isActive = item.key === active;
            return (
                <ButtonBase
                    key={item.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onChange?.(item.key)}
                    sx={{ flex: 1, flexDirection: "column", gap: 0.25, minHeight: 56, py: 0.75 }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 26,
                            borderRadius: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // The active pill uses the app's own canvas grey —
                            // no new colour, and it reads as "pressed" the way
                            // the tee sheet's selected view toggle does.
                            bgcolor: isActive ? appColors.canvasAlt : "transparent",
                            color: isActive ? appColors.textPrimary : appColors.textSecondary,
                        }}
                    >
                        {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: 12, color: isActive ? appColors.textPrimary : appColors.textSecondary }}>
                        {item.label}
                    </Typography>
                </ButtonBase>
            );
        })}
    </Stack>
);

/* ----------------------------------------------------------------- actions */

/**
 * The full-width primary action — what the landscape action bar's green
 * button becomes.
 *
 * `PAY`, `SAVE OPEN FOOD`, `APPLY DISCOUNT`. Full width, 52dp, ALL-CAPS, and it
 * carries its amount when it has one: `PAY $30.00` rather than `PAY`. The
 * landscape bar could afford to put the total elsewhere; here the button is
 * often the last thing on screen.
 */
export const MobilePrimary = ({
    children,
    tone = "primary",
    icon,
    onClick,
    disabled,
}: {
    children: ReactNode;
    tone?: "primary" | "destructive" | "default";
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}) => {
    const bg = disabled
        ? appColors.greyLight
        : tone === "destructive"
          ? appColors.red
          : tone === "default"
            ? appColors.slate
            : appColors.green;
    return (
        <ButtonBase
            onClick={onClick}
            disabled={disabled}
            sx={{
                width: "100%",
                minHeight: 52,
                gap: 1,
                bgcolor: bg,
                color: "#fff",
                borderRadius: `${appRadius.button}px`,
                fontSize: 15,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                flexShrink: 0,
            }}
        >
            {icon}
            {children}
        </ButtonBase>
    );
};

/** Two secondary actions side by side, above the primary. `RE-FIRE` / `ADD ITEMS`. */
export const MobileSecondaryRow = ({ children }: { children: ReactNode }) => (
    <Stack direction="row" sx={{ gap: 1, flexShrink: 0 }}>
        {children}
    </Stack>
);

export const MobileSecondary = ({
    children,
    tone = "default",
    onClick,
    disabled,
}: {
    children: ReactNode;
    tone?: "default" | "destructive" | "muted";
    onClick?: () => void;
    disabled?: boolean;
}) => (
    <ButtonBase
        onClick={onClick}
        disabled={disabled}
        sx={{
            flex: 1,
            minHeight: 48,
            bgcolor: tone === "destructive" ? appColors.red : tone === "muted" ? appColors.canvasAlt : appColors.slate,
            color: tone === "muted" ? appColors.textSecondary : "#fff",
            borderRadius: `${appRadius.button}px`,
            fontSize: 14,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            opacity: disabled ? 0.5 : 1,
        }}
    >
        {children}
    </ButtonBase>
);

/** The tray the actions sit in, pinned above the bottom nav. */
export const MobileActionArea = ({ children }: { children: ReactNode }) => (
    <Stack sx={{ p: 1, gap: 1, bgcolor: appColors.surface, borderTop: `1px solid ${appColors.divider}`, flexShrink: 0 }}>{children}</Stack>
);

/* ------------------------------------------------------------ bottom sheet */

export interface MobileSheetItem {
    label: string;
    icon?: ReactNode;
    destructive?: boolean;
    onClick?: () => void;
}

/**
 * A bottom sheet — what an anchored menu becomes.
 *
 * The landscape screens pop a small menu next to whatever was tapped: the line
 * item kebab (Edit / Discount / Delete), the screen overflow (Refresh Menu /
 * Remove All Discounts / Cancel Tab). Anchoring that to a row on a 402px screen
 * puts a menu over the thing it acts on, so it comes up from the bottom
 * instead — where a thumb already is.
 *
 * Same rows, same order, same words. The destructive entry keeps the app's own
 * red rather than being greyed or moved.
 */
export const MobileBottomSheet = ({ items, onDismiss }: { items: MobileSheetItem[]; onDismiss?: () => void }) => (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", flexDirection: "column" }}>
        <Box onClick={onDismiss} sx={{ flex: 1, bgcolor: "rgba(0,0,0,0.5)" }} />
        <Stack sx={{ bgcolor: appColors.surface, pt: 1, pb: 1 }}>
            <Box sx={{ width: 32, height: 4, borderRadius: 2, bgcolor: appColors.divider, mx: "auto", mb: 1 }} />
            {items.map((item) => (
                <ButtonBase
                    key={item.label}
                    onClick={item.onClick}
                    sx={{
                        justifyContent: "flex-start",
                        gap: 2,
                        px: 2.5,
                        minHeight: 52,
                        fontSize: 16,
                        color: item.destructive ? appColors.red : appColors.textPrimary,
                    }}
                >
                    {item.icon}
                    {item.label}
                </ButtonBase>
            ))}
        </Stack>
    </Box>
);

/* ------------------------------------------------------------------ screen */

export interface MobileScreenProps {
    appBar: ReactNode;
    children: ReactNode;
    /** Pinned above the bottom nav — the action tray. */
    actions?: ReactNode;
    bottomNav?: ReactNode;
    /**
     * The floating pill — `+ Create Order`.
     *
     * A slot rather than something the body renders, because it has to float
     * against the **screen** and not against the list. Put it inside the
     * scrolling body and it scrolls away with the content, which is the one
     * thing a floating action must never do.
     */
    fab?: ReactNode;
    /** Sheets, scrims and the drawer. */
    overlay?: ReactNode;
}

/**
 * One mobile screen: app bar, a scrolling body, an optional action tray, an
 * optional bottom nav — all inside the device frame.
 *
 * The body is the only part that scrolls. Everything else is pinned, which is
 * what stops the primary action from disappearing under a long list.
 */
export const MobileScreen = ({ appBar, children, actions, bottomNav, fab, overlay }: MobileScreenProps) => (
    <MobileFrame>
        <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {appBar}
            <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", bgcolor: appColors.canvas }}>{children}</Box>
                {fab}
            </Box>
            {actions}
            {bottomNav}
            {overlay}
        </Box>
    </MobileFrame>
);

/** Exported for the docs page that measures the canvas against the tablet's. */
export const mobileLayoutFacts = {
    canvas: MOBILE_CANVAS,
    tabletOrderPanel: appLayout.orderPanelWidth,
    frame: `${MOBILE_WIDTH}×${MOBILE_HEIGHT}`,
} as const;
