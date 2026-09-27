import { z } from "zod"

// ---------------------------------------------------------------------------
// Tile identity
// ---------------------------------------------------------------------------

/**
 * A tile coordinate in XYZ order, i.e. the `{z}/{x}/{y}` every map client
 * asks for.
 *
 * `z.coerce.number` is deliberate: HTTP path params arrive as strings, so the
 * same schema validates route params, CLI input and already-typed rows.
 *
 * The zoom ceiling is not hardcoded here — an `.mbtiles` file declares its own
 * `minzoom`/`maxzoom` in its metadata table, and anything outside the file
 * simply has no tile.
 */
export const TileCoordSchema = z
  .object({
    z: z.coerce.number().int().min(0),
    x: z.coerce.number().int().min(0),
    y: z.coerce.number().int().min(0),
  })
  .refine((coord) => coord.x < 2 ** coord.z && coord.y < 2 ** coord.z, {
    message: "x and y must be smaller than 2^z",
  })

export type TileCoord = z.infer<typeof TileCoordSchema>

/** Stable textual id of a tile, also used as its ETag. */
export function tileKey({ z, x, y }: TileCoord): string {
  return `${z}/${x}/${y}`
}

/**
 * Converts an XYZ row into the row MBTiles stores.
 *
 * MBTiles indexes tiles in TMS, which is XYZ with the Y axis reversed. From
 * the 1.3 spec: "the tile commonly referred to as 11/327/791 is inserted as
 * tile_row 1256, since 1256 is 2^11 - 1 - 791".
 */
export function toStorageRow(y: number, z: number): number {
  return 2 ** z - 1 - y
}
