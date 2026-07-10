# E2E Testing

End-to-end tests drive a real iOS/Android simulator, emulator, or device with
[`agent-device`](https://github.com/callstack/agent-device) — a CLI built for AI
agents but equally usable as a deterministic e2e runner. Flows are **recorded**
as `.ad` scripts under `e2e/flows/` and replayed as repeatable checks, locally
and in CI. `agent-device` is a dev dependency, so every command below also works
as `yarn agent-device …`.

## Commands

```sh
yarn e2e:doctor   # agent-device doctor — verify the local environment
yarn e2e          # agent-device test e2e/flows — run all recorded checks
yarn e2e:record   # agent-device replay --update — (re)record a flow
yarn e2e:impact   # sniffler impact — which flows the current diff affects
```

## Prerequisites

- Node.js and platform tooling (**Xcode** for iOS, **Android SDK** for Android).
- A build of the app installed on a booted simulator/emulator (`yarn ios` /
  `yarn android`).

Run `yarn e2e:doctor` to check the environment.

## Recording a flow

`.ad` scripts are produced by the recorder, not hand-authored. Boot a
simulator/emulator with the app installed, capture an interaction, and save it
under `e2e/flows/`:

```sh
yarn agent-device open MyApp --platform ios
yarn agent-device snapshot -i        # list interactive elements (@e1, @e2, …)
yarn agent-device fill @e1 "user@example.com"
yarn agent-device click @e3
yarn agent-device close
yarn e2e:record                      # persist as a replayable .ad check
```

`yarn e2e` then runs every check in `e2e/flows`, retries flakes, and emits JUnit
reports for CI.

## Impact selection with Sniffler

Device e2e runs are expensive, so we don't run every flow on every change.
[Sniffler](https://github.com/callstackincubator/sniffler) analyzes the PR
diff's TypeScript dependency graph and reports which recorded flows a change can
actually reach, mapping source files to flows via `.sniffler/test-map.json`:

```json
[
  {
    "test": "e2e/flows/launch-smoke.ad",
    "dependsOn": ["src/App.tsx", "src/Navigation.tsx", "src/Scenes/Login/Login.tsx"]
  }
]
```

Broad-impact changes (listed under `runAllWhenChanged` in `.sniffler/config.json`
— e.g. `package.json`, `babel.config.js`, `e2e/**`) select the full suite.

Run it locally with `yarn e2e:impact` (`sniffler impact --base origin/main
--head HEAD`).

## CI

- **E2E impact (Sniffler)** (`.github/workflows/e2e-impact.yml`) runs on every PR.
  It is **informational and never blocks**: if Sniffler errors or can't resolve
  the graph it **fails open** (reports "run the full suite") and still exits 0.
- **E2E (agent-device)** (`.github/workflows/agent-device-e2e.yml`) validates the
  agent-device setup (install + `--version`) on any change under `e2e/**`, and
  provides **manual** (`workflow_dispatch`) iOS and Android jobs that build the
  app on a runner and run the checks. Each device job re-runs Sniffler to set
  `$E2E_FLOWS` — running only the impacted flows, or the full `e2e/flows` suite
  when there's no partial impact. Building/installing the iOS app in CI is left
  as a TODO until app builds are wired up.
