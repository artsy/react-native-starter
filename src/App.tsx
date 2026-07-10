import { ScreenDimensionsProvider } from "@artsy/palette-mobile"
import { NavigationContainer } from "@react-navigation/native"
import { ReactNode } from "react"
import { LogBox } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { RelayEnvironmentProvider } from "react-relay"
import { MainNavigationStack } from "MainNavigationStack"
import { defaultEnvironment } from "relay/defaultEnvironent"
import { ThemeProvider } from "system/providers/ThemeProvider"
import { GlobalStoreProvider } from "store/GlobalStore"

LogBox.ignoreLogs(["Expected style "])

const AppProviders = ({ children }: { children: ReactNode }) => (
  <RelayEnvironmentProvider environment={defaultEnvironment}>
    <SafeAreaProvider>
      <ScreenDimensionsProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>{children}</NavigationContainer>
          </GestureHandlerRootView>
        </ThemeProvider>
      </ScreenDimensionsProvider>
    </SafeAreaProvider>
  </RelayEnvironmentProvider>
)

export const App = () => {
  return (
    <GlobalStoreProvider>
      <AppProviders>
        <MainNavigationStack />
      </AppProviders>
    </GlobalStoreProvider>
  )
}
