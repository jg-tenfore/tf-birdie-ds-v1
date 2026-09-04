import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileEmpty, MobileRow, MobileSearch, MobileSectionHeading } from "../mobile-parts";
import { MobileAppBar, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 11-customerSearch.** From `references/090426/`, laid out
 * against `App Screens → 11-customerSearch`.
 *
 * ## Three screens where the tablet has one
 *
 * On tablet, Customer Search is a **master-detail**: a results list on the left,
 * the selected customer's record filling the pane on the right, both visible at
 * once. Master-detail is the single most common layout to break on a phone, and
 * it breaks the same way every time — neither half is usable at half of 402px.
 *
 * So it unfolds into a stack: **search → results → record**, each a full
 * screen, `back` returning one step. That costs a tap and gains a screen that
 * can actually be read.
 *
 * ## The customer / member toggle
 *
 * The references show a two-up segmented control above the results. It is kept
 * because the two searches return different things and the tablet's version —
 * two separate fields side by side — needs 500px it does not have here.
 *
 * ## The record's sections stay collapsible
 *
 * The tablet record shows Memberships, Gift Cards, Tee Times, Punch Cards and
 * Rain Checks as stacked expandable sections. That pattern survives the
 * narrowing unchanged, which is why the record needed the least work of the
 * three: a vertical accordion is already a one-column layout.
 */

const results = [
    { name: "Macey West", email: "justin@gmail.com" },
    { name: "Brigid West", email: "justin@gmail.com" },
    { name: "Joaquin West", email: "justin@gmail.com", phone: "(617) 450-4133" },
    { name: "Eli West", email: "justin@gmail.com", phone: "(617) 450-4133" },
    { name: "Tod West", email: "justin@gmail.com" },
    { name: "Weston Farnsworth", email: "weston.farnsworth@tenfore.golf", phone: "5437964523" },
];

const recordSections = [
    { label: "Memberships", count: 1 },
    { label: "Gift Cards", count: 2 },
    { label: "Rain Checks", count: 3 },
    { label: "Tee Times", count: 4 },
    { label: "Punch Cards", count: 1 },
];

/** The segmented control from the references — two states, one row. */
const SegmentedToggle = ({ active }: { active: "Customer" | "Member" }) => (
    <Stack
        direction="row"
        sx={{ mx: 1.5, mb: 1, border: `1px solid ${appColors.divider}`, borderRadius: `${appRadius.button}px`, overflow: "hidden" }}
    >
        {(["Customer", "Member"] as const).map((k) => (
            <ButtonBase
                key={k}
                sx={{
                    flex: 1,
                    minHeight: 44,
                    gap: 0.75,
                    fontSize: 14,
                    bgcolor: k === active ? appColors.canvasAlt : appColors.surface,
                    color: appColors.textPrimary,
                }}
            >
                {k === active && <CheckIcon sx={{ fontSize: 16 }} />}
                {k}
            </ButtonBase>
        ))}
    </Stack>
);

export interface MobileCustomerSearchProps {
    /** `empty` before a query, `results` after, `record` on a picked customer. */
    view?: "empty" | "results" | "record";
    /** Expands every section on the record. */
    expanded?: boolean;
    drawerOpen?: boolean;
}

export const MobileCustomerSearch = ({ view = "empty", expanded = false, drawerOpen = false }: MobileCustomerSearchProps) => {
    const [drawer, setDrawer] = useState(drawerOpen);
    const [open, setOpen] = useState<string | null>(expanded ? "Rain Checks" : null);

    if (view === "record") {
        return (
            <MobileScreen
                appBar={<MobileAppBar title="Weston Farnsworth" subtitle="weston.farnsworth@tenfore.golf" leading="back" showOverflow />}
            >
                <Stack sx={{ p: 1.5, gap: 0.5, bgcolor: appColors.surface }}>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                        <PhoneOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                        <Typography sx={{ fontSize: 14 }}>5437964523</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                        <EmailOutlinedIcon sx={{ fontSize: 16, color: appColors.textSecondary }} />
                        <Typography sx={{ fontSize: 14 }}>weston.farnsworth@tenfore.golf</Typography>
                    </Stack>
                </Stack>

                <MobileSectionHeading>On file</MobileSectionHeading>
                {recordSections.map((s) => {
                    const isOpen = expanded || open === s.label;
                    return (
                        <Box key={s.label}>
                            <ButtonBase
                                onClick={() => setOpen(isOpen ? null : s.label)}
                                sx={{
                                    width: "100%",
                                    px: 1.5,
                                    minHeight: 52,
                                    gap: 1,
                                    bgcolor: appColors.surface,
                                    borderBottom: `1px solid ${appColors.divider}`,
                                }}
                            >
                                <Typography sx={{ fontSize: 16, flex: 1, textAlign: "left" }}>{s.label}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{s.count}</Typography>
                                <ExpandMoreIcon
                                    sx={{ fontSize: 22, color: appColors.textSecondary, transform: isOpen ? "rotate(180deg)" : undefined }}
                                />
                            </ButtonBase>
                            {isOpen && (
                                <Stack sx={{ px: 1.5, py: 1, bgcolor: appColors.canvas, gap: 0.5 }}>
                                    {Array.from({ length: s.count }, (_, i) => (
                                        <Stack key={i} direction="row" sx={{ justifyContent: "space-between" }}>
                                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                                                {s.label.slice(0, -1)} {i + 1}
                                            </Typography>
                                            <Typography sx={{ fontSize: 14 }}>—</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    );
                })}
            </MobileScreen>
        );
    }

    return (
        <MobileScreen
            appBar={
                <MobileAppBar title="Customer Lookup" leading={view === "results" ? "close" : "menu"} onLeading={() => setDrawer(true)} />
            }
            overlay={
                drawer ? (
                    <MobileNavDrawer active="customersearch" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : undefined
            }
        >
            <MobileSearch placeholder="Search Customers" value={view === "results" ? "West" : ""} trailing="tune" />
            {view === "results" && <SegmentedToggle active="Customer" />}
            {view === "empty" ? (
                <MobileEmpty message="No open tabs." />
            ) : (
                results.map((r) => (
                    <MobileRow
                        key={r.name}
                        title={r.name}
                        subtitle={[r.email, r.phone].filter(Boolean).join(" · ")}
                        image={undefined}
                        onClick={() => {}}
                    />
                ))
            )}
        </MobileScreen>
    );
};
