import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import {
  formatDurationShort,
  formatPace,
  metersToDistance,
  mpsToSpeed,
} from "@repo/units"
import Map from "@/components/map/Map"
import ActionModal from "@/components/ui/ActionModal"
import { useActivityRecorder } from "@/hooks/useActivityRecorder"
import {
  getActiveSession,
  computeElapsedSeconds,
  type ActiveSession,
} from "@/lib/activeSessionStorage"

type SportType = "run" | "ride" | "walk" | "hike"

const SPORTS: { type: SportType; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { type: "run", label: "Run", icon: "walk" },
  { type: "ride", label: "Ride", icon: "bicycle" },
  { type: "walk", label: "Walk", icon: "footsteps" },
  { type: "hike", label: "Hike", icon: "trail-sign" },
]

function getDefaultTitle(sport: string, startedAt?: number): string {
  const date = startedAt ? new Date(startedAt) : new Date()
  const hour = date.getHours()

  let timeOfDay = "Morning"
  if (hour >= 12 && hour < 17) {
    timeOfDay = "Afternoon"
  } else if (hour >= 17 && hour < 20) {
    timeOfDay = "Evening"
  } else if (hour >= 20 || hour < 5) {
    timeOfDay = "Night"
  }

  const sportName = sport.charAt(0).toUpperCase() + sport.slice(1)
  return `${timeOfDay} ${sportName}`
}

