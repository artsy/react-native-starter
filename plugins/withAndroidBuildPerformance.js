// plugins/withAndroidBuildPerformance.js
//
// Local Expo config plugin — Android native build performance tuning.
//
// This mirrors Energy/Folio's approach of driving `gradle.properties` from a
// config plugin (rather than hand-editing generated native files, which the
// prebuild/CNG workflow throws away). It does three things:
//
//   1. Tunes `gradle.properties` for faster builds (JVM heap/metaspace,
//      parallel execution, build cache, configuration cache).
//   2. Optionally restricts the build to a single ABI for local dev, gated
//      behind the `RN_DEV_SINGLE_ABI` env var so CI/release keep all ABIs.
//   3. Disables the slow per-library `lintVital` analysis in release builds.
//
// Registered in app.json's `plugins` array as
// "./plugins/withAndroidBuildPerformance.js".
//
// ⚠️  Configuration-cache caveat: `org.gradle.configuration-cache=true` is the
// biggest incremental win but can be incompatible with some React Native /
// Expo Gradle plugins. If a build fails with a configuration-cache error, drop
// (or set to false) the single `org.gradle.configuration-cache` line below.

const { withGradleProperties, withAppBuildGradle } = require("expo/config-plugins")

// gradle.properties we want to enforce: created if absent, replaced if present.
const GRADLE_PROPERTIES = {
  // Give the Gradle daemon a larger heap and metaspace. Our agent-device e2e
  // Android build literally hit "Daemon will be stopped after running out of
  // JVM Metaspace" at the default 512m — 1024m of metaspace fixes it.
  "org.gradle.jvmargs": "-Xmx4096m -XX:MaxMetaspaceSize=1024m",
  // Build independent modules in parallel.
  "org.gradle.parallel": "true",
  // Reuse task outputs across builds (local Gradle build cache).
  "org.gradle.caching": "true",
  // Configuration cache — biggest incremental win. See caveat in the header:
  // if a build fails with a configuration-cache error, drop this one line.
  "org.gradle.configuration-cache": "true",
}

function setGradleProperty(modResults, key, value) {
  const idx = modResults.findIndex(
    (item) => item.type === "property" && item.key === key
  )
  const entry = { type: "property", key, value }
  if (idx >= 0) {
    modResults.splice(idx, 1, entry)
  } else {
    modResults.push(entry)
  }
}

const withGradlePropertiesTuning = (config) =>
  withGradleProperties(config, (cfg) => {
    Object.entries(GRADLE_PROPERTIES).forEach(([key, value]) => {
      setGradleProperty(cfg.modResults, key, value)
    })

    // Opt-in single-ABI local dev build. Export ONE of:
    //   RN_DEV_SINGLE_ABI=arm64-v8a   # physical Android device
    //   RN_DEV_SINGLE_ABI=x86_64      # Android emulator
    // to compile native code for a single architecture (~4x faster local
    // native compile). Intentionally env-gated so CI/release builds — which
    // must ship all ABIs — are never affected.
    const singleAbi = process.env.RN_DEV_SINGLE_ABI
    if (singleAbi) {
      setGradleProperty(cfg.modResults, "reactNativeArchitectures", singleAbi)
    }

    return cfg
  })

// Skip the per-library `:<lib>:lintVitalAnalyzeRelease` tasks that run during
// release builds. AGP 8 DSL: `android { lint { checkReleaseBuilds false } }`.
// A second top-level `android {}` block is valid — Gradle applies every
// closure to the same Android extension.
const LINT_BLOCK = `
// Added by ./plugins/withAndroidBuildPerformance.js — skip the slow
// per-library lintVital analysis that otherwise runs on every release build.
android {
    lint {
        checkReleaseBuilds false
    }
}
`

const withReleaseLintDisabled = (config) =>
  withAppBuildGradle(config, (cfg) => {
    // Only the Groovy template is supported; bail out safely otherwise.
    if (cfg.modResults.language !== "groovy") {
      return cfg
    }
    if (!cfg.modResults.contents.includes("checkReleaseBuilds false")) {
      cfg.modResults.contents += `\n${LINT_BLOCK}\n`
    }
    return cfg
  })

const withAndroidBuildPerformance = (config) => {
  config = withGradlePropertiesTuning(config)
  config = withReleaseLintDisabled(config)
  return config
}

module.exports = withAndroidBuildPerformance
