import { GridIcon, HomeIcon, SettingsIcon } from "@artsy/icons/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useStoreRehydrated } from "easy-peasy"

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

// Tab icons come from @artsy/icons (native entrypoint). Each icon takes a
// `fill` prop that accepts a palette color token or a raw color, so the
// `color` React Navigation passes for the active/inactive state works directly.
const HomeTabs = createBottomTabNavigator({
  screenOptions: { headerShown: false },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: "Home",
        tabBarIcon: ({ color }) => <HomeIcon fill={color} />,
      },
    },
    List: {
      screen: ExampleListScreen,
      options: {
        title: "List",
        tabBarIcon: ({ color }) => <GridIcon fill={color} />,
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        title: "Settings",
        tabBarIcon: ({ color }) => <SettingsIcon fill={color} />,
      },
    },
  },
})

const RootStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
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
