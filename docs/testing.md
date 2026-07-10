# Testing

Tests run on **Jest** (via `jest-expo`) with
**[@testing-library/react-native](https://callstack.github.io/react-native-testing-library/)**.

```sh
yarn test              # run the whole suite
yarn test Login        # run tests matching "Login"
yarn test --findRelatedTests src/Scenes/Login/Login.tsx
```

## Conventions

- Query the way a user interacts with the UI (`getByText`, `findByTestId`, …).
  See the
  [RNTL query guide](https://callstack.github.io/react-native-testing-library/docs/how-should-i-query).
- Do **not** use `react-test-renderer` directly.
- Test files are **co-located**: `ComponentName.tests.tsx` for components,
  `util.test.ts` for utilities.
- Do not leave testing shortcuts (`fdescribe`, `describe.only`, `fit`,
  `it.only`) in committed code.

## Testing Relay components

Use `setupTestWrapper` from `src/utils/test/` and mock resolvers through
`renderWithRelay`. It supports **both** kinds of Relay component:

- **Self-fetching components** that issue their own query (via
  `useSystemQueryLoader` / `useLazyLoadQuery`) — pass only the `Component`. The
  wrapper renders it under a mock environment and a Suspense boundary.
- **Fragment components** (`useFragment`) — also pass a `query` that spreads the
  fragment, so the wrapper can drive it through a `QueryRenderer`.

```tsx
import { setupTestWrapper } from "utils/test/setupTestWrapper"

// Self-fetching component (useSystemQueryLoader / useLazyLoadQuery)
const { renderWithRelay } = setupTestWrapper<HomeQuery>({
  Component: HomeScreen,
})

it("renders the user", () => {
  renderWithRelay({ Me: () => ({ name: "Andy Warhol" }) })
  expect(screen.getByText("Andy Warhol")).toBeTruthy()
})

// Fragment component (useFragment) — pass a query that spreads the fragment
const { renderWithRelay } = setupTestWrapper<HomeUserTestQuery>({
  Component: HomeUser,
  query: graphql`
    query HomeUserTestQuery @relay_test_operation {
      me {
        ...HomeUser_me
      }
    }
  `,
})
```

## Testing non-Relay components

Use `renderWithWrappers` (also from `src/utils/test/`) for components that don't
need a Relay environment — it still provides the store and theme.

## Injecting store state

Read state in components with `GlobalStore.useAppState(...)`. In tests you can
seed the store to exercise a specific state (for example, a signed-in user).

## End-to-end tests

Unit/integration tests above run in Jest. **End-to-end** tests drive a real
iOS/Android simulator or emulator with
[`agent-device`](https://github.com/callstack/agent-device): flows are recorded
as `.ad` scripts under `e2e/flows/` and replayed as repeatable checks.

```sh
yarn e2e:doctor   # verify the local device environment
yarn e2e          # run all recorded checks (agent-device test e2e/flows)
yarn e2e:impact   # Sniffler: which flows the current diff affects
```

In CI, **Sniffler** analyzes a PR's dependency graph and selects only the e2e
flows a diff can actually reach (failing open to the full suite when it can't
tell). See [E2E Testing](./e2e-testing) for the full workflow.

## Running in CI

Several GitHub Actions workflows run on pull requests and pushes to `main`:

- **Checks** (`checks.yml`) — the same gates you run locally: `yarn relay`,
  `yarn tsc`, `yarn test --ci --maxWorkers=2`, `yarn lint`. `yarn lint` also
  enforces auto-sorted imports (`simple-import-sort`) and surfaces
  accessibility warnings (`react-native-a11y`).
- **Conventional Commits** (`run-conventional-commits-check.yml`) — validates
  the PR title.
- **E2E impact (Sniffler)** (`e2e-impact.yml`) — informational, never blocks;
  reports which e2e flows the diff affects.
- **E2E (agent-device)** (`agent-device-e2e.yml`) — validates the agent-device
  setup on every e2e change, plus manual (`workflow_dispatch`) iOS/Android
  device runs.
- **Deploy Docs** (`deploy-docs.yml`) — builds and publishes this VitePress site
  on pushes to `main`.

```sh
yarn relay     # compile Relay artifacts
yarn tsc       # type-check
yarn test --ci --maxWorkers=2
yarn lint
```

If tests import a package that ships untranspiled ESM, add it to
`transformIgnorePatterns` in `jest.config.js`.
