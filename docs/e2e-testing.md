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
- **E2E (agent-device)** (`.github/workflows/agent-device-e2e.yml`) has three jobs:
  - **agent-device setup check** — runs on any change under `e2e/**`; installs
    deps and verifies the CLI (`agent-device --version`). Lightweight, no build.
  - **Android e2e (manual)** — a `workflow_dispatch` job that runs the flows
    against a **real Android emulator** (`reactivecircus/android-emulator-runner`),
    and is validated end-to-end: `expo prebuild` → `yarn relay` → build a
    **release** APK (a debug build boots the expo-dev-client launcher, not the
    app) → boot the emulator → install → run the flows. It re-runs Sniffler to
    set `$E2E_FLOWS` (impacted flows, or the full `e2e/flows` suite). The
    install + run logic lives in **`e2e/scripts/android-e2e.sh`** (see
    _Debugging CI runs_ below).
  - **iOS e2e** — currently **disabled** (commented out in the workflow). The
    previous version only ran `agent-device doctor` + `test` with no build or
    booted simulator, so it reported green while validating nothing. The
    workflow keeps a step-by-step guide for wiring up a real macOS build +
    simulator flow that mirrors the Android job.

### Debugging CI runs

`e2e/scripts/android-e2e.sh` runs the suite with `--debug` (verbose CLI/daemon
diagnostics) and, on **every attempt** (pass or fail), captures evidence into
`e2e-artifacts/` — a device **screenshot**, an **accessibility snapshot**
(`snapshot.json`/`.txt`), the **foreground** window/activity (`foreground.txt`),
and recent **logcat**. It also records a per-attempt **video** (`--record-video`).
All of this is uploaded by the **Upload agent-device e2e artifacts** step
(`actions/upload-artifact`, `if: always()`) as `agent-device-e2e-artifacts`, so a
run can be inspected from the Actions tab whether it passed or failed. The
foreground + snapshot are also echoed into the job log for quick diagnosis.

The script also hardens against a CI-only flake: on a freshly-booted emulator the
home launcher can ANR and steal window focus right as the app cold-starts, so it
waits for the boot animation to finish, sets `hide_error_dialogs`, cold-launches
with `open Energy --relaunch`, and retries.

> **`.ad` DSL gotchas** (learned the hard way): in a replay, `is` takes a
> predicate **plus a selector**, e.g. `is visible text="Folio"` (a bare
> `is visible "Folio"` is rejected). And `wait <arg>` waits for on-screen
> **text** — `wait --connected` is treated as the literal text `--connected`, not
> a flag (that flag only exists on the standalone `wait` CLI command).
