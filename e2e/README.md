# End-to-end testing with agent-device

We use [`agent-device`](https://github.com/callstack/agent-device) for
end-to-end tests. It's a CLI that drives real iOS/Android simulators, emulators,
and devices — built for AI agents but equally usable as a deterministic e2e
runner. Flows are **recorded** as `.ad` scripts and then replayed as repeatable
checks (locally and in CI).

`agent-device` is installed as a dev dependency, so all commands below can be run
through `yarn agent-device …` (or the `yarn e2e*` scripts).

## Prerequisites

- Node.js ≥ 22.12 (see `.nvmrc`)
- Platform tooling: **Xcode** for iOS, **Android SDK** for Android
- A build of the app installed on a booted simulator/emulator (see the root
  README for `yarn ios` / `yarn android`)

Verify your environment:

```sh
yarn e2e:doctor          # agent-device doctor
```

## Recording a flow

1. Boot a simulator/emulator and install the app.
2. Open a session, then interact and capture state:

   ```sh
   yarn agent-device open Energy --platform ios
   yarn agent-device snapshot -i        # lists interactive elements (@e1, @e2, …)
   yarn agent-device fill @e1 "user@example.com"
   yarn agent-device click @e3
   yarn agent-device close
   ```

3. Save the interaction as a replayable `.ad` check under `e2e/flows/`. Because
   `.ad` scripts are produced by the recorder (not hand-authored), use the
   recorder/`replay --update` flow rather than writing them by hand:

   ```sh
   yarn e2e:record       # agent-device replay --update
   ```

## Running the checks

```sh
yarn e2e                 # agent-device test e2e/flows  (runs all recorded checks)
```

`agent-device test` runs every check in `e2e/flows`, retries flakes, and emits
JUnit reports for CI.

## Useful commands

| Command                    | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `agent-device doctor`      | Verify local environment / prerequisites   |
| `agent-device open`        | Start a device session                     |
| `agent-device snapshot -i` | Inspect interactive UI elements            |
| `agent-device click/fill`  | Interact with elements by `@ref`/selector  |
| `agent-device wait/is/get` | Assert / query app state                   |
| `agent-device replay`      | Replay a recorded `.ad` script             |
| `agent-device test`        | Run multiple checks with JUnit reporting   |
| `agent-device close`       | End the session                            |

See the [agent-device docs](https://oss.callstack.com/agent-device/) for the
full command reference and CI integration patterns.

## CI

`.github/workflows/agent-device-e2e.yml` installs `agent-device` and runs
`agent-device doctor` on every change to the e2e setup, and provides a
manually-triggered (`workflow_dispatch`) job scaffold for running the recorded
checks against a built app on a macOS runner. Building/installing the app in CI
is intentionally left as a TODO until app builds are wired up.
