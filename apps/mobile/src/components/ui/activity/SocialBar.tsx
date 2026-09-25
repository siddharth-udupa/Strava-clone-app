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
    <View className="flex-row items-center px-5 mb-7">
      <TouchableOpacity
        onPress={onKudosPress}
        className="flex-1 flex-row items-center justify-center bg-[#111C2D] border border-[#223149] rounded-2xl py-3 mr-1.5 active:bg-[#17263B]"
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Give kudos"
      >
        <Ionicons name="thumbs-up-outline" size={17} color="#FF8A5C" />
        <Text className="text-[#D5DDE8] text-[11px] font-bold ml-1.5">Kudos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCommentPress}
        className="flex-1 flex-row items-center justify-center bg-[#111C2D] border border-[#223149] rounded-2xl py-3 mx-0.75 active:bg-[#17263B]"
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="View comments"
      >
        <Ionicons name="chatbubble-outline" size={16} color="#A78BFA" />
        <Text className="text-[#D5DDE8] text-[11px] font-bold ml-1.5">Comments</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSharePress}
        className="flex-1 flex-row items-center justify-center bg-[#111C2D] border border-[#223149] rounded-2xl py-3 ml-1.5 active:bg-[#17263B]"
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Share activity"
      >
        <Feather name="share-2" size={16} color="#60A5FA" />
        <Text className="text-[#D5DDE8] text-[11px] font-bold ml-1.5">Share</Text>
      </TouchableOpacity>
    </View>
  )
}
