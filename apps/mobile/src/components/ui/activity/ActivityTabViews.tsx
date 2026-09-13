import React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { TabType } from "./ActivityTabNavigation"

export type ActivityTabViewsProps = {
  activeTab: TabType
}

export default function ActivityTabViews({ activeTab }: ActivityTabViewsProps) {
  if (activeTab === "analysis") {
    return (
      <View className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 items-center justify-center py-8">
        <Ionicons name="stats-chart-outline" size={36} color="#FC5200" />
        <Text className="text-gray-900 dark:text-white font-bold text-sm mt-2">Analysis</Text>
        <Text className="text-gray-500 dark:text-slate-400 text-xs mt-1 text-center">
          Detailed analysis and split performance for this effort.
        </Text>
      </View>
    )
  }

  if (activeTab === "segments") {
    return (
      <View className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 items-center justify-center py-8">
        <Ionicons name="git-commit-outline" size={36} color="#FC5200" />
        <Text className="text-gray-900 dark:text-white font-bold text-sm mt-2">
          Matched Segments
        </Text>
        <Text className="text-gray-500 dark:text-slate-400 text-xs mt-1 text-center">
          2 segment efforts recorded on this route.
        </Text>
      </View>
    )
  }

  if (activeTab === "best_efforts") {
    return (
      <View className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 items-center justify-center py-8">
        <Ionicons name="trophy-outline" size={36} color="#EAB308" />
        <Text className="text-gray-900 dark:text-white font-bold text-sm mt-2">
          Personal Records
        </Text>
        <Text className="text-gray-500 dark:text-slate-400 text-xs mt-1 text-center">
          Best 5k pace effort achieved during this run!
        </Text>
      </View>
    )
  }

  return null
}
