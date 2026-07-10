import { ScreenDimensionsProvider, Theme } from "@artsy/palette-mobile"
import { render } from "@testing-library/react-native"
import { ReactElement, ReactNode } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"

/**
 * The provider tree used in tests. Mirrors the non-navigation providers from
 * `src/App.tsx` so components that rely on palette-mobile theming, screen
 * dimensions, or safe-area insets render correctly under test.
 */
const TestProviders = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider>
    <ScreenDimensionsProvider>
      <Theme>{children}</Theme>
    </ScreenDimensionsProvider>
  </SafeAreaProvider>
)

/**
 * Renders a component wrapped in the app's providers using
 * `@testing-library/react-native`.
 *
 * IMPORTANT: this is for **non-Relay** components. For components that fetch
 * data with Relay, use `setupTestWrapper` instead.
 */
export const renderWithWrappers = (component: ReactElement) => {
  return render(component, { wrapper: TestProviders })
}
