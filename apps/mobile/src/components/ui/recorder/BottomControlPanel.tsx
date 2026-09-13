import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"

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
  const getActivityIcon = (type: ActivityTypeOption) => {
    switch (type) {
      case "ride":
        return <Ionicons name="bicycle" size={32} color="#FC5200" />
      case "walk":
        return <Ionicons name="walk" size={32} color="#FC5200" />
      case "workout":
        return <Ionicons name="fitness" size={30} color="#FC5200" />
      default:
        return <MaterialCommunityIcons name="run" size={34} color="#FC5200" />
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
      style={{ paddingBottom: Math.max(bottomInset + 16, 28) }}
      className="bg-white dark:bg-slate-900 rounded-t-[36px] shadow-2xl pt-3 px-6 justify-between border-t border-gray-100 dark:border-slate-800/80"
    >
      {/* Drag Handle Bar */}
      <View className="w-10 h-1 bg-gray-500/80 dark:bg-slate-500 rounded-full self-center mt-1 mb-4" />

      {/* Main Controls Row */}
      <View className="flex-row items-start justify-around my-1 py-1">
        {/* Left Button: Activity Switcher */}
        <TouchableOpacity
          onPress={onOpenActivityModal}
          activeOpacity={0.8}
          className="items-center w-24"
        >
          <View className="w-[72px] h-[72px] rounded-full bg-[#FFEAE3] dark:bg-orange-950/40 justify-center items-center relative">
            {getActivityIcon(activityType)}
            {/* Checkmark Badge */}
            <View className="absolute top-0 right-0 bg-[#FC5200] w-5 h-5 rounded-full justify-center items-center border-2 border-white dark:border-slate-900">
              <Ionicons name="checkmark" size={11} color="white" />
            </View>
          </View>
          <Text className="text-[13px] font-semibold text-gray-900 dark:text-slate-100 mt-2 text-center capitalize">
            {getActivityLabel(activityType)}
          </Text>
        </TouchableOpacity>

        {/* Center Button: Record / Pause / Resume / Finish */}
        <View className="items-center justify-center">
          {status === "idle" && (
            <TouchableOpacity
              onPress={onStartRecording}
              activeOpacity={0.85}
              className="w-[82px] h-[82px] rounded-full bg-[#FC5200] justify-center items-center shadow-lg shadow-[#FC5200]/40"
            >
              <Ionicons name="play" size={44} color="white" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}

          {status === "recording" && (
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={onPauseRecording}
                activeOpacity={0.85}
                className="w-[72px] h-[72px] rounded-full bg-amber-500 justify-center items-center shadow-md"
              >
                <Ionicons name="pause" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onFinishRecording}
                activeOpacity={0.85}
                className="w-[72px] h-[72px] rounded-full bg-red-600 justify-center items-center shadow-md"
              >
                <Ionicons name="square" size={26} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {status === "paused" && (
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={onResumeRecording}
                activeOpacity={0.85}
                className="w-[72px] h-[72px] rounded-full bg-emerald-600 justify-center items-center shadow-md"
              >
                <Ionicons name="play" size={32} color="white" style={{ marginLeft: 3 }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onFinishRecording}
                activeOpacity={0.85}
                className="w-[72px] h-[72px] rounded-full bg-red-600 justify-center items-center shadow-md"
              >
                <Ionicons name="checkmark" size={32} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right Button: Add Route */}
        <TouchableOpacity
          onPress={onOpenRouteModal}
          activeOpacity={0.8}
          className="items-center w-24"
        >
          <View className="w-[72px] h-[72px] rounded-full bg-[#F0F1F5] dark:bg-slate-800 justify-center items-center">
            <Ionicons name="git-network-outline" size={28} color="#374151" />
          </View>
          <Text className="text-[13px] font-semibold text-gray-900 dark:text-slate-100 mt-2 text-center leading-tight">
            {selectedRoute ? "Route\nAdded" : "Add\nRoute"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
