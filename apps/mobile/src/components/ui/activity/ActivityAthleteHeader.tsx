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
    <View>
      {/* Athlete Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 overflow-hidden items-center justify-center mr-3">
            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
          </View>
          <View className="flex-1">
            <Text className="text-[#FC5200] font-bold text-base">{userName}</Text>
            <Text className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
              {formattedDate}
            </Text>
          </View>
        </View>

        {/* Activity Type Badge */}
        <View className="bg-[#FC5200]/15 border border-[#FC5200]/40 px-3 py-1 rounded-full flex-row items-center">
          <MaterialCommunityIcons name={getIconName(activityType)} size={14} color="#FC5200" />
          <Text className="text-[#FC5200] font-bold text-xs ml-1.5">{activityType}</Text>
        </View>
      </View>

      {/* Activity Title & Description */}
      <Text className="text-gray-900 dark:text-white text-2xl font-black tracking-tight mb-1">
        {title || "Untitled Activity"}
      </Text>
      {description ? (
        <Text className="text-gray-600 dark:text-slate-300 text-sm mb-4 leading-5">
          {description}
        </Text>
      ) : (
        <TouchableOpacity onPress={onAddDescription} className="mb-4 self-start">
          <Text className="text-gray-500 dark:text-slate-400 text-xs italic bg-gray-100 dark:bg-slate-800/80 px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700">
            + Add a description
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
