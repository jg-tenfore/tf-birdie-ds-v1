import type React from "react";

import { MobileCombosScreen } from "../screens/combos";
import { MobileCustomerRecordScreen, MobileCustomerSearchScreen } from "../screens/customer-search";
import { MobileNewCustomerScreen } from "../screens/new-customer";
import { MobileTableChartScreen } from "../screens/table-chart";
import { MobileTablesScreen } from "../screens/tables";
import { MobileTabDetailScreen, MobileTabsScreen } from "../screens/tabs";

/**
 * The restaurant and customer routes, as a barrel.
 *
 * `mobile-app.tsx` is edited by several processes at once, so screens land here
 * rather than there — one file to import and spread, and no two contributors
 * rewriting the same route array.
 *
 * The paths are **the terminal's paths, unchanged**. `#/tabs/t-4131` is the same
 * check on either device, which is the property that makes the two prototypes
 * comparable rather than merely similar. `/tabs/active` is the same contract too:
 * it resolves to whatever `openTable` just opened, so the tables roster can
 * navigate without racing the reducer for the new ticket's id.
 *
 * Order matters for react-router only where a literal could be eaten by a
 * parameter. `/customers/new` sits on its own segment rather than under
 * `/customersearch/:id` for exactly that reason — a customer whose id happened
 * to be `new` would otherwise open the form.
 */
export const restaurantRoutes: [string, React.ReactNode][] = [
    ["/tabs", <MobileTabsScreen />],
    ["/tabs/:id", <MobileTabDetailScreen />],
    ["/tables", <MobileTablesScreen />],
    ["/tablechart", <MobileTableChartScreen />],
    ["/customersearch", <MobileCustomerSearchScreen />],
    ["/customersearch/:id", <MobileCustomerRecordScreen />],
    ["/customers/new", <MobileNewCustomerScreen />],
    ["/combos", <MobileCombosScreen />],
];
