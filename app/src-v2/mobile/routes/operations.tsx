import { MobileCreateGiftCardScreen, MobileGiftCardsScreen } from "../screens/gift-cards";
import { MobileEventDetailScreen, MobileEventsScreen } from "../screens/events";
import { MobileInventoryCountScreen, MobileInventoryNewCountScreen, MobileInventoryScreen } from "../screens/inventory";
import { MobileOrderLookupScreen } from "../screens/order-lookup";
import { MobileShiftScreen } from "../screens/shift";
import { MobileTimeClockScreen } from "../screens/time-clock";

/**
 * The Operations destinations, as a route table `mobile-app.tsx` can splice in.
 *
 * A barrel rather than nine imports in the app file, because these nine screens
 * are built and revised as one group — the drawer's whole Operations section —
 * and the app's route table is edited by everything else at the same time. One
 * import and one spread keeps that file's diff to a line.
 *
 * The paths are **the terminal's own**, deliberately. `#/inventory/78987` is the
 * same saved count on either device, which is what makes the two prototypes
 * comparable rather than merely similar.
 *
 * Static segments are listed before their dynamic siblings — `/inventory/new`
 * ahead of `/inventory/:title` — for readability. React Router ranks static
 * above dynamic regardless of order, so this is a convention rather than a
 * dependency.
 */
export const operationsRoutes: [string, React.ReactNode][] = [
    ["/giftcards", <MobileGiftCardsScreen />],
    ["/giftcards/new", <MobileCreateGiftCardScreen />],
    ["/events", <MobileEventsScreen />],
    ["/events/:id", <MobileEventDetailScreen />],
    ["/inventory", <MobileInventoryScreen />],
    ["/inventory/new", <MobileInventoryNewCountScreen />],
    ["/inventory/:title", <MobileInventoryCountScreen />],
    ["/orderlookup", <MobileOrderLookupScreen />],
    ["/timeclock", <MobileTimeClockScreen />],
    ["/shift", <MobileShiftScreen />],
];
