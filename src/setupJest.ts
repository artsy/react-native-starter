import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock"
import "react-native-gesture-handler/jestSetup"
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock"

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage)

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext)

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
)

// reanimated's mock initializes worklets, whose native part is unavailable in
// jest — mock worklets too so palette-mobile/moti components can render.
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/src/mock")
)

jest.mock("react-native-config", () => ({
  __esModule: true,
  default: {
    ARTSY_API_CLIENT_KEY: "test-client-key",
    ARTSY_API_CLIENT_SECRET: "test-client-secret", // pragma: allowlist secret
  },
}))

jest.mock("react-native-device-info", () => ({
  getBuildNumber: () => "1",
  getUserAgentSync: () => "Artsy-Mobile/test",
}))

// Native-backed component: render as a plain host view in tests.
jest.mock("react-native-linear-gradient", () => "LinearGradient")

// Native module: no-op haptics in tests.
jest.mock("react-native-haptic-feedback", () => ({
  __esModule: true,
  default: { trigger: jest.fn() },
  trigger: jest.fn(),
}))
