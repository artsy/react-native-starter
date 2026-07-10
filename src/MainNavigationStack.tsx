import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useStoreRehydrated } from "easy-peasy"
import { HomeTabs } from "Scenes/Home/HomeTabs"
import { LoginScreen } from "Scenes/Login/Login"
import { GlobalStore } from "store/GlobalStore"

export type MainNavigationStack = {
  Home: undefined
  Login: undefined
}

const Stack = createNativeStackNavigator<MainNavigationStack>()

export const MainNavigationStack = () => {
  const isRehydrated = useStoreRehydrated()
  const isLoggedIn = !!GlobalStore.useAppState(
    (store) => store.auth.userAccessToken
  )

  if (!isRehydrated) {
    return null
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Home" component={HomeTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}
