# Agent Guidelines

`react-native-starter` is Artsy's starter template for new React Native apps.
It is an **Expo-managed** project (using the **prebuild / CNG** workflow) that
mirrors the conventions of Artsy's production apps ([Eigen](https://github.com/artsy/eigen)
and [Energy/Folio](https://github.com/artsy/energy)) so a new app can be spun up
with the same stack and patterns.

## Tech Stack

- **React Native + Expo** — Cross-platform mobile framework, prebuild workflow
- **TypeScript** — Strict mode enabled, avoid `any`
- **Relay** — GraphQL data fetching (hooks preferred over HOCs)
- **GraphQL / Metaphysics** — Artsy's GraphQL API
- **@artsy/palette-mobile** — Design system and reusable component toolkit
- **react-navigation** — Screen navigation and routing (native-stack)
- **easy-peasy** — Global state management + persistence
- **Formik** — Form handling
- **Jest + @testing-library/react-native** — Testing
- **react-native-reanimated / Moti** — Animations
- **Luxon** — Date/time (do NOT use moment)
- **Yarn 4** — Package manager
- **GitHub Actions** — CI

## Common Commands

```bash
yarn install                       # Install dependencies
yarn setup:artsy                   # Download fonts + env vars (Artsy engineers)
yarn prebuild                      # Generate the native ios/ and android/ folders
yarn ios                           # Prebuild + run on iOS
yarn android                       # Prebuild + run on Android
yarn start                         # Metro bundler + Relay watcher
yarn test                          # Run Jest tests
yarn test Login                    # Run a specific test
yarn type-check                    # Relay compiler + TypeScript check
yarn lint                          # ESLint with auto-fix
yarn relay                         # Compile Relay fragments/queries
yarn sync-schema                   # Sync GraphQL schema from Metaphysics
```

## Pre-Commit Verification

Run these on your changed files before every commit:

```sh
yarn type-check
yarn test --findRelatedTests <changed-files>
yarn lint <changed-files>
```

Never commit code that fails these checks. The repo uses `lint-staged` via a
husky pre-commit hook.

## Expo Prebuild

This project does **not** commit the native `ios/` and `android/` folders — they
are generated from `app.json` and the installed native dependencies:

- Configure native settings (bundle id, splash, icons, plugins) in `app.json`,
  never by hand-editing generated native files.
- Run `yarn prebuild` (or `yarn ios:clean` / `yarn android:clean`) to regenerate
  the native projects.
- Fonts are bundled through the `expo-font` config plugin, sourced from
  `assets/fonts` (populated by `yarn setup:artsy`).
- **Local build cache:** `app.json`'s `buildCacheProvider` uses
  `expo-build-disk-cache`, so `yarn ios` / `yarn android` reuse a previously
  built binary from disk (`node_modules/.expo-build-disk-cache`) when the native
  fingerprint is unchanged, skipping a full native rebuild. It's disk-only for
  now; a remote provider can be added later via the provider's `remotePlugin`.

## Code Rules & Patterns

- Use **absolute imports** from `src/` (module-resolver root is `./src`) — do not
  use relative imports across folders. Same-folder relative imports are allowed.
- Imports are **auto-sorted by `eslint-plugin-simple-import-sort`** (side-effects,
  node builtins, external packages, absolute `src/` imports, then relative). Do not
  hand-order imports — `yarn lint` (`eslint --fix`) fixes ordering for you.
- Accessibility is linted by **`eslint-plugin-react-native-a11y`** (warnings, not
  errors). Add `accessibilityLabel` and `accessibilityRole` (and an
  `accessibilityHint` where useful) to interactive elements, and avoid nested
  touchables.
- Do not import components/hooks directly from another Scene — extract shared
  code to `src/components/` (shared UI) or `src/helpers/` (shared utilities).
- Use **`@artsy/palette-mobile`** for UI primitives (`Flex`, `Text`, `Button`,
  `Input`, `Spacer`, `useColor`, `useSpace`, `Theme`) — do not re-implement them.
- Prefer **Relay hooks** (`useFragment`, `usePaginationFragment`) over HOCs, and
  co-locate fragments with the component that uses them.
- Load queries through **`useSystemQueryLoader`** (`src/system/relay/`) instead of
  calling `useLazyLoadQuery` directly, and read the environment through
  **`useSystemRelayEnvironment`** instead of `useRelayEnvironment`. These are thin
  wrappers today, but keeping every call site behind them gives us one seam to add
  cross-cutting behavior later (e.g. an offline-first fetch policy) without touching
  screens — mirroring Eigen/Energy.
- Run `yarn relay` after modifying any GraphQL query or fragment. Generated
  artifacts live in `src/__generated__/` — never edit these by hand.
- Use **Luxon** for date/time — do not add moment.
- Use the **`logger`** (`system/logger`) instead of `console.*` — it gives
  consistent, level-prefixed output and is the single seam wired to Sentry
  (breadcrumbs + captures), so transports can be added without touching call sites.
- Read global state with `GlobalStore.useAppState(...)`; dispatch with
  `GlobalStore.actions...`. If you change a store Model's shape, bump the store
  version and add a migration.
- **Feature flags:** gate work behind a flag declared in
  `src/system/featureFlags/features.ts` and read it with
  `useFeatureFlag("yourFlag")` — never call Unleash's `useFlag` directly. Each
  flag has a compiled-in `readyForRelease` boolean (start `false`; flip to `true`
  only in the PR that completes the feature) so it can never activate in builds
  that shipped before it was ready. When enabling a flag in Unleash, add an
  `appVersion` SEMVER constraint (e.g. `appVersion SEMVER_GTE 3.1.0`) matching the
  version it landed in — the provider sends `appVersion`/`buildNumber` context for
  this. In `__DEV__`, override flags locally via **Settings → Dev Menu**. Store
  changes here (the `devMenu` slice) followed the store-version bump rule above.
  See [docs/feature-flags.md](./docs/feature-flags.md).
- **Keep the docs site in sync.** When a change adds, changes, or removes a
  feature, config, command, or architectural pattern, update the VitePress docs
  under `docs/` **in the same PR** so the site stays accurate (add a page and
  register it in `docs/.vitepress/config.mts` if needed).

## File Organization

```
src/
├── App.tsx                 # Root component + provider tree
├── MainNavigationStack.tsx # Route definitions + navigation stack
├── Scenes/                 # Top-level screens (PascalCase: Home, Login, ...)
│   └── Home/
│       ├── Home.tsx
│       └── HomeUser.tsx
├── components/             # Shared UI components across scenes
├── helpers/                # Shared utilities
├── relay/                  # Relay environment + network middlewares
├── store/                  # easy-peasy global store + Models
├── assets/                 # Images and fonts
├── utils/test/             # Test helpers (setupTestWrapper, renderWithWrappers)
└── __generated__/          # Relay-generated artifacts (do not edit)
data/
└── schema.graphql          # Metaphysics GraphQL schema
```

## Testing

Use **`@testing-library/react-native`** — do not use `react-test-renderer`
directly. Query the way a user interacts with the UI (`getByText`,
`findByTestId`, etc). See the
[RNTL query guide](https://callstack.github.io/react-native-testing-library/docs/how-should-i-query).

- Test files are co-located: `ComponentName.tests.tsx` (or `util.test.ts`).
- For Relay components, use `setupTestWrapper` from `src/utils/test/` and mock
  resolvers via `renderWithRelay`.
- For non-Relay components, use `renderWithWrappers`.

```tsx
import { setupTestWrapper } from "utils/test/setupTestWrapper"

const { renderWithRelay } = setupTestWrapper<HomeQuery>({
  Component: HomeScreen,
})

it("renders the user", () => {
  renderWithRelay({ Me: () => ({ name: "Andy Warhol" }) })
  expect(screen.getByText("Andy Warhol")).toBeTruthy()
})
```

- Do not leave testing shortcuts (`fdescribe`, `describe.only`, `fit`, `it.only`)
  in committed code.

## PR Title Format

Enforced by CI — must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`

## Naming Conventions

- Components / component files: `PascalCase.tsx`
- Hooks: `camelCase` starting with `use`
- Constants: `UPPER_SNAKE_CASE`
- Utility files: `camelCase.ts`
- Test files: `ComponentName.tests.tsx` or `utilName.test.ts`
