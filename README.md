### Meta

- **Point People:** [Mounir Dhahri](https://github.com/MounirDhahri)

This is an [Artsy](https://github.com/artsy) OSS project.

Don't know what Artsy is? Check out [this overview](https://github.com/artsy/meta/blob/master/meta/what_is_artsy.md) and [more](https://github.com/artsy/meta/blob/master/README.md), or read our objc.io on [team culture](https://www.objc.io/issues/22-scale/artsy).

Want to know more about Eigen: our Artsy Mobile? Check it out [here](https://github.com/artsy), read the [mobile](http://artsy.github.io/blog/categories/mobile/) blog posts, or [eigen's](http://artsy.github.io/blog/categories/eigen/) specifically.

### Start a new project from this template

This repo is a **GitHub template**, so you can spin up your own app from it:

1. **Get a copy** — click **“Use this template” → Create a new repository** (clean
   history). Or without GitHub: `npx degit artsy/react-native-starter my-app`, or
   fork/clone.
2. **Set up & install** — outside Artsy run `yarn setup:oss` (placeholder fonts +
   `keys.{development,production}.json`, no private access needed), then
   `yarn install`. Artsy engineers run `yarn setup:artsy` instead. Fill in your own
   key values (real `keys*.json` are gitignored).
3. **Rebrand** — edit `app.json` (`name`, `slug`, iOS `bundleIdentifier`, Android
   `package`, icons/splash). Don't hand-edit the generated `ios/`/`android/` folders.
4. **Point at your backend** — swap `data/schema.graphql` for your GraphQL API
   (`yarn sync-schema`) and replace the sample screens in `src/Scenes/`.
5. **Generate native projects & run** — `yarn prebuild`, then `yarn ios` / `yarn android`.

See the [Getting Started guide](https://artsy.github.io/react-native-starter/getting-started)
for details.

### Getting Started

This project uses **Expo** with the **prebuild** (CNG) workflow. The native
`ios/` and `android/` folders are **not** committed — they are generated on
demand from `app.json` and the installed native dependencies.

**For Artsy Engineers**

```sh
# 1. Install the pinned toolchain (node, ruby, java, yarn)
mise install # or `asdf install`

# 2. Download fonts + environment variables and install dependencies
yarn setup:artsy
yarn install

# 3. Generate the native projects
yarn prebuild

# 4. Run the app
yarn ios        # or: yarn android
```

**For OSS Contributors**

```sh
# 1. Install the pinned toolchain (node, ruby, java, yarn)
mise install # or `asdf install`

# 2. Set up placeholder fonts + keys files (no Artsy/S3 access needed), then install
yarn setup:oss
yarn install

# 3. Generate the native projects
yarn prebuild

# 4. Run the app
yarn ios        # or: yarn android
```

`yarn setup:oss` writes **empty placeholder** `Unica77LL` fonts into
`assets/fonts` (the real fonts are Artsy-private — text falls back to the system
font; drop your own `.otf` files there to change it) and creates
`keys.development.json` + `keys.production.json` from `keys.example.json`. So you
**don't** need to source `assets/fonts/Unica77LL-*.otf` yourself.

## Features

- **Expo** managed workflow with **prebuild** — no committed native folders
- **TypeScript** in strict mode 💜
- Artsy design system via **[@artsy/palette-mobile](https://github.com/artsy/palette)**
- **React Navigation** boilerplate ready to be extended
- **Relay 20** integrated (co-located fragments + Relay compiler)
- Global store management and state persistence with **easy-peasy**
- Functional **Login** screen already available
- ESLint + Prettier, and Jest via **jest-expo** / `@testing-library/react-native`

## Documentation

📖 **[artsy.github.io/react-native-starter](https://artsy.github.io/react-native-starter/)** — full docs (VitePress).

- [Getting Started](https://artsy.github.io/react-native-starter/getting-started)
- [Configuration](https://artsy.github.io/react-native-starter/configuration)
- [Feature Flags](https://artsy.github.io/react-native-starter/feature-flags)
- [Architecture](https://artsy.github.io/react-native-starter/architecture)
- [Testing](https://artsy.github.io/react-native-starter/testing) · [E2E Testing](https://artsy.github.io/react-native-starter/e2e-testing)

The site is built from `docs/` and deployed to GitHub Pages on every push to
`main` (`yarn docs:dev` to preview locally).

## Common Commands

```sh
yarn start          # Metro + Relay compiler
yarn ios            # Prebuild + run on iOS
yarn android        # Prebuild + run on Android
yarn prebuild       # Regenerate native ios/ and android/ folders
yarn test           # Jest
yarn type-check     # Relay compile + tsc
yarn lint           # ESLint (auto-fix)
yarn relay          # Compile Relay artifacts
yarn sync-schema    # Refresh data/schema.graphql from metaphysics
```

## License

MIT License. See [LICENSE](LICENSE).

## About Artsy

<a href="https://www.artsy.net/">
  <img align="left" src="https://avatars2.githubusercontent.com/u/546231?s=200&v=4"/>
</a>

This project is the work of engineers at [Artsy][footer_website], the world's
leading and largest online art marketplace and platform for discovering art.
One of our core [Engineering Principles][footer_principles] is being [Open
Source by Default][footer_open] which means we strive to share as many details
of our work as possible.

You can learn more about this work from [our blog][footer_blog] and by following
[@ArtsyOpenSource][footer_twitter] or explore our public data by checking out
[our API][footer_api]. If you're interested in a career at Artsy, read through
our [job postings][footer_jobs]!

[footer_website]: https://www.artsy.net/
[footer_principles]: https://github.com/artsy/README/blob/main/culture/engineering-principles.md
[footer_open]: https://github.com/artsy/README/blob/main/culture/engineering-principles.md#open-source-by-default
[footer_blog]: https://artsy.github.io/
[footer_twitter]: https://twitter.com/ArtsyOpenSource
[footer_api]: https://developers.artsy.net/
[footer_jobs]: https://www.artsy.net/jobs
