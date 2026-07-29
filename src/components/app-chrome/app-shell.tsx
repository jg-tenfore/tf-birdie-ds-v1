import { Fragment, useState, type ReactNode } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { appColors, appLayout, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { appIdentity, navGroups, type NavKey } from "./nav-items";

/**
 * The shipping Birdie POS chrome, reproduced as-is.
 *
 * Structure, from `references/072926/`:
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │ ☰  Screen title        ACCOUNT  LOG OUT  🛒  ⋮       │ 64px slate
 *   ├──────────────────────────────────────────────────────┤
 *   │ optional sub-bar (tee sheet date nav, filter field)  │
 *   ├─────────────────┬────────────────────────────────────┤
 *   │  order panel    │  content                           │
 *   │  (LEFT, white)  │  (light grey canvas)               │
 *   ├─────────────────┴────────────────────────────────────┤
 *   │  [BTN] [BTN] [BTN] [BTN] [BTN]        [PAY $0.00]    │ 72px
 *   └──────────────────────────────────────────────────────┘
 *
 * Two things differ from the Birdie design system on purpose, because this
 * documents what ships: navigation is a **hamburger flyout** rather than a
 * permanent rail, and the order panel is on the **left**, not the right.
 */

export interface AppShellProps {
    /** Screen title beside the hamburger. Some screens use a long breadcrumb. */
    title?: ReactNode;
    /** Which drawer item reads as current. */
    active?: NavKey;
    /** Right-hand app bar items. Defaults to ACCOUNT + LOG OUT. */
    accountLabel?: string;
    showLogOut?: boolean;
    /** Extra uppercase text actions between LOG OUT and the icons, e.g. HIDE BACK. */
    topActions?: string[];
    showCart?: boolean;
    showOverflow?: boolean;
    /** Replaces the whole right-hand cluster when supplied. */
    topBarRight?: ReactNode;

    /** Full-width band directly under the app bar (date nav, filter field). */
    subBar?: ReactNode;
    /** Left-hand order/cart panel. Omit on screens with no active order. */
    orderPanel?: ReactNode;
    /** Bottom action bar — normally a row of <ActionButton>s. */
    actionBar?: ReactNode;

    children?: ReactNode;
    /** Drawer starts open — used by the nav story. */
    defaultDrawerOpen?: boolean;
    /** Dark canvas, as on the tee-time detail screens. */
    tone?: "light" | "dark";
}

/** The drawer's dark identity block plus grouped destination list. */
const NavDrawerContent = ({ active, onNavigate }: { active?: NavKey; onNavigate?: (key: NavKey) => void }) => (
    <Box sx={{ width: appLayout.drawerWidth, height: "100%", bgcolor: appColors.surface }}>
        <Box sx={{ bgcolor: appColors.slate, color: "#fff", px: 3, pt: 3, pb: 3 }}>
            <Box
                component="img"
                src={assetUrl("logos/tf-square-white.svg")}
                alt=""
                sx={{ width: 56, height: 52, mb: 2, opacity: 0.95 }}
            />
            <Typography sx={{ fontSize: 26, fontWeight: 400, mb: 1 }}>{appIdentity.product}</Typography>
            {[appIdentity.version, appIdentity.account, appIdentity.facility, appIdentity.device].map((line) => (
                <Typography key={line} sx={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.88)" }}>
                    {line}
                </Typography>
            ))}
        </Box>

        {navGroups.map((group, groupIndex) => (
            <Fragment key={group.heading ?? `group-${groupIndex}`}>
                {groupIndex > 0 && <Divider />}
                <List sx={{ py: 1 }}>
                    {group.heading && (
                        <Typography sx={{ px: 3, py: 1.5, fontSize: 15, color: appColors.textSecondary }}>{group.heading}</Typography>
                    )}
                    {group.items.map((item) => (
                        <ListItemButton
                            key={item.key}
                            selected={item.key === active}
                            onClick={() => onNavigate?.(item.key)}
                            sx={{ px: 3, minHeight: 56 }}
                        >
                            <ListItemIcon sx={{ minWidth: 52, color: appColors.textPrimary }}>
                                <item.Icon />
                            </ListItemIcon>
                            <ListItemText slotProps={{ primary: { sx: { fontSize: 17 } } }}>{item.label}</ListItemText>
                        </ListItemButton>
                    ))}
                </List>
            </Fragment>
        ))}
    </Box>
);

/**
 * A bottom action-bar button.
 *
 * `tone` maps to the app's own vocabulary: `default` slate, `primary` green for
 * the confirming action, `danger` red for POP, `disabled` grey. Buttons share
 * the row equally unless `grow` is set.
 */
export const ActionButton = ({
    children,
    tone = "default",
    icon,
    grow = 1,
    onClick,
}: {
    children: ReactNode;
    tone?: "default" | "primary" | "danger" | "disabled" | "active";
    icon?: ReactNode;
    grow?: number;
    onClick?: () => void;
}) => {
    const palette = {
        default: { bg: appColors.slate, hover: appColors.slateDark, fg: "#fff" },
        primary: { bg: appColors.green, hover: appColors.greenDark, fg: "#fff" },
        active: { bg: appColors.green, hover: appColors.greenDark, fg: "#fff" },
        danger: { bg: appColors.red, hover: "#C62F43", fg: "#fff" },
        disabled: { bg: appColors.greyLight, hover: appColors.greyLight, fg: "#fff" },
    }[tone];

    return (
        <Button
            onClick={onClick}
            disableElevation
            startIcon={icon}
            sx={{
                flex: `${grow} 1 0`,
                minHeight: 56,
                borderRadius: `${appRadius.button}px`,
                bgcolor: palette.bg,
                color: palette.fg,
                "&:hover": { bgcolor: palette.hover },
            }}
        >
            {children}
        </Button>
    );
};

/** The bottom bar itself — an equal-width row with a small gutter. */
export const ActionBar = ({ children }: { children: ReactNode }) => (
    <Box sx={{ display: "flex", gap: `${appLayout.actionBarGap}px`, px: 1, py: 1, width: "100%" }}>{children}</Box>
);

export const AppShell = ({
    title,
    active,
    accountLabel = appIdentity.accountLabel,
    showLogOut = true,
    topActions = [],
    showCart = false,
    showOverflow = true,
    topBarRight,
    subBar,
    orderPanel,
    actionBar,
    children,
    defaultDrawerOpen = false,
    tone = "light",
}: AppShellProps) => {
    const [drawerOpen, setDrawerOpen] = useState(defaultDrawerOpen);

    const isDark = tone === "dark";

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                bgcolor: isDark ? "#1A1A1A" : appColors.canvas,
            }}
        >
            <AppBar position="static" sx={{ bgcolor: isDark ? "#0F0F0F" : appColors.slate }}>
                <Toolbar sx={{ gap: 1 }}>
                    <IconButton edge="start" aria-label="Open navigation" onClick={() => setDrawerOpen(true)} sx={{ color: "#fff", mr: 1 }}>
                        <MenuIcon sx={{ fontSize: 28 }} />
                    </IconButton>

                    <Typography sx={{ fontSize: 15, color: "#fff", flex: 1, minWidth: 0 }} noWrap>
                        {title}
                    </Typography>

                    {topBarRight ?? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                            {accountLabel && (
                                <Typography sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff" }}>{accountLabel}</Typography>
                            )}
                            {showLogOut && <Typography sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff" }}>LOG OUT</Typography>}
                            {topActions.map((label) => (
                                <Typography key={label} sx={{ fontSize: 13, letterSpacing: "0.06em", color: "#fff" }}>
                                    {label}
                                </Typography>
                            ))}
                            {showCart && (
                                <IconButton aria-label="Cart" sx={{ color: "#fff" }}>
                                    <ShoppingCartIcon sx={{ fontSize: 30 }} />
                                </IconButton>
                            )}
                            {showOverflow && (
                                <IconButton aria-label="More" edge="end" sx={{ color: "#fff" }}>
                                    <MoreVertIcon />
                                </IconButton>
                            )}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {subBar}

            <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
                {orderPanel && (
                    <Box
                        component="aside"
                        aria-label="Current order"
                        sx={{
                            width: appLayout.orderPanelWidth,
                            flexShrink: 0,
                            bgcolor: appColors.surface,
                            borderRight: "1px solid",
                            borderColor: appColors.divider,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                        }}
                    >
                        {orderPanel}
                    </Box>
                )}

                <Box component="main" sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
                    {children}
                </Box>
            </Box>

            {actionBar && (
                <Box sx={{ flexShrink: 0, bgcolor: isDark ? "#0F0F0F" : appColors.canvasAlt }}>
                    <ActionBar>{actionBar}</ActionBar>
                </Box>
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} slotProps={{ paper: { sx: { width: appLayout.drawerWidth } } }}>
                <NavDrawerContent active={active} onNavigate={() => setDrawerOpen(false)} />
            </Drawer>
        </Box>
    );
};

export { NavDrawerContent };
export default AppShell;
