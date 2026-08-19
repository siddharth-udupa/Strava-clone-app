export type TileProviderType = "raster" | "vector"

export type TileProvider = {
  id: string
  name: string
  type: TileProviderType
  url: string
  attribution: string
  tileSize?: number
  maxZoom?: number
  requiresApiKey?: boolean
}
