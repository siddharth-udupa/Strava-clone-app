import {
  getTile,
  TileCoordSchema,
  tileKey,
  type MbtilesDb,
  type TileCoord,
} from "@repo/tiles"
import type { Cpeak, CpeakRequest, Handler } from "cpeak"

type TileRoutesOptions = {
  db: MbtilesDb
}

/** What a gzipped Mapbox Vector Tile is served as. */
const MVT_CONTENT_TYPE = "application/vnd.mapbox-vector-tile"

// Tileset tiles never change, so clients can hold onto them.
const CACHE_CONTROL = "public, max-age=86400, immutable"

/**
 * Validates path params as a tile coordinate, dropping the optional `.pbf`
 * suffix. Throws a ZodError, which the server turns into a 400.
 */
function parseCoord(params: CpeakRequest["params"]): TileCoord {
  const { z, x, y } = params
  return TileCoordSchema.parse({ z, x, y: y.replace(/\.pbf$/i, "") })
}

export function tileRoutes(app: Cpeak, { db }: TileRoutesOptions) {
  const getTileHandler: Handler = async (request, response) => {
    const coord = parseCoord(request.params)
    const tile = await getTile(db, coord)

    // No tile for that coordinate: outside the tileset's zoom range, or an area
    // the extract does not cover.
    if (!tile) {
      return response
        .status(404)
        .json({ error: `Tile ${tileKey(coord)} not found` })
    }

    const etag = `"${tileKey(coord)}"`
    response.setHeader("etag", etag)
    response.setHeader("cache-control", CACHE_CONTROL)

    // A re-validating client only needs the status, not the bytes again, and a
    // 304 must not carry a body.
    if (request.headers["if-none-match"] === etag) {
      response.status(304).end()
      return
    }

    // For format=pbf the stored bytes are gzipped MVT, and they go out as they
    // are: `content-encoding: gzip` is what tells the client to unpack them
    // before parsing. MapLibre GL JS hands the response straight to its tile
    // parser, so without the header it fails on the compressed bytes. Cpeak has
    // no binary helper, so the buffer goes straight onto the Node response.
    response.setHeader("content-type", MVT_CONTENT_TYPE)
    response.setHeader("content-encoding", "gzip")
    response.setHeader("content-length", tile.tileData.byteLength)
    response.status(200).end(tile.tileData)
  }

  // A Cpeak `:param` matches a whole path segment, so this one route answers
  // both `{z}/{x}/{y}` and `{z}/{x}/{y}.pbf` — the suffix is stripped in
  // parseCoord. Adding a second `/tiles/:z/:x/:y.pbf` route would land on the
  // same node of the router and throw as a duplicate at boot.
  app.route("get", "/tiles/:z/:x/:y", getTileHandler)
}
