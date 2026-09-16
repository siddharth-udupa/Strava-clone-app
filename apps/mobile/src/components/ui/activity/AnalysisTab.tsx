import React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ActivityChartWrapper from "@/components/charts/ActivityChartWrapper"
import type { DistanceUnit, ElevationUnit, SpeedUnit } from "@repo/units"

export type ActivityAnalysisTabProps = {
  distanceData?: number[]
  altitudeData?: number[]
  speedData?: number[]
  distanceUnit?: DistanceUnit
  elevationUnit?: ElevationUnit
  speedUnit?: SpeedUnit
}

export default function ActivityAnalysisTab({
  distanceData,
  altitudeData,
  speedData,
  distanceUnit = "metric",
  elevationUnit = "meters",
  speedUnit = "km/h",
}: ActivityAnalysisTabProps) {
  const hasData =
    distanceData &&
    altitudeData &&
    speedData &&
    distanceData.length > 0 &&
    altitudeData.length > 0

  if (!hasData) {
    return (
      <View className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6 items-center justify-center my-4">
        <Ionicons name="stats-chart-outline" size={36} color="#FC5200" />
        <Text className="text-gray-900 dark:text-white font-bold text-sm mt-2">
          No Analysis Data
        </Text>
        <Text className="text-gray-500 dark:text-slate-400 text-xs mt-1 text-center">
          Elevation or telemetry stream data is not available for this activity.
        </Text>
      </View>
    )
  }

  return (
    <View className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 my-2 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="stats-chart" size={18} color="#FC5200" />
          <Text className="text-gray-900 dark:text-white font-bold text-sm">
            Elevation Profile
          </Text>
        </View>
      </View>

      <ActivityChartWrapper
        distanceData={distanceData}
        altitudeData={altitudeData}
        speedData={speedData}
        distanceUnit={distanceUnit}
        elevationUnit={elevationUnit}
        speedUnit={speedUnit}
      />
    </View>
  )
}
