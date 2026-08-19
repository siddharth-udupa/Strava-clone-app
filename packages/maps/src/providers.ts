import type { TileProvider } from "./types"

export const tileProviders = {
  openstreetmap: {
    id: "openstreetmap",
    name: "OpenStreetMap (Standard)",
    type: "raster",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 256,
    maxZoom: 19,
  },

  cartoVoyager: {
    id: "cartoVoyager",
    name: "CartoDB Voyager (Modern & Colorful)",
    type: "raster",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    tileSize: 256,
    maxZoom: 20,
  },

  cartoPositron: {
    id: "cartoPositron",
    name: "CartoDB Positron (Minimal Light)",
    type: "raster",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    tileSize: 256,
    maxZoom: 20,
  },

  cartoDark: {
    id: "cartoDark",
    name: "CartoDB Dark Matter (Sleek Dark)",
    type: "raster",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    tileSize: 256,
    maxZoom: 20,
  },

  cyclosm: {
    id: "cyclosm",
    name: "CyclOSM (Cycling Infrastructure)",
    type: "raster",
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Style: &copy; <a href="https://github.com/cyclosm/cyclosm-cartocss-style">CyclOSM</a>',
    tileSize: 256,
    maxZoom: 20,
  },

  opentopo: {
    id: "opentopo",
    name: "OpenTopoMap (Topographic Terrain)",
    type: "raster",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    tileSize: 256,
    maxZoom: 17,
  },

  esriSatellite: {
    id: "esriSatellite",
    name: "Esri World Imagery (Satellite)",
    type: "raster",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    tileSize: 256,
    maxZoom: 19,
  },

  esriGray: {
    id: "esriGray",
    name: "Esri Light Gray Canvas",
    type: "raster",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    tileSize: 256,
    maxZoom: 16,
  },
} satisfies Record<string, TileProvider>

export type TileProviderId = keyof typeof tileProviders

export const DEFAULT_TILE_PROVIDER: TileProviderId = "cartoVoyager"
