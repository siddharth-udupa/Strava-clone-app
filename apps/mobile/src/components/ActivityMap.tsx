import { View } from "react-native"
import { Map, Camera, GeoJSONSource, Layer } from "@maplibre/maplibre-react-native"
import type { LngLatBounds } from "@maplibre/maplibre-react-native"
import { decodePolyline } from "@repo/gpx"
import { TileProvider } from "../../../shared/TileProvider"

type ActivityMapProps = {
  encodedPolyline?: string
  isStatic?: boolean
  isChangeable: boolean
}

export default function ActivityMap({
  encodedPolyline,
  isStatic = false,
  isChangeable,
}: ActivityMapProps) {
  // Decode polyline → [{lat, lng}] — same as web MapClient
  const points = encodedPolyline ? decodePolyline(encodedPolyline) : []

  // GeoJSON for the route line — MapLibre needs [lng, lat] order
  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> | null =
    points.length >= 2
      ? {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: points.map((p) => [p.lng, p.lat]),
          },
          properties: {},
        }
      : null

  // Fit camera to route bounds — mirrors web FitBounds component
  // LngLatBounds = [west, south, east, north]
  const cameraBounds: LngLatBounds | null = routeGeoJSON
    ? [
        Math.min(...points.map((p) => p.lng)),
        Math.min(...points.map((p) => p.lat)),
        Math.max(...points.map((p) => p.lng)),
        Math.max(...points.map((p) => p.lat)),
      ]
    : null

  // Default center when no route — mirrors web [51.505, -0.09]
  const defaultCenter: [number, number] = [-0.09, 51.505]

  // Tile URL — cartoVoyager matches the web default (checked layer in TileLayers.tsx)
  // Replace {s} (subdomain) with a fixed letter and strip {r} (retina suffix).
  const tileUrl = TileProvider.cartoVoyager.url
    .replace("{s}", "a")
    .replace("{r}", "")

  // Inline MapLibre style — raster tile source over an empty base
  const mapStyle = {
    version: 8 as const,
    sources: {
      tiles: {
        type: "raster" as const,
        tiles: [tileUrl],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "background-tiles",
        type: "raster" as const,
        source: "tiles",
      },
    ],
  }

  return (
    <View className="w-full h-44 overflow-hidden">
      <Map
        className="flex-1"
        mapStyle={mapStyle}
        dragPan={!isStatic}
        // pitchEnabled={false}
        attribution={false}
        logo={false}
        compass={false}
      >
        {/* <Camera
          animationMode="none"
          {...(cameraBounds
            ? {
                bounds: cameraBounds,
                padding: { paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 },
              }
            : { centerCoordinate: defaultCenter, zoomLevel: 13 })}
        /> */}

        {/* Route polyline — only rendered when encodedPolyline is provided */}
        {routeGeoJSON && (
          <GeoJSONSource id="route" data={routeGeoJSON}>
            <Layer
              id="routeLine"
              type="line"
              paint={{
                "line-color": "#FC4C02",  // same hex as web Polyline pathOptions
                "line-width": 3,
                "line-opacity": 0.9,
              }}
              layout={{
                "line-cap": "round",
                "line-join": "round",
              }}
            />
          </GeoJSONSource>
        )}
      </Map>
    </View>
  )
}
