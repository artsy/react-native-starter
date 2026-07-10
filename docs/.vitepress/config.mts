import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "React Native Starter",
  description:
    "Artsy's starter template for new React Native apps — an Expo-managed project mirroring the conventions of Artsy's production apps.",

  // Project site on GitHub Pages: https://artsy.github.io/react-native-starter/
  base: "/react-native-starter/",

  // Keep repo-only markdown (PR template, legacy env notes) out of the site
  // build and navigation. These files stay in the repo for CI/tooling.
  srcExclude: [
    "pull_request_template.md",
    "environment_variables_configuration.md",
  ],

  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Configuration", link: "/configuration" },
      { text: "Architecture", link: "/architecture" },
      { text: "Testing", link: "/testing" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Configuration", link: "/configuration" },
          { text: "Architecture", link: "/architecture" },
          { text: "Testing", link: "/testing" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/artsy/react-native-starter",
      },
    ],

    editLink: {
      pattern:
        "https://github.com/artsy/react-native-starter/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "An Artsy Open Source project.",
    },
  },
})
