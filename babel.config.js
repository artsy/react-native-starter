const presets = [
  [
    "babel-preset-expo",
    { jsxRuntime: "classic" }, // this is so `import React from "react"` is not needed.
  ],
  "@babel/preset-typescript",
  ["@babel/preset-react", { runtime: "automatic" }], // this is so `import React from "react"` is not needed.
]

const plugins = [
  // The relay plugin should run before other plugins or presets
  // to ensure the graphql template literals are correctly transformed
  "relay",
  "@babel/plugin-transform-named-capturing-groups-regex",
  ["@babel/plugin-proposal-decorators", { version: "legacy" }],
  [
    "module-resolver",
    {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      root: ["./src"],
    },
  ],
  // This has to be listed last according to the documentation.
  // https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/#babel-plugin
  "react-native-worklets/plugin",
]

if (process.env.CI) {
  // When running a bundled app, these statements can cause a big bottleneck in the JavaScript thread.
  // This includes calls from debugging libraries and logs we might forget to remove
  plugins.push("transform-remove-console")
}

module.exports = { presets, plugins }
