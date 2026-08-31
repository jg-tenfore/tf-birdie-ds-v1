import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TenderSearch } from "@/components/concepts/rainchecks/aug-31/raincheck-tender";
import { searchAllRainchecks, searchRainchecks } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { PaneFrame } from "./pane-frame";

/**
 * **Aug 31 → Components. The search field, and the scope question.**
 *
 * One control, **two scopes**, and that pairing is the direct answer to the only
 * objection raised against including used credits at all:
 *
 * > *"My worry is if we include all exhausted rainchecks it will slow down the
 * > search for the more common use case of actually using a raincheck when there
 * > is one."*
 *
 * | Tab | Function | Scope | Matches |
 * | :-- | :-- | :-- | :-- |
 * | **Available** | `searchRainchecks(q)` | Spendable only | id · name · email |
 * | **History** | `searchAllRainchecks(q)` | Everything, **all customers** | id · name · email, ranked spendable-first |
 *
 * **The fast path is byte for byte the query that ships today.** It cannot get
 * slower, because nothing was added to it. The broader question was given its
 * own tab rather than folded into the narrow one — that is the whole trade, and
 * it costs no query time.
 *
 * ## Three things the API has to honour
 *
 * 1. **Minimum two characters.** Both helpers return `[]` below that. A single
 *    letter against a full ledger is a scan, not a lookup.
 * 2. **History ranks, it does not filter.** `available → part spent → expired →
 *    used → voided`, then reverse issue date. The credit you can spend stays
 *    first on screen without anything being hidden to put it there — omission is
 *    what produced the empty list in the first place.
 * 3. **History spans every customer.** The reason to be on that tab is often
 *    that the name on the ticket is not the name on the credit: a misspelling, a
 *    spouse's booking, a company account, a slip carrying nothing but an id.
 *
 * ## Field spec
 *
 * MD2 filled field (`appColors.fieldFill`) with a bottom rule, a leading search
 * glyph, **48dp** input height and a 16px face — 16px is the floor that stops
 * mobile browsers zooming on focus, and the counter is a touch device.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/Components/Search & scope",
    parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Type in both.** Try `weston`, then `29115`, then `senior`.
 *
 * Watch the counts diverge: Available answers *"what can this pay with"* and
 * History answers *"what exists"*. Below two characters both return nothing, by
 * design.
 */
export const BothScopes: Story = {
    name: "The same string, both scopes",
    render: function BothScopes() {
        const [q, setQ] = useState("weston");
        const narrow = searchRainchecks(q);
        const broad = searchAllRainchecks(q);
        return (
            <Stack sx={{ width: 890, gap: 2 }}>
                <PaneFrame height="auto" note="One field, driving both queries">
                    <TenderSearch query={q} onQuery={setQ} placeholder="Enter Raincheck id, customer name, or email" />
                </PaneFrame>

                <Stack direction="row" sx={{ gap: 2 }}>
                    {(
                        [
                            ["AVAILABLE · searchRainchecks()", narrow, "Spendable only — the query that ships today"],
                            ["HISTORY · searchAllRainchecks()", broad, "Everything, every customer, ranked"],
                        ] as const
                    ).map(([label, rows, note]) => (
                        <Box key={label} sx={{ flex: 1, border: `1px solid ${appColors.divider}`, p: 1.5, bgcolor: appColors.surface }}>
                            <Typography sx={{ fontSize: 13, fontFamily: "Roboto Mono, monospace", color: appColors.textSecondary }}>
                                {label}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: appColors.textDisabled, mb: 1 }}>{note}</Typography>
                            <Typography sx={{ fontSize: 20, color: rows.length ? appColors.greenTee : appColors.textDisabled }}>
                                {rows.length} {rows.length === 1 ? "result" : "results"}
                            </Typography>
                            <Stack sx={{ mt: 1, gap: 0.25 }}>
                                {rows.map((r) => (
                                    <Typography key={r.id} sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                        #{r.id} · {r.customerName} · {r.course ?? "—"}
                                    </Typography>
                                ))}
                                {rows.length === 0 && (
                                    <Typography sx={{ fontSize: 13, color: appColors.textDisabled }}>
                                        {q.trim().length < 2 ? "Under two characters — both return []" : "No match"}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        );
    },
};
