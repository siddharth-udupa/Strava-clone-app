import { useMemo } from "react"
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { decodePolyline } from "@repo/gpx"
import { getMapLibreStyle, DEFAULT_TILE_PROVIDER, tileProviders, type TileProviderId } from "@repo/maps"

let MapLibreModule: typeof import("@maplibre/maplibre-react-native") | null = null

try {
  MapLibreModule = require("@maplibre/maplibre-react-native")
} catch (err) {
  MapLibreModule = null
}

export type MapProps = {
  encodedPolyline?: string
  isStatic?: boolean
  providerId?: TileProviderId
  style?: StyleProp<ViewStyle>
  boundsPadding?: { top: number; bottom: number; left: number; right: number }
}

export default function Map({
  encodedPolyline,
  isStatic = false,
  providerId = DEFAULT_TILE_PROVIDER,
  style,
  boundsPadding,
}: MapProps) {
  const points = useMemo(() => (
    encodedPolyline ? decodePolyline(encodedPolyline) : []), [encodedPolyline])

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

  const cameraBounds = useMemo(() => {
    if (!routeGeoJSON || points.length < 2) return null
    let minLng = Math.min(...points.map((p) => p.lng))
    let minLat = Math.min(...points.map((p) => p.lat))
    let maxLng = Math.max(...points.map((p) => p.lng))
    let maxLat = Math.max(...points.map((p) => p.lat))

    // Minimum bounding box span (~400 meters) to avoid excessive zooming on short distance movements
    const MIN_DELTA = 0.004
    const lngDelta = maxLng - minLng
    const latDelta = maxLat - minLat

    if (lngDelta < MIN_DELTA) {
      const midLng = (minLng + maxLng) / 2
      minLng = midLng - MIN_DELTA / 2
      maxLng = midLng + MIN_DELTA / 2
    }

    if (latDelta < MIN_DELTA) {
      const midLat = (minLat + maxLat) / 2
      minLat = midLat - MIN_DELTA / 2
      maxLat = midLat + MIN_DELTA / 2
    }

    return [minLng, minLat, maxLng, maxLat] as import("@maplibre/maplibre-react-native").LngLatBounds
  }, [routeGeoJSON, points])

  const defaultCenter: [number, number] = [-0.09, 51.505]

  const mapStyle = useMemo(
    () => getMapLibreStyle(providerId),
    [providerId]
  )

  const activeProvider = tileProviders[providerId] || tileProviders[DEFAULT_TILE_PROVIDER]

  const containerStyles = [styles.container, style]
  const mapStyles = style ? [styles.map, style] : styles.map

  // Placeholder when native MapLibre module is unavailable (e.g. Expo Go standard client)
  if (!MapLibreModule || !MapLibreModule.Map) {
    return (
      <View style={containerStyles} className="bg-gray-100 dark:bg-slate-950 justify-center items-center relative overflow-hidden flex-1 w-full h-full">
        <View className="absolute inset-0 opacity-10 bg-gray-300 dark:bg-slate-800" />
        <View className="items-center justify-center p-4">
          <MaterialCommunityIcons
            name="map-marker-path"
            size={48}
            color="#FC5200"
            opacity={0.8}
          />
          <Text className="text-gray-600 dark:text-slate-400 text-xs font-semibold mt-1">
            Map Route ({points.length} points)
          </Text>
          <Text className="text-gray-500 dark:text-slate-500 text-[10px] mt-0.5 text-center">
            Native MapLibre requires Dev Build (`npx expo run:android`)
          </Text>
          <Text className="text-gray-600 dark:text-slate-400 text-[11px] font-medium mt-2 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-md border border-gray-200 dark:border-slate-800">
            Active Style: {activeProvider.name}
          </Text>
        </View>
      </View>
    )
  }

  const { Map: MapLibreView, Camera, GeoJSONSource, Layer } = MapLibreModule

  return (
    <View style={containerStyles} className="bg-gray-100 dark:bg-slate-950 overflow-hidden relative flex-1 w-full h-full">
      <MapLibreView
        style={mapStyles}
        mapStyle={mapStyle}
        dragPan={!isStatic}
        touchZoom={!isStatic}
        doubleTapZoom={!isStatic}
        doubleTapHoldZoom={!isStatic}
        touchPitch={false}
        attribution={false}
        logo={false}
        compass={false}
      >
        <Camera
          maxZoom={16}
          minZoom={2}
          duration={0}
          {...(cameraBounds
            ? {
              bounds: cameraBounds,
              padding: boundsPadding || { top: 24, bottom: 24, left: 24, right: 24 },
            }
            : { center: defaultCenter, zoom: 13 })}
        />

        {routeGeoJSON && (
          <GeoJSONSource id="route" data={routeGeoJSON}>
            <Layer
              id="routeLine"
              type="line"
              paint={{
                "line-color": "#FC4C02",
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
      </MapLibreView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
})
