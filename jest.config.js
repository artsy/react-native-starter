module.exports = {
  moduleFileExtensions: ["ts", "tsx", "js"],
  setupFilesAfterEnv: ["jest-extended/all", "./src/setupJest.ts"],
  preset: "jest-expo",

  // See: https://docs.expo.dev/develop/unit-testing/#installation-and-configuration
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg|@artsy/palette-mobile)",
  ],
}
