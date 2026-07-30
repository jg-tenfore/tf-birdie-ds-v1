import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { appReplicaTheme } from "@/theme/app-replica-theme";
import { StoreProvider, useStore } from "./store";
import { CombosScreen } from "./screens/combos";
import { EventDetailScreen, EventsScreen } from "./screens/events";
import { GiftCardsScreen } from "./screens/gift-cards";
import { InventoryCountScreen, InventoryNewCountScreen, InventoryScreen } from "./screens/inventory";
import { PaymentScreen } from "./screens/payment";
import { QuickOrderScreen } from "./screens/quick-order";
import { ProShopScreen } from "./screens/selling";
import { TableChartScreen } from "./screens/table-chart";
import { TablesScreen } from "./screens/tables";
import { TabDetailScreen, TabsScreen } from "./screens/tabs";
import { BaySheetScreen } from "./screens/bay-sheet";
import { CourtSheetScreen } from "./screens/court-sheet";
import { TeeSheetScreen } from "./screens/tee-sheet";
import { TeeTimeDetailScreen } from "./screens/tee-time-detail";
import { TeeTimeCartSignOutScreen, TeeTimeEditScreen } from "./screens/tee-time-edit";
import { SignInScreen } from "./screens/sign-in";
import { CustomerRecordScreen, CustomerSearchScreen } from "./screens/customer-search";
import { StubScreen } from "./screens/misc";
import { OrderLookupScreen } from "./screens/order-lookup";
import { OrdersTipsScreen } from "./screens/orders-tips";
import { RestaurantReservationsScreen } from "./screens/restaurant-reservations";
import { TimeClockScreen } from "./screens/time-clock";
import { ShiftScreen } from "./screens/shift";

/** Everything past sign-in requires an operator, as the real terminal does. */
const RequireOperator = ({ children }: { children: React.ReactNode }) => {
    const { state } = useStore();
    const location = useLocation();
    if (!state.operator) return <Navigate to="/signin" replace state={{ from: location }} />;
    return <>{children}</>;
};

const routes: [string, React.ReactNode][] = [
    ["/proshop", <ProShopScreen />],
    ["/combos", <CombosScreen />],
    ["/quickorder", <QuickOrderScreen />],
    ["/pay", <PaymentScreen />],
    ["/teesheet", <TeeSheetScreen />],
    ["/teesheet/:time", <TeeTimeDetailScreen />],
    ["/teesheet/:time/:index/edit", <TeeTimeEditScreen />],
    ["/teesheet/:time/:index/cartsignout", <TeeTimeCartSignOutScreen />],
    ["/tabs", <TabsScreen />],
    ["/tabs/:id", <TabDetailScreen />],
    ["/tables", <TablesScreen />],
    ["/customersearch", <CustomerSearchScreen />],
    ["/customersearch/:id", <CustomerRecordScreen />],
    ["/orderlookup", <OrderLookupScreen />],
    ["/timeclock", <TimeClockScreen />],
    ["/shift", <ShiftScreen />],
    ["/coursheet", <CourtSheetScreen />],
    ["/baysheet", <BaySheetScreen />],
    ["/reservations", <RestaurantReservationsScreen />],
    ["/orderstips", <OrdersTipsScreen />],
    ["/tablechart", <TableChartScreen />],
    ["/giftcards", <GiftCardsScreen />],
    ["/events", <EventsScreen />],
    ["/events/:id", <EventDetailScreen />],
    ["/inventory", <InventoryScreen />],
    ["/inventory/new", <InventoryNewCountScreen />],
    ["/inventory/:title", <InventoryCountScreen />],
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
