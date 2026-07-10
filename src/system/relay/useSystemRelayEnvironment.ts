import { useRelayEnvironment } from "react-relay"
import { IEnvironment } from "relay-runtime"

/**
 * Thin wrapper around Relay's `useRelayEnvironment`.
 *
 * Use this instead of `useRelayEnvironment` directly, for the same reason as
 * `useSystemQueryLoader`: it's the single seam where cross-cutting behavior can
 * be added later (offline guards, environment resets, per-request config)
 * without touching call sites — mirroring Eigen/Energy's
 * `useSystemRelayEnvironment`.
 */
export function useSystemRelayEnvironment(): {
  relayEnvironment: IEnvironment
} {
  const relayEnvironment = useRelayEnvironment()
  return { relayEnvironment }
}
