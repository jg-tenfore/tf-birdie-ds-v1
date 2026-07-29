import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * Customer Search, as it ships.
 *
 * Transcribed from `references/072926/11-customerSearch/`. The screen is one
 * centred search field over an otherwise empty canvas; typing drops an elevated
 * result card directly under the field. Tapping a result opens the customer
 * record — a form of grey filled fields followed by five navy section bars
 * (Memberships, Customer Types, Gift Cards, Tee Time History, Punch Cards) and
 * a read-only General Info list.
 */

/* ------------------------------------------------------------------ search */

/** Contact icons in the result list are a saturated green, not the app's brand green. */
const resultIconGreen = "#388E3C";

export interface CustomerResult {
    /** Bold italic code shown above the first result, e.g. "(tr456)". */
    tag?: string;
    name: string;
    email: string;
    /** Rendered as an empty slot when absent, which is why 2-line rows are as tall as 3-line ones. */
    phone?: string;
}

/** The heading plus the underlined, centre-aligned search field. */
export const CustomerSearchField = ({ value }: { value?: string }) => (
    <Box sx={{ width: "82.5%", mx: "auto", pt: 13 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, textAlign: "center", color: appColors.textPrimary }}>Customer Search</Typography>

        <Box
            sx={{
                mt: 2.5,
                pb: 0.75,
                borderBottom: `1px solid ${appColors.textPrimary}`,
                textAlign: "center",
            }}
        >
            <Typography sx={{ fontSize: 20, color: value ? appColors.textPrimary : "#757575", lineHeight: 1.3 }}>
                {value || "Search by customer name, email, or phone…"}
            </Typography>
        </Box>
    </Box>
);

const ContactLine = ({ icon, text }: { icon: ReactNode; text?: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minHeight: 22 }}>
        <Box sx={{ width: 20, display: "flex", color: resultIconGreen }}>{text ? icon : null}</Box>
        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{text}</Typography>
    </Box>
);

/**
 * The result card. It hangs off the bottom of the search field at the same
 * width, floating over the canvas with a hard MD2 shadow.
 */
export const CustomerResultsList = ({ results }: { results: CustomerResult[] }) => (
    <Box
        sx={{
            width: "82.5%",
            mx: "auto",
            bgcolor: appColors.surface,
            boxShadow: "0 3px 10px rgba(0,0,0,0.28)",
        }}
    >
        {results.map((result) => (
            <Box
                key={result.email}
                sx={{
                    borderTop: `1px solid ${appColors.textPrimary}`,
                    px: 0.75,
                    py: 0.75,
                }}
            >
                {result.tag && (
                    <Typography sx={{ fontSize: 15, fontStyle: "italic", fontWeight: 700, color: appColors.textPrimary }}>
                        {result.tag}
                    </Typography>
                )}
                <Typography sx={{ fontSize: 17, color: appColors.textPrimary, mb: 0.5 }}>{result.name}</Typography>
                <ContactLine icon={<EmailIcon sx={{ fontSize: 20 }} />} text={result.email} />
                <ContactLine icon={<PhoneIcon sx={{ fontSize: 20 }} />} text={result.phone} />
            </Box>
        ))}
    </Box>
);

/* ------------------------------------------------------------------ record */

export interface CustomerRecordField {
    label: string;
    value?: string;
}

/**
 * A grey filled field. With a value it floats the label above; empty, the label
 * sits in the value's place as a placeholder — the app never shows both.
 */
export const CustomerField = ({ label, value }: CustomerRecordField) => (
    <Box
        sx={{
            bgcolor: "#E0E0E0",
            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
            borderBottom: "1px solid rgba(0,0,0,0.42)",
            px: 1.5,
            minHeight: 56,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        }}
    >
        {value ? (
            <>
                <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: appColors.textSecondary }}>{label}</Typography>
                <Typography sx={{ fontSize: 17, lineHeight: 1.5, color: appColors.textPrimary }}>{value}</Typography>
            </>
        ) : (
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{label}</Typography>
        )}
    </Box>
);

/**
 * The record's three field rows. The last row is four columns — Street Address
 * keeps the width of a third, and City / State / Zip share what is left.
 */
