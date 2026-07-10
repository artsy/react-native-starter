import AsyncStorage from "@react-native-async-storage/async-storage"
import { FlagProvider } from "@unleash/proxy-client-react"
import { FC, PropsWithChildren, useEffect } from "react"
import { getBuildNumber } from "react-native-device-info"
import { IConfig } from "unleash-proxy-client"

import { GlobalStore } from "store/GlobalStore"

import packageJson from "../../../package.json"

// Configure via env to enable Unleash (left unset in the template so a fresh app
// boots without feature-flag credentials). Read flags through `useFeatureFlag`
// (system/featureFlags) rather than `useFlag` directly, so build-time gating and
// dev overrides are applied.
const UNLEASH_URL = process.env.EXPO_PUBLIC_UNLEASH_URL
const UNLEASH_CLIENT_KEY = process.env.EXPO_PUBLIC_UNLEASH_CLIENT_KEY

const IS_CONFIGURED = !!UNLEASH_URL && !!UNLEASH_CLIENT_KEY

const storageName = (name: string) => `unleash:${name}`

/**
 * Always mounts an Unleash `FlagProvider` so `useFlag` (and therefore
 * `useFeatureFlag`) has a context and never throws — even in the default
 * template state where no Unleash env is set.
 *
 * When unconfigured we pass `startClient={false}` and an empty `bootstrap`, so
 * the client makes NO network requests and every flag resolves to `false`.
 *
 * The Unleash `context` carries:
 *   - `userId`     — the signed-in user (targeting / per-user rollout).
 *   - `sessionId`  — a persisted anonymous id for sticky rollouts, and the seam
 *                    for future A/B variants (kept sticky per install).
 *   - `properties.appVersion` / `properties.buildNumber` — enable server-side
 *     VERSION GATING. Pair a flag with a strategy constraint such as
 *     `appVersion SEMVER_GTE 3.1.0` so a flag can only ever activate in builds at
 *     or above the version where the feature landed. This mirrors the compiled-in
 *     `readyForRelease` gate on the server side.
 */
export const FeatureFlagProvider: FC<PropsWithChildren> = ({ children }) => {
  const userId = GlobalStore.useAppState(
    (state) => state.auth.userID ?? undefined
  )
  const sessionId = GlobalStore.useAppState((state) => state.devMenu.sessionId)

  // Generate the anonymous stickiness id once, then persist it.
  useEffect(() => {
    GlobalStore.actions.devMenu.ensureSessionId()
  }, [])

  const config: IConfig = {
    appName: "react-native-starter",
    // Placeholder url/clientKey are harmless when `startClient` is false — no
    // request is ever made in the unconfigured case.
    url: UNLEASH_URL ?? "https://unleash.invalid/proxy",
    clientKey: UNLEASH_CLIENT_KEY ?? "unconfigured",
    // Manual refresh only (e.g. when the app returns to the foreground).
    refreshInterval: 0,
    context: {
      userId,
      sessionId: sessionId || undefined,
      properties: {
        appVersion: packageJson.version,
        buildNumber: String(getBuildNumber()),
      },
    },
    // Empty bootstrap ⇒ everything is `false` until the real client fetches.
    ...(IS_CONFIGURED ? {} : { bootstrap: [] }),
    storageProvider: {
      save: async (name, data) =>
        AsyncStorage.setItem(storageName(name), JSON.stringify(data)),
      get: async (name) => {
        const data = await AsyncStorage.getItem(storageName(name))
        return data ? JSON.parse(data) : undefined
      },
    },
  }

  return (
    <FlagProvider config={config} startClient={IS_CONFIGURED}>
      {children}
    </FlagProvider>
  )
}
