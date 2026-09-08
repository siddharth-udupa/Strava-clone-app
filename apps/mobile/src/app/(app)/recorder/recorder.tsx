import { useState } from "react"
import { View, Text, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { metersToDistance, formatDurationShort, formatPace, mpsToSpeed } from "@repo/units"
import { useActivityRecorder } from "@/hooks/useActivityRecorder"

export default function RecorderScreen() {
  const router = useRouter()
  const [activityType, setActivityType] = useState<"run" | "ride">("run")
  const {
    status,
    points,
    distanceMeters,
    elapsedSeconds,
    currentSpeedMps,
    isBackgroundActive,
    errorMsg,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopAndSaveRecording,
  } = useActivityRecorder(activityType)

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(app)/dashboard" as any)
    }
  }

  const handleFinish = async () => {
    const saved = await stopAndSaveRecording()
    if (saved) {
      const distKm = metersToDistance(saved.distanceMeters, "metric")
      Alert.alert("Activity Saved!", `Total distance: ${distKm} km`)
      handleGoBack()
    }
  }

  const formattedDistance = metersToDistance(distanceMeters, "metric").toFixed(2)
  const formattedTime = formatDurationShort(elapsedSeconds)
  const formattedPace = formatPace(elapsedSeconds, distanceMeters, "min/km")
  const formattedSpeed = mpsToSpeed(currentSpeedMps, "km/h")

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-slate-950">
      <View className="flex-1 p-4 justify-between">
        {/* Top Header & Type Switcher */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleGoBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 justify-center items-center shadow-xs"
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>

            <Text className="text-gray-500 dark:text-slate-400 text-sm font-semibold uppercase">
              GPS Activity Recorder
            </Text>

            <View className="w-10" />
          </View>

          {status === "idle" && (
            <View className="flex-row mt-4 bg-gray-200 dark:bg-slate-800 rounded-lg p-1 self-center w-48">
              <TouchableOpacity
                onPress={() => setActivityType("run")}
                className={`flex-1 py-2 rounded-md items-center ${
                  activityType === "run" ? "bg-[#FC5200]" : "bg-transparent"
                }`}
              >
                <Text
                  className={`font-bold ${
                    activityType === "run" ? "text-white" : "text-gray-700 dark:text-slate-300"
                  }`}
                >
                  Run
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivityType("ride")}
                className={`flex-1 py-2 rounded-md items-center ${
                  activityType === "ride" ? "bg-[#FC5200]" : "bg-transparent"
                }`}
              >
                <Text
                  className={`font-bold ${
                    activityType === "ride" ? "text-white" : "text-gray-700 dark:text-slate-300"
                  }`}
                >
                  Ride
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {status !== "idle" && (
            <View className="flex-row justify-center mt-3">
              <View
                className={`flex-row items-center px-3 py-1 rounded-full gap-1.5 ${
                  isBackgroundActive ? "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800" : "bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800"
                }`}
              >
                <View
                  className={`w-2 h-2 rounded-full ${
                    isBackgroundActive ? "bg-emerald-600" : "bg-amber-600"
                  }`}
                />
                <Text
                  className={`text-xs font-semibold ${
                    isBackgroundActive ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {isBackgroundActive ? "Background GPS Active (Priority 1)" : "Foreground GPS (Fallback)"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Error Notification */}
        {errorMsg && (
          <View className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 p-3 rounded-lg my-2">
            <Text className="text-red-600 dark:text-red-400 text-center font-semibold">{errorMsg}</Text>
          </View>
        )}

        {/* Live Metrics Grid */}
        <View className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          {/* Main Distance Metric */}
          <View className="items-center mb-6">
            <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold tracking-wider uppercase">
              DISTANCE (KM)
            </Text>
            <Text className="text-gray-900 dark:text-white text-6xl font-black mt-1">
              {formattedDistance}
            </Text>
          </View>

          {/* Secondary Stats Grid */}
          <View className="flex-row justify-around border-t border-gray-200 dark:border-slate-800 pt-4">
            <View className="items-center">
              <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase">TIME</Text>
              <Text className="text-gray-900 dark:text-white text-2xl font-bold mt-1">
                {formattedTime}
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase">
                {activityType === "run" ? "PACE" : "SPEED (KM/H)"}
              </Text>
              <Text className="text-gray-900 dark:text-white text-2xl font-bold mt-1">
                {activityType === "run" ? formattedPace : `${formattedSpeed}`}
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase">GPS PTS</Text>
              <Text className="text-gray-900 dark:text-white text-2xl font-bold mt-1">
                {points.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View className="mb-5">
          {status === "idle" && (
            <TouchableOpacity
              onPress={startRecording}
              className="bg-[#FC5200] h-16 rounded-full justify-center items-center shadow-lg shadow-[#FC5200]/40"
            >
              <Text className="text-white text-xl font-black tracking-wider">
                START
              </Text>
            </TouchableOpacity>
          )}

          {status === "recording" && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={pauseRecording}
                className="flex-1 bg-amber-500 h-14 rounded-full justify-center items-center"
              >
                <Text className="text-white text-lg font-bold">PAUSE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinish}
                className="flex-1 bg-red-600 h-14 rounded-full justify-center items-center"
              >
                <Text className="text-white text-lg font-bold">FINISH</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === "paused" && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={resumeRecording}
                className="flex-1 bg-emerald-600 h-14 rounded-full justify-center items-center"
              >
                <Text className="text-white text-lg font-bold">RESUME</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinish}
                className="flex-1 bg-red-600 h-14 rounded-full justify-center items-center"
              >
                <Text className="text-white text-lg font-bold">FINISH</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
