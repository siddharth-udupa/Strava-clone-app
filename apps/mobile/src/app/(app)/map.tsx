import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, ScrollView, StatusBar, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import Map from "@/components/Map"
import { tileProviders, DEFAULT_TILE_PROVIDER, type TileProviderId } from "@repo/maps"

export default function FullScreenMapScreen() {
  const insets = useSafeAreaInsets()
  const [providerId, setProviderId] = useState<TileProviderId>(DEFAULT_TILE_PROVIDER)
  const [isLayerPickerOpen, setIsLayerPickerOpen] = useState(false)
  const isChangeable = true

  const currentProvider = tileProviders[providerId] || tileProviders[DEFAULT_TILE_PROVIDER]

  return (
    <View className="flex-1 bg-slate-950 relative">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent />

      {/* FULL SCREEN MAP VIEW */}
      <View style={styles.fullScreenMap}>
        <Map
          isStatic={false}
          isChangeable={true}
          providerId={providerId}
          style={styles.fullScreenMap}
        />
      </View>

      {/* FLOATING TOP NAVIGATION BAR */}
      <View
        style={{ paddingTop: Math.max(insets.top, 40) }}
        className="absolute top-0 left-0 right-0 px-4 pb-3 flex-row items-center justify-between pointer-events-box-none bg-gradient-to-b from-slate-950/80 to-transparent"
      >
        <View className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full shadow-lg flex-row items-center">
          <MaterialCommunityIcons name="map-outline" size={18} color="#FC5200" />
          <Text className="text-white font-bold text-sm ml-2">Map Explorer</Text>
        </View>

        {/* TILE PROVIDER PICKER BUTTON */}
        {isChangeable && (
          <TouchableOpacity
            onPress={() => setIsLayerPickerOpen(true)}
            className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-full shadow-lg flex-row items-center active:opacity-80"
          >
            <Ionicons name="layers" size={18} color="#FC5200" />
            <Text className="text-slate-200 text-xs font-semibold ml-1.5" numberOfLines={1}>
              {currentProvider.name.split(" ")[0]}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#94A3B8" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>

      {/* FLOATING BOTTOM OVERLAY */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl flex-row justify-around items-center"
      >
        <View className="items-center">
          <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Tile Provider</Text>
          <Text className="text-white font-extrabold text-sm mt-0.5" numberOfLines={1}>
            {currentProvider.name}
          </Text>
        </View>
        <View className="h-8 w-[1px] bg-slate-800" />
        <View className="items-center">
          <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tile Switching</Text>
          <Text className="text-emerald-400 font-extrabold text-sm mt-0.5">
            {isChangeable ? "Enabled" : "Disabled"}
          </Text>
        </View>
      </View>

      {/* TILE PROVIDER SELECTION MODAL */}
      <Modal
        visible={isLayerPickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLayerPickerOpen(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <View className="flex-row items-center">
                <Ionicons name="layers" size={20} color="#FC5200" />
                <Text className="text-white font-bold text-lg ml-2">Choose Map Style</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsLayerPickerOpen(false)}
                className="bg-slate-800 p-1.5 rounded-full"
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-2">
              {(Object.keys(tileProviders) as TileProviderId[]).map((key) => {
                const provider = tileProviders[key]
                const isSelected = providerId === key
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setProviderId(key)
                      setIsLayerPickerOpen(false)
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
    </View>
  )
}

const styles = StyleSheet.create({
  fullScreenMap: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
})
