import { act, renderHook } from "@testing-library/react-native"
import { ReactNode } from "react"
import { GlobalStore, GlobalStoreProvider } from "store/GlobalStore"
import { FeatureFlagName } from "system/featureFlags/features"
import { useFeatureFlag } from "system/featureFlags/useFeatureFlag"

// Controllable Unleash flag. Overrides the global mock in setupJest for this
// file so each test can decide what the "remote" value is.
const mockUseFlag = jest.fn()

jest.mock("@unleash/proxy-client-react", () => ({
  useFlag: (key: string) => mockUseFlag(key),
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

const wrapper = ({ children }: { children: ReactNode }) => (
  <GlobalStoreProvider>{children}</GlobalStoreProvider>
)

const renderFlag = (name: FeatureFlagName) =>
  renderHook(() => useFeatureFlag(name), { wrapper })

describe("useFeatureFlag", () => {
  beforeEach(() => {
    mockUseFlag.mockReset()
    act(() => {
      GlobalStore.actions.devMenu.clearAllFeatureFlagOverrides()
    })
  })

  it("stays off when readyForRelease is false, even if the remote flag is on", () => {
    mockUseFlag.mockReturnValue(true)

    const { result } = renderFlag(NOT_READY)

    expect(result.current).toBe(false)
  })

  it("is on when readyForRelease is true and the remote flag is on", () => {
    mockUseFlag.mockReturnValue(true)

    const { result } = renderFlag(READY)

    expect(result.current).toBe(true)
  })

  it("lets a dev override force a not-ready flag on", () => {
    mockUseFlag.mockReturnValue(false)

    act(() => {
      GlobalStore.actions.devMenu.setFeatureFlagOverride({
        name: NOT_READY,
        value: true,
      })
    })

    const { result } = renderFlag(NOT_READY)

    expect(result.current).toBe(true)
  })

  it("lets a dev override force a ready flag off", () => {
    mockUseFlag.mockReturnValue(true)

    act(() => {
      GlobalStore.actions.devMenu.setFeatureFlagOverride({
        name: READY,
        value: false,
      })
    })

    const { result } = renderFlag(READY)

    expect(result.current).toBe(false)
  })

  it("returns false (no throw) when the remote flag is off / unconfigured", () => {
    mockUseFlag.mockReturnValue(false)

    const { result } = renderFlag(READY)

    expect(result.current).toBe(false)
  })
})
