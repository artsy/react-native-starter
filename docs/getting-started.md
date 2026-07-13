# Getting Started

`react-native-starter` is an **Expo-managed** project using the **prebuild
(CNG)** workflow. It targets **Expo SDK 56** (React Native 0.85, React 19.2).
The native `ios/` and `android/` folders are **not** committed — they are
generated on demand from `app.json` and the installed native dependencies.

## Start a new project from this template

This repo is a **GitHub template**. To kickstart your own app:

1. **Get a copy** — click **“Use this template” → Create a new repository** on
   GitHub for a clean-history copy. Without GitHub you can also
   `npx degit artsy/react-native-starter my-app`, or fork/clone.
2. **Rebrand** — in `app.json`, set your app `name`, `slug`, iOS
   `bundleIdentifier`, Android `package`, and icons/splash. Never hand-edit the
   generated native folders — they're regenerated on every prebuild.
3. **Point at your backend** — the template wires Relay to Artsy's GraphQL
   (metaphysics). Swap `data/schema.graphql` for your own API (update the URL in
   the `sync-schema` script, then `yarn sync-schema`) and replace the sample
   `Login`/example screens under `src/Scenes/`.
4. Then follow **Install → Configure keys → Generate the native projects → Run**
   below.

> Outside Artsy, use `yarn setup:oss` (not `yarn setup:artsy`) — it needs no
> private access and writes placeholder fonts + `keys.json` so you don't have to
> source Artsy's private fonts. Drop your own `.otf` files in `assets/fonts` to
> use your own typefaces.

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

**For Artsy engineers**, `yarn setup:artsy` downloads the real fonts and
environment variables from S3 (needs Artsy AWS access):

```sh
yarn setup:artsy   # fonts + env vars (Artsy engineers only)
yarn install
```

**For open-source contributors**, run `yarn setup:oss` instead — it needs no
private resources:

```sh
yarn setup:oss     # placeholder fonts + keys.json from the example
yarn install
```

`yarn setup:oss` writes **empty placeholder** `Unica77LL` fonts into
`assets/fonts` so `expo prebuild` resolves them (the real fonts are
Artsy-private, so text falls back to the system font — drop your own `.otf`
files in `assets/fonts` to change that) and creates `keys.json` from
`keys.example.json` if you don't have one. So you **don't** need to obtain
`assets/fonts/Unica77LL-*.otf` yourself.

Fonts are bundled through the `expo-font` config plugin from `assets/fonts`
(populated by `yarn setup:artsy` or `yarn setup:oss`) — that directory is
gitignored.

## Configure keys

The app reads secrets through [`react-native-keys`](https://github.com/numandev1/react-native-keys),
which uses **per-environment** files: `keys.development.json` for debug builds and
`keys.production.json` for release builds (there is no plain `keys.json`). Create
them from the tracked example (real `keys*.json` files are gitignored):

```sh
cp keys.example.json keys.development.json
cp keys.example.json keys.production.json
```

- **OSS contributors:** `yarn setup:oss` creates both files from the example;
  fill in the `secure` values yourself.
- **Artsy engineers:** `yarn setup:artsy` **downloads the real key files** from
  the private S3 bucket (`s3://artsy-citadel/rnstarter/keys.<env>.json`), so you
  don't fill them in by hand. If S3 is unreachable it falls back to the example
  and warns.

See [Configuration](./configuration) for details on keys, environment variables,
Sentry, and feature flags.

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

### Faster local builds (disk cache)

`app.json` configures a `buildCacheProvider` (`expo-build-disk-cache`), so
`yarn ios` / `yarn android` reuse a previously built binary from
`node_modules/.expo-build-disk-cache` when the native fingerprint hasn't
changed — skipping a full native rebuild. The cache lives on disk only for now
(a remote provider can be plugged in later via the provider's `remotePlugin`
option).

### Build performance

Several config-only tweaks (all driven from `app.json` / config plugins, since
the native folders are generated) speed up native builds:

**Android — Gradle tuning.** The local config plugin
`plugins/withAndroidBuildPerformance.js` writes performance-oriented
`gradle.properties`:

- `org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m` — larger daemon
  heap/metaspace (the default 512m metaspace was OOM-ing our e2e build).
- `org.gradle.parallel=true`, `org.gradle.caching=true` — parallel modules and
  the local build cache.
- `org.gradle.configuration-cache=true` — the biggest incremental win.
  ⚠️ It can be incompatible with some RN/Expo Gradle plugins; if a build fails
  with a configuration-cache error, drop that one line in the plugin.

The same plugin also disables the slow per-library `lintVital` analysis on
release builds (`android { lint { checkReleaseBuilds false } }`).

**Android — single ABI for local dev.** By default all ABIs are built (needed
for release/CI). For a much faster local compile (~4x), build a single
architecture by exporting `RN_DEV_SINGLE_ABI` before `yarn android`:

```sh
export RN_DEV_SINGLE_ABI=arm64-v8a   # physical device
# or
export RN_DEV_SINGLE_ABI=x86_64      # emulator
yarn android
```

Leave it unset for release/CI builds so all ABIs ship.

**iOS — prebuilt React Native.** `expo-build-properties` sets
`ios.buildReactNativeFromSource: false`, so pod install consumes the prebuilt
RNCore + Hermes XCFrameworks (`RCT_USE_PREBUILT_RNCORE=1`) instead of compiling
React Native from source — a large iOS build speedup. If you ever hit a build
error tied to precompiled RN (e.g. when combined with `useFrameworks: static`),
set it back to `true` to build RN from source.

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
