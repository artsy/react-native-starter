import { useVariant } from "@unleash/proxy-client-react"
import { useEffect } from "react"

import { GlobalStore } from "store/GlobalStore"
import { FeatureFlagName, features } from "system/featureFlags/features"
import { logger } from "system/logger"

/**
 * A/B experiment layer on top of the safe feature-flag system.
 *
 * Where `useFeatureFlag` answers a boolean "is this on?", `useFeatureVariant`
 * answers "which branch of the experiment is this user in?". It wraps Unleash's
 * `useVariant` (see `@unleash/proxy-client-react`), which returns a variant that
 * is *sticky* per install because the provider sends a persisted anonymous
 * `sessionId` in the Unleash context (see `FeatureFlagProvider`).
 *
 * It applies the SAME safety guarantees as `useFeatureFlag`:
 *
 *   1. `readyForRelease` build-time gate. While a feature's `readyForRelease` is
 *      `false`, this hook returns the CONTROL branch no matter what the Unleash
 *      server says — an experiment branch must never render in a build that
 *      shipped before the experiment was ready. Pair the Unleash flag with an
 *      `appVersion` SEMVER constraint for belt-and-suspenders on the server side.
 *   2. Dev override (local, `__DEV__` only). Because the Dev Menu override is a
 *      simple boolean, it can only force the experiment On or Off — it cannot
 *      pick a specific remote variant. A forced-on override therefore reports
 *      `enabled: true` while still returning the CONTROL variant name (a real
 *      variant picker in the Dev Menu would be a follow-up). Overrides are
 *      ignored entirely in release builds.
 *
 * Safe when Unleash is unconfigured: `FeatureFlagProvider` always mounts a Flag
 * context, so `useVariant` resolves to the disabled variant
 * (`{ name: "disabled", enabled: false }`) rather than throwing — this hook maps
 * that to the CONTROL result.
 *
 * @example
 * const { enabled, variant, payload } = useFeatureVariant("exampleNewFeature")
 * if (!enabled) return <Control />
 * return variant === "b" ? <TreatmentB payload={payload} /> : <TreatmentA />
 */

/** Name reported for the control branch (not exposed to an active variant). */
export const CONTROL_VARIANT = "control"

/**
 * A parsed Unleash variant payload. Unleash stores payloads as a
 * `{ type, value }` string pair; we parse `json` and `number` payloads and leave
 * everything else (`string`, `csv`) as the raw string. Callers narrow as needed.
 */
export type FeatureVariantPayload = unknown

export interface FeatureVariantResult {
  /**
   * Whether the user is in an ACTIVE (non-control) experiment branch. False for
   * control, for not-yet-ready features, and when Unleash is unconfigured.
   */
  readonly enabled: boolean
  /** The variant name (e.g. "a", "b"). `CONTROL_VARIANT` when not enabled. */
  readonly variant: string
  /** The parsed variant payload, if the variant carries one. */
  readonly payload?: FeatureVariantPayload
}

const CONTROL_RESULT: FeatureVariantResult = {
  enabled: false,
  variant: CONTROL_VARIANT,
}

/**
 * Module-level dedupe of exposure logs. Its lifetime is the JS runtime, i.e. one
 * app session, so keying by `flag:variant` means we log each (flag, variant)
 * exposure at most once per session — exactly the granularity we want, without
 * spamming Sentry breadcrumbs on every re-render. A real app would forward these
 * exposures to its analytics / experimentation pipeline here as well.
 */
const exposedThisSession = new Set<string>()

const logExposureOnce = (flag: FeatureFlagName, variant: string): void => {
  const key = `${flag}:${variant}`
  if (exposedThisSession.has(key)) {
    return
  }
  exposedThisSession.add(key)
  logger.info("experiment exposure", { flag, variant })
}

/** Parse an Unleash variant payload into a typed value. */
const parsePayload = (
  payload: { type: string; value: string } | undefined
): FeatureVariantPayload => {
  if (!payload) {
    return undefined
  }

  switch (payload.type) {
    case "json":
      try {
        return JSON.parse(payload.value)
      } catch {
        logger.warn("failed to parse experiment json payload", {
          value: payload.value,
        })
        return payload.value
      }
    case "number": {
      const parsed = Number(payload.value)
      return Number.isNaN(parsed) ? payload.value : parsed
    }
    // "string", "csv", and anything else are returned as-is.
    default:
      return payload.value
  }
}

/**
 * Resolve the experiment variant for the current build and user. See the module
 * docblock for the full resolution model.
 */
export const useFeatureVariant = (
  name: FeatureFlagName
): FeatureVariantResult => {
  const descriptor = features[name]

  // Called unconditionally to respect the rules of hooks. When Unleash is
  // unconfigured this resolves to the disabled variant (no network, no throw).
  const remoteVariant = useVariant(descriptor.unleashFlagKey)

  // Read the dev override unconditionally too (hooks must not be conditional).
  const override = GlobalStore.useAppState(
    (state) => state.devMenu.featureFlagOverrides[name]
  )

  let result: FeatureVariantResult

  if (__DEV__ && override !== undefined) {
    // Boolean override: force On/Off but keep the control variant name.
    result = override
      ? { enabled: true, variant: CONTROL_VARIANT }
      : CONTROL_RESULT
  } else if (!descriptor.readyForRelease) {
    // Build-time gate: never surface an experiment branch in a build that
    // shipped before the experiment was ready.
    result = CONTROL_RESULT
  } else if (remoteVariant.enabled && remoteVariant.name) {
    result = {
      enabled: true,
      variant: remoteVariant.name,
      payload: parsePayload(remoteVariant.payload),
    }
  } else {
    result = CONTROL_RESULT
  }

  // Log exposure once per (flag, variant) per session, after commit, so
  // re-renders don't spam and render stays side-effect free.
  useEffect(() => {
    if (result.enabled) {
      logExposureOnce(name, result.variant)
    }
  }, [name, result.enabled, result.variant])

  return result
}
