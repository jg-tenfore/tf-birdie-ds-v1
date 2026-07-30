import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

import type { Customer } from "@/data/crm";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * The customer lookup results sheet.
 *
 * Every screen that asks "who is this for?" — a tee time, a court, a bay, a
 * member-account tender — should ask it the same way, and until now several of
 * them took free text instead. A booking against a typed name is a booking that
 * can never be matched to a record, so it is worth having one component for it.
 *
 * Rendering only. The caller owns the query, the filtering and what a pick does,
 * because those differ: a court reserves, a tender charges, a tee time attaches.
 */

export interface CustomerLookupProps {
    results: Customer[];
    onPick: (customer: Customer) => void;
    /**
     * Offers to create the customer being searched for. Several device screens
     * dead-end here — a walk-up who is not in the database cannot be booked at
     * all — so the exit is worth having wherever the lookup appears.
     */
    onCreate?: () => void;
    /** What the operator typed, used in the create row's label. */
    query?: string;
    /** Sheets that hang off a field want no border; standalone ones want one. */
    bordered?: boolean;
}

export const CustomerLookupResults = ({ results, onPick, onCreate, query, bordered }: CustomerLookupProps) => (
    <Box
        sx={{
            bgcolor: "#fff",
            boxShadow: 6,
            maxHeight: 460,
            overflowY: "auto",
            borderTop: bordered ? `1px solid ${appColors.textPrimary}` : undefined,
        }}
    >
        {results.map((c) => (
            <ButtonBase
                key={c.id}
                onClick={() => onPick(c)}
                sx={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    px: 2,
                    py: 1.25,
                    // A hard rule between rows, not a hairline — these are dense
                    // three-line entries and a faint divider loses them.
                    borderBottom: `1px solid ${appColors.textPrimary}`,
                    "&:hover": { bgcolor: appColors.canvas },
                }}
            >
                {c.tag && <Typography sx={{ fontSize: 15, fontWeight: 700, fontStyle: "italic" }}>{c.tag}</Typography>}
                <Typography sx={{ fontSize: 19 }}>{c.displayName}</Typography>

                <Stack direction="row" sx={{ alignItems: "center", gap: 1, mt: 0.25 }}>
                    <EmailIcon sx={{ fontSize: 18, color: appColors.greenTee }} />
                    <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{c.email || "—"}</Typography>
                </Stack>

                {c.phone && (
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: appColors.greenTee }} />
                        <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{c.phone}</Typography>
                    </Stack>
                )}
            </ButtonBase>
        ))}

        {results.length === 0 && !onCreate && (
            <Typography sx={{ px: 2, py: 2, fontSize: 17, color: appColors.textSecondary }}>No customers match.</Typography>
        )}

        {onCreate && (
            <ButtonBase onClick={onCreate} sx={{ display: "flex", width: "100%", gap: 1, px: 2, py: 1.75, color: appColors.green }}>
                <AddIcon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontSize: 17 }}>
                    {results.length || !query ? "Add a new customer" : `Add “${query}” as a new customer`}
                </Typography>
            </ButtonBase>
        )}
    </Box>
);
