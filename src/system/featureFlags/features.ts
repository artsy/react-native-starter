/**
 * Feature flag registry.
 *
 * This is the single source of truth for every feature that can be gated in the
 * app. It combines two independent safety layers so a feature can be built,
 * merged, and even partially released without ever turning on in a build that
 * shipped before the feature was ready:
 *
 *   effective = devOverride ?? (readyForRelease && remoteUnleashFlag)
 *
 * 1. `readyForRelease` (build-time gate — eigen's pattern). This boolean is
 *    COMPILED INTO each build. While it is `false`, the feature stays off in
 *    that build no matter what the Unleash server says. Flip it to `true` only
 *    in the PR that actually finishes the feature. Because older builds shipped
 *    with `readyForRelease: false` baked in, enabling the flag on the Unleash
 *    server can never light the feature up in those older, unfinished builds —
 *    it only affects builds that shipped ready.
 *
 * 2. `remoteUnleashFlag` (server-side gate — Unleash). Once a build ships ready,
 *    the Unleash flag (keyed by `unleashFlagKey`) controls the actual rollout.
 *    Pair the flag with a strategy constraint on the `appVersion` / `buildNumber`
 *    context we send (see `FeatureFlagProvider`) — e.g.
 *    `appVersion SEMVER_GTE 3.1.0` — so even the server side only targets builds
 *    at or above the version where the feature landed. This is belt-and-suspenders
 *    with `readyForRelease`.
 *
 * 3. `devOverride` (local only). In `__DEV__` a developer can force a flag On or
 *    Off from the Dev Menu; the override wins over both gates above. Overrides
 *    are ignored entirely in release builds.
 *
 * A/B variants are intentionally NOT modelled here yet — the Unleash context
 * already carries a sticky `sessionId`, so variants can be layered on later
 * without reworking this registry.
 *
 * To add a flag:
 *   1. Add an entry below with a stable `unleashFlagKey` (kebab-case) and a
 *      clear `description`. Start with `readyForRelease: false`.
 *   2. Read it with `useFeatureFlag("yourFlagName")`.
 *   3. When the feature is complete, flip `readyForRelease` to `true` in the
 *      finishing PR, and create the Unleash flag (with a version constraint).
 */

/** Shape of a single feature descriptor. */
export interface FeatureDescriptor {
  /**
   * Compiled-in release gate. When `false`, the feature is force-disabled in
   * this build regardless of the remote Unleash flag. Flip to `true` in the PR
   * that completes the feature.
   */
  readonly readyForRelease: boolean
  /** Human-readable summary shown in the Dev Menu. */
  readonly description: string
  /** The Unleash flag key that controls the server-side rollout. */
  readonly unleashFlagKey: string
  /** Whether this flag is listed in the in-app Dev Menu for local overrides. */
  readonly showInDevMenu: boolean
}

export const features = {
  exampleNewFeature: {
    readyForRelease: false,
    description:
      "Example feature flag. Demonstrates the readyForRelease build gate " +
      "plus server-side Unleash gating. Safe to delete once you add real flags.",
    unleashFlagKey: "example-new-feature",
    showInDevMenu: true,
  },
} satisfies Record<string, FeatureDescriptor>

/** Union of all registered feature flag names. */
export type FeatureFlagName = keyof typeof features

/** All feature flag names, typed. */
export const featureFlagNames = Object.keys(features) as FeatureFlagName[]
