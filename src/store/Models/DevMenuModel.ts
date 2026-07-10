import { action, Action } from "easy-peasy"
import { uuid } from "helpers/uuid"
import { FeatureFlagName } from "system/featureFlags/features"

/**
 * Local developer tooling state.
 *
 * - `featureFlagOverrides` holds per-flag On/Off overrides set from the Dev Menu.
 *   A missing entry means "no override" (fall back to the normal resolution).
 *   Overrides are only honoured in `__DEV__` (see `useFeatureFlag`).
 * - `sessionId` is a persisted, anonymous stickiness id passed to Unleash so a
 *   given install consistently lands on the same side of a gradual rollout — and
 *   so future A/B variants stay sticky. It is generated once and then persisted.
 */
interface DevMenuModelState {
  featureFlagOverrides: { [K in FeatureFlagName]?: boolean }
  sessionId: string
}

const devMenuModelInitialState: DevMenuModelState = {
  featureFlagOverrides: {},
  sessionId: "",
}

export interface DevMenuModel extends DevMenuModelState {
  setFeatureFlagOverride: Action<
    this,
    { name: FeatureFlagName; value: boolean }
  >
  clearFeatureFlagOverride: Action<this, FeatureFlagName>
  clearAllFeatureFlagOverrides: Action<this>
  /** Generate and persist a stickiness id if one does not already exist. */
  ensureSessionId: Action<this>
}

export const DevMenuModel: DevMenuModel = {
  ...devMenuModelInitialState,

  setFeatureFlagOverride: action((state, { name, value }) => {
    state.featureFlagOverrides[name] = value
  }),

  clearFeatureFlagOverride: action((state, name) => {
    delete state.featureFlagOverrides[name]
  }),

  clearAllFeatureFlagOverrides: action((state) => {
    state.featureFlagOverrides = {}
  }),

  ensureSessionId: action((state) => {
    if (!state.sessionId) {
      state.sessionId = uuid()
    }
  }),
}
