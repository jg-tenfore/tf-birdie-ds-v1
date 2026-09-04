import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { westonGiftCards, type GiftCardRow } from "@/components/screens/operations/gift-cards-table";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileEmpty, MobileSearch, MobileSectionHeading } from "../mobile-parts";
import { MobileAppBar, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 14-giftcards.** Laid out against `App Screens → 14-giftcards`.
 *
 * Gift Cards is an eight-column table and nothing else. On the 1290px tablet
 * each column gets `flex: 1`, i.e. ~161px, which is exactly enough for
 * `533752807261` and `5/26/2122` to sit centred without wrapping. Divide the
 * same eight columns into 402px and each gets **50px** — narrower than the
 * word "Expiration".
 *
 * ## The table stacks; it does not scroll sideways
 *
 * Every column is kept. What changes is that they are read top-to-bottom
 * instead of left-to-right, in three lines:
 *
 * | Line | Columns | Why here |
 * | -- | -- | -- |
 * | 1 | **Customer Name** · **Balance** | The two an operator is actually looking for. Balance sits right, so a column of balances is scannable down the list the way the table's Balance column was |
 * | 2 | ID · Gift Card Type · Expiration Date | Identity and validity — what you check once you have found the card |
 * | 3 | Awarded · Spent · UPC | The audit trail. Last because it is never the reason the screen was opened |
 *
 * A horizontally scrolling table would have kept the columns intact and made
 * Balance — the value the screen exists to show — invisible until you scrolled
 * past six columns to reach it. That is the wrong trade for a lookup screen.
 *
 * ## Dimming is why this row is hand-built rather than a `MobileRow`
 *
 * The shipping screen communicates "no balance left" **purely by dimming the
 * whole row** to `#C9CDD1` — no badge, no strikethrough, no label. `MobileRow`
 * has no dim state and adding one to a shared primitive for one screen would be
 * a restyle, so the row here is assembled from `Stack`/`Typography` at
 * `MobileRow`'s own metrics: 1.5 horizontal padding, 16px title, 13px secondary
 * lines, a `divider` hairline underneath. It looks like a `MobileRow` because it
 * is measured off one.
 *
 * Winnings cards carry no UPC, so that segment is dropped from line 3 rather
 * than rendered as an empty cell — a blank cell in a table reads as "no value",
 * a dangling `·` in a sentence reads as a bug.
 *
 * ## The search bar and the header band
 *
 * The tablet sub-bar is a filled field plus a **200px slate SEARCH button**.
 * 200px is half this screen, so the commit collapses into `MobileSearch`'s own
 * trailing glyph — the same affordance every other mobile screen in this
 * category uses.
 *
 * Dropping the button also drops the **grey column-header band**, and that band
 * was load-bearing: on tablet it is drawn over the empty canvas before any
 * search, which is the only thing telling the operator the table exists and is
 * merely unfilled. There are no columns left to head here, so the sentence has
 * to do the band's job — which is why this screen has an empty state where the
 * tablet deliberately has none.
 *
 * ## The action bar
 *
 * One full-width BACK, and nothing else. Back is the app bar's job on mobile
 * (the same call `5-quickorder` made), so the action tray disappears entirely
 * and the results list gets its ~52dp back.
 */

/** `MobileRow`'s metrics, plus the dim state the gift-card table needs. */
const GiftCardStackedRow = ({ row }: { row: GiftCardRow }) => {
    const primary = row.dimmed ? "#C9CDD1" : appColors.textPrimary;
    const secondary = row.dimmed ? "#C9CDD1" : appColors.textSecondary;

    const identity = [`ID ${row.id}`, row.type, `Exp ${row.expirationDate}`].join(" · ");
    // A Winnings card has no UPC. Dropped rather than rendered empty.
    const audit = [`Awarded ${row.awarded}`, `Spent ${row.spent}`, row.upc && `UPC ${row.upc}`].filter(Boolean).join(" · ");

    return (
        <Stack sx={{ px: 1.5, py: 1, gap: 0.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
                <Typography
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 16,
                        color: primary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {row.customerName}
                </Typography>
                <Typography sx={{ fontSize: 16, color: primary, flexShrink: 0 }}>{row.balance}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, color: secondary }} noWrap>
                {identity}
            </Typography>
            <Typography sx={{ fontSize: 13, color: secondary }} noWrap>
                {audit}
            </Typography>
        </Stack>
    );
};

export interface MobileGiftCardsProps {
    /** The typed query. Empty is the pre-search state. */
    query?: string;
    rows?: GiftCardRow[];
    drawerOpen?: boolean;
}

export const MobileGiftCards = ({ query = "", rows = [], drawerOpen = false }: MobileGiftCardsProps) => {
    const [drawer, setDrawer] = useState(drawerOpen);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Gift Cards" leading="menu" onLeading={() => setDrawer(true)} showOverflow={false} />}
            overlay={
                drawer ? (
                    <MobileNavDrawer active="giftcards" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : undefined
            }
        >
            <MobileSearch placeholder="Gift Card Search" value={query} />
            {rows.length === 0 ? (
                <MobileEmpty message="Search by customer name or gift card number." />
            ) : (
                <>
                    <MobileSectionHeading>
                        {rows.length} card{rows.length === 1 ? "" : "s"}
                    </MobileSectionHeading>
                    <Box>
                        {rows.map((row, i) => (
                            <GiftCardStackedRow key={`${row.id}-${i}`} row={row} />
                        ))}
                    </Box>
                </>
            )}
        </MobileScreen>
    );
};

export { westonGiftCards };
