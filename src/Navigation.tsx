import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable"
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useStoreRehydrated } from "easy-peasy"
import { Platform } from "react-native"

import { DevMenuScreen } from "Scenes/DevMenu/DevMenu"
import { HomeScreen } from "Scenes/Home/Home"
import { ExampleListScreen } from "Scenes/List/ExampleList"
import { LoginScreen } from "Scenes/Login/Login"
import { SettingsScreen } from "Scenes/Settings/Settings"
import { GlobalStore } from "store/GlobalStore"

// Auth guards for the static navigator's conditional groups.
const useIsLoggedIn = () =>
  !!GlobalStore.useAppState((store) => store.auth.userAccessToken)
const useIsLoggedOut = () => !useIsLoggedIn()

// Native bottom tabs render a real UITabBarController, so on iOS 26 the system
// draws the "Liquid Glass" floating tab bar (and falls back to the classic
// native bar on older OS versions). Native tabs can't render React-component
// icons, so tab icons are native descriptors: SF Symbols on iOS and PNG image
// sources on Android (rasterized from @artsy/icons in src/assets/images/tabs).
const HomeTabs = createNativeBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    // Minimize the Liquid Glass bar as the user scrolls down (iOS 26+; a no-op
    // on older OS versions).
    tabBarMinimizeBehavior: "onScrollDown",
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: "Home",
        tabBarIcon: Platform.select({
          ios: { type: "sfSymbol", name: "house" } as const,
          android: {
            type: "image",
            source: require("assets/images/tabs/home.png"),
          } as const,
        }),
      },
    },
    List: {
      screen: ExampleListScreen,
      options: {
        title: "List",
        tabBarIcon: Platform.select({
          ios: { type: "sfSymbol", name: "square.grid.2x2" } as const,
          android: {
            type: "image",
            source: require("assets/images/tabs/grid.png"),
          } as const,
        }),
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        title: "Settings",
        tabBarIcon: Platform.select({
          ios: { type: "sfSymbol", name: "gearshape" } as const,
          android: {
            type: "image",
            source: require("assets/images/tabs/settings.png"),
          } as const,
        }),
      },
    },
  },
})

const RootStack = createNativeStackNavigator({
  screenOptions: { headerShown: false, contentStyle: {
    backgroundColor: "#fff"
  } },
  groups: {
    SignedIn: {
      if: useIsLoggedIn,
      screens: {
        Home: HomeTabs,
        // Developer-only screen for feature-flag overrides. The entry point in
        // Settings is gated on `__DEV__`, but the route is always registered so
        // the static param list stays stable.
        DevMenu: {
          screen: DevMenuScreen,
          options: { headerShown: true, title: "Dev Menu" },
        },
      },
    },
    SignedOut: {
      if: useIsLoggedOut,
      screens: {
        Login: LoginScreen,
      },
    },
  },
})

// Register the param list globally so `useNavigation()` is typed everywhere.
// react-navigation's sanctioned pattern requires a global namespace here.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // Must stay an interface (not a type alias) so it merges with react-navigation's
    // RootParamList; an empty-extends interface is the sanctioned pattern here.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends StaticParamList<typeof RootStack> {}
  }
}

const Navigation = createStaticNavigation(RootStack)

/**
 * Root navigation entry point. Waits for the persisted store to rehydrate so
 * the auth guards resolve to the right group on first render.
 */
export const Main = () => {
  const isRehydrated = useStoreRehydrated()

  if (!isRehydrated) {
    return null
  }

  return <Navigation />
}
