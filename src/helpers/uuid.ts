/**
 * Generate an RFC-4122 v4 UUID.
 *
 * Uses the global `crypto.getRandomValues`, which is polyfilled app-wide by
 * `react-native-get-random-values` (imported in `index.js`). Falls back to
 * `Math.random` if `crypto` is somehow unavailable (e.g. an odd test env) so a
 * non-throwing id is always returned — this is only used for anonymous
 * stickiness, not for anything security-sensitive.
 */
export const uuid = (): string => {
  const bytes = new Uint8Array(16)

  const cryptoObj = (globalThis as { crypto?: Crypto }).crypto
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Set the version (4) and variant (10xx) bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-")
}
