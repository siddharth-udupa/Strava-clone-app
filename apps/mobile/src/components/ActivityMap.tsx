import React, { useMemo } from "react"
import { View, Text, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { decodePolyline } from "@repo/gpx"
import { TileProvider } from "../../../shared/TileProvider"

let MapLibreModule: typeof import("@maplibre/maplibre-react-native") | null = null

try {
  MapLibreModule = require("@maplibre/maplibre-react-native")
} catch (err) {
  MapLibreModule = null
}

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
  const points = useMemo(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : []),
    [encodedPolyline]
  )

  // GeoJSON for the route line — MapLibre needs [lng, lat] order
  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> | null = useMemo(
    () =>
      points.length >= 2
        ? {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: points.map((p) => [p.lng, p.lat]),
            },
            properties: {},
          }
        : null,
    [points]
  )

  // Fit camera to route bounds — LngLatBounds = [west, south, east, north]
  const cameraBounds = useMemo(() => {
    if (!routeGeoJSON || points.length < 2) return null
    return [
      Math.min(...points.map((p) => p.lng)),
      Math.min(...points.map((p) => p.lat)),
      Math.max(...points.map((p) => p.lng)),
      Math.max(...points.map((p) => p.lat)),
    ] as import("@maplibre/maplibre-react-native").LngLatBounds
  }, [routeGeoJSON, points])

  // Default center when no route — mirrors web [51.505, -0.09]
  const defaultCenter: [number, number] = [-0.09, 51.505]

  // Tile URL — cartoVoyager matches web default
  const tileUrl = useMemo(
    () => TileProvider.cartoVoyager.url.replace("{s}", "a").replace("{r}", ""),
    []
  )

  // MapLibre raster style spec
  const mapStyle = useMemo(
    () => ({
      version: 8 as const,
      sources: {
        "carto-tiles": {
          type: "raster" as const,
          tiles: [tileUrl],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "carto-layer",
          type: "raster" as const,
          source: "carto-tiles",
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    }),
    [tileUrl]
  )

  // If MapLibre native module is missing (e.g. running in standard Expo Go),
  // render a styled map placeholder with fixed dimensions so the layout is preserved.
  if (!MapLibreModule || !MapLibreModule.Map) {
    return (
      <View style={styles.container} className="bg-slate-950 my-1 justify-center items-center relative overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-slate-800" />
        <View className="items-center justify-center">
          <MaterialCommunityIcons
            name="map-marker-path"
            size={48}
            color="#FC5200"
            opacity={0.8}
          />
          <Text className="text-slate-400 text-xs font-semibold mt-1">
            Map Route ({points.length} points)
          </Text>
          <Text className="text-slate-500 text-[10px] mt-0.5">
            Native MapLibre requires Dev Build (`npx expo run:android`)
          </Text>
        </View>
      </View>
    )
  }

  const { Map, Camera, GeoJSONSource, Layer } = MapLibreModule

  return (
    <View style={styles.container} className="bg-slate-950 my-1 overflow-hidden">
      <Map
        style={styles.map}
        mapStyle={mapStyle}
        dragPan={!isStatic}
        touchPitch={false}
        attribution={false}
        logo={false}
        compass={false}
      >
        <Camera
          duration={0}
          {...(cameraBounds
            ? {
                bounds: cameraBounds,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              }
            : { center: defaultCenter, zoom: 13 })}
        />

        {/* Route polyline layer */}
        {routeGeoJSON && (
          <GeoJSONSource id="route" data={routeGeoJSON}>
            <Layer
              id="routeLine"
              type="line"
              paint={{
                "line-color": "#FC4C02", // Strava orange
                "line-width": 4,
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 176, // Fixed height for tests & rendering
  },
  map: {
    width: "100%",
    height: 176,
    flex: 1,
  },
})
