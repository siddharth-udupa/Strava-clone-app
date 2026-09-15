import React from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export type ActivityAthleteHeaderProps = {
  userName: string
  createdAt: string | Date
  activityType: string
  title?: string | null
  description?: string | null
  avatarUrl?: string
  onAddDescription?: () => void
}

export default function ActivityAthleteHeader({
  userName,
  createdAt,
  activityType,
  title,
  description,
  avatarUrl = "https://avatar.iran.liara.run/public/48",
  onAddDescription,
}: ActivityAthleteHeaderProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const getIconName = (type: string) => {
    switch (type) {
      case "Ride":
        return "bike"
      case "Hike":
        return "hiking"
      default:
        return "run"
    }
  }

  return (
    <View className="mb-2">
      {/* Athlete Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 overflow-hidden items-center justify-center mr-3.5 shadow-sm">
            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-[#FC5200] font-bold text-base leading-snug">{userName}</Text>
            <Text className="text-gray-500 dark:text-slate-400 text-xs mt-0.5 leading-normal">
              {formattedDate}
            </Text>
          </View>
        </View>

        {/* Activity Type Badge */}
        <View className="bg-[#FC5200]/15 border border-[#FC5200]/30 px-3.5 py-1.5 rounded-full flex-row items-center">
          <MaterialCommunityIcons name={getIconName(activityType)} size={15} color="#FC5200" />
          <Text className="text-[#FC5200] font-bold text-xs ml-1.5 leading-none">{activityType}</Text>
        </View>
      </View>

      {/* Activity Title & Description */}
      <Text className="text-gray-900 dark:text-white text-2xl font-black tracking-tight leading-8 mb-2">
        {title || "Untitled Activity"}
      </Text>
      {description ? (
        <Text className="text-gray-600 dark:text-slate-300 text-sm mb-4 leading-6">
          {description}
        </Text>
      ) : (
        <TouchableOpacity onPress={onAddDescription} className="mb-4 mt-1 self-start active:opacity-70">
          <Text className="text-gray-500 dark:text-slate-400 text-xs italic bg-gray-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700/80 leading-tight">
            + Add a description
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

