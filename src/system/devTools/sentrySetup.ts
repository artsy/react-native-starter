import * as Sentry from "@sentry/react-native"

// Set EXPO_PUBLIC_SENTRY_DSN (e.g. in your .env / EAS env) to enable Sentry.
// Left unset in the template so a fresh app reports nowhere until configured.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

export function setupSentry(
  props: Partial<Sentry.ReactNativeOptions> = {}
): void {
  // Disabled in dev so it doesn't clobber stack traces / logs.
  if (__DEV__) {
    return
  }

  if (!SENTRY_DSN) {
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enableAutoSessionTracking: true,
    ...props,
  })
}