export const CustomerRecordFields = ({ customer }: { customer: CustomerRecord }) => (
    <Box sx={{ px: 1, pt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.75, mb: 1.75 }}>
            <CustomerField label="First Name" value={customer.firstName} />
            <CustomerField label="Last Name" value={customer.lastName} />
            <CustomerField label="Enter Customer Email" value={customer.email} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.75, mb: 1.75 }}>
            <CustomerField label="Phone Number" value={customer.phone} />
            <CustomerField label="Customer Birthday" value={customer.birthday} />
            <CustomerField label="Enter notes for this customer" value={customer.notes} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1.47fr 1fr 1fr 1fr", gap: 1.75 }}>
            <CustomerField label="Street Address" value={customer.street} />
            <CustomerField label="City" value={customer.city} />
            <CustomerField label="State" value={customer.state} />
            <CustomerField label="Zip Code" value={customer.zip} />
        </Box>
    </Box>
);

export interface CustomerRecord {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    birthday?: string;
    notes?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
}

/** Navy bar. On its own it is a collapsed section; with children it caps a white card. */
export const CustomerSection = ({ title, children }: { title: string; children?: ReactNode }) => (
    <Box sx={{ px: 1, mt: 3 }}>
        <Box
            sx={
                children
                    ? {
                          bgcolor: appColors.surface,
                          border: `1px solid ${appColors.divider}`,
                          borderRadius: `${appRadius.card}px`,
                      }
                    : undefined
            }
        >
            <Box
                sx={{
                    bgcolor: appColors.navy,
                    borderRadius: `${appRadius.card}px`,
                    px: 2,
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Typography sx={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>{title}</Typography>
            </Box>
            {children}
        </Box>
    </Box>
);

/** Membership rows read "<name>  Expires  <date>" on one line. */
export const MembershipRow = ({ name, expires }: { name: string; expires: string }) => (
    <Box sx={{ display: "flex", gap: 2, px: 2, py: 1.75 }}>
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{name}</Typography>
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>Expires</Typography>
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{expires}</Typography>
    </Box>
);

/** Customer types are a plain, un-grouped checkbox column. None are selected here. */
export const CustomerTypeList = ({ types }: { types: string[] }) => (
    <Box sx={{ px: 1.5, py: 1 }}>
        {types.map((type) => (
            <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 1.25, minHeight: 34 }}>
                <Checkbox
                    disableRipple
                    sx={{ p: 0, color: appColors.textPrimary, "&.Mui-checked": { color: appColors.textPrimary } }}
                    slotProps={{ input: { "aria-label": type } }}
                />
                <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{type}</Typography>
            </Box>
        ))}
    </Box>
);

/** Gift cards: a two-column header with the balance flushed right, and no rows. */
export const GiftCardsTable = () => (
    <Box sx={{ px: 2, pt: 2, pb: 2, minHeight: 130 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>UPC</Typography>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>Balance</Typography>
        </Box>
    </Box>
);

export interface TeeTimeHistoryRow {
    id: string;
    date: string;
    players: number;
}

export const TeeTimeHistoryTable = ({ rows }: { rows: TeeTimeHistoryRow[] }) => (
    <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "100px 210px 90px", mb: 0.5 }}>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>TeeTime ID</Typography>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>Date</Typography>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary, textAlign: "center" }}>Players</Typography>
        </Box>
        {rows.map((row) => (
            <Box key={row.id} sx={{ display: "grid", gridTemplateColumns: "100px 210px 90px", py: 0.25 }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{row.id}</Typography>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{row.date}</Typography>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary, textAlign: "center" }}>{row.players}</Typography>
            </Box>
        ))}
    </Box>
);

