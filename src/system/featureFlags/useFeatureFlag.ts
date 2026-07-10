import { useFlag } from "@unleash/proxy-client-react"

import { GlobalStore } from "store/GlobalStore"
import { FeatureFlagName,features } from "system/featureFlags/features"

/**
 * Resolve whether a feature is enabled for the current build and user.
 *
 * Resolution order (see `features.ts` for the full model):
 *
 *   1. In `__DEV__`, if a Dev Menu override is set for this flag (On/Off), it
 *      wins. Overrides are ignored in release builds.
 *   2. Otherwise the effective value is `readyForRelease && remoteUnleashFlag`,
 *      where `readyForRelease` is compiled into the build and `remoteUnleashFlag`
 *      comes from Unleash (keyed by `descriptor.unleashFlagKey`).
 *
 * Safe when Unleash is unconfigured: `FeatureFlagProvider` always mounts a Flag
 * context (see that file), so `useFlag` returns `false` rather than throwing.
 *
 * @example
 * const showNewThing = useFeatureFlag("exampleNewFeature")
 */
export const useFeatureFlag = (name: FeatureFlagName): boolean => {
  const descriptor = features[name]

  // Called unconditionally to respect the rules of hooks. When Unleash is
  // unconfigured this resolves to `false` (no network, no throw).
  const remoteEnabled = useFlag(descriptor.unleashFlagKey)

  // Read the dev override unconditionally too (hooks must not be conditional).
  const override = GlobalStore.useAppState(
    (state) => state.devMenu.featureFlagOverrides[name]
  )

  if (__DEV__ && override !== undefined) {
    return override
  }

  return descriptor.readyForRelease && remoteEnabled
}
