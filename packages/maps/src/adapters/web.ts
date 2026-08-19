import { tileProviders, DEFAULT_TILE_PROVIDER, type TileProviderId } from "../providers"

export function getWebTileProvider(id: TileProviderId = DEFAULT_TILE_PROVIDER) {
  const provider = tileProviders[id] ?? tileProviders[DEFAULT_TILE_PROVIDER]

  return {
    id: provider.id,
    name: provider.name,
    url: provider.url,
    attribution: provider.attribution,
    maxZoom: provider.maxZoom,
    tileSize: provider.tileSize,
  }
}
