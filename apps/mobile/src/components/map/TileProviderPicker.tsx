import React, { useState } from "react"
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleProp, ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { tileProviders, DEFAULT_TILE_PROVIDER, type TileProviderId } from "@repo/maps"

export type TileProviderPickerProps = {
  currentProviderId: TileProviderId
  onSelectProvider: (providerId: TileProviderId) => void
  triggerStyle?: StyleProp<ViewStyle>
}

export default function TileProviderPicker({
  currentProviderId,
  onSelectProvider,
  triggerStyle,
}: TileProviderPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const activeProvider = tileProviders[currentProviderId] || tileProviders[DEFAULT_TILE_PROVIDER]

  return (
    <>
      {/* Floating Trigger Button */}
      <TouchableOpacity
        onPress={() => setIsPickerOpen(true)}
        style={triggerStyle}
        className="absolute top-3 right-3 z-10 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-lg flex-row items-center active:opacity-80"
      >
        <Ionicons name="layers" size={16} color="#FC5200" />
        <Text className="text-slate-200 text-xs font-semibold ml-1.5" numberOfLines={1}>
          {activeProvider.name.split(" ")[0]}
        </Text>
        <Ionicons name="chevron-down" size={12} color="#94A3B8" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Tile Provider Picker Sheet Modal */}
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
                      onSelectProvider(key)
                      setIsPickerOpen(false)
                    }}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between my-1 ${isSelected
                        ? "bg-[#FC5200]/15 border-[#FC5200]"
                        : "bg-slate-800/60 border-slate-800"
                      }`}
                  >
                    <View className="flex-1 mr-2">
                      <Text
                        className={`font-semibold text-sm ${isSelected ? "text-[#FC5200]" : "text-white"
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
    </>
  )
}
