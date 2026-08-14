import { FlatList, TouchableOpacity, View, Text, ActivityIndicator } from "react-native"
import ActivtyCard from "./ActivtyCard"
import { Ionicons } from "@expo/vector-icons"
import type { ActivityCardType } from "@repo/types"

interface ActivityFeedProps {
  activities: ActivityCardType[]
  contentContainerStyle?: any
  refreshing?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  error?: string | null
}

export default function ActivityFeed({
  activities,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  isLoading = false,
  error = null,
}: ActivityFeedProps) {
  if (isLoading && activities.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#FC5200" />
        <Text className="text-slate-400 text-sm mt-3 font-medium">Loading activities...</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.activityId}
      renderItem={({ item }) => (
        <ActivtyCard activity={item} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        error ? (
          <View className="p-8 items-center justify-center">
            <Text className="text-red-400 text-sm text-center font-medium">{error}</Text>
          </View>
        ) : (
          <View className="p-8 items-center justify-center">
            <Ionicons name="fitness-outline" size={48} color="#64748B" />
            <Text className="text-slate-400 text-sm mt-2 text-center font-medium">
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
// TODO: Add a component about weekly goal
function ListHeaderComponent() {
  return (
    <View>
      <View className="bg-slate-900 p-4 mb-1 border-b border-slate-800 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-400 text-xs uppercase font-semibold">Weekly Goal</Text>
          <Text className="text-white text-lg font-bold mt-0.5">24.6 / 35.0 km</Text>
          <View className="w-48 h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <View className="w-3/4 h-full bg-[#FC5200] rounded-full" />
          </View>
        </View>
        <TouchableOpacity className="bg-slate-800 px-3 py-2 rounded-lg flex-row items-center border border-slate-700">
          <Ionicons name="trophy-outline" size={16} color="#FC5200" />
          <Text className="text-white text-xs font-semibold ml-1.5">View Goals</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}