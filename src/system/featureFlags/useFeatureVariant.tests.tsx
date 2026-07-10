import { act, renderHook } from "@testing-library/react-native"
import { ReactNode } from "react"

import { GlobalStore, GlobalStoreProvider } from "store/GlobalStore"
import { FeatureFlagName } from "system/featureFlags/features"
import {
  CONTROL_VARIANT,
  useFeatureVariant,
} from "system/featureFlags/useFeatureVariant"
import { logger } from "system/logger"

// Controllable Unleash variant. Overrides the global mock in setupJest for this
// file so each test can decide what the "remote" variant is.
const mockUseVariant = jest.fn()

jest.mock("@unleash/proxy-client-react", () => ({
  useVariant: (key: string) => mockUseVariant(key),
}))

// Spy on the logger so we can assert exposure logging without hitting Sentry.
jest.mock("system/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

// A tiny registry with one not-ready and one ready flag so we can exercise the
// build-time gate independently of the real registry.
jest.mock("system/featureFlags/features", () => ({
  features: {
    notReady: {
      readyForRelease: false,
      description: "not ready",
      unleashFlagKey: "not-ready",
      showInDevMenu: true,
    },
    ready: {
      readyForRelease: true,
      description: "ready",
      unleashFlagKey: "ready",
      showInDevMenu: true,
    },
  },
  featureFlagNames: ["notReady", "ready"],
}))

const NOT_READY = "notReady" as FeatureFlagName
const READY = "ready" as FeatureFlagName

const DISABLED_VARIANT = { name: "disabled", enabled: false }

const wrapper = ({ children }: { children: ReactNode }) => (
  <GlobalStoreProvider>{children}</GlobalStoreProvider>
)

const renderVariant = (name: FeatureFlagName) =>
  renderHook(() => useFeatureVariant(name), { wrapper })

describe("useFeatureVariant", () => {
  beforeEach(() => {
    mockUseVariant.mockReset()
    ;(logger.info as jest.Mock).mockClear()
    ;(logger.warn as jest.Mock).mockClear()
    act(() => {
      GlobalStore.actions.devMenu.clearAllFeatureFlagOverrides()
    })
  })

  it("returns the control branch when readyForRelease is false, even if a remote variant is enabled", () => {
    mockUseVariant.mockReturnValue({ name: "treatment", enabled: true })

    const { result } = renderVariant(NOT_READY)

    expect(result.current).toEqual({
      enabled: false,
      variant: CONTROL_VARIANT,
    })
    expect(logger.info).not.toHaveBeenCalled()
  })

  it("returns the remote variant (with parsed payload) when ready and enabled", () => {
    mockUseVariant.mockReturnValue({
      name: "variant-a",
      enabled: true,
      payload: { type: "json", value: '{"color":"blue"}' },
    })

    const { result } = renderVariant(READY)

    expect(result.current).toEqual({
      enabled: true,
      variant: "variant-a",
      payload: { color: "blue" },
    })
  })

  it("logs an exposure once, not on every render", () => {
    mockUseVariant.mockReturnValue({ name: "exposure-once", enabled: true })

    const { rerender } = renderVariant(READY)
    rerender({})
    rerender({})

    expect(logger.info).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith("experiment exposure", {
      flag: READY,
      variant: "exposure-once",
    })
  })

  it("returns control and does not throw when Unleash is unconfigured (disabled variant)", () => {
    mockUseVariant.mockReturnValue(DISABLED_VARIANT)

    const { result } = renderVariant(READY)

    expect(result.current).toEqual({
      enabled: false,
      variant: CONTROL_VARIANT,
    })
    expect(logger.info).not.toHaveBeenCalled()
  })

  it("forces the experiment on (control variant) via a dev override", () => {
    mockUseVariant.mockReturnValue(DISABLED_VARIANT)

    act(() => {
      GlobalStore.actions.devMenu.setFeatureFlagOverride({
        name: NOT_READY,
        value: true,
      })
    })

    const { result } = renderVariant(NOT_READY)

    expect(result.current).toEqual({ enabled: true, variant: CONTROL_VARIANT })
  })
})
