# Getting Started

`react-native-starter` is an **Expo-managed** project using the **prebuild
(CNG)** workflow. The native `ios/` and `android/` folders are **not** committed
— they are generated on demand from `app.json` and the installed native
dependencies.

## Prerequisites

The pinned toolchain lives in `.tool-versions` (and `.nvmrc`):

| Tool    | Version        |
| ------- | -------------- |
| Node.js | `24.6.0`       |
| Yarn    | `4.17.0`       |
| Ruby    | `3.1.7`        |
| Java    | `zulu-17.50.19` |

Install everything with [`mise`](https://mise.jdx.dev) (or `asdf`):

```sh
mise install   # or: asdf install
```

You'll also need the native build toolchains — Xcode for iOS and Android Studio
/ JDK for Android. See the
[React Native environment setup](https://reactnative.dev/docs/set-up-your-environment).

## Install

**For Artsy engineers**, `yarn setup:artsy` downloads fonts and environment
variables:

```sh
yarn setup:artsy   # fonts + env vars (Artsy engineers only)
yarn install
```

Fonts are bundled through the `expo-font` config plugin from `assets/fonts`
(populated by `yarn setup:artsy`) — that directory is gitignored.

## Configure keys

The app reads secrets through [`react-native-keys`](https://github.com/numandev1/react-native-keys).
Create a real `keys.json` from the tracked example (real `keys*.json` files are
gitignored):

```sh
cp keys.example.json keys.json
```

Then fill in the `secure` values. See [Configuration](./configuration) for
details on keys, environment variables, Sentry, and feature flags.

## Generate the native projects

```sh
yarn prebuild   # runs `expo prebuild --clean`
```

Configure native settings (bundle id, splash, icons, plugins) in `app.json` —
**never** by hand-editing the generated native files, since they're regenerated
on every prebuild.

## Run the app

```sh
yarn ios        # prebuild + run on iOS (or: yarn ios-device)
yarn android    # prebuild + run on Android
```

`yarn ios` / `yarn android` start Metro for you. If you need Metro on its own
(together with the Relay compiler in watch mode):

```sh
yarn start
```

## Common commands

```sh
yarn start          # Metro bundler + Relay watcher
yarn ios            # Prebuild + run on iOS
yarn android        # Prebuild + run on Android
yarn prebuild       # Regenerate native ios/ and android/ folders
yarn test           # Jest
yarn type-check     # Relay compile + tsc
yarn lint           # ESLint (auto-fix + auto-sort imports)
yarn relay          # Compile Relay artifacts
yarn sync-schema    # Refresh data/schema.graphql from Metaphysics
yarn e2e            # Run recorded agent-device e2e checks (e2e/flows)
yarn e2e:doctor     # Verify the agent-device environment
yarn e2e:impact     # Sniffler: which e2e flows a diff affects
yarn docs:dev       # VitePress docs dev server
yarn docs:build     # Build the docs site
yarn docs:preview   # Preview the built docs site
```

`yarn lint` auto-fixes and **auto-sorts imports** (via `eslint-plugin-simple-import-sort`),
so import ordering is never something you maintain by hand. See
[Testing → Running in CI](./testing#running-in-ci) for the accessibility
(`react-native-a11y`) lint rules and the full set of CI workflows, and
[E2E Testing](./e2e-testing) for `yarn e2e*`.

## Pre-commit verification

`lint-staged` runs on staged files via a Husky pre-commit hook. Before every
commit, run these on your changed files:

```sh
yarn type-check
yarn test --findRelatedTests <changed-files>
yarn lint <changed-files>
```

Never commit code that fails these checks.

## Documentation site

These docs are built with [VitePress](https://vitepress.dev):

```sh
yarn docs:dev       # local dev server with hot reload
yarn docs:build     # build the static site
yarn docs:preview   # preview the production build
```

The site is deployed to GitHub Pages by the `deploy-docs` GitHub Actions
workflow on every push to `main`.
