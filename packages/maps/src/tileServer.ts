declare const process: { env: Record<string, string | undefined> }

const DEFAULT_TILE_SERVER_URL = "http://localhost:4000"

/**
 * Base URL of the `@repo/tile_provider` service, which serves the
 * `apps/tile_provider/data/south-india.mbtiles` tileset over HTTP.
 *
 * `localhost` only works for a browser on the same machine; a phone on the LAN
 * needs `NEXT_PUBLIC_TILE_SERVER_URL` (web) or `EXPO_PUBLIC_TILE_SERVER_URL`
 * (mobile) pointing at the dev machine. Each `process.env.X` has to be written
 * out in full for Next and Expo to inline it.
 */
function readTileServerUrl(): string {
  if (typeof process === "undefined") return DEFAULT_TILE_SERVER_URL
  return (
    process.env.NEXT_PUBLIC_TILE_SERVER_URL ??
    process.env.EXPO_PUBLIC_TILE_SERVER_URL ??
    DEFAULT_TILE_SERVER_URL
  )
}

export const TILE_SERVER_URL = readTileServerUrl().replace(/\/+$/, "")

/** MBTiles ships no fonts, so text layers need a glyph server. */
export const TILE_GLYPHS_URL = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
