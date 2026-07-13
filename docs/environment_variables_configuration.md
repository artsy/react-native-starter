## Environment Variables Configuration

Public runtime config lives in a local **`.env`** file at the project root. Expo
inlines it at build time, and **only** variables prefixed `EXPO_PUBLIC_` are
exposed to the app — see the
[Expo environment variables guide](https://docs.expo.dev/guides/environment-variables/).

`yarn setup:oss` and `yarn setup:artsy` copy the tracked **`.env.example`** to
`.env` (gitignored) if you don't have one. You can also do it by hand:

```sh
cp .env.example .env
```

Every variable is optional — the app boots fine with them left blank:

| Variable | Purpose | Blank behavior |
| --- | --- | --- |
| `EXPO_PUBLIC_UNLEASH_URL` | Unleash proxy URL | Remote flags disabled (all flags `false`, no network) |
| `EXPO_PUBLIC_UNLEASH_CLIENT_KEY` | Unleash client key | Remote flags disabled |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN | Error reporting disabled |

> **Note:** Expo inlines env vars at **build time**, so after changing a value
> you must rebuild the app.

## Secrets are not env vars

API secrets (e.g. `ARTSY_API_CLIENT_KEY` / `ARTSY_API_CLIENT_SECRET`) are read
through [`react-native-keys`](https://github.com/numandev1/react-native-keys)
from `keys.development.json` / `keys.production.json`, **not** from `.env`. See
[Configuration](./configuration).
