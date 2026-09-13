import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"

export type ActivitySocialBarProps = {
  onKudosPress?: () => void
  onCommentPress?: () => void
  onSharePress?: () => void
}

export default function ActivitySocialBar({
  onKudosPress,
  onCommentPress,
  onSharePress,
}: ActivitySocialBarProps) {
  return (
    <View className="flex-row items-center justify-between bg-gray-50 dark:bg-slate-950/70 border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 mb-4">
      <TouchableOpacity
        onPress={onKudosPress}
        className="flex-1 flex-row items-center justify-center py-1.5 rounded-lg mr-1 bg-transparent"
      >
        <Ionicons name="thumbs-up-outline" size={18} color="#4B5563" />
        <Text className="text-xs font-bold ml-1.5 text-gray-700 dark:text-slate-400">Kudos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCommentPress}
        className="flex-1 flex-row items-center justify-center py-1.5 rounded-lg border-x border-gray-200 dark:border-slate-800"
      >
        <Ionicons name="chatbubble-outline" size={18} color="#4B5563" />
        <Text className="text-gray-700 dark:text-slate-400 text-xs font-bold ml-1.5">
          Comments
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSharePress}
        className="flex-1 flex-row items-center justify-center py-1.5 rounded-lg ml-1"
      >
        <Feather name="share-2" size={16} color="#4B5563" />
        <Text className="text-gray-700 dark:text-slate-400 text-xs font-bold ml-1.5">Share</Text>
      </TouchableOpacity>
    </View>
  )
}
