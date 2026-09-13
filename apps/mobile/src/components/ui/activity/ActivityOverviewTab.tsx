import React from "react"
import { View, Text } from "react-native"

export type ActivityOverviewTabProps = {
  distance: string | number
  duration: string
  pace: string | number
  elevGain: string | number
  elevLoss: string | number
  calories?: string
}

export default function ActivityOverviewTab({
  distance,
  duration,
  pace,
  elevGain,
  elevLoss,
  calories = "- kcal",
}: ActivityOverviewTabProps) {
  return (
    <View>
      {/* Main 3 Metrics */}
      <View className="flex-row justify-between bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 mb-4 shadow-xs">
        <View className="items-start">
          <Text className="text-gray-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Distance
          </Text>
          <View className="flex-row items-baseline mt-1">
            <Text className="text-gray-900 dark:text-white text-2xl font-black">{distance}</Text>
            <Text className="text-gray-500 dark:text-slate-400 text-xs ml-1 font-semibold">km</Text>
          </View>
        </View>

        <View className="items-start border-x border-gray-200 dark:border-slate-800/80 px-4">
          <Text className="text-gray-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Moving Time
          </Text>
          <Text className="text-gray-900 dark:text-white text-2xl font-black mt-1">{duration}</Text>
        </View>

        <View className="items-start">
          <Text className="text-gray-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Pace
          </Text>
          <View className="flex-row items-baseline mt-1">
            <Text className="text-gray-900 dark:text-white text-2xl font-black">{pace}</Text>
            <Text className="text-gray-500 dark:text-slate-400 text-xs ml-1 font-semibold">/km</Text>
          </View>
        </View>
      </View>

      {/* Secondary Detailed Metrics Grid */}
      <View className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
        <View className="flex-row justify-between items-center pb-2.5 border-b border-gray-200 dark:border-slate-800/60">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold">Elevation Gain</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold">{elevGain} m</Text>
        </View>

        <View className="flex-row justify-between items-center pb-2.5 border-b border-gray-200 dark:border-slate-800/60">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold">Elevation Loss</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold">{elevLoss} m</Text>
        </View>

        <View className="flex-row justify-between items-center pb-2.5 border-b border-gray-200 dark:border-slate-800/60">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold">Elapsed Time</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold">{duration}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold">Calories</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold">{calories}</Text>
        </View>
      </View>
    </View>
  )
}
