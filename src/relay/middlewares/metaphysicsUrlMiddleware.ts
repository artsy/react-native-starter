import { urlMiddleware } from "react-relay-network-modern"

import { getUserAgent } from "helpers/getUserAgent"
import { unsafe__getAuth, unsafe__getEnvironment } from "store/GlobalStore"

export const metaphysicsUrlMiddleware = () => {
  return urlMiddleware({
    url: () => unsafe__getEnvironment().strings.metaphysicsURL,
    headers: () => {
      const userAgent = getUserAgent()
      const { userID } = unsafe__getAuth()
      return {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        // Only send X-USER-ID once we actually have a userID. Right after
        // sign-in it can still be null (setUserID populates it async), and a
        // null header value is rejected by Expo's native fetch.
        ...(userID ? { "X-USER-ID": userID } : {}),
        "X-TIMEZONE": "Europe/Berlin",
      }
    },
  })
}
