import { tileProviders, DEFAULT_TILE_PROVIDER, type TileProviderId } from "../providers"

export function getMapLibreStyle(id: TileProviderId = DEFAULT_TILE_PROVIDER) {
  const provider = tileProviders[id] ?? tileProviders[DEFAULT_TILE_PROVIDER]

  const tileUrl = provider.url
    .replace("{s}", "a")
    .replace("{r}", "")

  return {
    version: 8 as const,
    sources: {
      "base-map": {
        type: provider.type,
        tiles: [tileUrl],
        tileSize: provider.tileSize ?? 256,
      },
    },
    layers: [
      {
        id: "base-map-layer",
        type: provider.type,
        source: "base-map",
        minzoom: 0,
        maxzoom: provider.maxZoom ?? 22,
      },
    ],
  }
}
