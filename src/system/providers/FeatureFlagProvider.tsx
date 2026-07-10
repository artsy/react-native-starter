import AsyncStorage from "@react-native-async-storage/async-storage"
import { FlagProvider } from "@unleash/proxy-client-react"
import { FC, PropsWithChildren } from "react"
import { GlobalStore } from "store/GlobalStore"

// Configure via env to enable Unleash (left unset in the template so a fresh app
// boots without feature-flag credentials). Read flags with `useFlag` from
// @unleash/proxy-client-react once configured.
const UNLEASH_URL = process.env.EXPO_PUBLIC_UNLEASH_URL
const UNLEASH_CLIENT_KEY = process.env.EXPO_PUBLIC_UNLEASH_CLIENT_KEY

const storageName = (name: string) => `unleash:${name}`

export const FeatureFlagProvider: FC<PropsWithChildren> = ({ children }) => {
  const userId = GlobalStore.useAppState(
    (state) => state.auth.userID ?? undefined
  )

  // Not configured — no-op passthrough so the starter runs without Unleash.
  if (!UNLEASH_URL || !UNLEASH_CLIENT_KEY) {
    return <>{children}</>
  }

  return (
    <FlagProvider
      config={{
        appName: "react-native-starter",
        url: UNLEASH_URL,
        clientKey: UNLEASH_CLIENT_KEY,
        context: { userId },
        // Manual refresh only (e.g. when the app returns to the foreground).
        refreshInterval: 0,
        storageProvider: {
          save: async (name, data) =>
            AsyncStorage.setItem(storageName(name), JSON.stringify(data)),
          get: async (name) => {
            const data = await AsyncStorage.getItem(storageName(name))
            return data ? JSON.parse(data) : undefined
          },
        },
      }}
    >
      {children}
    </FlagProvider>
  )
}
