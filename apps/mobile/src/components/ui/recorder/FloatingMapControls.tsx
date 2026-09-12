import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type FloatingMapControlsProps = {
  is3dMode: boolean
  onOpenLayerPicker: () => void
  onToggle3dMode: () => void
  onRecenterLocation: () => void
  onOpenInfo: () => void
}

export default function FloatingMapControls({
  is3dMode,
  onOpenLayerPicker,
  onToggle3dMode,
  onRecenterLocation,
  onOpenInfo,
}: FloatingMapControlsProps) {
  return (
    <View className="px-4 mb-3 flex-row justify-between items-end">
      {/* Left: Map Info Icon */}
      <TouchableOpacity
        onPress={onOpenInfo}
        className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 justify-center items-center shadow-md active:scale-95"
        accessibilityLabel="Map info"
      >
        <Ionicons name="information-outline" size={20} color="#374151" />
      </TouchableOpacity>

      {/* Right: Stack of 3 Floating Action Buttons */}
      <View className="flex-col items-center gap-3">
        {/* Layer Toggle Button */}
        <TouchableOpacity
          onPress={onOpenLayerPicker}
          className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 justify-center items-center shadow-lg active:scale-95"
          accessibilityLabel="Choose map style"
        >
          <Ionicons name="layers-outline" size={20} color="#111827" />
        </TouchableOpacity>

        {/* 3D Mode Toggle Button */}
        <TouchableOpacity
          onPress={onToggle3dMode}
          className={`w-11 h-11 rounded-full border justify-center items-center shadow-lg active:scale-95 ${
            is3dMode
              ? "bg-[#FC5200] border-[#FC5200]"
              : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
          }`}
          accessibilityLabel="Toggle 3D mode"
        >
          <Text
            className={`font-black text-xs ${
              is3dMode ? "text-white" : "text-gray-900 dark:text-white"
            }`}
          >
            3D
          </Text>
        </TouchableOpacity>

        {/* Recenter Button */}
        <TouchableOpacity
          onPress={onRecenterLocation}
          className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 justify-center items-center shadow-lg active:scale-95"
          accessibilityLabel="Recenter location"
        >
          <Ionicons name="locate-outline" size={20} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
