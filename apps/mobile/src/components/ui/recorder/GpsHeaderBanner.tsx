import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { LocationStatus } from "@/hooks/useActivityRecorder"

export type GpsHeaderBannerProps = {
  status: "idle" | "recording" | "paused" | "finished"
  locationStatus?: LocationStatus
  isBackgroundActive: boolean
  onToggleExpand?: () => void
  onRequestPermissions?: () => void
}

export default function GpsHeaderBanner({
  status,
  locationStatus = "acquired",
  isBackgroundActive,
  onToggleExpand,
  onRequestPermissions,
}: GpsHeaderBannerProps) {
  let bannerBg = "bg-[#EAF5EA] dark:bg-emerald-950/90"
  let borderBg = "border-emerald-200 dark:border-emerald-900"
  let textColor = "text-[#2E7D32] dark:text-emerald-400"
  let iconName: keyof typeof Ionicons.glyphMap = "cellular"
  let iconColor = "#2E7D32"
  let statusText = "GPS Acquired"

  if (locationStatus === "disabled") {
    bannerBg = "bg-red-100 dark:bg-red-950/90"
    borderBg = "border-red-200 dark:border-red-900"
    textColor = "text-red-700 dark:text-red-400"
    iconName = "warning-outline"
    iconColor = "#DC2626"
    statusText = "Location Service Turned Off"
  } else if (locationStatus === "denied") {
    bannerBg = "bg-red-100 dark:bg-red-950/90"
    borderBg = "border-red-200 dark:border-red-900"
    textColor = "text-red-700 dark:text-red-400"
    iconName = "alert-circle-outline"
    iconColor = "#DC2626"
    statusText = "Location Permission Denied"
  } else if (locationStatus === "acquiring") {
    bannerBg = "bg-amber-100 dark:bg-amber-950/90"
    borderBg = "border-amber-200 dark:border-amber-900"
    textColor = "text-amber-800 dark:text-amber-400"
    iconName = "compass-outline"
    iconColor = "#D97706"
    statusText = "Acquiring Location..."
  } else {
    if (status === "paused") {
      statusText = "GPS Paused"
      bannerBg = "bg-amber-100 dark:bg-amber-950/90"
      borderBg = "border-amber-200 dark:border-amber-900"
      textColor = "text-amber-800 dark:text-amber-400"
      iconName = "pause-circle-outline"
      iconColor = "#D97706"
    } else if (status === "recording") {
      statusText = isBackgroundActive ? "GPS Active (High Precision)" : "GPS Active"
      bannerBg = "bg-[#EAF5EA] dark:bg-emerald-950/90"
      borderBg = "border-emerald-200 dark:border-emerald-900"
      textColor = "text-[#2E7D32] dark:text-emerald-400"
      iconName = "cellular"
      iconColor = "#2E7D32"
    } else {
      statusText = "GPS Acquired"
      bannerBg = "bg-[#EAF5EA] dark:bg-emerald-950/90"
      borderBg = "border-emerald-200 dark:border-emerald-900"
      textColor = "text-[#2E7D32] dark:text-emerald-400"
      iconName = "cellular"
      iconColor = "#2E7D32"
    }
  }

  const isClickable = (locationStatus === "disabled" || locationStatus === "denied") && !!onRequestPermissions

  return (
    <TouchableOpacity
      disabled={!isClickable}
      onPress={onRequestPermissions}
      activeOpacity={0.8}
      className={`${bannerBg} rounded-t-2xl px-4 py-2.5 flex-row justify-center items-center relative border-t border-x ${borderBg}`}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name={iconName} size={16} color={iconColor} />
        <Text className={`text-xs font-black ${textColor} tracking-wide text-center uppercase`}>
          {statusText}
        </Text>
      </View>

      {onToggleExpand && (
        <TouchableOpacity
          onPress={onToggleExpand}
          className="absolute right-3.5 p-1"
          accessibilityLabel="Toggle metrics expand"
        >
          <Ionicons name="resize-outline" size={16} color={iconColor} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

