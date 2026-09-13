import { createNavigationContainerRef } from '@react-navigation/native';

// Lets code outside the component tree (notification tap handlers, deep
// links) trigger navigation without needing a `navigation` prop passed down
// to it. Attached to <NavigationContainer ref={navigationRef}> in
// AppNavigator.tsx.
export const navigationRef = createNavigationContainerRef();

/** Navigates once the container is ready; silently no-ops before then (e.g.
 * a notification tapped from a cold start, before the navigator has mounted) —
 * better to drop a stale navigation than crash trying to navigate too early. */
export function navigateFromNotification(name: string, params?: object) {
  if (!navigationRef.isReady()) return;
  (navigationRef.navigate as (name: string, params?: object) => void)(name, params);
}