/** Punch cards get their own navy column header, then an empty-state band. */
export const PunchCardsTable = () => (
    <Box sx={{ px: 1.5, py: 1.5 }}>
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                bgcolor: appColors.navy,
                px: 1.5,
                py: 1.25,
            }}
        >
            {["Rounds", "Purchased", "Used", "Remaining"].map((heading, index) => (
                <Typography key={heading} sx={{ fontSize: 14, fontWeight: 700, color: "#fff", textAlign: index === 0 ? "left" : "center" }}>
                    {heading}
                </Typography>
            ))}
        </Box>
        <Box sx={{ bgcolor: appColors.canvas, py: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>No punch cards</Typography>
        </Box>
    </Box>
);

export interface GeneralInfoRow {
    label: string;
    value: string;
}

/** Read-only footer of the record. Labels are italic; values start at the midline. */
export const GeneralInfoList = ({ rows }: { rows: GeneralInfoRow[] }) => (
    <Box sx={{ px: 2, pt: 3, pb: 2 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: appColors.textPrimary, mb: 1.5 }}>General Info</Typography>
        {rows.map((row) => (
            <Box key={row.label} sx={{ display: "grid", gridTemplateColumns: "50% 50%", py: 0.75 }}>
                <Typography sx={{ fontSize: 16, fontStyle: "italic", color: appColors.textPrimary }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{row.value}</Typography>
            </Box>
        ))}
    </Box>
);

/* ----------------------------------------------------------------- fixtures */

/** The "weston" query and its six matches, verbatim from the reference. */
export const westonResults: CustomerResult[] = [
    {
        tag: "(tr456)",
        name: "Weston Farnsworth - 30 Day booking window",
        email: "weston.farnsworth@tenfore.golf",
        phone: "8017084153",
    },
    { name: "Tony Finau - Senior", email: "weston+tony@tenfore.golf", phone: "8017084153" },
    { name: "Weston Senior - Senior", email: "weston.farnsworth+senior@tenfore.golf" },
    { name: "Randy Orton", email: "weston.farnsworth+randy@tenfore.golf" },
    { name: "Weston TenForeTest", email: "weston.farnsworth+MCGGOLF@tenfore.golf" },
    { name: "Tom Watson", email: "weston.farnsworth+tomwatson@tenfore.golf", phone: "8015962658" },
];

export const westonFarnsworth: CustomerRecord = {
    firstName: "Weston",
    lastName: "Farnsworth",
    email: "weston.farnsworth@tenfore.golf",
    phone: "8017084153",
    notes: "free golf for life",
    street: "N/A",
    city: "N/A",
    state: "MD",
};

export const customerTypes = [
    "Senior",
    "Military",
    "Resident",
    "Private Cart",
    "Diamond",
    "New Deal",
    "Guest of Members",
    "Hero",
    "premium single",
    "Resident 22 Test",
    "Austin Test",
    "Test percent off",
    "Simp",
];

export const teeTimeHistory: TeeTimeHistoryRow[] = [
    { id: "9864881", date: "11/23/2026 8:10 AM", players: 4 },
    { id: "9691883", date: "8/1/2026 7:30 AM", players: 1 },
    { id: "9814580", date: "8/1/2026 7:20 AM", players: 1 },
    { id: "9691881", date: "8/1/2026 7:00 AM", players: 1 },
    { id: "9856840", date: "7/21/2026 3:00 PM", players: 4 },
    { id: "9883310", date: "7/21/2026 3:00 PM", players: 1 },
    { id: "9024773", date: "7/20/2026 8:15 PM", players: 1 },
    { id: "8251663", date: "7/20/2026 8:09 PM", players: 2 },
    { id: "9813752", date: "7/20/2026 7:50 PM", players: 1 },
    { id: "8773670", date: "7/20/2026 7:46 PM", players: 1 },
    { id: "9813748", date: "7/20/2026 6:50 PM", players: 1 },
    { id: "9024768", date: "7/20/2026 6:30 PM", players: 3 },
    { id: "9024766", date: "7/20/2026 6:00 PM", players: 2 },
    { id: "9024734", date: "7/20/2026 10:00 AM", players: 1 },
    { id: "9813697", date: "7/20/2026 8:50 AM", players: 2 },
    { id: "9024728", date: "7/20/2026 8:30 AM", players: 1 },
    { id: "9087104", date: "7/1/2026 11:30 AM", players: 3 },
    { id: "9087091", date: "6/30/2026 8:15 PM", players: 1 },
    { id: "9087075", date: "6/30/2026 3:45 PM", players: 4 },
    { id: "9087062", date: "6/30/2026 12:30 PM", players: 4 },
    { id: "8934817", date: "6/19/2026 2:01 PM", players: 4 },
    { id: "7076225", date: "6/16/2026 7:12 AM", players: 1 },
    { id: "7021582", date: "6/16/2026 7:03 AM", players: 4 },
    { id: "7607641", date: "6/10/2026 12:00 PM", players: 1 },
    { id: "7607567", date: "6/9/2026 2:33 PM", players: 1 },
    { id: "7607565", date: "6/9/2026 2:15 PM", players: 2 },
    { id: "7607564", date: "6/9/2026 2:06 PM", players: 2 },
    { id: "7607170", date: "6/4/2026 6:36 AM", players: 2 },
    { id: "7607120", date: "6/3/2026 1:30 PM", players: 4 },
    { id: "7607108", date: "6/3/2026 11:42 AM", players: 4 },
];

export const westonGeneralInfo: GeneralInfoRow[] = [
    { label: "Customer ID", value: "458336" },
    { label: "Golf Course Customer ID", value: "313489" },
    { label: "Rewards Balance:", value: "825" },
    { label: "Customer Balance", value: "$2,451.96" },
    { label: "Card on File", value: "4242" },
    { label: "Card on File Expires", value: "2/2042" },
];
