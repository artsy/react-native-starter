import { Theme } from "@artsy/palette-mobile"
import * as SystemUI from "expo-system-ui"
import { FC, PropsWithChildren, useEffect } from "react"
import { Platform, StatusBar, useColorScheme } from "react-native"

/**
 * Applies the palette-mobile theme based on the OS color scheme and keeps the
 * status bar / Android root background in sync. Follow the system setting for
 * now; swap `useColorScheme()` for a store-backed override if the app needs a
 * manual light/dark toggle later.
 */
export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const isDarkMode = useColorScheme() === "dark"
  const theme = isDarkMode ? "v3dark" : "v3light"

  useEffect(() => {
    if (Platform.OS === "android") {
      void SystemUI.setBackgroundColorAsync(isDarkMode ? "#121212" : "#FFFFFF")
    }
  }, [isDarkMode])

  return (
    <Theme theme={theme}>
      {children}

      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"}
        translucent={false}
      />
    </Theme>
  )
}
