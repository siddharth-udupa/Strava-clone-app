import React from "react"
import { View, TouchableOpacity } from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"

export type ActivityHeaderOverlayProps = {
  topInset: number
  onBack: () => void
  onShare?: () => void
  onMore?: () => void
}

export default function ActivityHeaderOverlay({
  topInset,
  onBack,
  onShare,
  onMore,
}: ActivityHeaderOverlayProps) {
  return (
    <View
      style={{ paddingTop: Math.max(topInset, 16) }}
      className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between z-20 pointer-events-box-none"
    >
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-700/80 items-center justify-center shadow-md active:opacity-80"
      >
        <Ionicons name="arrow-back" size={20} color="#111827" />
      </TouchableOpacity>

      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          onPress={onShare}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-700/80 items-center justify-center shadow-md active:opacity-80"
        >
          <Feather name="share-2" size={18} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMore}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-700/80 items-center justify-center shadow-md active:opacity-80"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
