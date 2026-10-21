import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

import { placeholderTile } from "@/components/screens/pro-shop/category-tile";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { membershipDefaults, membershipGroups, memberships, testingMemberships, type Membership } from "./membership-data";

/**
 * **Memberships, as it ships.** Transcribed from
 * `references/102226/memberships/`.
 *
 * Two screens: a grid of everything the course has ever configured, and a form
 * that sells one of them. The flaws are reproduced and named in the story
 * notes; the two that matter most are that the group tiles are filters drawn
 * as products, and that the form's price is not the tile's price.
 */

const usd = (value: number) => `${value < 0 ? "-" : ""}$${Math.abs(value).toFixed(2)}`;

/* ---------------------------------------------------------------- the list */

/**
 * A group tile.
 *
 * Same footprint as a membership, a logo where the price goes, and no caption
 * saying it filters rather than sells. The device draws the course's wordmark
 * on the first and its own antler mark on the second; the wordmark is not in
 * this repo, so it is set as type — the only thing on these two screens that
 * is not reproduced exactly.
 */
export const MembershipGroupTile = ({ name, logo, onSelect }: { name: string; logo: string; onSelect?: () => void }) => (
    <Box
        onClick={onSelect}
        role={onSelect ? "button" : undefined}
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            minHeight: 200,
            bgcolor: appColors.surface,
            cursor: onSelect ? "pointer" : "default",
        }}
    >
        {logo === "antler" ? (
            <Box component="img" src={assetUrl("logos/tf-square-black.svg")} alt="" sx={{ width: 92, height: 86 }} />
        ) : (
            <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 13, letterSpacing: "0.22em", color: appColors.textSecondary }}>CEDAR RAPIDS</Typography>
                <Typography sx={{ fontSize: 34, fontWeight: 700, letterSpacing: "0.12em", color: appColors.textPrimary }}>
                    G
                    <Box component="span" sx={{ color: appColors.green }}>
                        ●
                    </Box>
                    LF
                </Typography>
                <Typography sx={{ fontSize: 9, letterSpacing: "0.14em", color: appColors.textSecondary }}>
                    TWIN PINES · ELLIS · JONES · GARDNER
                </Typography>
            </Box>
        )}
        <Typography sx={{ fontSize: 24, color: appColors.textPrimary }}>{name}</Typography>
    </Box>
);

/** One membership row: a thumbnail, the name, and a price with no period. */
export const MembershipTile = ({ membership, onSelect }: { membership: Membership; onSelect?: () => void }) => (
    <Box
        onClick={onSelect}
        role={onSelect ? "button" : undefined}
        aria-label={`${membership.name} ${usd(membership.price)}`}
        sx={{
            display: "flex",
            alignItems: "stretch",
            minHeight: 86,
            bgcolor: appColors.surface,
            cursor: onSelect ? "pointer" : "default",
            "&:hover": onSelect ? { bgcolor: "#F7F9F8" } : undefined,
        }}
    >
        {/*
         * The device prints a lifestyle photo on memberships that have one
         * configured and its own antler mark on the rest. That photography is
         * not in this repo — memberships are not stock and never will be shot —
         * so a configured image falls back to the same generated plate the Pro
         * Shop grid uses. The photo/mark distinction is the part that matters:
         * it is the only thing separating a maintained row from a test one.
         */}
        <Box sx={{ width: 92, flexShrink: 0, display: "grid", placeItems: "center", overflow: "hidden", bgcolor: appColors.surface }}>
            {membership.photo ? (
                <Box
                    component="img"
                    src={placeholderTile(membership.name)}
                    alt=""
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <Box component="img" src={assetUrl("logos/tf-square-black.svg")} alt="" sx={{ width: 50, height: 46 }} />
            )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1, px: 1.5 }}>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 700, color: appColors.textPrimary }}>
                {membership.name}
            </Typography>
            <Typography sx={{ flexShrink: 0, fontSize: 17, color: appColors.textPrimary }}>{usd(membership.price)}</Typography>
        </Box>
    </Box>
);

/**
 * The membership list.
 *
 * Three columns of tiles under two group tiles, filling top-to-bottom in the
 * device's own order. Nothing is grouped, sorted or searchable — twenty rows
 * today, and the only way through them is the scroll.
 */
