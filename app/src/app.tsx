import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { appReplicaTheme } from "@/theme/app-replica-theme";
import { StoreProvider, useStore } from "./store";
import { PaymentScreen } from "./screens/payment";
import { ProShopScreen, QuickOrderScreen } from "./screens/selling";
import { TeeSheetScreen, TeeTimeDetailScreen } from "./screens/tee-sheet";
import { SignInScreen } from "./screens/sign-in";
import {
    CustomerSearchScreen,
    OrderLookupScreen,
    ShiftScreen,
    StubScreen,
    TablesScreen,
    TabsScreen,
    TimeClockScreen,
} from "./screens/misc";

/** Everything past sign-in requires an operator, as the real terminal does. */
const RequireOperator = ({ children }: { children: React.ReactNode }) => {
    const { state } = useStore();
    const location = useLocation();
    if (!state.operator) return <Navigate to="/signin" replace state={{ from: location }} />;
    return <>{children}</>;
};

const routes: [string, React.ReactNode][] = [
    ["/proshop", <ProShopScreen />],
    ["/quickorder", <QuickOrderScreen />],
    ["/pay", <PaymentScreen />],
    ["/teesheet", <TeeSheetScreen />],
    ["/teesheet/:time", <TeeTimeDetailScreen />],
    ["/tabs", <TabsScreen />],
    ["/tables", <TablesScreen />],
    ["/customersearch", <CustomerSearchScreen />],
    ["/orderlookup", <OrderLookupScreen />],
    ["/timeclock", <TimeClockScreen />],
    ["/shift", <ShiftScreen />],
    ["/coursheet", <StubScreen title="Court Sheet" active="courtsheet" note="Tennis and pickleball courts." />],
    ["/baysheet", <StubScreen title="Bay Sheet" active="baysheet" note="Simulator bays." />],
    ["/reservations", <StubScreen title="Reservations" active="reservations" note="Restaurant reservations." />],
    ["/orderstips", <StubScreen title="Orders & Tips" active="orderstips" note="Tip adjustment on closed card sales." />],
    ["/tablechart", <StubScreen title="Table Chart" active="tablechart" note="Floor-plan editor." />],
    ["/giftcards", <StubScreen title="Gift Cards" active="giftcards" note="Balance lookup and reload." />],
    ["/events", <StubScreen title="Events" active="events" note="Outings and league billing." />],
    ["/inventory", <StubScreen title="Inventory" active="inventory" note="Physical stock counts." />],
    ["/settings", <StubScreen title="Settings" active="settings" note="Terminal and hardware configuration." />],
];

export const App = () => (
    <ThemeProvider theme={appReplicaTheme}>
        <CssBaseline />
        <StoreProvider>
            <HashRouter>
                <Routes>
                    <Route path="/signin" element={<SignInScreen />} />
                    {routes.map(([path, element]) => (
                        <Route key={path} path={path} element={<RequireOperator>{element}</RequireOperator>} />
                    ))}
                    <Route path="*" element={<Navigate to="/signin" replace />} />
                </Routes>
            </HashRouter>
        </StoreProvider>
    </ThemeProvider>
);
