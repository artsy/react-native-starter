---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: React Native Starter
  text: Artsy's starter template for new React Native apps
  tagline: An Expo-managed project that mirrors the stack and conventions of Artsy's production apps (Eigen and Energy/Folio), so a new app can be spun up ready to build.
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: Configuration
      link: /configuration
    - theme: alt
      text: View on GitHub
      link: https://github.com/artsy/react-native-starter

features:
  - title: Expo + Prebuild (CNG)
    details: React Native via the Expo managed workflow. Native ios/ and android/ folders are generated from app.json — never committed, never hand-edited.
  - title: TypeScript, strict
    details: Strict-mode TypeScript with absolute imports from src/. Relay compiler runs as part of the type-check.
  - title: Relay + Metaphysics
    details: Relay 20 wired to Artsy's GraphQL API with co-located fragments and hooks (useLazyLoadQuery, useFragment).
  - title: Palette design system
    details: UI primitives from @artsy/palette-mobile (Flex, Text, Button, Input, Theme) — no re-implementing the basics.
  - title: State + persistence
    details: Global state with easy-peasy, persisted through async-storage with versioned migrations.
  - title: Batteries included
    details: React Navigation (static API), Sentry, Unleash feature flags, Formik, and Jest + @testing-library/react-native.
---
