# Feature Flags

The app ships a **safe feature-flag system**: a feature can be built and merged
behind a flag and will **never turn on in a build that shipped before it was
ready**, even if the flag is switched on server-side.

Flags are read with the `useFeatureFlag` hook and resolve from three layers:

```
effective = devOverride ?? (readyForRelease && remoteUnleashFlag)
```

| Layer               | Where it lives                                   | Purpose                                                              |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| `readyForRelease`   | `src/system/featureFlags/features.ts` (compiled) | Build-time gate — off until the feature is complete in this build.  |
| `remoteUnleashFlag` | Unleash server (keyed by `unleashFlagKey`)       | Server-side rollout, gated by an `appVersion` constraint.           |
| `devOverride`       | Dev Menu (local, `__DEV__` only)                 | Force a flag On/Off on your device.                                 |

For A/B experiments layered on top of the same registry, see
[A/B testing (variants)](#a-b-testing-variants).

## The registry

Every flag is declared in `src/system/featureFlags/features.ts`:

```ts
export const features = {
  exampleNewFeature: {
    readyForRelease: false,
    description: "Example feature flag.",
    unleashFlagKey: "example-new-feature",
    showInDevMenu: true,
  },
} satisfies Record<string, FeatureDescriptor>
```

`readyForRelease` is a **plain, in-repo, compile-time constant** — it is baked
into each build. There is intentionally no remote service backing it: that is
what makes the gate safe. Because an older build shipped with
`readyForRelease: false` compiled in, enabling the Unleash flag can never light
the feature up in that older, unfinished build.

## Reading a flag

```tsx
import { useFeatureFlag } from "system/featureFlags/useFeatureFlag"

const MyComponent = () => {
  const showNewThing = useFeatureFlag("exampleNewFeature")
  return showNewThing ? <NewUI /> : <OldUI />
}
```

`useFeatureFlag` is safe when Unleash is unconfigured (the default template
state): `FeatureFlagProvider` always mounts a Flag context with `startClient`
disabled and an empty bootstrap, so the hook returns `false` instead of throwing
and makes no network requests.

## Adding a flag

1. Add an entry to `features.ts` with a stable kebab-case `unleashFlagKey` and a
   clear `description`. Start with `readyForRelease: false`.
2. Build the feature, reading it with `useFeatureFlag("yourFlag")`.
3. Use the Dev Menu (below) to exercise it locally.
4. When the feature is complete, flip `readyForRelease` to `true` **in the
   finishing PR**, and create the Unleash flag with a version constraint.

## Setting a feature "ready"

Flipping `readyForRelease: true` only affects builds compiled **after** that
change. On the server side, gate the Unleash flag with a strategy constraint on
the `appVersion` context the app sends:

```
appVersion  SEMVER_GTE  3.1.0
```

Use the version in which the feature landed. This belt-and-suspenders pairing
means neither the build nor the server can activate the feature in an older
build. The provider sends `appVersion` and `buildNumber` (from
`react-native-device-info`) plus a persisted, anonymous `sessionId` for sticky
rollouts — see `src/system/providers/FeatureFlagProvider.tsx`.

## Dev Menu overrides

In `__DEV__` builds, open **Settings → Dev Menu** to force any flag with
`showInDevMenu: true` to Default / On / Off. Overrides are stored per-device in
the global store (`devMenu.featureFlagOverrides`) and are ignored entirely in
release builds. "Reset all overrides" clears them.

## A/B testing (variants)

On top of the on/off flag above, an **experiment layer** answers "which branch
is this user in?" via Unleash [variants]. Read it with the `useFeatureVariant`
hook, which reuses the same flag registry and the exact same safety gates as
`useFeatureFlag`.

```tsx
import { useFeatureVariant } from "system/featureFlags/useFeatureVariant"

const MyComponent = () => {
  const { enabled, variant, payload } = useFeatureVariant("exampleNewFeature")

  if (!enabled) return <Control /> // control / not-ready / unconfigured
  return variant === "b" ? <TreatmentB payload={payload} /> : <TreatmentA />
}
```

The hook returns:

| Field     | Type      | Meaning                                                                 |
| --------- | --------- | ----------------------------------------------------------------------- |
| `enabled` | `boolean` | `true` only for an ACTIVE (non-control) branch.                         |
| `variant` | `string`  | The variant name (e.g. `"a"`, `"b"`); `"control"` when not enabled.     |
| `payload` | `unknown` | The parsed variant payload, if any (`json` → object, `number` → number). |

### readyForRelease gate

Experiments obey the **same build-time gate** as flags:

```
effective = devOverride ?? (readyForRelease && remoteUnleashVariant)
```

While a feature's `readyForRelease` is `false`, `useFeatureVariant` returns the
**control** result no matter what the Unleash server sends — an experiment branch
can never render in a build that shipped before the experiment was ready. Pair
the Unleash flag with an `appVersion SEMVER_GTE <version>` strategy constraint as
belt-and-suspenders on the server side (the provider sends `appVersion` /
`buildNumber` context; see [above](#setting-a-feature-ready)).

Because the Dev Menu override is a simple boolean, in `__DEV__` it can only force
the experiment On or Off — a forced-on override reports `enabled: true` while
still returning the `"control"` variant name (a per-variant Dev Menu picker would
be a follow-up).

### Stickiness

Variant assignment is **sticky per install**: `FeatureFlagProvider` sends a
persisted, anonymous `sessionId` in the Unleash context, so a given device keeps
landing in the same branch across launches and rollout percentage changes.

### Exposure logging

When a user is exposed to an **enabled** variant, the hook logs once via
`logger.info("experiment exposure", { flag, variant })` (a Sentry breadcrumb) so
the experiment is measurable. A module-level dedupe set keyed by `flag:variant`
ensures re-renders don't spam it — its lifetime is the JS runtime, i.e. one app
session. A production app would also forward this exposure to its analytics /
experimentation pipeline from the same seam.

Safe when Unleash is unconfigured (the default template state): `useVariant`
resolves to the disabled variant instead of throwing, which the hook maps to the
control result, and nothing is logged.

### Setting up a variant in Unleash

1. Add (or reuse) a flag entry in `features.ts` and read it with
   `useFeatureVariant("yourFlag")`. Flip `readyForRelease: true` in the finishing
   PR, exactly as for a plain flag.
2. In Unleash, on that flag's activation strategy add **variants** (e.g. `a` and
   `b`) with weights that sum to 100%, and attach a payload if a branch needs
   data. Set the stickiness to the `sessionId` context field so assignment stays
   consistent per install.
3. Add an `appVersion SEMVER_GTE <version>` constraint matching the version the
   experiment landed in.

[variants]: https://docs.getunleash.io/reference/feature-toggle-variants
