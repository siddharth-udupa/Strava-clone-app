import { getTileProvider, getTileSource } from "./maplibre"
import { DEFAULT_TILE_PROVIDER, type TileProviderId } from "../providers"

export function getWebTileProvider(id: TileProviderId = DEFAULT_TILE_PROVIDER) {
  const provider = getTileProvider(id)
  const source = getTileSource(provider)

  return {
    id: provider.id,
    name: provider.name,
    type: provider.type,
    url: source.tiles[0] ?? "",
    attribution: provider.attribution,
    minZoom: provider.minZoom,
    maxZoom: provider.maxZoom,
    tileSize: source.tileSize,
  }
}
