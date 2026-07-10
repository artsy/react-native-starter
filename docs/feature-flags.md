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

## A/B variants

Variants are **not** implemented yet, but the Unleash context already carries a
sticky `sessionId`, so they can be layered on later without reworking the
registry or the provider.
