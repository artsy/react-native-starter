import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock"
import "react-native-gesture-handler/jestSetup"
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock"

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage)

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext)

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  wrap: (component: unknown) => component,
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}))

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
)

// reanimated's mock initializes worklets, whose native part is unavailable in
// jest — mock worklets too so palette-mobile/moti components can render.
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/src/mock")
)

jest.mock("react-native-keys", () => ({
  __esModule: true,
  default: {
    OSS: "true",
    secureFor: (key: string) => `test-${key}`,
  },
}))

jest.mock("@unleash/proxy-client-react", () => ({
  FlagProvider: ({ children }: { children: unknown }) => children,
  useFlag: () => false,
  useFlagsStatus: () => ({ flagsReady: true, flagsError: null }),
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

// palette-mobile peers that hit native code — stub with plain RN components.
jest.mock("react-native-blurhash", () => {
  const ReactNative = require("react-native")
  return { Blurhash: ReactNative.View }
})

jest.mock("react-native-collapsible-tab-view", () => {
  const ReactNative = require("react-native")
  return {
    Tabs: {
      Container: ReactNative.View,
      FlatList: ReactNative.FlatList,
      FlashList: ReactNative.FlatList,
      Lazy: ReactNative.View,
      ScrollView: ReactNative.ScrollView,
      Tab: ReactNative.View,
      MasonryFlashList: ReactNative.FlatList,
    },
    useCurrentTabScrollY: () => ({ value: 0 }),
    useFocusedTab: () => "SomeFocusedTab",
    useHeaderMeasurements: () => ({ height: { value: 0 }, top: { value: 0 } }),
    useTabNameContext: () => "Tab",
  }
})
