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
        "X-USER-ID": userID as string,
        "X-TIMEZONE": "Europe/Berlin",
      }
    },
  })
}
