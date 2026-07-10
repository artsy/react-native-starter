import * as Sentry from "@sentry/react-native"

/**
 * Structured, leveled logger — the single logging seam for the app.
 *
 * Inspired by Bluesky's `logger` and Eigen's logging conventions. All app code
 * should log through this module instead of calling `console.*` directly. That
 * gives us:
 *
 * - Consistent, level-prefixed console output in development.
 * - Automatic Sentry wiring (breadcrumbs + captures) in production.
 * - A single place to add future transports (bitdrift, file, remote, etc.)
 *   without touching any call sites.
 *
 * Usage:
 * ```ts
 * import { logger } from "system/logger"
 *
 * logger.debug("cache hit", { key })
 * logger.info("user signed in", { userId })
 * logger.warn("slow request", { ms })
 * logger.error("failed to open app", err, { url })
 * ```
 */

/** Log levels, ordered from least to most severe. */
export type LogLevel = "debug" | "info" | "warn" | "error"

/** Arbitrary structured context attached to a log entry. */
export type LogMetadata = Record<string, unknown>

/**
 * Numeric severity used for gating. A message is emitted only when its level is
 * greater than or equal to the current minimum level.
 */
const LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

/**
 * The active minimum level. Anything below this is dropped. Defaults to `debug`
 * in development (verbose) and `info` in production (quieter).
 */
let minLevel: LogLevel = __DEV__ ? "debug" : "info"

/** Override the minimum log level at runtime (used by tests and dev tooling). */
export function setLogLevel(level: LogLevel): void {
  minLevel = level
}

/** Read the current minimum log level. */
export function getLogLevel(): LogLevel {
  return minLevel
}

/** Whether a message at `level` should be emitted given the current threshold. */
function isEnabled(level: LogLevel): boolean {
  return LEVEL_SEVERITY[level] >= LEVEL_SEVERITY[minLevel]
}

/**
 * Console transport. In development every enabled level prints via its matching
 * `console` method. In production we stay quiet except for `warn`/`error`, which
 * remain useful in native/device logs.
 */
function logToConsole(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata,
  error?: Error
): void {
  if (!__DEV__ && level !== "warn" && level !== "error") {
    return
  }

  const prefix = `[${level}]`
  const args: unknown[] = [prefix, message]

  if (error) {
    args.push(error)
  }

  if (metadata && Object.keys(metadata).length > 0) {
    args.push(metadata)
  }

  console[level](...args)
}

/**
 * Sentry transport. `debug`/`info` become breadcrumbs; `warn` adds a breadcrumb
 * and captures a warning-level message; `error` captures the provided `Error`
 * (or a synthesized one) as an exception. Metadata rides along as breadcrumb
 * `data` and capture `extra`.
 */
function logToSentry(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata,
  error?: Error
): void {
  Sentry.addBreadcrumb({
    category: "logger",
    level: level === "warn" ? "warning" : level,
    message,
    data: metadata,
  })

  if (level === "warn") {
    Sentry.captureMessage(message, "warning")
    return
  }

  if (level === "error") {
    if (error) {
      Sentry.captureException(error, { extra: { message, ...metadata } })
    } else {
      Sentry.captureMessage(message, "error")
    }
  }
}

function emit(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata,
  error?: Error
): void {
  if (!isEnabled(level)) {
    return
  }

  logToConsole(level, message, metadata, error)
  logToSentry(level, message, metadata, error)
}

/**
 * The app-wide logger singleton. Prefer this over `console.*`.
 *
 * - `debug(message, metadata?)`
 * - `info(message, metadata?)`
 * - `warn(message, metadata?)`
 * - `error(message, error?, metadata?)`
 */
export const logger = {
  debug(message: string, metadata?: LogMetadata): void {
    emit("debug", message, metadata)
  },
  info(message: string, metadata?: LogMetadata): void {
    emit("info", message, metadata)
  },
  warn(message: string, metadata?: LogMetadata): void {
    emit("warn", message, metadata)
  },
  /**
   * Log an error. Pass the caught `Error` when you have one so Sentry captures a
   * real exception (with stack); otherwise a message is captured at error level.
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    emit("error", message, metadata, error)
  },
}

export type Logger = typeof logger
