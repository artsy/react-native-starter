import { Flex } from "@artsy/palette-mobile"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useStoreRehydrated } from "easy-peasy"
import { HomeScreen } from "Scenes/Home/Home"
import { ExampleListScreen } from "Scenes/List/ExampleList"
import { LoginScreen } from "Scenes/Login/Login"
import { SettingsScreen } from "Scenes/Settings/Settings"
import { GlobalStore } from "store/GlobalStore"

// Auth guards for the static navigator's conditional groups.
const useIsLoggedIn = () =>
  !!GlobalStore.useAppState((store) => store.auth.userAccessToken)
const useIsLoggedOut = () => !useIsLoggedIn()

// Simple dot indicator so the tabs render without pulling in an icon set.
// Swap for real icons (e.g. @artsy/icons) when building out the app.
const TabDot = ({ color }: { color: string }) => (
  <Flex width={6} height={6} borderRadius={3} backgroundColor={color} />
)

const HomeTabs = createBottomTabNavigator({
  screenOptions: { headerShown: false },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: "Home",
        tabBarIcon: ({ color }) => <TabDot color={color} />,
      },
    },
    List: {
      screen: ExampleListScreen,
      options: {
        title: "List",
        tabBarIcon: ({ color }) => <TabDot color={color} />,
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        title: "Settings",
        tabBarIcon: ({ color }) => <TabDot color={color} />,
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
