import { and, eq } from "drizzle-orm"
import type { MbtilesDb } from "../db.js"
import { metadata, tiles } from "../schema.js"
import { toStorageRow, type TileCoord } from "../tileId.js"

/**
 * Looks up one tile, or undefined when the file has no tile for that
 * coordinate (outside `minzoom`/`maxzoom`, or simply not covered).
 */
export async function getTile(db: MbtilesDb, { z, x, y }: TileCoord) {
  return db.query.tiles.findFirst({
    where: and(
      eq(tiles.zoomLevel, z),
      eq(tiles.tileColumn, x),
      eq(tiles.tileRow, toStorageRow(y, z))
    ),
  })
}

export type MbtilesMetadata = {
  name?: string
  description?: string
  /** Tile payload format, e.g. "pbf" (gzipped MVT), "png", "webp". */
  format?: string
  minzoom: number
  maxzoom: number
  /** left, bottom, right, top in WGS84. */
  bounds?: [number, number, number, number]
  /** lon, lat, zoom of the tileset's default view. */
  center?: [number, number, number]
  attribution?: string
  /** Layers and their attribute types, straight from the `json` row. */
  vectorLayers?: unknown[]
}

function toNumbers(value: string | undefined): number[] | undefined {
  if (!value) return undefined
  const numbers = value.split(",").map(Number)
  return numbers.every((n) => Number.isFinite(n)) ? numbers : undefined
}

/**
 * The file's `metadata` table, parsed into the shape a map client needs to
 * build a style and pick a zoom range.
 */
export async function getMbtilesMetadata(
  db: MbtilesDb
): Promise<MbtilesMetadata> {
  const rows = await db.select().from(metadata)
  const values = Object.fromEntries(rows.map((row) => [row.name, row.value]))

  // Only vector tiles carry the `json` row, and a malformed one should not take
  // the server down.
  let vectorLayers: unknown[] | undefined
  if (values.json) {
    try {
      const parsed = JSON.parse(values.json) as { vector_layers?: unknown[] }
      vectorLayers = parsed.vector_layers
    } catch {
      vectorLayers = undefined
    }
  }

  return {
    name: values.name,
    description: values.description,
    format: values.format,
    minzoom: Number(values.minzoom ?? 0),
    maxzoom: Number(values.maxzoom ?? 0),
    bounds: toNumbers(values.bounds) as MbtilesMetadata["bounds"],
    center: toNumbers(values.center) as MbtilesMetadata["center"],
    attribution: values.attribution,
    vectorLayers,
  }
}
