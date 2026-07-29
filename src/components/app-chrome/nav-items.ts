import type { SvgIconComponent } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import GridViewIcon from "@mui/icons-material/GridView";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";

/**
 * The shipping app's navigation, transcribed from the flyout drawer in
 * `references/072926/0-sidebarnav/`.
 *
 * Three groups, in this exact order — "Pro Shop", "Restaurant", and a final
 * ungrouped block. The group headings are rendered as grey section labels and
 * separated by dividers, exactly as the app does.
 */

export type NavKey =
    | "proshop"
    | "teesheet"
    | "courtsheet"
    | "baysheet"
    | "quickorder"
    | "tabs"
    | "tables"
    | "reservations"
    | "orderstips"
    | "tablechart"
    | "customersearch"
    | "orderlookup"
    | "timeclock"
    | "giftcards"
    | "events"
    | "inventory"
    | "shift"
    | "logout"
    | "settings";

export interface NavItem {
    key: NavKey;
    label: string;
    Icon: SvgIconComponent;
}

export interface NavGroup {
    /** Grey heading above the group; the final block has none. */
    heading?: string;
    items: NavItem[];
}

export const navGroups: NavGroup[] = [
    {
        heading: "Pro Shop",
        items: [
            { key: "proshop", label: "Pro Shop", Icon: StorefrontIcon },
            { key: "teesheet", label: "Tee Sheet", Icon: GolfCourseIcon },
            { key: "courtsheet", label: "Court Sheet", Icon: SportsTennisIcon },
            { key: "baysheet", label: "Bay Sheet", Icon: SportsGolfIcon },
        ],
    },
    {
        heading: "Restaurant",
        items: [
            { key: "quickorder", label: "Quick Order", Icon: BoltIcon },
            { key: "tabs", label: "Tabs", Icon: CreditCardIcon },
            { key: "tables", label: "Tables", Icon: RestaurantIcon },
            { key: "reservations", label: "Reservations", Icon: AssignmentTurnedInOutlinedIcon },
            { key: "orderstips", label: "Orders & Tips", Icon: AttachMoneyIcon },
            { key: "tablechart", label: "Table Chart", Icon: GridViewIcon },
        ],
    },
    {
        items: [
            { key: "customersearch", label: "Customer Search", Icon: SearchIcon },
            { key: "orderlookup", label: "Order Lookup", Icon: ReceiptLongOutlinedIcon },
            { key: "timeclock", label: "Time Clock", Icon: AccessTimeIcon },
            { key: "giftcards", label: "Gift Cards", Icon: CreditCardIcon },
            { key: "events", label: "Events", Icon: CalendarMonthOutlinedIcon },
            { key: "inventory", label: "Inventory", Icon: AssignmentTurnedInOutlinedIcon },
            { key: "shift", label: "Shift", Icon: AssignmentTurnedInOutlinedIcon },
            { key: "logout", label: "Log Out", Icon: PowerSettingsNewIcon },
            { key: "settings", label: "Settings", Icon: SettingsIcon },
        ],
    },
];

/** Identity shown in the drawer's dark header block. */
export const appIdentity = {
    product: "TenFore Birdie",
    version: "v. 5.6.18.52",
    account: "Test Test Account (test@testmember.com)",
    facility: "The Dunes of Delgado PROD",
    device: "sdk_gphone64_arm64",
    /** Uppercase account label shown in the top app bar. */
    accountLabel: "TEST TEST ACCOUNT",
} as const;
