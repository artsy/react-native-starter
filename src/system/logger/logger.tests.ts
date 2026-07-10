import * as Sentry from "@sentry/react-native"

import { getLogLevel, logger, setLogLevel } from "system/logger"

describe("logger", () => {
  const initialLevel = getLogLevel()

  afterEach(() => {
    setLogLevel(initialLevel)
    jest.clearAllMocks()
  })

  it("captures an exception on error() when an Error is provided", () => {
    const err = new Error("boom")
    logger.error("something failed", err, { userId: "1" })

    expect(Sentry.captureException).toHaveBeenCalledWith(err, {
      extra: { message: "something failed", userId: "1" },
    })
  })

  it("captures a message at error level on error() with no Error", () => {
    logger.error("something failed")

    expect(Sentry.captureException).not.toHaveBeenCalled()
    expect(Sentry.captureMessage).toHaveBeenCalledWith("something failed", "error")
  })

  it("captures a warning message on warn()", () => {
    logger.warn("watch out", { ms: 1200 })

    expect(Sentry.captureMessage).toHaveBeenCalledWith("watch out", "warning")
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: "warning", message: "watch out" })
    )
  })

  it("adds a breadcrumb (no capture) on debug() and info()", () => {
    logger.info("hello", { a: 1 })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: "info", message: "hello", data: { a: 1 } })
    )
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it("gates messages below the minimum level", () => {
    setLogLevel("info")

    logger.debug("suppressed")
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled()

    logger.info("emitted")
    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(1)
  })
})
