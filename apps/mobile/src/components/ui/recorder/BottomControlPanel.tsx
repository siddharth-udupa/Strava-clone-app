import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type ActivityTypeOption = "run" | "ride" | "walk" | "workout"

export type BottomControlPanelProps = {
  status: "idle" | "recording" | "paused" | "finished"
  activityType: ActivityTypeOption
  selectedRoute: string | null
  bottomInset: number
  onOpenActivityModal: () => void
  onStartRecording: () => void
  onPauseRecording: () => void
  onResumeRecording: () => void
  onFinishRecording: () => void
  onOpenRouteModal: () => void
}

export default function BottomControlPanel({
  status,
  activityType,
  selectedRoute,
  bottomInset,
  onOpenActivityModal,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onFinishRecording,
  onOpenRouteModal,
}: BottomControlPanelProps) {
  const getActivityIconName = (type: ActivityTypeOption) => {
    switch (type) {
      case "ride":
        return "bicycle"
      case "walk":
        return "walk"
      case "workout":
        return "fitness"
      default:
        return "footsteps"
    }
  }

  const getActivityLabel = (type: ActivityTypeOption) => {
    switch (type) {
      case "ride":
        return "Ride"
      case "walk":
        return "Walk"
      case "workout":
        return "Workout"
      default:
        return "Run"
    }
  }

  return (
    <View
      style={{ paddingBottom: Math.max(bottomInset, 28) }}
      className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 rounded-t-3xl shadow-2xl pt-4 px-7"
    >
      {/* Drag Handle Bar */}
      <View className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full self-center mb-3" />

      {/* Main Controls Row */}
      <View className="flex-row items-center justify-around my-3">
        {/* Left Button: Activity Switcher */}
        <TouchableOpacity
          onPress={onOpenActivityModal}
          className="items-center active:scale-95"
        >
          <View className="w-18 h-18 rounded-full bg-[#FFF1EB] dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 justify-center items-center relative">
            <Ionicons
              name={getActivityIconName(activityType) as any}
              size={28}
              color="#FC5200"
            />
            <View className="absolute top-0 right-0 bg-[#FC5200] w-6 h-6 rounded-full justify-center items-center border-2 border-white dark:border-slate-900 shadow-sm">
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          </View>
          <Text className="text-xs font-extrabold text-gray-800 dark:text-slate-200 mt-2 capitalize">
            {getActivityLabel(activityType)}
          </Text>
        </TouchableOpacity>

        {/* Center Button: Main Record / Pause / Resume / Finish */}
        {status === "idle" && (
          <TouchableOpacity
            onPress={onStartRecording}
            className="w-22 h-22 rounded-full bg-[#FC5200] justify-center items-center shadow-xl shadow-[#FC5200]/50 active:scale-95"
          >
            <Ionicons name="play" size={42} color="white" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}

        {status === "recording" && (
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={onPauseRecording}
              className="w-18 h-18 rounded-full bg-amber-500 justify-center items-center shadow-lg active:scale-95"
            >
              <Ionicons name="pause" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onFinishRecording}
              className="w-18 h-18 rounded-full bg-red-600 justify-center items-center shadow-lg active:scale-95"
            >
              <Ionicons name="square" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {status === "paused" && (
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={onResumeRecording}
              className="w-18 h-18 rounded-full bg-emerald-600 justify-center items-center shadow-lg active:scale-95"
            >
              <Ionicons name="play" size={30} color="white" style={{ marginLeft: 3 }} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onFinishRecording}
              className="w-18 h-18 rounded-full bg-red-600 justify-center items-center shadow-lg active:scale-95"
            >
              <Ionicons name="checkmark" size={30} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Right Button: Add Route */}
        <TouchableOpacity
          onPress={onOpenRouteModal}
          className="items-center active:scale-95"
        >
          <View className="w-18 h-18 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 justify-center items-center">
            <Ionicons name="git-network-outline" size={28} color="#374151" />
          </View>
          <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mt-2 text-center">
            {selectedRoute ? "Route Added" : "Add Route"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
