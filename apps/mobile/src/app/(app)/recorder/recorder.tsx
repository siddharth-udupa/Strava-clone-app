import { useState } from "react"
import { View, Text, TouchableOpacity, Alert, Modal, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { metersToDistance, formatDurationShort, formatPace, mpsToSpeed } from "@repo/units"
import { useActivityRecorder } from "@/hooks/useActivityRecorder"
import Map from "@/components/map/Map"
import { tileProviders, DEFAULT_TILE_PROVIDER, type TileProviderId } from "@repo/maps"

import FloatingMapControls from "@/components/ui/recorder/FloatingMapControls"
import LiveMetricsCard from "@/components/ui/recorder/LiveMetricsCard"
import BottomControlPanel, { type ActivityTypeOption } from "@/components/ui/recorder/BottomControlPanel"
import ActivityTypeModal from "@/components/ui/recorder/ActivityTypeModal"
import RouteSelectionModal from "@/components/ui/recorder/RouteSelectionModal"

export default function RecorderScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [activityType, setActivityType] = useState<ActivityTypeOption>("run")
  const [providerId, setProviderId] = useState<TileProviderId>(DEFAULT_TILE_PROVIDER)
  const [is3dMode, setIs3dMode] = useState(false)
  const [isLayerPickerOpen, setIsLayerPickerOpen] = useState(false)
  const [isActivityTypeModalOpen, setIsActivityTypeModalOpen] = useState(false)
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  const recorderType = activityType === "ride" ? "ride" : "run"
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
  } = useActivityRecorder(recorderType)

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
      Alert.alert("Activity Saved!", `Total distance: ${distKm.toFixed(2)} km`)
      handleGoBack()
    }
  }

  const handleRecenterLocation = () => {
    Alert.alert("Location", "Map view centered on current position.")
  }

  const formattedDistance = metersToDistance(distanceMeters, "metric").toFixed(2)
  const formattedTime = formatDurationShort(elapsedSeconds)
  const formattedPace = formatPace(elapsedSeconds, distanceMeters, "min/km")
  const formattedSpeed = mpsToSpeed(currentSpeedMps, "km/h")

  return (
    <View className="flex-1 bg-slate-900 relative">
      {/* Fullscreen Map Background */}
      <View className="absolute inset-0">
        <Map providerId={providerId} isStatic={false} />
      </View>

      {/* Top Left Back Button (Floating circular chevron down) */}
      <TouchableOpacity
        onPress={handleGoBack}
        style={{ top: Math.max(insets.top + 8, 16) }}
        className="absolute left-4 z-30 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 justify-center items-center shadow-lg active:scale-95"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-down" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Bottom Overlay Container */}
      <View className="absolute bottom-0 left-0 right-0 z-20 justify-end">
        {/* Floating Map Action Buttons (Stack above Metrics Card) */}
        <FloatingMapControls
          is3dMode={is3dMode}
          onOpenLayerPicker={() => setIsLayerPickerOpen(true)}
          onToggle3dMode={() => setIs3dMode((prev) => !prev)}
          onRecenterLocation={handleRecenterLocation}
          onOpenInfo={() =>
            Alert.alert(
              "Map Info",
              `Active Style: ${tileProviders[providerId]?.name || providerId}`
            )
          }
        />

        {/* Error Notification Banner */}
        {errorMsg && (
          <View className="mx-4 mb-2 bg-red-500/90 px-4 py-2.5 rounded-xl border border-red-400">
            <Text className="text-white text-xs font-bold text-center">{errorMsg}</Text>
          </View>
        )}

        {/* Live Activity Metrics Card */}
        <LiveMetricsCard
          formattedTime={formattedTime}
          formattedPace={formattedPace}
          formattedSpeed={formattedSpeed}
          formattedDistance={formattedDistance}
          activityType={activityType}
          status={status}
          pointsCount={points.length}
          distanceMeters={distanceMeters}
          isBackgroundActive={isBackgroundActive}
        />

        {/* Enlarged Strava Curved Bottom Panel */}
        <BottomControlPanel
          status={status}
          activityType={activityType}
          selectedRoute={selectedRoute}
          bottomInset={insets.bottom}
          onOpenActivityModal={() => setIsActivityTypeModalOpen(true)}
          onStartRecording={startRecording}
          onPauseRecording={pauseRecording}
          onResumeRecording={resumeRecording}
          onFinishRecording={handleFinish}
          onOpenRouteModal={() => setIsAddRouteModalOpen(true)}
        />
      </View>

      {/* Map Layer Switcher Modal */}
      <Modal
        visible={isLayerPickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLayerPickerOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 max-h-[70%] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-800 pb-3">
              <View className="flex-row items-center">
                <Ionicons name="layers" size={20} color="#FC5200" />
                <Text className="text-gray-900 dark:text-white font-bold text-lg ml-2">
                  Choose Map Style
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsLayerPickerOpen(false)}
                className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-full"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-2">
              {(Object.keys(tileProviders) as TileProviderId[]).map((key) => {
                const provider = tileProviders[key]
                const isSelected = providerId === key
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setProviderId(key)
                      setIsLayerPickerOpen(false)
                    }}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between my-1 ${
                      isSelected
                        ? "bg-orange-50 dark:bg-[#FC5200]/15 border-[#FC5200]"
                        : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-800"
                    }`}
                  >
                    <View className="flex-1 mr-2">
                      <Text
                        className={`font-semibold text-sm ${
                          isSelected ? "text-[#FC5200]" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {provider.name}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color="#FC5200" />}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Activity Type Selection Modal */}
      <ActivityTypeModal
        visible={isActivityTypeModalOpen}
        activityType={activityType}
        onSelectActivity={(type) => setActivityType(type)}
        onClose={() => setIsActivityTypeModalOpen(false)}
      />

      {/* Route Selection Modal */}
      <RouteSelectionModal
        visible={isAddRouteModalOpen}
        selectedRoute={selectedRoute}
        onSelectRoute={(route) => setSelectedRoute(route)}
        onClose={() => setIsAddRouteModalOpen(false)}
      />
    </View>
  )
}
