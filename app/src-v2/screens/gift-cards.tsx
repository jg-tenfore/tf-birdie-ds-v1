import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import {
    GiftCardTableBody,
    GiftCardTableHeader,
    westonGiftCards,
    type GiftCardRow,
} from "@/components/screens/operations/gift-cards-table";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";

/**
 * Gift Cards, from `references/072926/14-giftcards/`.
 *
 * The table and its header band are the same components the Storybook stories
 * use — this screen only adds the live search and the wiring. The one behaviour
 * that has to be kept: a zero-balance card is communicated by dimming the whole
 * row, not by any badge or column, so a spent-out card is easy to miss.
 *
 * There is no empty-state message anywhere in this screen — clear the search and
 * the header band sits over a bare canvas. The device opens in that state; this
 * lands on the reference query's results instead, since an empty table tells you
 * nothing about what the screen is for.
 */
export const GiftCardsScreen = () => {
    const navigate = useNavigate();
    // Opens populated. The device opens on a bare canvas under the header band,
    // but an empty table tells you nothing about the screen — so the reference
    // query's own result set is what you land on, and search narrows from there.
    const [query, setQuery] = useState("weston");
    const [rows, setRows] = useState<GiftCardRow[]>(westonGiftCards);

    const search = () => {
        const q = query.trim().toLowerCase();
        // "weston" is the reference query and returns the device's own test data,
        // which is why it matches cards belonging to two other names.
        if (!q) return setRows([]);
        setRows(
            q === "weston" ? westonGiftCards : westonGiftCards.filter((r) => r.customerName.toLowerCase().includes(q) || r.upc.includes(q)),
        );
    };

    return (
        <Shell
            title="Gift Cards"
            active="giftcards"
            topBarRight={null}
            subBar={
                <Box sx={{ flexShrink: 0 }}>
                    <Stack direction="row" sx={{ bgcolor: "#FAFAFA", alignItems: "center", gap: 1, px: 1, py: 1 }}>
                        <Stack
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                height: 52,
                                bgcolor: "#E2E2E2",
                                borderBottom: `1px solid #767676`,
                                px: 1.75,
                                justifyContent: "center",
                            }}
                        >
                            {query ? (
                                <>
                                    <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Gift Card Search</Typography>
                                    <Box
                                        component="input"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && search()}
                                        sx={{ border: 0, bgcolor: "transparent", outline: "none", fontSize: 17, fontFamily: "inherit" }}
                                    />
                                </>
                            ) : (
                                <Box
                                    component="input"
                                    autoFocus
                                    placeholder="Gift Card Search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && search()}
                                    sx={{
                                        border: 0,
                                        bgcolor: "transparent",
                                        outline: "none",
                                        fontSize: 17,
                                        fontFamily: "inherit",
                                        "&::placeholder": { color: appColors.textPrimary, opacity: 1 },
                                    }}
                                />
                            )}
                        </Stack>
                        <Box
                            component="button"
                            onClick={search}
                            sx={{
                                width: 240,
                                height: 56,
                                border: 0,
                                bgcolor: appColors.slate,
                                color: "#fff",
                                borderRadius: `${appRadius.button}px`,
                                fontSize: 16,
                                fontFamily: "inherit",
                                letterSpacing: "0.09em",
                                cursor: "pointer",
                            }}
                        >
                            SEARCH
                        </Box>
                    </Stack>
                    <GiftCardTableHeader />
                </Box>
            }
            actionBar={
                <ActionButton grow={1} icon={<ArrowBackIosNewIcon />} onClick={() => navigate(-1)}>
                    Back
                </ActionButton>
            }
        >
            {/* No "no results" copy — the app leaves the canvas bare. */}
            <GiftCardTableBody rows={rows} />
        </Shell>
    );
};
