# Architecture

An overview of how the starter is wired together: the provider tree,
navigation, state, Relay data fetching, and the file layout.

## Provider tree

`src/App.tsx` is the root. The app is wrapped with `Sentry.wrap(...)` and the
providers are nested (outermost first):

```tsx
<GlobalStoreProvider>       // easy-peasy store + persistence
  <FeatureFlagProvider>     // Unleash (no-op until configured)
    <RelayEnvironmentProvider>
      <SafeAreaProvider>
        <ScreenDimensionsProvider>
          <ThemeProvider>   // @artsy/palette-mobile theme
            <GestureHandlerRootView>
              <GlobalRetryErrorBoundary>
                <SuspenseWrapper>
                  <Main />  // navigation entry point
```

`setupSentry()` runs once at module load, before the component tree renders.

## Navigation

Navigation uses **react-navigation v7's static API**, defined in
`src/Navigation.tsx`.

- A native-stack `RootStack` splits into two conditional **groups** guarded by
  auth state read from the store:
  - `SignedIn` (`useIsLoggedIn`) → the `HomeTabs` bottom-tab navigator
    (`Home`, `List`, `Settings`).
  - `SignedOut` (`useIsLoggedOut`) → the `Login` screen.
- The param list is registered on the global `ReactNavigation.RootParamList`
  namespace via `StaticParamList<typeof RootStack>`, so `useNavigation()` is
  typed everywhere without manual param types.
- `createStaticNavigation(RootStack)` produces the navigator. The exported
  `Main` component waits for the persisted store to rehydrate
  (`useStoreRehydrated`) before rendering, so the auth guards resolve to the
  correct group on first paint.

Screens live under `src/Scenes/` (one folder per top-level screen).

## State management

Global state uses **easy-peasy**, configured in `src/store/GlobalStore.tsx`:

- The store is created with `createStore(persist(GlobalStoreModel, { storage }))`
  and persisted to `AsyncStorage`.
- Typed hooks come from `createTypedHooks<GlobalStoreModel>()`. Read state with
  `GlobalStore.useAppState(...)`; dispatch through `GlobalStore.actions...`.

```tsx
// Read
const token = GlobalStore.useAppState((state) => state.auth.userAccessToken)

// Dispatch
GlobalStore.actions.auth.signOut()
```

Models live in `src/store/Models/` (`AuthModel`, `ConfigModel`,
`EnvironmentModel`, and the root `GlobalStoreModel`).

::: warning Store versioning
The store is persisted with a `STORE_VERSION`. If you change a Model's shape,
bump the version and add a migration so persisted state upgrades cleanly.
:::

## Relay & GraphQL

Data fetching uses **Relay 20** against Artsy's Metaphysics GraphQL API.

- Load queries through **`useSystemQueryLoader`** (from `src/system/relay/`)
  rather than calling `useLazyLoadQuery` directly, and access the Relay
  environment through **`useSystemRelayEnvironment`** rather than
  `useRelayEnvironment`. Today both are thin drop-in wrappers, but they are the
  single seam where cross-cutting behavior (offline guards, global fetch
  policy/key, environment resets) can be added later without touching call
  sites — mirroring Eigen/Energy.
- Prefer Relay **hooks** (`useFragment`, `usePaginationFragment`) over HOCs, and
  **co-locate fragments** with the component that consumes them.
- Run `yarn relay` after changing any query or fragment. Generated artifacts
  live in `src/__generated__/` and are **never** edited by hand (they're
  gitignored except for `.gitkeep`).
- The Relay environment is set up in `src/relay/` (network middlewares under
  `src/relay/middlewares/`) and provided via `RelayEnvironmentProvider` in
  `App.tsx`.
- `yarn type-check` runs the Relay compiler before `tsc`.

## Logging

App code logs through the structured, leveled **`logger`** in
`src/system/logger/` — never `console.*` directly:

```ts
import { logger } from "system/logger"

logger.debug("cache hit", { key })
logger.info("user signed in", { userId })
logger.warn("slow request", { ms })
logger.error("failed to open app", err, { url })
```

The logger is the single logging seam: in development it prints level-prefixed
console output, and in production it is wired to Sentry (`debug`/`info` become
breadcrumbs, `warn` captures a warning, `error` captures the passed `Error` as
an exception). The minimum level defaults to `debug` in dev and `info` in
production. Routing every call site through one module means future transports
(file, remote, etc.) can be added in one place.

## File organization

```
src/
├── App.tsx                 # Root component + provider tree
├── Navigation.tsx          # Route definitions + navigation stack
├── Scenes/                 # Top-level screens (Home, List, Login, Settings)
├── components/             # Shared UI components across scenes
├── helpers/                # Shared utilities
├── relay/                  # Relay environment + network middlewares
├── store/                  # easy-peasy global store + Models
├── system/                 # Core infra
│   ├── devTools/           # Sentry setup
│   ├── logger/             # Structured leveled logger (Sentry-wired)
│   ├── providers/          # Theme, FeatureFlag providers
│   ├── relay/              # useSystemQueryLoader / useSystemRelayEnvironment
│   └── wrappers/           # Suspense + error-boundary wrappers
├── assets/                 # Images and fonts
├── utils/test/             # Test helpers (setupTestWrapper, renderWithWrappers)
└── __generated__/          # Relay-generated artifacts (do not edit)
data/
└── schema.graphql          # Metaphysics GraphQL schema
e2e/
└── flows/                  # Recorded agent-device .ad e2e checks
```

## Conventions

- Use **absolute imports** from `src/` (module-resolver root is `./src`). Only
  same-folder relative imports are allowed.
- Do not import components/hooks directly from another Scene — extract shared
  code to `src/components/` (UI) or `src/helpers/` (utilities).
- Use **`@artsy/palette-mobile`** primitives (`Flex`, `Text`, `Button`,
  `Input`, `Spacer`, `useColor`, `useSpace`, `Theme`) rather than
  re-implementing them.
- Use **Luxon** for date/time — do not add moment.
- Log through the **`logger`** (`system/logger`) instead of `console.*`.
- Load Relay queries via **`useSystemQueryLoader`** and read the environment via
  **`useSystemRelayEnvironment`** (not the raw Relay hooks).
- Imports are **auto-sorted** by `eslint-plugin-simple-import-sort` (run
  `yarn lint`), and `eslint-plugin-react-native-a11y` flags missing
  accessibility props on interactive components (at `warn`).
- Naming: components `PascalCase.tsx`, hooks `useCamelCase`, constants
  `UPPER_SNAKE_CASE`, utilities `camelCase.ts`.
- PR titles follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`)
  — enforced by CI.
