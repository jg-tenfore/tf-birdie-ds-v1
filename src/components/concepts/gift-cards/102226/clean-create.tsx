import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { GuestField } from "@/components/concepts/clinics/102126/clinic-parts";
import { defaultExpiration, giftCardTypes, spendCategories, type GiftCardType } from "@/components/screens/gift-cards/gift-card-data";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { demoCustomer, type DemoCustomer } from "@/components/screens/clinics/demo-customer";

/**
 * **Create a gift card, tidied.**
 *
 * > *"With gift cards, try and attempt to clean this up. Make it look better
 * > for sure."* → *"The titles just seem very crammed, and then the 'same as
 * > from' button is just…"*
 *
 * Five changes, all of them subtraction or labelling:
 *
 * 1. **The amount gets a label.** On the shipping screen the biggest control
 *    has no caption at all; you learn what it is by tapping it.
 * 2. **FROM and TO become cards with plain-language headings** — *Bought by*
 *    and *For* — instead of two runs of `Gift Card FROM ——— Golf Course
 *    Customer ID 0` crammed above their fields.
 * 3. **`Same as From` stops being a dark button.** It sat where a primary
 *    action goes while doing a copy; it is now a text action inside the card
 *    it fills.
 * 4. **The spend categories get a sentence** saying what unticking one does.
 * 5. **The expiry says it is automatic**, since it is computed from today and
 *    nobody chose it.
 *
 * The type stays a dropdown and stays unexplained by design: Weston confirmed
 * all three act the same, so the only honest label is the one on the tin.
 */

const PartyCard = ({
    heading,
    hint,
    party,
    onFind,
    action,
}: {
    heading: string;
    hint: string;
    party?: DemoCustomer;
    onFind?: () => void;
    action?: { label: string; onClick: () => void };
}) => (
    <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 1.5 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 500, color: appColors.textPrimary }}>{heading}</Typography>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: appColors.textSecondary }}>
                {party ? `Customer ${party.customerId}` : hint}
            </Typography>
            {action && !party && (
                <Typography
                    onClick={action.onClick}
                    role="button"
                    sx={{ fontSize: 15, letterSpacing: "0.04em", color: appColors.greenDark, cursor: "pointer", px: 1 }}
                >
                    {action.label}
                </Typography>
            )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <GuestField label="First Name" value={party?.first} onFill={onFind} />
            <GuestField label="Last Name" value={party?.last} onFill={onFind} />
            <GuestField label="Email" value={party?.email} onFill={onFind} />
            <GuestField label="Phone" value={party?.phone} onFill={onFind} />
        </Box>
    </Box>
);

export interface CleanCreateProps {
    amount: number;
    onAmount?: () => void;
    type: GiftCardType;
    onType?: () => void;
    from?: DemoCustomer;
    to?: DemoCustomer;
    onFindFrom?: () => void;
    onFindTo?: () => void;
    onSameAsFrom?: () => void;
}

export const CleanCreate = ({ amount, onAmount, type, onType, from, to, onFindFrom, onFindTo, onSameAsFrom }: CleanCreateProps) => (
    <Box sx={{ px: 3, py: 2.5 }}>
        {/* The amount, captioned, and the two settings that come with it. */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "stretch", mb: 2 }}>
            <Box
                onClick={onAmount}
                role={onAmount ? "button" : undefined}
                aria-label={`Amount ${amount ? `$${amount.toFixed(2)}` : "not set"}`}
                sx={{
                    width: 300,
                    px: 2.5,
                    py: 1.5,
                    bgcolor: appColors.surface,
                    borderRadius: `${appRadius.card}px`,
                    cursor: onAmount ? "pointer" : "default",
                }}
            >
                <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary }}>AMOUNT</Typography>
                <Typography sx={{ fontSize: 34, color: amount ? appColors.textPrimary : appColors.textSecondary }}>
                    ${amount.toFixed(2)}
                </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 1.5 }}>
                <Box
                    onClick={onType}
                    role={onType ? "button" : undefined}
                    aria-label={`Gift Card Type: ${type}`}
                    sx={{ display: "flex", alignItems: "center", minHeight: touchTarget.min, cursor: onType ? "pointer" : "default" }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary }}>TYPE</Typography>
                        <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>{type}</Typography>
                    </Box>
                    <ArrowDropDownIcon sx={{ color: appColors.textSecondary }} />
                </Box>

                <Box sx={{ borderTop: "1px solid", borderColor: appColors.divider, mt: 1, pt: 1 }}>
                    <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary }}>EXPIRES</Typography>
                    {/* Said out loud: nobody picked this, the system did. */}
                    <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>
                        {defaultExpiration}{" "}
                        <Box component="span" sx={{ color: appColors.textSecondary }}>
                            — set automatically
                        </Box>
                    </Typography>
                </Box>
            </Box>
        </Box>

        <PartyCard heading="Bought by" hint="Search for the customer" party={from} onFind={onFindFrom} />
        <PartyCard
            heading="For"
            hint="Search, or copy the buyer"
            party={to}
            onFind={onFindTo}
            action={onSameAsFrom && from ? { label: "SAME AS BUYER", onClick: onSameAsFrom } : undefined}
        />

        <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2 }}>
            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>This card can pay for</Typography>
            {/* The sentence the shipping screen never writes. */}
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 0.5 }}>
                Untick anything it should not cover. All four are on by default.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {spendCategories.map((category) => (
                    <Box key={category} sx={{ display: "flex", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
                        <Checkbox checked readOnly slotProps={{ input: { "aria-label": category } }} sx={{ p: 1 }} />
                        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }} noWrap>
                            {category}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    </Box>
);

/** Who a tap on a field finds, kept the same across all three versions. */
export const buyer = () => demoCustomer(0);
export const recipient = () => demoCustomer(1);
export const defaultType: GiftCardType = giftCardTypes[0];

export default CleanCreate;
