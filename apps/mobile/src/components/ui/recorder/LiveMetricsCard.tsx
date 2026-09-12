import React from "react"
import { View, Text } from "react-native"
import GpsHeaderBanner from "./GpsHeaderBanner"

export type LiveMetricsCardProps = {
  formattedTime: string
  formattedPace: string
  formattedSpeed: string | number
  formattedDistance: string
  activityType: string
  status: "idle" | "recording" | "paused" | "finished"
  pointsCount: number
  distanceMeters: number
  isBackgroundActive: boolean
  onToggleExpand?: () => void
}

export default function LiveMetricsCard({
  formattedTime,
  formattedPace,
  formattedSpeed,
  formattedDistance,
  activityType,
  status,
  pointsCount,
  distanceMeters,
  isBackgroundActive,
  onToggleExpand,
}: LiveMetricsCardProps) {
  const isPaceMode = activityType !== "ride"

  return (
    <View className="mx-4 mb-3">
      {/* Light Green Header Bar */}
      <GpsHeaderBanner
        status={status}
        isBackgroundActive={isBackgroundActive}
        onToggleExpand={onToggleExpand}
      />

      {/* 3-Column Metrics Grid */}
      <View className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-b-2xl p-4 shadow-xl flex-row justify-between items-center">
        {/* Column 1: Time */}
        <View className="flex-1 items-center">
          <Text className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">
            {formattedTime}
          </Text>
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold mt-0.5">
            Time
          </Text>
        </View>

        <View className="w-[1px] h-8 bg-gray-200 dark:bg-slate-800" />

        {/* Column 2: Split avg / Pace / Speed */}
        <View className="flex-1 items-center">
          <Text className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">
            {status === "idle" && pointsCount === 0
              ? "-:--"
              : isPaceMode
              ? formattedPace
              : `${formattedSpeed}`}
          </Text>
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold mt-0.5">
            {isPaceMode ? "Split avg. (/km)" : "Speed (km/h)"}
          </Text>
        </View>

        <View className="w-[1px] h-8 bg-gray-200 dark:bg-slate-800" />

        {/* Column 3: Distance */}
        <View className="flex-1 items-center">
          <Text className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">
            {status === "idle" && distanceMeters === 0 ? "0" : formattedDistance}
          </Text>
          <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold mt-0.5">
            Distance (km)
          </Text>
        </View>
      </View>
    </View>
  )
}
