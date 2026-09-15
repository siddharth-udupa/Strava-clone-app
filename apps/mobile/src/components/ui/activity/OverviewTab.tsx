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
    <View className="mb-2">
      {/* Main 3 Metrics Header Card */}
      <View className="flex-row items-center justify-around bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-5 mb-5 shadow-xs">
        <View className="flex-1 items-center justify-center px-1">
          <Text className="text-gray-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider text-center leading-tight mb-1.5">
            Distance
          </Text>
          <View className="flex-row items-baseline justify-center">
            <Text className="text-gray-900 dark:text-white text-2xl font-black leading-tight">{distance}</Text>
            <Text className="text-gray-500 dark:text-slate-400 text-xs ml-1 font-semibold leading-tight">km</Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center border-x border-gray-200 dark:border-slate-800/80 px-2 py-0.5">
          <Text className="text-gray-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider text-center leading-tight mb-1.5">
            Moving Time
          </Text>
          <Text className="text-gray-900 dark:text-white text-2xl font-black leading-tight text-center">{duration}</Text>
        </View>

        <View className="flex-1 items-center justify-center px-1">
          <Text className="text-gray-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider text-center leading-tight mb-1.5">
            Pace
          </Text>
          <View className="flex-row items-baseline justify-center">
            <Text className="text-gray-900 dark:text-white text-2xl font-black leading-tight">{pace}</Text>
            <Text className="text-gray-500 dark:text-slate-400 text-xs ml-1 font-semibold leading-tight">/km</Text>
          </View>
        </View>
      </View>

      {/* Secondary Detailed Metrics Grid */}
      <View className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-1">
        <View className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-slate-800/60">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">Elevation Gain</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold leading-relaxed">{elevGain} m</Text>
        </View>

        <View className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-slate-800/60">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">Elevation Loss</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold leading-relaxed">{elevLoss} m</Text>
        </View>

        <View className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-slate-800/60">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">Elapsed Time</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold leading-relaxed">{duration}</Text>
        </View>

        <View className="flex-row justify-between items-center pt-2">
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">Calories</Text>
          <Text className="text-gray-900 dark:text-white text-sm font-extrabold leading-relaxed">{calories}</Text>
        </View>
      </View>
    </View>
  )
}

