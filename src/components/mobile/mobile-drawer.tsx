import { Fragment } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appIdentity, navGroups, type NavKey } from "@/components/app-chrome/nav-items";
import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";

/**
 * **Mobile Screens — the navigation drawer.** From `references/090426/`.
 *
 * The same drawer, the same three groups, the same order, the same identity
 * block. `navGroups` is imported rather than re-declared, so a destination
 * added to the app appears here without anyone remembering to.
 *
 * Three things change, and only because of width:
 *
 * 1. **It covers ~86% of the screen** rather than the tablet's 340 of 1280. A
 *    drawer that took 340px here would leave 62px of context, which is not
 *    context — so it takes almost everything and the scrim does the rest.
 * 2. **Rows are 52dp rather than 56**, and the icon column narrows from 52 to
 *    44. The list is long enough that the third group falls below the fold on a
 *    725dp canvas; tightening the row buys back two destinations.
 * 3. **The identity block loses the large mark.** On tablet it is a 56px logo
 *    over four lines; here the four lines are what matters and the mark shrinks
 *    to sit beside the product name.
 *
 * Everything else — the slate header, the grey group headings, the dividers,
 * the 17px labels — is unchanged.
 */
export const MobileNavDrawer = ({
    active,
    onPick,
    onDismiss,
}: {
    active?: NavKey;
    onPick?: (key: NavKey) => void;
    onDismiss?: () => void;
}) => (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 40, display: "flex" }}>
        <Stack sx={{ width: "86%", bgcolor: appColors.surface, overflowY: "auto" }}>
            <Stack sx={{ bgcolor: appColors.slate, color: "#fff", px: 2, pt: 2, pb: 2, flexShrink: 0 }}>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Box component="img" src={assetUrl("logos/tf-square-white.svg")} alt="" sx={{ width: 32, height: 30, opacity: 0.95 }} />
                    <Typography sx={{ fontSize: 20 }}>{appIdentity.product}</Typography>
                </Stack>
                {[appIdentity.version, appIdentity.account, appIdentity.facility, appIdentity.device].map((line) => (
                    <Typography key={line} sx={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.88)" }}>
                        {line}
                    </Typography>
                ))}
            </Stack>

            {navGroups.map((group, groupIndex) => (
                <Fragment key={group.heading ?? `group-${groupIndex}`}>
                    {groupIndex > 0 && <Divider />}
                    <Stack sx={{ py: 0.5 }}>
                        {group.heading && (
                            <Typography sx={{ px: 2, py: 1, fontSize: 14, color: appColors.textSecondary }}>{group.heading}</Typography>
                        )}
                        {group.items.map((item) => {
                            const isActive = item.key === active;
                            return (
                                <ButtonBase
                                    key={item.key}
                                    onClick={() => onPick?.(item.key)}
                                    sx={{
                                        justifyContent: "flex-start",
                                        gap: 0,
                                        px: 2,
                                        minHeight: 52,
                                        bgcolor: isActive ? appColors.canvasAlt : "transparent",
                                    }}
                                >
                                    <Box sx={{ width: 44, display: "flex", color: appColors.textPrimary }}>
                                        <item.Icon sx={{ fontSize: 22 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{item.label}</Typography>
                                </ButtonBase>
                            );
                        })}
                    </Stack>
                </Fragment>
            ))}
        </Stack>
        <Box onClick={onDismiss} sx={{ flex: 1, bgcolor: "rgba(0,0,0,0.5)" }} />
    </Box>
);
