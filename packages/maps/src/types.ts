import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec"

export type TileProviderType = "raster" | "vector"

/** A style built by the adapter, ready for MapLibre GL JS or MapLibre Native. */
export type MapLibreStyle = StyleSpecification

type TileProviderBase = {
  id: string
  name: string
  /** Tile URL template, in the `{z}/{x}/{y}` form every map client asks for. */
  url: string
  attribution: string
  minZoom?: number
  maxZoom?: number
}

export type RasterTileProvider = TileProviderBase & {
  type: "raster"
  tileSize?: number
  requiresApiKey?: boolean
}

export type VectorTileLayer = {
  id: string
  type: "background" | "raster" | "fill" | "line" | "circle" | "symbol"
  source: string
  "source-layer"?: string
  minzoom?: number
  maxzoom?: number
  filter?: unknown
  layout?: Record<string, unknown>
  paint?: Record<string, unknown>
}

export type VectorTileProvider = TileProviderBase & {
  type: "vector"
  /** Fontstack template, required by the style's symbol layers. */
  glyphs?: string
  /** left, bottom, right, top in WGS84. */
  bounds?: [number, number, number, number]
  /** lon, lat, zoom of the tileset's default view. */
  center?: [number, number, number]
  layers: VectorTileLayer[]
}

export type TileProvider = RasterTileProvider | VectorTileProvider

export type MapLibreSource = {
  type: TileProviderType
  tiles: string[]
  attribution: string
  tileSize?: number
  minzoom: number
  maxzoom: number
}
