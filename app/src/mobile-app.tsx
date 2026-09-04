import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { appReplicaTheme } from "@/theme/app-replica-theme";
import { MobileEmpty } from "@/components/mobile/mobile-parts";
import type { NavKey } from "@/components/app-chrome/nav-items";
import { StoreProvider, useStore } from "./store";
import { MobileShell } from "./mobile/mobile-shell";
import { MobileSignInScreen } from "./mobile/screens/sign-in";
import { MobilePaymentScreen } from "./mobile/screens/payment";
import { MobileProShopScreen, MobileQuickOrderScreen } from "./mobile/screens/selling";
import { operationsRoutes } from "./mobile/routes/operations";
import { restaurantRoutes } from "./mobile/routes/restaurant";
import { sheetsRoutes } from "./mobile/routes/sheets";
import { teeSheetRoutes } from "./mobile/routes/tee-sheet";

/**
 * The phone prototype.
 *
 * A second application over **the same store** as the counter terminal in
 * `app.tsx` — same reducer, same cart, same tee sheet, same completed sales.
 * Only the screens differ, because a 390px order panel beside a content pane
 * has no responsive path to a bottom-nav phone layout.
 *
 * The route table is deliberately **the same shape** as the terminal's, so a
 * URL means the same thing on both. `#/teesheet/7:10 AM` is the same tee time
 * on either device, which is what makes the two comparable rather than merely
 * similar.
 */

/** Everything past sign-in requires an operator, as the real terminal does. */
const RequireOperator = ({ children }: { children: React.ReactNode }) => {
    const { state } = useStore();
    const location = useLocation();
    if (!state.operator) return <Navigate to="/signin" replace state={{ from: location }} />;
    return <>{children}</>;
};

/**
 * A destination that exists in the drawer but has no phone screen yet.
 *
 * Present on purpose rather than omitted: the drawer is the shipping app's own
 * navigation and quietly dropping rows from it would make the prototype claim a
 * smaller app than the terminal has. A stub that says what it is beats a dead
 * link or a missing row.
 */
export const MobileStub = ({ title, active, note }: { title: string; active?: NavKey; note: string }) => (
    <MobileShell title={title} active={active}>
        <MobileEmpty message={note} />
        <Typography sx={{ px: 3, pb: 3, fontSize: 12, textAlign: "center", color: "#9AA1A9" }}>
            This destination is built on the counter terminal. Open the landscape prototype to use it.
        </Typography>
    </MobileShell>
);

/**
 * Every destination, gathered from four barrels plus the selling core.
 *
 * The barrels exist because these were built in parallel and a single shared
 * route table is the one file four writers cannot safely share. They also keep
 * this file readable: the shape of the app is four groups and a till, not a
 * flat list of thirty-one strings.
 *
 * The paths are **character-identical to `app.tsx`** on purpose. A URL means the
 * same thing on both builds, so `#/teesheet/7:10 AM` is the same tee time on
 * either device — which is what lets the two be compared rather than merely
 * resemble each other.
 */
const routes: [string, React.ReactNode][] = [
    ["/proshop", <MobileProShopScreen />],
    ["/quickorder", <MobileQuickOrderScreen />],
    ["/pay", <MobilePaymentScreen />],
    ...teeSheetRoutes,
    ...restaurantRoutes,
    ...operationsRoutes,
    ...sheetsRoutes,
];

/**
 * Drawer rows with no phone screen.
 *
 * Only Settings, which is a stub on the terminal too — it has never been more
 * than a placeholder there, so building a phone version would be inventing a
 * screen rather than porting one.
 */
const stubs: [string, string, NavKey][] = [["/settings", "Settings", "settings"]];

export const MobileApp = () => (
    <ThemeProvider theme={appReplicaTheme}>
        <CssBaseline />
        <StoreProvider>
            <HashRouter>
                <Routes>
                    <Route path="/signin" element={<MobileSignInScreen />} />
                    {routes.map(([path, element]) => (
                        <Route key={path} path={path} element={<RequireOperator>{element}</RequireOperator>} />
                    ))}
                    {stubs.map(([path, title, active]) => (
                        <Route
                            key={path}
                            path={path}
                            element={
                                <RequireOperator>
                                    <MobileStub title={title} active={active} note={`${title} is a placeholder on both builds.`} />
                                </RequireOperator>
                            }
                        />
                    ))}
                    <Route path="*" element={<Navigate to="/signin" replace />} />
                </Routes>
            </HashRouter>
        </StoreProvider>
    </ThemeProvider>
);
