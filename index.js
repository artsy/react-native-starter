import "react-native-gesture-handler"
import "react-native-get-random-values"

import { registerRootComponent } from "expo"

import { App } from "./src/App"

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and sets up the environment appropriately for both Expo Go and native builds.
registerRootComponent(App)
