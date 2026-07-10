import { ScreenDimensionsProvider } from "@artsy/palette-mobile"
import * as Sentry from "@sentry/react-native"
import { ReactNode } from "react"
import { LogBox } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { RelayEnvironmentProvider } from "react-relay"
import { Main } from "Navigation"
import { defaultEnvironment } from "relay/defaultEnvironent"
import { setupSentry } from "system/devTools/sentrySetup"
import { ThemeProvider } from "system/providers/ThemeProvider"
import { GlobalRetryErrorBoundary } from "system/wrappers/RetryErrorBoundary"
import { SuspenseWrapper } from "system/wrappers/SuspenseWrapper"
import { GlobalStoreProvider } from "store/GlobalStore"

LogBox.ignoreLogs(["Expected style "])

setupSentry()

const AppProviders = ({ children }: { children: ReactNode }) => (
  <RelayEnvironmentProvider environment={defaultEnvironment}>
    <SafeAreaProvider>
      <ScreenDimensionsProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GlobalRetryErrorBoundary>
              <SuspenseWrapper>{children}</SuspenseWrapper>
            </GlobalRetryErrorBoundary>
          </GestureHandlerRootView>
        </ThemeProvider>
      </ScreenDimensionsProvider>
    </SafeAreaProvider>
  </RelayEnvironmentProvider>
)

export const App = Sentry.wrap(() => {
  return (
    <GlobalStoreProvider>
      <AppProviders>
        <Main />
      </AppProviders>
    </GlobalStoreProvider>
  )
})
