import type { ReactNode } from "react";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import GolfCourseOutlinedIcon from "@mui/icons-material/GolfCourseOutlined";
import LocalBarOutlinedIcon from "@mui/icons-material/LocalBarOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import { layout, touchTarget } from "@/theme/tokens";
import { assetUrl } from "@/utils/asset-url";

/**
 * The persistent Birdie POS frame.
 *
 * This is the layout contract every screen inherits, and the reason it is a
 * component rather than a diagram: the dimensions in `tokens.layout` only mean
 * something if there is exactly one implementation of them.
 *
 * Structure at 1280×800:
 *
 *   ┌──────────────────────────────────────────────┐ 64  app bar
 *   ├────┬────────────────────────────┬────────────┤
 *   │ 88 │        canvas              │    380     │ 664 working area
 *   │rail│                            │ order panel│
 *   ├────┴────────────────────────────┴────────────┤
 *   └──────────────────────────────────────────────┘ 72  action bar
 *
 * The page itself never scrolls — each region scrolls internally. A POS that
 * scrolls as a page loses the action bar exactly when the operator reaches
 * for it.
 */

export type NavKey = "register" | "tickets" | "payments" | "teesheet" | "fnb" | "proshop" | "customers" | "settings";

const navItems: { key: NavKey; label: string; Icon: SvgIconComponent }[] = [
    { key: "register", label: "Register", Icon: PointOfSaleOutlinedIcon },
    { key: "tickets", label: "Tickets", Icon: ReceiptLongOutlinedIcon },
    { key: "payments", label: "Payments", Icon: CreditCardOutlinedIcon },
    { key: "teesheet", label: "Tee sheet", Icon: GolfCourseOutlinedIcon },
    { key: "fnb", label: "F & B", Icon: LocalBarOutlinedIcon },
    { key: "proshop", label: "Pro shop", Icon: ShoppingBagOutlinedIcon },
    { key: "customers", label: "Members", Icon: PeopleOutlineOutlinedIcon },
    { key: "settings", label: "Settings", Icon: SettingsOutlinedIcon },
];

export interface PosShellProps {
    /** Which rail item reads as current. */
    active?: NavKey;
    /** Course / venue name shown in the app bar. */
    venue?: string;
    /** Till identifier — matters at close-out, so it is always visible. */
    till?: string;
    operator?: { name: string; initials: string };
    /** Connection state. Offline is a first-class state, not an error dialog. */
    connection?: "online" | "offline";
    /** Main working canvas. */
    children: ReactNode;
    /** Right-hand order/cart panel. Omit for screens with no active order. */
    orderPanel?: ReactNode;
    /** Bottom action bar — the one primary commit action for this screen. */
    actionBar?: ReactNode;
    onNavigate?: (key: NavKey) => void;
}

const NavRail = ({ active, onNavigate }: { active?: NavKey; onNavigate?: (key: NavKey) => void }) => (
    <Box
        component="nav"
        aria-label="Primary"
        sx={{
            width: layout.navRailWidth,
            flexShrink: 0,
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            overflowY: "auto",
            py: 1,
        }}
    >
        <Stack spacing={0.5} sx={{ alignItems: "center" }}>
            {navItems.map(({ key, label, Icon }) => {
                const isActive = key === active;

                return (
                    <Box
                        key={key}
                        component="button"
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => onNavigate?.(key)}
                        sx={{
                            // The rail is 88px so an icon and its label both fit —
                            // an unlabeled icon rail is a memory test.
                            width: layout.navRailWidth - 12,
                            minHeight: touchTarget.large,
                            border: 0,
                            cursor: "pointer",
                            borderRadius: 2,
                            py: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.25,
                            bgcolor: isActive ? "primary.main" : "transparent",
                            color: isActive ? "primary.contrastText" : "text.secondary",
                            transition: "background-color 120ms linear",
                            "&:hover": { bgcolor: isActive ? "primary.dark" : "action.hover" },
                        }}
                    >
                        <Icon sx={{ fontSize: 26 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>
                            {label}
                        </Typography>
                    </Box>
                );
            })}
        </Stack>
    </Box>
);

export const PosShell = ({
    active = "register",
    venue = "Sagamore Golf Club",
    till = "Register 2",
    operator = { name: "Dana Kim", initials: "DK" },
    connection = "online",
    children,
    orderPanel,
    actionBar,
    onNavigate,
}: PosShellProps) => (
    <Box
        sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            // The page never scrolls; regions do.
            overflow: "hidden",
        }}
    >
        <AppBar position="static">
            <Toolbar>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
                    <Box component="img" src={assetUrl("logos/tf-square-color.svg")} alt="Tenfore" sx={{ height: 32 }} />
                    <Stack spacing={0} sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                            {venue}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                            {till}
                        </Typography>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Chip
                        size="small"
                        label={connection === "online" ? "Online" : "Offline — 3 queued"}
                        color={connection === "online" ? "success" : "warning"}
                        variant={connection === "online" ? "outlined" : "filled"}
                    />
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: 15 }}>{operator.initials}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {operator.name}
                        </Typography>
                    </Stack>
                </Stack>
            </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
            <NavRail active={active} onNavigate={onNavigate} />

            <Box component="main" sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
                {children}
            </Box>

            {orderPanel && (
                <Box
                    component="aside"
                    aria-label="Current order"
                    sx={{
                        width: { xs: layout.orderPanelWidth, lg: layout.orderPanelWidthLarge },
                        flexShrink: 0,
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}
                >
                    {orderPanel}
                </Box>
            )}
        </Box>

        {actionBar && (
            <Box
                sx={{
                    minHeight: layout.actionBarHeight,
                    flexShrink: 0,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {actionBar}
            </Box>
        )}
    </Box>
);

export default PosShell;