export default function SaveActivityScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { saveRecordedActivity, discardRecordingSession } = useActivityRecorder()

  const [session, setSession] = useState<ActiveSession | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [sportType, setSportType] = useState<SportType>("run")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  // Modals state
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false)
  const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false)

  // Load session from disk on mount
  useEffect(() => {
    let isMounted = true
    getActiveSession().then((sess) => {
      if (isMounted) {
        if (sess) {
          setSession(sess)
          const initialSport = (sess.type as SportType) || "run"
          setSportType(initialSport)
          setTitle(getDefaultTitle(initialSport, sess.startedAt))
        } else {
          setTitle(getDefaultTitle("run"))
        }
        setLoadingSession(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // When sport selection changes, update title if user hasn't heavily customized it
  const handleSelectSport = (type: SportType) => {
    setSportType(type)
    setTitle(getDefaultTitle(type, session?.startedAt))
  }

  const distanceMeters = session?.distanceMeters || 0
  const elapsedSeconds = session ? computeElapsedSeconds(session) : 0
  const points = session?.points || []
  const maxSpeedMps = session?.maxSpeedMps || 0

  const formattedDistance = metersToDistance(distanceMeters, "metric").toFixed(2)
  const formattedTime = formatDurationShort(elapsedSeconds)
  const formattedPace = formatPace(elapsedSeconds, distanceMeters, "min/km")
  const formattedMaxSpeed = mpsToSpeed(maxSpeedMps, "km/h").toFixed(1)

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for your activity.")
      return
    }

    setIsSaving(true)
    try {
      const result = await saveRecordedActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        activityType: sportType,
      })

      if (result) {
        setIsSuccessModalVisible(true)
      } else {
        Alert.alert("Save Failed", "There was an error saving your activity. Please try again.")
      }
    } catch (err: any) {
      console.error("Error saving activity:", err)
      Alert.alert("Error", "An unexpected error occurred while saving.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loadingSession) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-950 justify-center items-center">
        <ActivityIndicator size="large" color="#FC5200" />
        <Text className="text-gray-400 text-xs font-semibold mt-3">Loading recorded data...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* White Clean Navigation Bar without buttons */}
      <View
        style={{ paddingTop: Math.max(insets.top, 35) }}
        className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 pb-3 justify-center items-center"
      >
        <Text className="text-gray-900 dark:text-white font-bold text-lg">Save Activity</Text>
        <Text className="text-gray-500 dark:text-slate-400 text-[11px] font-medium">Review & publish</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 28) + 90 }}
        className="flex-1"
      >
        <View className="pt-3">
          {/* 1. TITLE BOX */}
          <View className="bg-white dark:bg-slate-900 rounded-2xl mx-4 mb-3 p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Title <Text className="text-[#FC5200]">*</Text>
            </Text>
            <View className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 h-11 flex-row items-center">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Name your activity..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-base text-gray-900 dark:text-white font-medium"
                style={{ paddingVertical: 0 }}
                maxLength={100}
              />
            </View>
          </View>

          {/* 2. DESCRIPTION */}
          <View className="bg-white dark:bg-slate-900 rounded-2xl mx-4 mb-3 p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Description
            </Text>
            <View className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="How'd it go? Share details about your workout..."
                placeholderTextColor="#9CA3AF"
                className="text-sm text-gray-900 dark:text-white"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 90 }}
                maxLength={1000}
              />
            </View>
            {description.length > 800 && (
              <Text className="text-right text-[10px] text-gray-400 mt-1">
                {description.length}/1000
              </Text>
            )}
          </View>

          {/* 3. TYPE (SPORT TYPE SELECTOR) */}
          <View className="bg-white dark:bg-slate-900 rounded-2xl mx-4 mb-3 p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Sport Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SPORTS.map((sport) => {
                const isActive = sport.type === sportType
                return (
                  <TouchableOpacity
                    key={sport.type}
                    onPress={() => handleSelectSport(sport.type)}
                    activeOpacity={0.75}
                    className={`flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-xl border ${
                      isActive
                        ? "bg-[#FC5200] border-[#FC5200]"
                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                    }`}
                  >
                    <Ionicons
                      name={sport.icon}
                      size={16}
                      color={isActive ? "#FFFFFF" : "#9CA3AF"}
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        isActive ? "text-white" : "text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      {sport.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* 4. OVERVIEW */}
          <View className="bg-white dark:bg-slate-900 rounded-2xl mx-4 mb-3 p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Overview
            </Text>

            <View className="flex-row items-center justify-around py-1">
              <View className="items-center flex-1 border-r border-gray-100 dark:border-slate-800">
                <Text className="text-2xl font-black text-gray-900 dark:text-white">
                  {formattedDistance}
                </Text>
                <Text className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">
                  Distance (km)
                </Text>
              </View>

              <View className="items-center flex-1 border-r border-gray-100 dark:border-slate-800">
                <Text className="text-2xl font-black text-gray-900 dark:text-white">
                  {formattedTime}
                </Text>
                <Text className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">
                  Time
                </Text>
              </View>

              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-gray-900 dark:text-white">
                  {formattedPace}
                </Text>
                <Text className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">
                  Avg Pace
                </Text>
              </View>
            </View>

            {maxSpeedMps > 0 && (
              <View className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex-row justify-between items-center px-2">
                <Text className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Max Speed
                </Text>
                <Text className="text-xs font-bold text-gray-900 dark:text-white">
                  {formattedMaxSpeed} km/h
                </Text>
              </View>
            )}
          </View>

          {/* 5. MAP */}
          <View className="mx-4 mb-3 rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm h-48 relative">
            <Map isStatic={true} livePoints={points} />
            <View className="absolute bottom-2 left-2 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/50 flex-row items-center">
              <Ionicons name="location-sharp" size={12} color="#FC5200" />
              <Text className="text-white text-[11px] font-bold ml-1">
                {points.length} GPS Points Recorded
              </Text>
            </View>
          </View>

          {/* 6. DISCARD BUTTON */}
          <View className="mx-4 mb-4">
            <TouchableOpacity
              onPress={() => setIsDiscardModalVisible(true)}
              activeOpacity={0.8}
              className="w-full py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 items-center justify-center flex-row gap-2 active:bg-red-100 dark:active:bg-red-500/20"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-red-600 dark:text-red-400 font-bold text-sm">
                Discard Activity
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 7. SAVE ACTIVITY BUTTON — elevated higher to avoid overlapping device menu/nav bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom + 16, 28) }}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 pt-3 shadow-xl"
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || !title.trim()}
          activeOpacity={0.85}
          style={
            title.trim() && !isSaving
              ? {
                  shadowColor: "#FC5200",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }
              : undefined
          }
          className={`h-12 rounded-2xl items-center justify-center flex-row gap-2 ${
            title.trim() && !isSaving
              ? "bg-[#FC5200]"
              : "bg-gray-200 dark:bg-slate-800 opacity-60"
          }`}
        >
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white font-bold text-sm">Saving Activity...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={title.trim() ? "#FFFFFF" : "#9CA3AF"}
              />
              <Text
                className={`font-bold text-sm ${
                  title.trim() ? "text-white" : "text-gray-400 dark:text-slate-500"
                }`}
              >
                Save Activity
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* SUCCESS ACTION MODAL */}
      <ActionModal
        visible={isSuccessModalVisible}
        title="Activity Saved!"
        description="Your activity has been logged successfully and published to your feed."
        icon="checkmark-circle"
        iconVariant="success"
        primaryText="Go to Dashboard"
        onPrimaryPress={() => {
          setIsSuccessModalVisible(false)
          router.replace("/(app)/dashboard" as any)
        }}
        closeOnBackdropPress={false}
      />

      {/* DISCARD CONFIRMATION ACTION MODAL */}
      <ActionModal
        visible={isDiscardModalVisible}
        title="Discard Activity?"
        description="Are you sure you want to discard this recorded activity? This action cannot be undone."
        icon="trash-outline"
        iconVariant="danger"
        primaryText="Discard"
        primaryVariant="destructive"
        onPrimaryPress={async () => {
          setIsDiscardModalVisible(false)
          await discardRecordingSession()
          router.replace("/(app)/dashboard" as any)
        }}
        secondaryText="Cancel"
        onSecondaryPress={() => setIsDiscardModalVisible(false)}
        onClose={() => setIsDiscardModalVisible(false)}
      />
    </View>
  )
}
