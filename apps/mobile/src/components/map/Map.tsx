import { useState, useMemo, useEffect } from "react"
import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Modal, ScrollView } from "react-native"
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
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
  isChangeable?: boolean
  providerId?: TileProviderId
  style?: StyleProp<ViewStyle>
}

export default function Map({
  encodedPolyline,
  isStatic = false,
  isChangeable = false,
  providerId: initialProviderId = DEFAULT_TILE_PROVIDER,
  style,
}: MapProps) {
  const [currentProviderId, setCurrentProviderId] = useState<TileProviderId>(initialProviderId)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  useEffect(() => {
    if (initialProviderId) {
      setCurrentProviderId(initialProviderId)
    }
  }, [initialProviderId])

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
    () => getMapLibreStyle(currentProviderId),
    [currentProviderId]
  )

  const activeProvider = tileProviders[currentProviderId] || tileProviders[DEFAULT_TILE_PROVIDER]

  const containerStyles = [styles.container, style]
  const mapStyles = style ? [styles.map, style] : styles.map

  const renderPickerModal = () => (
    <Modal
      visible={isPickerOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsPickerOpen(false)}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[70%]">
          <View className="flex-row items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <View className="flex-row items-center">
              <Ionicons name="layers" size={20} color="#FC5200" />
              <Text className="text-white font-bold text-lg ml-2">Choose Map Style</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsPickerOpen(false)}
              className="bg-slate-800 p-1.5 rounded-full"
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView className="space-y-2">
            {(Object.keys(tileProviders) as TileProviderId[]).map((key) => {
              const provider = tileProviders[key]
              const isSelected = currentProviderId === key
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    setCurrentProviderId(key)
                    setIsPickerOpen(false)
                  }}
                  className={`p-3.5 rounded-xl border flex-row items-center justify-between my-1 ${
                    isSelected
                      ? "bg-[#FC5200]/15 border-[#FC5200]"
                      : "bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <View className="flex-1 mr-2">
                    <Text
                      className={`font-semibold text-sm ${
                        isSelected ? "text-[#FC5200]" : "text-white"
                      }`}
                    >
                      {provider.name}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                      {provider.id} ({provider.type})
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#FC5200" />
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  // Placeholder when native MapLibre module is unavailable (e.g. Expo Go standard client)
  if (!MapLibreModule || !MapLibreModule.Map) {
    return (
      <View style={containerStyles} className="bg-slate-950 justify-center items-center relative overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-slate-800" />

        {/* Changeable Tile Provider Control */}
        {isChangeable && (
          <TouchableOpacity
            onPress={() => setIsPickerOpen(true)}
            className="absolute top-3 right-3 z-10 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-lg flex-row items-center active:opacity-80"
          >
            <Ionicons name="layers" size={16} color="#FC5200" />
            <Text className="text-slate-200 text-xs font-semibold ml-1.5" numberOfLines={1}>
              {activeProvider.name.split(" ")[0]}
            </Text>
            <Ionicons name="chevron-down" size={12} color="#94A3B8" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}

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
            Active Provider: {activeProvider.name}
          </Text>
        </View>

        {isChangeable && renderPickerModal()}
      </View>
    )
  }

  const { Map: MapLibreView, Camera, GeoJSONSource, Layer } = MapLibreModule

  return (
    <View style={containerStyles} className="bg-slate-950 overflow-hidden relative">
      {/* Changeable Tile Provider Control overlay */}
      {isChangeable && (
        <TouchableOpacity
          onPress={() => setIsPickerOpen(true)}
          className="absolute top-3 right-3 z-10 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-lg flex-row items-center active:opacity-80"
        >
          <Ionicons name="layers" size={16} color="#FC5200" />
          <Text className="text-slate-200 text-xs font-semibold ml-1.5" numberOfLines={1}>
            {activeProvider.name.split(" ")[0]}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#94A3B8" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      )}

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

      {isChangeable && renderPickerModal()}
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
