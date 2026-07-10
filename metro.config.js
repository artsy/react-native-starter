// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

// getSentryExpoConfig wraps Expo's default Metro config and adds Sentry's
// source-map upload support.
module.exports = getSentryExpoConfig(__dirname)
