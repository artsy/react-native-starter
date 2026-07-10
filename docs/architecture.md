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

- Prefer Relay **hooks** (`useLazyLoadQuery`, `useFragment`,
  `usePaginationFragment`) over HOCs.
- **Co-locate fragments** with the component that consumes them.
- Run `yarn relay` after changing any query or fragment. Generated artifacts
  live in `src/__generated__/` and are **never** edited by hand (they're
  gitignored except for `.gitkeep`).
- The Relay environment is set up in `src/relay/` (network middlewares under
  `src/relay/middlewares/`) and provided via `RelayEnvironmentProvider` in
  `App.tsx`.
- `yarn type-check` runs the Relay compiler before `tsc`.

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
│   ├── providers/          # Theme, FeatureFlag providers
│   └── wrappers/           # Suspense + error-boundary wrappers
├── assets/                 # Images and fonts
├── utils/test/             # Test helpers (setupTestWrapper, renderWithWrappers)
└── __generated__/          # Relay-generated artifacts (do not edit)
data/
└── schema.graphql          # Metaphysics GraphQL schema
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
- Naming: components `PascalCase.tsx`, hooks `useCamelCase`, constants
  `UPPER_SNAKE_CASE`, utilities `camelCase.ts`.
- PR titles follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`)
  — enforced by CI.
