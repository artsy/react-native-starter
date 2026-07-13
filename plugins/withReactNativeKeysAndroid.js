// plugins/withReactNativeKeysAndroid.js
//
// Local Expo config plugin — wire react-native-keys into the Android build.
//
// WHY THIS EXISTS
// react-native-keys ships its own Android config plugin, but on React Native
// 0.85 it silently does nothing. Its injector
// (react-native-keys/plugin/build/android/buildscriptDependency.js) only adds
// the Gradle wiring *after* a line matching `def enableProguardInReleaseBuilds`.
// RN 0.80+ renamed that variable to `def enableMinifyInReleaseBuilds`, so the
// anchor is never found, the injection is skipped, `apply from … RNKeys.gradle`
// never lands in android/app/build.gradle, `keysAndroid.js` never runs, and
// `PrivateKey.java` keeps its install-time placeholder — so
// `Keys.secureFor("ARTSY_API_CLIENT_KEY")` decrypts to an empty string on
// Android. (iOS is unaffected: it is wired through an Xcode scheme pre-action.)
//
// This plugin injects the exact same three lines the upstream plugin would,
// anchored to the RN 0.85 variable name (with fallbacks). RNKeys.gradle runs
// `loadKeys()` at Gradle configuration time, so once these lines are present a
// normal build regenerates PrivateKey.java + the cpp headers from
// keys.development.json.
//
// Registered in app.json's `plugins` array as
// "./plugins/withReactNativeKeysAndroid.js", after "react-native-keys".

const { withAppBuildGradle } = require("expo/config-plugins")

// Which keys file the Android build reads. Mirrors the upstream plugin's
// default (a single file for all build types). keys.development.json is the
// debug file; release uses the same secure values in this template.
const DEFAULT_KEY_FILE = "keys.development.json"

// The block the upstream react-native-keys plugin injects. `project.ext.*` must
// be set before `apply from … RNKeys.gradle`, because RNKeys.gradle reads
// project.ext.DEFAULT_FILE_NAME during configuration.
const KEYS_BLOCK = `
// Added by ./plugins/withReactNativeKeysAndroid.js — react-native-keys' own
// Android plugin no-ops on RN 0.85 (it anchors to the removed
// \`enableProguardInReleaseBuilds\`). This wires key generation back in.
project.ext.IS_EXAMPLE = false;
project.ext.DEFAULT_FILE_NAME = "${DEFAULT_KEY_FILE}"
apply from: project(':react-native-keys').projectDir.getPath() + "/RNKeys.gradle"
`

// Anchors to insert after, most-preferred first. RN 0.85 uses
// `enableMinifyInReleaseBuilds`; older templates use the proguard name; the
// apply-plugin line is a last resort that always exists.
const ANCHORS = [
  /def enableMinifyInReleaseBuilds.+/,
  /def enableProguardInReleaseBuilds.+/,
  /apply plugin: "com\.facebook\.react"/,
]

function injectKeysWiring(contents) {
  // Idempotent: if the wiring is already present (ours, or upstream started
  // working), just make sure it points at the right file and bail.
  if (contents.includes("apply from: project(':react-native-keys')")) {
    return contents.replace(
      /(project\.ext\.DEFAULT_FILE_NAME\s*=\s*").*?"/,
      `$1${DEFAULT_KEY_FILE}"`
    )
  }

  for (const anchor of ANCHORS) {
    const match = contents.match(anchor)
    if (match) {
      return contents.replace(match[0], `${match[0]}\n${KEYS_BLOCK}`)
    }
  }

  throw new Error(
    "[withReactNativeKeysAndroid] Could not find an anchor in " +
      "android/app/build.gradle to inject the react-native-keys wiring. " +
      "The build.gradle template changed — update ANCHORS in " +
      "plugins/withReactNativeKeysAndroid.js."
  )
}

const withReactNativeKeysAndroid = (config) =>
  withAppBuildGradle(config, (cfg) => {
    // Only the Groovy template is supported; bail out safely otherwise.
    if (cfg.modResults.language !== "groovy") {
      return cfg
    }
    cfg.modResults.contents = injectKeysWiring(cfg.modResults.contents)
    return cfg
  })

module.exports = withReactNativeKeysAndroid
