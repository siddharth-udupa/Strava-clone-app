import { FlatList, TouchableOpacity, View, Text, ActivityIndicator } from "react-native"
import ActivtyCard from "./ActivtyCard"
import { Ionicons } from "@expo/vector-icons"
import type { ActivityCardType, PreferencesType } from "@repo/types"
import { useEffect, useState } from "react"
import { authClient, type User } from "@/lib/auth-client"

interface ActivityFeedProps {
  user: User
  activities: ActivityCardType[]
  contentContainerStyle?: any
  refreshing?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  error?: string | null
}

const API_URL = process.env.EXPO_PUBLIC_API_URL!

// Module-level cache for user preferences to prevent fetching on every tab switch
let cachedPreferences: PreferencesType | null = null

const DEFAULT_PREFERENCES: PreferencesType = {
  updatedAt: null,
  userId: "",
  onBoarded: true,
  theme: "light",
  distanceUnit: "metric",
  elevationUnit: "meters",
  paceUnit: "min/km",
  speedUnit: "km/h",
  weightUnit: "kg",
  timeFormat: "12h",
}

export default function ActivityFeed({
  user,
  activities,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  isLoading = false,
  error = null,
}: ActivityFeedProps) {
  const [preferences, setPreference] = useState<PreferencesType>(
    cachedPreferences ?? DEFAULT_PREFERENCES
  )

  useEffect(() => {
    if (cachedPreferences) return

    async function fetchPreferences() {
      try {
        const res = await authClient.$fetch<PreferencesType>(
          `${API_URL}/api/preferences`
        )
        if (res?.data) {
          cachedPreferences = res.data
          setPreference(res.data)
        }
      } catch (err) {
        console.error("Using default preferences due to fetch error:", err)
      }
    }
    fetchPreferences()
  }, [])


  if (isLoading && activities.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8 bg-gray-100 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#FC5200" />
        <Text className="text-gray-500 dark:text-slate-400 text-sm mt-3 font-medium">
          Loading activities...
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.activityId}
      renderItem={({ item }) => (
        <ActivtyCard activity={item} preferences={preferences} user={user} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        error ? (
          <View className="p-8 items-center justify-center">
            <Text className="text-red-500 dark:text-red-400 text-sm text-center font-medium">
              {error}
            </Text>
          </View>
        ) : (
          <View className="p-8 items-center justify-center">
            <Ionicons name="fitness-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-slate-400 text-sm mt-2 text-center font-medium">
              No activities found yet.
            </Text>
          </View>
        )
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  )
}

// Header Banner Widget Component
function ListHeaderComponent() {
  return (
    <View>
      <View className="bg-white dark:bg-slate-900 p-4 mb-2 border-b border-gray-200 dark:border-slate-800 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
            Weekly Goal
          </Text>
          <Text className="text-gray-900 dark:text-white text-lg font-bold mt-0.5">
            24.6 / 35.0 km
          </Text>
          <View className="w-48 h-2 bg-gray-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <View className="w-3/4 h-full bg-[#FC5200] rounded-full" />
          </View>
        </View>
        <TouchableOpacity className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-lg flex-row items-center border border-gray-200 dark:border-slate-700">
          <Ionicons name="trophy-outline" size={16} color="#FC5200" />
          <Text className="text-gray-800 dark:text-white text-xs font-semibold ml-1.5">
            View Goals
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}