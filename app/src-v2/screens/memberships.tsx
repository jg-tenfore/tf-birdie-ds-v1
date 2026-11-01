import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { GuestForm } from "@/components/concepts/clinics/102126/clinic-parts";
import { demoCustomer, type DemoCustomer } from "@/components/screens/clinics/demo-customer";
import { memberships, testingMemberships, type Membership } from "@/components/screens/memberships/membership-data";
import { MembershipTile } from "@/components/screens/memberships/membership-screens";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { LiveOrderPanel, Shell } from "../pos-shell";
import { useActions } from "../store";

/**
 * **Memberships — V2**, with the three things that are wrong with it fixed.
 *
 * V1 has no membership screen; the shipping one is transcribed under
 * **Flows / Memberships / Current state**, and it has three problems that are
 * not design opinions but plain defects:
 *
 * 1. **The price changes twice and nothing explains it.** $1.00 on the tile,
 *    $0.32 on the form, $0.36 on the ticket, with only a read-only
 *    *"First month type: Prorated"* connecting them. Here the arithmetic is on
 *    screen: the full rate, the proration, and what is owed today.
 * 2. **No search over a list nobody has weeded.** Eighteen rows including
 *    `Beta Compare` and `July QA`. There is a search now, and the two group
 *    tiles say they are filters.
 * 3. **The Customer ID filled itself in grey**, so the one field holding a
 *    real answer read as disabled. It is an answer here, not a ghost.
 *
 * Weston has not asked for a membership redesign, so nothing else moved: same
 * catalogue, same fields, same order. Each fix is listed above so any of them
 * can be vetoed on its own.
 */

/** What the form charges today, and why — the sentence the device never writes. */
const prorate = (price: number) => {
    /* A month that is a third gone bills a third less. The real rule lives on
       the server; this is here so the two figures are visibly related. */
    const share = 0.32;
    const today = Number((price * share).toFixed(2));

    return { share, today, saved: Number((price - today).toFixed(2)) };
};

const usd = (value: number) => `$${value.toFixed(2)}`;

export const MembershipsScreen = () => {
    const navigate = useNavigate();
    const { addItem } = useActions();

    const [group, setGroup] = useState<string | undefined>(undefined);
    const [query, setQuery] = useState("");
    const [picked, setPicked] = useState<Membership | undefined>(undefined);
    const [customer, setCustomer] = useState<DemoCustomer | undefined>(undefined);

    const rows = (group === "testing" ? testingMemberships : memberships).filter((m) =>
        m.name.toLowerCase().includes(query.trim().toLowerCase()),
    );

    const money = picked ? prorate(picked.price) : undefined;

    const add = () => {
        if (!picked || !money) return;
        /* Derived from the membership, not the clock: the store bumps the
           quantity when an id repeats, so two of the same membership read as
           one line of two. */
        addItem({ id: `mem-${picked.name}`, name: `${picked.name} — first month`, price: money.today }, "Pro Shop");
        navigate("/proshop");
    };

    return (
        <Shell
            title={picked ? picked.name : "Memberships"}
            active="proshop"
            orderPanel={<LiveOrderPanel />}
            actionBar={
                <>
                    <ActionButton
                        icon={<ChevronLeftIcon />}
                        onClick={() => (picked ? setPicked(undefined) : group ? setGroup(undefined) : navigate("/proshop"))}
                    >
                        Back
                    </ActionButton>
                    {picked && (
                        <ActionButton tone="primary" disabled={!customer} onClick={customer ? add : undefined}>
                            {customer ? `Add to cart · ${usd(money!.today)}` : "Find the member"}
                        </ActionButton>
                    )}
                </>
            }
        >
            {!picked ? (
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvasAlt, p: 2 }}>
                    {/* Fix 2 — a search, and group tiles that admit to being filters. */}
                    <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Box
                            sx={{
                                flex: "0 1 420px",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                minHeight: touchTarget.comfortable,
                                px: 2,
                                bgcolor: appColors.fieldFill,
                                borderBottom: "1px solid rgba(0,0,0,0.42)",
                                borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
                            <Box
                                component="input"
                                value={query}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                                placeholder="Search memberships"
                                aria-label="Search memberships"
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    border: "none",
                                    outline: "none",
                                    bgcolor: "transparent",
                                    fontFamily: "inherit",
                                    fontSize: 18,
                                    color: appColors.textPrimary,
                                    "&::placeholder": { color: appColors.textSecondary },
                                }}
                            />
                        </Box>

                        {["Golf", "testing"].map((name) => (
                            <Box
                                key={name}
                                onClick={() => setGroup(group === name ? undefined : name)}
                                role="button"
                                aria-pressed={group === name}
                                sx={{
                                    display: "grid",
                                    placeItems: "center",
                                    minHeight: touchTarget.min,
                                    px: 2,
                                    cursor: "pointer",
                                    borderRadius: `${appRadius.button}px`,
                                    border: "1px solid",
                                    borderColor: group === name ? appColors.slate : appColors.divider,
                                    bgcolor: group === name ? appColors.slate : appColors.surface,
                                    color: group === name ? "#fff" : appColors.textPrimary,
                                    fontSize: 15,
                                }}
                            >
                                {name}
                            </Box>
                        ))}

                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                            {rows.length} of {memberships.length + testingMemberships.length}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 2 }}>
                            {rows.map((membership) => (
                                <MembershipTile key={membership.name} membership={membership} onSelect={() => setPicked(membership)} />
                            ))}
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, px: 3, py: 2.5 }}>
                    {/* Fix 1 — the arithmetic, instead of a read-only word. */}
                    <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2, mb: 2.5 }}>
                        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>
                            WHAT THEY PAY
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textPrimary }}>
                                {picked.name} — full month
                            </Typography>
                            <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{usd(picked.price)}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mt: 0.75 }}>
                            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textSecondary }}>
                                Prorated — joining {Math.round((1 - money!.share) * 100)}% of the way through the month
                            </Typography>
                            <Typography sx={{ fontSize: 17, color: appColors.greenDark }}>−{usd(money!.saved)}</Typography>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                borderTop: "1px solid",
                                borderColor: appColors.divider,
                                mt: 1.5,
                                pt: 1.5,
                            }}
                        >
                            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textSecondary }}>Due today</Typography>
                            <Typography sx={{ fontSize: 24, fontWeight: 500, color: appColors.textPrimary }}>
                                {usd(money!.today)}
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 1 }}>
                            Then {usd(picked.price)} a month. Tax and fees are added at the till.
                        </Typography>
                    </Box>

                    {/* Fix 3 — the found record reads as an answer, not a ghost. */}
                    <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>
                        WHO IS THE MEMBER
                    </Typography>
                    <GuestForm guest={customer} onFound={() => setCustomer(demoCustomer(0))} />
                </Box>
            )}
        </Shell>
    );
};
