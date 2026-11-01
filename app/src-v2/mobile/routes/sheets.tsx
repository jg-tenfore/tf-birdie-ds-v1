import { MobileBaySheetScreen } from "../screens/bay-sheet";
import { MobileCourtSheetScreen } from "../screens/court-sheet";
import { MobileOrdersTipsScreen } from "../screens/orders-tips";
import { MobileReservationsScreen } from "../screens/restaurant-reservations";
import { MobileResourceReservationScreen } from "../screens/resource-reservation";

/**
 * The resource sheets and the reporting screens, as a route table.
 *
 * A barrel rather than five imports in `mobile-app.tsx` because that file is
 * shared and edited by several hands at once; a route table that arrives as one
 * import is one merge, not five. The shape is the same `[path, element]` pair
 * `mobile-app.tsx` already maps over, so wiring it is a spread and nothing else.
 *
 * Paths match the terminal's exactly — `#/coursheet/Tennis%20Court%201/7:20%20AM`
 * opens the same slot on either device, which is what makes the two prototypes
 * comparable rather than merely similar.
 *
 * Two screens the landscape build gives their own route are **steps inside a
 * route** here: the bay sheet's New Booking (the terminal's `fullScreen`
 * dialog) and the reservations day's Create a Reservation. Neither has a URL
 * worth deep-linking on a phone — both are modals that happen to fill the
 * frame — and keeping them local keeps this table to the five destinations the
 * drawer actually lists.
 */
export const sheetsRoutes: [string, React.ReactNode][] = [
    ["/coursheet", <MobileCourtSheetScreen />],
    ["/coursheet/:resource/:time", <MobileResourceReservationScreen />],
    ["/baysheet", <MobileBaySheetScreen />],
    ["/reservations", <MobileReservationsScreen />],
    ["/orderstips", <MobileOrdersTipsScreen />],
];
