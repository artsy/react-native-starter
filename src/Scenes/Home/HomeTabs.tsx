import { Flex } from "@artsy/palette-mobile"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { HomeScreen } from "Scenes/Home/Home"
import { SettingsScreen } from "Scenes/Settings/Settings"

export type HomeTabsParamList = {
  HomeTab: undefined
  SettingsTab: undefined
}

const Tab = createBottomTabNavigator<HomeTabsParamList>()

// Simple dot indicator so the tabs render without pulling in an icon set.
// Swap for real icons (e.g. @artsy/icons) when building out the app.
const TabDot = ({ color }: { color: string }) => (
  <Flex width={6} height={6} borderRadius={3} backgroundColor={color} />
)

export const HomeTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
