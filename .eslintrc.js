const OFF = "off"
const ERR = "error"

module.exports = {
  root: true,
  plugins: [
    "@typescript-eslint",
    "jest",
    "no-relative-import-paths",
    "react-hooks",
    "react-native-a11y",
    "simple-import-sort",
    "testing-library",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:testing-library/react",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "prettier", // "prettier" needs to be last!
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 6,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    /**
     * Errors
     */

    "@typescript-eslint/no-unused-vars": [
      ERR,
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    // Import ordering is handled by `simple-import-sort` (auto-fixable),
    // so the `import/order` rule is disabled below to avoid the two fighting.
    "simple-import-sort/imports": [
      ERR,
      {
        groups: [
          // Side-effect imports (e.g. `import "./setup"`).
          ["^\\u0000"],
          // Node.js builtins.
          ["^node:"],
          // External packages (npm modules, including scoped `@artsy/...`).
          ["^@?\\w"],
          // Absolute imports from `src/` (module-resolver root). These start
          // with a letter too, but win via longest-match over the packages
          // group above.
          [
            "^(App|Navigation|Scenes|assets|helpers|relay|store|system|utils|__generated__|setupJest)(/.*|$)",
          ],
          // Any other absolute imports not matched above.
          ["^"],
          // Relative imports (same folder / parent).
          ["^\\."],
        ],
      },
    ],
    "simple-import-sort/exports": ERR,
    "import/no-duplicates": ERR,
    "react/jsx-curly-brace-presence": ERR,
    "react-hooks/rules-of-hooks": ERR,

    /**
     * Warnings
     */

    "no-relative-import-paths/no-relative-import-paths": [
      "warn",
      { allowSameFolder: true, rootDir: "src" },
    ],

    // Accessibility guidance (react-native-a11y). Kept at "warn" so they guide
    // authors of new/interactive components without hard-failing CI on the
    // existing codebase. Add `accessibilityLabel`/`accessibilityRole` (and a
    // hint where useful) to interactive elements to satisfy these.
    "react-native-a11y/has-accessibility-hint": "warn",
    "react-native-a11y/has-accessibility-props": "warn",
    "react-native-a11y/has-valid-accessibility-role": "warn",
    "react-native-a11y/has-valid-accessibility-state": "warn",
    "react-native-a11y/no-nested-touchables": "warn",

    /**
     * Disabled
     */

    // Superseded by `simple-import-sort/imports` above.
    "import/order": OFF,

    "@typescript-eslint/ban-ts-comment": OFF,
    "@typescript-eslint/ban-types": OFF,
    "@typescript-eslint/explicit-module-boundary-types": OFF,
    "@typescript-eslint/no-empty-function": OFF,
    "@typescript-eslint/no-explicit-any": OFF,
    "@typescript-eslint/no-non-null-assertion": OFF,
    "@typescript-eslint/no-var-requires": OFF,
    "import/default": OFF,
    "import/namespace": OFF,
    "import/no-named-as-default-member": OFF,
    "import/no-named-as-default": OFF,
    "import/no-unresolved": OFF,
    "no-control-regex": OFF,
    "no-empty-pattern": OFF,
    "no-extra-boolean-cast": OFF,
    "no-redeclare": OFF,
    "no-undef": OFF,
    "no-useless-catch": OFF,
    "no-useless-escape": OFF,
    "react-hooks/exhaustive-deps": OFF,
    "react/react-in-jsx-scope": OFF,
  },
}
