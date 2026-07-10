import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock"
import "react-native-gesture-handler/jestSetup"
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock"

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage)

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext)

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
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
