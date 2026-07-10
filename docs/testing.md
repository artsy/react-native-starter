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
`renderWithRelay`:

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

## Testing non-Relay components

Use `renderWithWrappers` (also from `src/utils/test/`) for components that don't
need a Relay environment — it still provides the store and theme.

## Injecting store state

Read state in components with `GlobalStore.useAppState(...)`. In tests you can
seed the store to exercise a specific state (for example, a signed-in user).

## Running in CI

The `checks` GitHub Actions workflow runs on every push to `main` and on pull
requests, executing the same gates you run locally:

```sh
yarn relay     # compile Relay artifacts
yarn tsc       # type-check
yarn test --ci --maxWorkers=2
yarn lint
```

If tests import a package that ships untranspiled ESM, add it to
`transformIgnorePatterns` in `jest.config.js`.
