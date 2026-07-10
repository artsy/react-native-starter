import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  createStore,
  createTypedHooks,
  persist,
  StoreProvider,
} from "easy-peasy"
import { FC, PropsWithChildren } from "react"
import { Platform } from "react-native"

import { GlobalStoreModel } from "store/Models/GlobalStoreModel"

// Bump on every change to a store Model's shape. v1 added the `devMenu` slice
// (feature-flag overrides + anonymous stickiness id). This repo has no migration
// runner yet, so a version bump resets persisted state to the new default shape.
const STORE_VERSION = 1

if (Platform.OS === "ios") {
  // @ts-ignore
  window.requestIdleCallback = null
}

const asynchStorage = {
  async getItem(key: string) {
    try {
      const res = await AsyncStorage.getItem(key)
      if (res) {
        return JSON.parse(res)
      }
    } catch (error) {
      throw error
    }
  },
  async setItem(key: string, data: string) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      throw error
    }
  },
  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      throw error
    }
  },
}

function createGlobalStore() {
  const store = createStore<GlobalStoreModel>(
    persist(GlobalStoreModel, {
      storage: asynchStorage,
    }),
    {
      name: "GlobalStore",
      version: STORE_VERSION,
      devTools: __DEV__,
    }
  )
  return store
}

const globalStoreInstance = createGlobalStore()

const hooks = createTypedHooks<GlobalStoreModel>()

export const GlobalStore = {
  useAppState: hooks.useStoreState,
  get actions() {
    return globalStoreInstance.getActions()
  },
}

export const GlobalStoreProvider: FC<PropsWithChildren> = ({ children }) => {
  return <StoreProvider store={globalStoreInstance}>{children}</StoreProvider>
}

/**
 * This is marked as unsafe because it will not cause a re-render
 */
export function unsafe__getEnvironment() {
  return { ...globalStoreInstance.getState().config.environment }
}

/**
 * This is marked as unsafe because it will not cause a re-render
 */
export function unsafe__getAuth() {
  return { ...globalStoreInstance.getState().auth }
}
