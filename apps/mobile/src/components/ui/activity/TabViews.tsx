import React from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { TabType } from "./TabNavigation"
import type { DistanceUnit, ElevationUnit, SpeedUnit } from "@repo/units"

const ActivityAnalysisTab = React.lazy(() => import("./AnalysisTab"))

export type ActivityTabViewsProps = {
  activeTab: TabType
  streams?: Array<{
    distanceData: number[]
    altitudeData: number[]
    speedData: number[]
  }>
  preferences?: {
    distanceUnit: DistanceUnit
    elevationUnit: ElevationUnit
    speedUnit: SpeedUnit
  }
}

class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chart ErrorBoundary caught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-6 items-center justify-center my-4">
          <Ionicons name="alert-circle-outline" size={36} color="#F59E0B" />
          <Text className="text-amber-900 dark:text-amber-200 font-bold text-sm mt-2 text-center">
            Unable to render chart
          </Text>
          <Text className="text-amber-700 dark:text-amber-400 text-xs mt-1 text-center">
            The native SVG views have not been compiled into your app binary yet. Run 'npx expo run:android' or rebuild your dev client to enable chart rendering.
          </Text>
        </View>
      )
    }
    return this.props.children
  }
}

export default function ActivityTabViews({
  activeTab,
  streams,
  preferences,
}: ActivityTabViewsProps) {
  if (activeTab === "analysis") {
    const stream = streams && streams.length > 0 ? streams[0] : undefined
    return (
      <ChartErrorBoundary>
        <React.Suspense
          fallback={
            <View className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-8 items-center justify-center my-4">
              <ActivityIndicator size="small" color="#FC5200" />
              <Text className="text-xs text-gray-500 mt-2">Loading analysis chart...</Text>
            </View>
          }
        >
          <ActivityAnalysisTab
            distanceData={stream?.distanceData}
            altitudeData={stream?.altitudeData}
            speedData={stream?.speedData}
            distanceUnit={preferences?.distanceUnit}
            elevationUnit={preferences?.elevationUnit}
            speedUnit={preferences?.speedUnit}
          />
        </React.Suspense>
      </ChartErrorBoundary>
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
