import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { cartSignOut, editReservation } from "./tee-sheet-data";

/**
 * The two full screens a reservation's Edit and Cart Signout actions push onto.
 *
 * Neither is a dialog — both take over the whole canvas and return via an
 * explicit BACK in the bottom bar.
 */

const feeChipSx = (selected: boolean) => ({
    width: 172,
    minHeight: 68,
    px: 1,
    lineHeight: 1.2,
    textTransform: "none" as const,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0,
    bgcolor: selected ? appColors.navy : appColors.grey,
    "&:hover": { bgcolor: selected ? appColors.navyDeep : "#8E8E8E" },
});

/** Grey read-only pair shown at the right end of each fee row. */
const TotalBox = ({ label, value }: { label: string; value: string }) => (
    <Box
        sx={{
            minWidth: 160,
            bgcolor: "#E4E4E4",
            borderRadius: `${appRadius.card}px`,
            textAlign: "center",
            py: 1,
            px: 2,
        }}
    >
        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
        <Typography sx={{ fontSize: 24, color: appColors.textPrimary }}>{value}</Typography>
    </Box>
);

const FeeSection = ({
    heading,
    options,
    selected,
    subTotal,
    grandTotal,
}: {
    heading: string;
    options: readonly string[];
    selected?: string;
    subTotal: string;
    grandTotal: string;
}) => (
    <>
        <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, bgcolor: appColors.surface }}>
            <Typography sx={{ fontSize: 21, color: appColors.textPrimary, flex: 1 }}>{heading}</Typography>

            {heading === "Fee Information" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>{editReservation.holesLabel}</Typography>
                    <Switch defaultChecked />
                </Box>
            )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, px: 2, py: 1.5, bgcolor: "#F4F6F8" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
                {options.map((option) => (
                    <Button key={option} sx={feeChipSx(option === selected)}>
                        {option}
                    </Button>
                ))}
            </Box>

            <TotalBox label="SubTotal" value={subTotal} />
            <TotalBox label="Grand Total" value={grandTotal} />
        </Box>
    </>
);

/**
 * Edit reservation — pricing, in two stacked fee groups.
 *
 * Green fees and transportation fees each carry their own SubTotal / Grand
 * Total, so a starter can see at a glance which half of the price a comp or
 * discount landed on. Exactly one green-fee rate is selected at a time (here
 * "Birdie (25%)", filled navy); the transportation row in this capture has
 * nothing selected.
 *
 * "SAVE FEES TO ALL" applies the same selection to every player in the tee
 * time, which is why it sits beside SAVE rather than inside it.
 */
export const EditReservationScreen = () => (
    <Box sx={{ bgcolor: appColors.surface, minHeight: "100%" }}>
        <Box sx={{ display: "flex", px: 2, pt: 2, pb: 1, gap: 4 }}>
            <Typography sx={{ fontSize: 21, flex: 1 }}>Guest Info</Typography>
            <Typography sx={{ fontSize: 21, flex: 1 }}>Booker Info</Typography>
            <Typography sx={{ fontSize: 21, flex: 2 }}>Change Customer</Typography>
        </Box>

        <Box sx={{ display: "flex", px: 2, pb: 3, gap: 4, borderBottom: `1px solid ${appColors.divider}` }}>
            <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 22, color: appColors.textPrimary }}>{editReservation.guest.name}</Typography>
                <Typography sx={{ fontSize: 18, color: appColors.textPrimary, pt: 0.5 }}>{editReservation.guest.when}</Typography>
                <Typography sx={{ fontSize: 17, color: appColors.textSecondary, pt: 0.5 }}>{editReservation.guest.email}</Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
                {editReservation.bookerPlaceholders.map((placeholder, index) => (
                    <Typography
                        key={index}
                        sx={{ fontSize: index < 2 ? 22 : 15, color: appColors.textPrimary, letterSpacing: "0.1em", pt: 0.5 }}
                    >
                        {placeholder}
                    </Typography>
                ))}
            </Box>

            <Box sx={{ flex: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#E0E0E0", px: 2, minHeight: 62 }}>
                    <SearchIcon sx={{ color: appColors.textSecondary }} />
                    <Typography sx={{ fontSize: 21, color: appColors.textSecondary }}>Change Customer</Typography>
                </Box>

                <Button
                    startIcon={<PeopleIcon />}
                    sx={{ mt: 2, minHeight: 56, bgcolor: appColors.green, "&:hover": { bgcolor: appColors.greenDark } }}
                >
                    Use other customer&apos;s punchcards
                </Button>
            </Box>
        </Box>

        <FeeSection
            heading="Fee Information"
            options={editReservation.greenFees.options}
            selected={editReservation.greenFees.selected}
            subTotal={editReservation.greenFees.subTotal}
            grandTotal={editReservation.greenFees.grandTotal}
        />

        <FeeSection
            heading="Transportation Fee Information"
            options={editReservation.transportFees.options}
            subTotal={editReservation.transportFees.subTotal}
            grandTotal={editReservation.transportFees.grandTotal}
        />
    </Box>
);

/**
 * Cart Sign Out — a liability waiver captured on the tablet.
 *
 * Name is prefilled from the reservation, cart number is typed in, and the
 * signature is drawn directly on the glass below the "Sign Here" rule. The
 * consent checkbox starts unchecked.
 */
export const CartSignOutScreen = () => (
    <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%", px: 3, py: 2, display: "flex", flexDirection: "column" }}>
        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{cartSignOut.reservation}</Typography>

        <Box sx={{ borderBottom: `1px solid ${appColors.textSecondary}`, pt: 2, pb: 0.5 }}>
            <Typography sx={{ fontSize: 26, color: appColors.textPrimary }}>{cartSignOut.customer}</Typography>
        </Box>

        <Box sx={{ borderBottom: `1px solid ${appColors.textSecondary}`, pt: 3, pb: 0.5 }}>
            <Typography sx={{ fontSize: 26, color: appColors.textSecondary }}>Cart Number</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, pt: 2 }}>
            <Checkbox sx={{ p: 0, mt: 0.25 }} />
            <Typography sx={{ fontSize: 16, color: appColors.textPrimary, lineHeight: 1.35 }}>{cartSignOut.consent}</Typography>
        </Box>

        {/* The rule is the signature baseline; the caption sits under it. */}
        <Box sx={{ mt: 8, borderTop: `1px solid ${appColors.textSecondary}` }} />
        <Typography sx={{ fontSize: 20, color: appColors.textSecondary, textAlign: "center", pt: 1 }}>{cartSignOut.signHere}</Typography>

        <Box sx={{ flex: 1, minHeight: 220 }} />
    </Box>
);
