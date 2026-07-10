# Configuration

The starter reads two kinds of configuration: **native secrets** through
`react-native-keys` (`keys.json`) and **runtime configuration** through
`EXPO_PUBLIC_*` environment variables. Both real files are gitignored — only
the tracked examples live in the repo.

## Keys (`react-native-keys`)

Secrets used at the native layer are provided via
[`react-native-keys`](https://github.com/numandev1/react-native-keys). Create a
real `keys.json` from the tracked example:

```sh
cp keys.example.json keys.json
```

`keys.example.json` documents the expected shape:

```json
{
  "OSS": "true",
  "secure": {
    "ARTSY_API_CLIENT_KEY": "-",
    "ARTSY_API_CLIENT_SECRET": "-"
  }
}
```

Values under `secure` are read in code with `Keys.secureFor(...)`. For example,
`src/store/Models/AuthModel.ts` uses them to authenticate against Gravity:

```ts
import Keys from "react-native-keys"

const client_id = Keys.secureFor("ARTSY_API_CLIENT_KEY")
const client_secret = Keys.secureFor("ARTSY_API_CLIENT_SECRET")
```

::: warning Real key files are gitignored
`.gitignore` ignores `keys*.json` except `keys.example.json`. Never commit a
populated `keys.json`.
:::

## Environment variables

Runtime configuration is read from `EXPO_PUBLIC_*` variables (Expo inlines these
into the JS bundle at build time). They are left **unset** in the template so a
fresh app boots without third-party credentials and reports nowhere until
configured.

| Variable                        | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `EXPO_PUBLIC_SENTRY_DSN`        | Enables Sentry crash/error reporting        |
| `EXPO_PUBLIC_UNLEASH_URL`       | Unleash proxy URL for feature flags         |
| `EXPO_PUBLIC_UNLEASH_CLIENT_KEY`| Unleash proxy client key for feature flags  |

Put these in a `.env` file (gitignored — only `.env.example` is tracked) or set
them in your EAS build environment.

::: tip Rebuild after changing env vars
Because `EXPO_PUBLIC_*` values are inlined at build time, you must rebuild the
app after changing them.
:::

## Sentry

Crash and error reporting is wired up in `src/system/devTools/sentrySetup.ts`
and the app is wrapped with `Sentry.wrap(...)` in `src/App.tsx`.

`setupSentry()` is a no-op unless a DSN is configured, and it is **disabled in
development** so it doesn't clobber stack traces and logs:

```ts
// src/system/devTools/sentrySetup.ts
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

export function setupSentry(props = {}): void {
  if (__DEV__) return
  if (!SENTRY_DSN) return

  Sentry.init({
    dsn: SENTRY_DSN,
    enableAutoSessionTracking: true,
    ...props,
  })
}
```

Set `EXPO_PUBLIC_SENTRY_DSN` in a release build to start reporting.

## Logging

App code logs through the structured `logger` in `src/system/logger/` rather
than calling `console.*` directly:

```ts
import { logger } from "system/logger"

logger.info("user signed in", { userId })
logger.error("failed to open app", err, { url })
```

In development it prints level-prefixed console output; in production it feeds
Sentry (breadcrumbs for `debug`/`info`, captures for `warn`/`error`). Because
everything goes through one seam, the Sentry wiring above is the only place
logging integrations are configured. See
[Architecture → Logging](./architecture#logging) for the level semantics.

## Feature flags (Unleash)

Feature flags are served by [Unleash](https://www.getunleash.io/) through
`@unleash/proxy-client-react`, configured in
`src/system/providers/FeatureFlagProvider.tsx`.

`FeatureFlagProvider` always mounts a Flag context (flags are cached in
`AsyncStorage`; context carries `userId`, an anonymous `sessionId`, and
`appVersion`/`buildNumber`). When `EXPO_PUBLIC_UNLEASH_URL` or
`EXPO_PUBLIC_UNLEASH_CLIENT_KEY` is missing, the client is started in a
no-network mode (`startClient={false}`, empty bootstrap) so every flag resolves
to `false` without throwing — the starter runs without feature-flag credentials.

Do **not** read `useFlag` directly. Read flags through the safe wrapper, which
adds a compiled-in `readyForRelease` gate and local dev overrides:

```tsx
import { useFeatureFlag } from "system/featureFlags/useFeatureFlag"

const MyComponent = () => {
  const isEnabled = useFeatureFlag("exampleNewFeature")
  return isEnabled ? <NewUI /> : <OldUI />
}
```

See [Feature Flags](/feature-flags) for the full model (the `readyForRelease`
build-time gate, adding a flag, the Dev Menu, and the `appVersion` SEMVER
constraint used to gate a flag server-side).

## GraphQL environments

Backend endpoints are defined per environment in
`src/store/Models/EnvironmentModel.ts` (`staging` vs `production`):

| Service     | Staging                                    | Production                              |
| ----------- | ------------------------------------------ | --------------------------------------- |
| Gravity     | `https://stagingapi.artsy.net`             | `https://api.artsy.net`                 |
| Metaphysics | `https://metaphysics-staging.artsy.net/v2` | `https://metaphysics-production.artsy.net/v2` |

Sync the GraphQL schema used by the Relay compiler with:

```sh
yarn sync-schema   # writes data/schema.graphql from Metaphysics
```
