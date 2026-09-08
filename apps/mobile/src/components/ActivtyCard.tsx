import { View, Text, TouchableOpacity, Image } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import type { ActivityCardType, PreferencesType } from "@repo/types"
import ActivityMap from "./map/Map"
import {
  metersToDistance,
  metersToElevation,
  formatDateAndTime,
  formatDurationShort,
  formatPace,
  mpsToSpeed,
} from "@repo/units"
import type { User } from "@/lib/auth-client"

interface ActivityCardProps {
  activity: ActivityCardType
  preferences: PreferencesType
  user: User
}

const getSportIcon = (type: string) => {
  const normalized = type?.toLowerCase() || ""
  if (normalized.includes("run") || normalized.includes("walk")) {
    return <MaterialCommunityIcons name="run" size={24} color="#111827" />
  }
  if (normalized.includes("ride") || normalized.includes("cycle") || normalized.includes("bike")) {
    return <MaterialCommunityIcons name="bike" size={24} color="#111827" />
  }
  if (normalized.includes("hike")) {
    return <MaterialCommunityIcons name="hiking" size={24} color="#111827" />
  }
  return <MaterialCommunityIcons name="lightning-bolt" size={24} color="#111827" />
}

export default function ActivtyCard({ activity, preferences, user }: ActivityCardProps) {
  const router = useRouter()

  const handlePressCard = () => {
    if (activity.activityId) {
      router.push(`/activities/${activity.activityId}` as any)
    }
  }

  const { date: formattedDate, time: formattedTime } = formatDateAndTime(
    activity.createdAt,
    preferences?.timeFormat
  )

  const isRunOrWalk = ["run", "walk", "hike"].some((t) =>
    activity.type?.toLowerCase().includes(t)
  )
  const isRide = ["ride", "cycle", "bike"].some((t) =>
    activity.type?.toLowerCase().includes(t)
  )

  const distanceVal = metersToDistance(activity.distance, preferences?.distanceUnit)
  const distanceUnitLabel = preferences?.distanceUnit === "imperial" ? "mi" : "km"

  const durationStr = formatDurationShort(activity.duration)

  let elev = { name: "Elev Gain", value: activity.elevationGain }
  if (activity.elevationLoss > activity.elevationGain) {
    elev = { name: "Elev Loss", value: activity.elevationLoss }
  }

  let middleStatLabel = elev.name
  let middleStatVal = `${metersToElevation(elev.value, preferences?.elevationUnit)} ${preferences?.elevationUnit === "feet" ? "ft" : "m"}`

  if (isRunOrWalk && activity.distance > 0) {
    middleStatLabel = "Pace"
    middleStatVal = formatPace(
      activity.duration,
      activity.distance,
      preferences?.paceUnit ?? "min/km"
    )
  } else if (isRide && activity.distance > 0 && activity.duration > 0) {
    middleStatLabel = "Speed"
    const avgMps = activity.distance / activity.duration
    const speedVal = mpsToSpeed(avgMps, preferences?.speedUnit ?? "km/h")
    const speedUnitLabel =
      preferences?.speedUnit === "mph"
        ? "mph"
        : preferences?.speedUnit === "m/s"
          ? "m/s"
          : "km/h"
    middleStatVal = `${speedVal} ${speedUnitLabel}`
  }

  return (
    <View className="bg-white border-y border-gray-200 my-1 py-4 px-4">
      {/* Header Row: Avatar + User Details */}
      <TouchableOpacity
        onPress={handlePressCard}
        activeOpacity={0.8}
        className="flex-row items-center mb-3"
      >
        {user?.image ? (
          <Image
            source={{ uri: user.image }}
            className="w-11 h-11 rounded-full bg-gray-200"
          />
        ) : (
          <Ionicons name="person-circle-outline" size={44} color="#9CA3AF" />
        )}
        <View className="ml-3 flex-1 justify-center">
          <Text className="text-gray-900 font-bold text-base leading-snug">
            {user?.name || "User"}
          </Text>
          <Text className="text-gray-500 text-xs font-normal mt-0.5">
            {formattedDate} at {formattedTime} • Strava App
            {activity.location ? ` • ${activity.location}` : ""}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Activity Title & Sport Icon */}
      <TouchableOpacity
        onPress={handlePressCard}
        activeOpacity={0.8}
        className="flex-row items-start my-2"
      >
        <View className="mt-0.5 mr-3">
          {getSportIcon(activity.type)}
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-xl leading-tight">
            {activity.title || "Untitled Activity"}
          </Text>
          {activity.description ? (
            <Text className="text-gray-600 text-sm font-normal mt-1">
              {activity.description}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Stats 3-Column Grid with Vertical Dividers */}
      <View className="my-3 flex-row items-center">
        <View className="pr-4 border-r border-gray-200">
          <Text className="text-gray-500 text-xs font-normal mb-0.5">Distance</Text>
          <Text className="text-gray-900 text-xl font-bold tracking-tight">
            {distanceVal} <Text className="text-base font-normal">{distanceUnitLabel}</Text>
          </Text>
        </View>
        <View className="px-4 border-r border-gray-200">
          <Text className="text-gray-500 text-xs font-normal mb-0.5">{middleStatLabel}</Text>
          <Text className="text-gray-900 text-xl font-bold tracking-tight">
            {middleStatVal}
          </Text>
        </View>
        <View className="pl-4">
          <Text className="text-gray-500 text-xs font-normal mb-0.5">Time</Text>
          <Text className="text-gray-900 text-xl font-bold tracking-tight">
            {durationStr}
          </Text>
        </View>
      </View>

      {/* Real Map — rendered if activity has encodedPolyline */}
      {activity.encodedPolyline ? (
        <TouchableOpacity
          onPress={handlePressCard}
          activeOpacity={0.9}
          className="my-3 rounded-lg overflow-hidden border border-gray-200 h-72 w-full bg-gray-100"
        >
          <ActivityMap
            encodedPolyline={activity.encodedPolyline}
            isStatic={true}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>
      ) : null}

      {/* Action Row: Kudos & Comment */}
      <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-end items-center gap-2">
        <TouchableOpacity
          activeOpacity={0.7}
          className="p-2.5 rounded-lg bg-gray-100 items-center justify-center"
        >
          <Ionicons name="thumbs-up-outline" size={20} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="p-2.5 rounded-lg bg-gray-100 items-center justify-center"
        >
          <Ionicons name="chatbubble-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
