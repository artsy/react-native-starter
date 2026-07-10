### Meta

- **Point People:** [Mounir Dhahri](https://github.com/MounirDhahri)

This is an [Artsy](https://github.com/artsy) OSS project.

Don't know what Artsy is? Check out [this overview](https://github.com/artsy/meta/blob/master/meta/what_is_artsy.md) and [more](https://github.com/artsy/meta/blob/master/README.md), or read our objc.io on [team culture](https://www.objc.io/issues/22-scale/artsy).

Want to know more about Eigen: our Artsy Mobile? Check it out [here](https://github.com/artsy), read the [mobile](http://artsy.github.io/blog/categories/mobile/) blog posts, or [eigen's](http://artsy.github.io/blog/categories/eigen/) specifically.

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
Instructions coming later

## Features

- **Expo** managed workflow with **prebuild** — no committed native folders
- **TypeScript** in strict mode 💜
- Artsy design system via **[@artsy/palette-mobile](https://github.com/artsy/palette)**
- **React Navigation** boilerplate ready to be extended
- **Relay 20** integrated (co-located fragments + Relay compiler)
- Global store management and state persistence with **easy-peasy**
- Functional **Login** screen already available
- ESLint + Prettier, and Jest via **jest-expo** / `@testing-library/react-native`

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