export const MembershipList = ({
    group,
    onGroup,
    onSelect,
}: {
    group?: string;
    onGroup?: (name: string) => void;
    onSelect?: (membership: Membership) => void;
}) => {
    const rows = group === "testing" ? testingMemberships : memberships;

    return (
        <Box sx={{ minHeight: "100%", bgcolor: appColors.canvasAlt, p: 2 }}>
            {!group && (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 2, mb: 2 }}>
                    {membershipGroups.map((entry) => (
                        <MembershipGroupTile
                            key={entry.name}
                            name={entry.name}
                            logo={entry.logo}
                            onSelect={onGroup ? () => onGroup(entry.name) : undefined}
                        />
                    ))}
                </Box>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 2 }}>
                {rows.map((membership) => (
                    <MembershipTile
                        key={membership.name}
                        membership={membership}
                        onSelect={onSelect ? () => onSelect(membership) : undefined}
                    />
                ))}
            </Box>
        </Box>
    );
};

/* ---------------------------------------------------------------- the form */

const FormField = ({
    label,
    value,
    searchable,
    /** The device greys the Customer ID even once it holds an answer. */
    dimmed,
    onTap,
}: {
    label: string;
    value?: string;
    searchable?: boolean;
    dimmed?: boolean;
    onTap?: () => void;
}) => (
    <Box
        onClick={value ? undefined : onTap}
        role={!value && onTap ? "button" : undefined}
        aria-label={value ? `${label}: ${value}` : `${label} — tap to look up a customer`}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: 68,
            px: 2,
            bgcolor: appColors.fieldFill,
            borderBottom: "1px solid rgba(0,0,0,0.42)",
            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
            cursor: !value && onTap ? "pointer" : "default",
        }}
    >
        {searchable && <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary, flexShrink: 0 }} />}
        <Box sx={{ minWidth: 0 }}>
            {value && <Typography sx={{ fontSize: 13, color: appColors.textSecondary, lineHeight: 1.2 }}>{label}</Typography>}
            <Typography
                sx={{ fontSize: 20, color: !value ? appColors.textSecondary : dimmed ? appColors.textDisabled : appColors.textPrimary }}
                noWrap
            >
                {value || label}
            </Typography>
        </Box>
    </Box>
);

export interface MembershipFormProps {
    /** The found customer, if a search has run. */
    customer?: { first: string; last: string; email: string; phone: string; memberNumber: string; customerId: string };
    onField?: () => void;
}

/**
 * The membership form.
 *
 * Six searches and two numbers on one canvas, with the billing question —
 * *Enter quantity to pay for now* — in the same column as the guest's phone.
 *
 * Two readings worth having in front of a developer: the price here is **not**
 * the price on the tile that opened this screen, and *First month type:
 * Prorated* is a sentence rather than a control, so the arithmetic between
 * $1.00 and $0.32 happens somewhere nobody can see.
 */
export const MembershipForm = ({ customer, onField }: MembershipFormProps) => (
    <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, px: 3, py: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 3, rowGap: 2 }}>
            <FormField label="First Name" value={customer?.first} searchable onTap={onField} />
            <FormField label="Last Name" value={customer?.last} searchable onTap={onField} />

            <Box sx={{ gridColumn: "1 / -1" }}>
                <FormField label="Email" value={customer?.email} searchable onTap={onField} />
            </Box>

            <FormField label="Phone" value={customer?.phone} searchable onTap={onField} />
            <FormField label="Member Number" value={customer?.memberNumber || undefined} searchable onTap={onField} />

            <FormField label="Enter price before tax" value={membershipDefaults.price} />
            <FormField label="Golf Course Customer ID" value={customer?.customerId} dimmed />

            <FormField label="Enter quantity to pay for now" value={membershipDefaults.quantity} />

            {/* Not a control. A sentence, in a column of fields. */}
            <Box sx={{ display: "grid", placeItems: "center", minHeight: 68 }}>
                <Typography sx={{ fontSize: 20, color: appColors.textPrimary }}>First month type</Typography>
                <Typography sx={{ fontSize: 20, color: appColors.textPrimary }}>{membershipDefaults.firstMonthType}</Typography>
            </Box>
        </Box>
    </Box>
);

export default MembershipList;
