import { Fragment, useCallback, useState } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { appIdentity, navGroups } from "@/components/app-chrome/nav-items";
import { appColors, appLayout } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { RaincheckListing, type RaincheckListingProps } from "./raincheck-listing";

/**
 * **Concept — Aug 24.** How you actually reach the raincheck listing.
 *
 * The listing on its own answers *"find me this raincheck"*, but a screen with
 * no way in is a screen nobody uses. This says where it lives.
 *
 * **Beside Gift Cards.** The drawer's third block is the app's "things that are
 * not a sheet or a sale" list — Customer Search, Order Lookup, Time Clock, Gift
 * Cards, Events, Inventory, Shift. A raincheck is the same kind of object as a
 * gift card: **money the course is holding on a customer's behalf**, redeemable
 * later, needing to be looked up by somebody who was not there when it was
 * issued.
 *
 * That is the same argument the customer record already makes — the project
 * puts `Rain Checks` directly beneath `Gift Cards` there, for exactly this
 * reason. Putting it anywhere else in the drawer would mean answering "why not
 * next to Gift Cards", and there is no answer.
 *
 * One new nav row. No new pattern, no new component, no new level of hierarchy.
 */

/** The shipping drawer's own contents, with one row added. */
const ConceptNavDrawer = ({ onPick }: { onPick?: () => void }) => {
    // The new row sits in the drawer's third block, which is below the fold on a
    // 800px-tall tablet. A story about *where a thing lives* that opens with the
    // thing off screen is not doing its job, so the drawer scrolls to it.
    const focusNewRow = useCallback((node: HTMLElement | null) => {
        node?.scrollIntoView({ block: "center" });
    }, []);

    return (
        <Box sx={{ width: appLayout.drawerWidth, height: "100%", bgcolor: appColors.surface, overflowY: "auto" }}>
            <Box sx={{ bgcolor: appColors.slate, color: "#fff", px: 3, pt: 3, pb: 3 }}>
                <Box
                    component="img"
                    src={assetUrl("logos/tf-square-white.svg")}
                    alt=""
                    sx={{ width: 56, height: 52, mb: 2, opacity: 0.95 }}
                />
                <Typography sx={{ fontSize: 26, mb: 1 }}>{appIdentity.product}</Typography>
                {[appIdentity.version, appIdentity.account, appIdentity.facility, appIdentity.device].map((line) => (
                    <Typography key={line} sx={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.88)" }}>
                        {line}
                    </Typography>
                ))}
            </Box>

            {navGroups.map((group, groupIndex) => (
                <Fragment key={group.heading ?? `group-${groupIndex}`}>
                    {groupIndex > 0 && <Divider />}
                    <List sx={{ py: 1 }}>
                        {group.heading && (
                            <Typography sx={{ px: 3, py: 1.5, fontSize: 15, color: appColors.textSecondary }}>{group.heading}</Typography>
                        )}
                        {group.items.map((item) => (
                            <Fragment key={item.key}>
                                <ListItemButton sx={{ px: 3, minHeight: 56 }}>
                                    <ListItemIcon sx={{ minWidth: 52, color: appColors.textPrimary }}>
                                        <item.Icon />
                                    </ListItemIcon>
                                    <ListItemText slotProps={{ primary: { sx: { fontSize: 17 } } }}>{item.label}</ListItemText>
                                </ListItemButton>

                                {/* The one addition — directly under Gift Cards, because
                                a raincheck is the same kind of thing and the eye
                                looks for it there. */}
                                {item.key === "giftcards" && (
                                    <ListItemButton
                                        ref={focusNewRow}
                                        selected
                                        onClick={onPick}
                                        sx={{ px: 3, minHeight: 56, borderLeft: `4px solid ${appColors.greenTee}` }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 52, color: appColors.greenTee }}>
                                            <CloudOutlinedIcon />
                                        </ListItemIcon>
                                        <ListItemText slotProps={{ primary: { sx: { fontSize: 17, color: appColors.greenTee } } }}>
                                            Rain Checks
                                        </ListItemText>
                                        <Typography sx={{ fontSize: 11, letterSpacing: "0.06em", color: appColors.greenTee }}>
                                            NEW
                                        </Typography>
                                    </ListItemButton>
                                )}
                            </Fragment>
                        ))}
                    </List>
                </Fragment>
            ))}
        </Box>
    );
};

export interface RaincheckListingScreenProps extends RaincheckListingProps {
    /** Opens on the drawer, so the story can show the way in before the screen. */
    startOpen?: boolean;
}

export const RaincheckListingScreen = ({ startOpen, ...listing }: RaincheckListingScreenProps) => {
    const [open, setOpen] = useState(Boolean(startOpen));

    return (
        <AppShell
            title="Rain Checks"
            accountLabel={appIdentity.accountLabel}
            actionBar={
                <>
                    <ActionButton icon={<GolfCourseIcon />}>Tee Sheet</ActionButton>
                    <ActionButton icon={<StorefrontIcon />}>Pro Shop</ActionButton>
                    <ActionButton icon={<PrintOutlinedIcon />} grow={1.4}>
                        Print This View
                    </ActionButton>
                </>
            }
            overlay={
                open ? (
                    <Stack direction="row" sx={{ position: "absolute", inset: 0, zIndex: 20 }}>
                        <ConceptNavDrawer onPick={() => setOpen(false)} />
                        <Box onClick={() => setOpen(false)} sx={{ flex: 1, bgcolor: "rgba(0,0,0,0.5)" }} />
                    </Stack>
                ) : undefined
            }
        >
            <RaincheckListing {...listing} />
        </AppShell>
    );
};
