const OFF = "off"
const ERR = "error"

module.exports = {
  root: true,
  plugins: [
    "@typescript-eslint",
    "jest",
    "no-relative-import-paths",
    "react-hooks",
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
    "import/order": [
      ERR,
      {
        alphabetize: { order: "asc" },
        groups: [
          "builtin",
          "external",
          "internal",
          "index",
          "sibling",
          "parent",
          "object",
          "type",
        ],
      },
    ],
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

    /**
     * Disabled
     */

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
