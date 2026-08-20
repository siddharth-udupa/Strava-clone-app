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
}

export default function Map({
  encodedPolyline,
  isStatic = false,
  providerId = DEFAULT_TILE_PROVIDER,
  style,
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
    return [
      Math.min(...points.map((p) => p.lng)),
      Math.min(...points.map((p) => p.lat)),
      Math.max(...points.map((p) => p.lng)),
      Math.max(...points.map((p) => p.lat)),
    ] as import("@maplibre/maplibre-react-native").LngLatBounds
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
      <View style={containerStyles} className="bg-slate-950 justify-center items-center relative overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-slate-800" />
        <View className="items-center justify-center p-4">
          <MaterialCommunityIcons
            name="map-marker-path"
            size={48}
            color="#FC5200"
            opacity={0.8}
          />
          <Text className="text-slate-400 text-xs font-semibold mt-1">
            Map Route ({points.length} points)
          </Text>
          <Text className="text-slate-500 text-[10px] mt-0.5 text-center">
            Native MapLibre requires Dev Build (`npx expo run:android`)
          </Text>
          <Text className="text-slate-400 text-[11px] font-medium mt-2 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            Active Style: {activeProvider.name}
          </Text>
        </View>
      </View>
    )
  }

  const { Map: MapLibreView, Camera, GeoJSONSource, Layer } = MapLibreModule

  return (
    <View style={containerStyles} className="bg-slate-950 overflow-hidden relative">
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
          duration={0}
          {...(cameraBounds
            ? {
              bounds: cameraBounds,
              padding: { top: 24, bottom: 24, left: 24, right: 24 },
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
    height: 200,
  },
  map: {
    width: "100%",
    height: 200,
    flex: 1,
  },
})
