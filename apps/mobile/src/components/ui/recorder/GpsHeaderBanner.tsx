import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type GpsHeaderBannerProps = {
  status: "idle" | "recording" | "paused" | "finished"
  isBackgroundActive: boolean
  onToggleExpand?: () => void
}

export default function GpsHeaderBanner({
  status,
  isBackgroundActive,
  onToggleExpand,
}: GpsHeaderBannerProps) {
  const getStatusText = () => {
    if (status === "idle") return "GPS Acquired"
    if (status === "paused") return "GPS Paused"
    if (isBackgroundActive) return "GPS Active (High Precision)"
    return "GPS Active"
  }

  return (
    <View className="bg-[#EAF5EA] dark:bg-emerald-950/90 rounded-t-2xl px-4 py-2.5 flex-row justify-center items-center relative">
      <View className="flex-row items-center gap-2">
        <Ionicons name="cellular" size={16} color="#2E7D32" />
        <Text className="text-xs font-black text-[#2E7D32] dark:text-emerald-400 tracking-wide text-center uppercase">
          {getStatusText()}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onToggleExpand}
        className="absolute right-3.5 p-1"
        accessibilityLabel="Toggle metrics expand"
      >
        <Ionicons name="resize-outline" size={16} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  )
}
