import { MobileTeeSheetScreen } from "../screens/tee-sheet";
import { MobileTeeTimeDetailScreen } from "../screens/tee-time";
import { MobileCartSignOutScreen, MobileCreateRaincheckScreen, MobileTeeTimeEditScreen } from "../screens/tee-time-forms";

/**
 * The tee sheet family's routes, as a barrel `mobile-app.tsx` spreads into its
 * own table.
 *
 * A barrel rather than five imports in the app file because the phone build is
 * being assembled by several passes at once and `mobile-app.tsx` is shared: one
 * import and one spread per family means two screens landing in the same commit
 * cannot collide over the route list.
 *
 * The paths are **the terminal's own**, character for character — see
 * `app/src/app.tsx`. That is deliberate: `#/teesheet/7:10%20AM` has to mean the
 * same tee time on the phone as on the counter, or the two prototypes are merely
 * similar rather than comparable. The `:time` segment is URL-encoded because a
 * tee time contains a space and a colon.
 */
export const teeSheetRoutes: [string, React.ReactNode][] = [
    ["/teesheet", <MobileTeeSheetScreen />],
    ["/teesheet/:time", <MobileTeeTimeDetailScreen />],
    ["/teesheet/:time/:index/edit", <MobileTeeTimeEditScreen />],
    ["/teesheet/:time/:index/cartsignout", <MobileCartSignOutScreen />],
    ["/teesheet/:time/:index/raincheck", <MobileCreateRaincheckScreen />],
];
