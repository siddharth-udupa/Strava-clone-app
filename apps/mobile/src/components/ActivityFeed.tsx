import { FlatList, TouchableOpacity, View, Text } from "react-native"
import ActivtyCard, { ActivityItem } from "./ActivtyCard"
import { Ionicons } from "@expo/vector-icons"

interface ActivityFeedProps {
  activities: ActivityItem[]
  contentContainerStyle?: any
}

export default function ActivityFeed({
  activities,
  contentContainerStyle,
}: ActivityFeedProps) {
  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ActivtyCard activity={item} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
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