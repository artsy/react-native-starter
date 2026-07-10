module.exports = {
  moduleFileExtensions: ["ts", "tsx", "js"],
  setupFilesAfterEnv: ["jest-extended/all", "./src/setupJest.ts"],
  preset: "jest-expo",

  // Co-located test files use the `*.tests.tsx` / `*.test.ts` convention
  // (see AGENTS.md), which the jest-expo default `testMatch` does not pick up.
  testMatch: ["**/*.tests.{ts,tsx}", "**/*.test.{ts,tsx}"],

  // Don't fail branches that legitimately have no tests (e.g. docs-only PRs).
  passWithNoTests: true,

  // See: https://docs.expo.dev/develop/unit-testing/#installation-and-configuration
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg|@artsy/palette-mobile|moti|@motify/.*|@d11/.*)",
  ],
}
