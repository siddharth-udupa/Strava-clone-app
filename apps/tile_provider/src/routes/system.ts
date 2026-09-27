import { getMbtilesMetadata, type MbtilesDb } from "@repo/tiles"
import type { Cpeak, Handler } from "cpeak"

type SystemRoutesOptions = {
  db: MbtilesDb
}

export function systemRoutes(app: Cpeak, { db }: SystemRoutesOptions) {
  // Reads the metadata table, so a tileset that cannot be read surfaces here
  // rather than as a 404 on every tile.
  const health: Handler = async (_request, response) => {
    const metadata = await getMbtilesMetadata(db)

    return response.json({
      status: "ok",
      format: metadata.format,
      minzoom: metadata.minzoom,
      maxzoom: metadata.maxzoom,
    })
  }

  // Everything a client needs to build a style against this tileset.
  const metadata: Handler = async (_request, response) =>
    response.json(await getMbtilesMetadata(db))

  app.route("get", "/health", health)
  app.route("get", "/metadata", metadata)
}
