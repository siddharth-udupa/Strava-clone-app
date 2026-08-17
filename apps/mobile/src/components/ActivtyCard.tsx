import { View, Text, TouchableOpacity, Image } from "react-native"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import type { ActivityCardType } from "@repo/types"
import { toDateAndTime } from "@repo/units"
import React, { Component, lazy, Suspense } from "react"

// Lazy-import ActivityMap so MapLibre's native TurboModule registration
// (MLRNCameraModule) only happens when the component actually tries to render,
// NOT at module-evaluation time. This prevents the crash from cascading up to
// dashboard.tsx and making it appear to have no default export.
const ActivityMap = lazy(() => import("./ActivityMap"))

// Error boundary — contains any native-module crash inside the map area only.
// The rest of the card (and the entire feed) keeps rendering normally.
interface MapBoundaryState { hasError: boolean }
class MapErrorBoundary extends Component<
  { children: React.ReactNode },
  MapBoundaryState
> {
  state: MapBoundaryState = { hasError: false }

  static getDerivedStateFromError(): MapBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      // Silent fallback — no map shown, card still fully functional
      return null
    }
    return this.props.children
  }
}

interface ActivityCardProps {
  activity: ActivityCardType
}

export default function ActivtyCard({ activity }: ActivityCardProps) {
  let elev = { name: "", value: 0 }
  if (activity.elevationGain > activity.elevationLoss) {
    elev = { name: "Elev Gain", value: activity.elevationGain }
  } else {
    elev = { name: "Elev Loss", value: activity.elevationLoss }
  }

  return (
    <View className="bg-slate-900 mb-3 border-y border-slate-800/80">
      {/* Card Header: Avatar + User Details */}
      <View className="flex-row items-center justify-between p-4 pb-2">
        <View className="flex-row items-center flex-1">
          <Image
            source={{ uri: "../../../../web/public/temphoto.png" }}
            className="w-11 h-11 rounded-full bg-slate-800"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-base mr-2">
                {activity.userName}
              </Text>
              <View className="bg-slate-800 px-2 py-0.5 rounded-md flex-row items-center">
                {activity.type === "Run" && (
                  <MaterialCommunityIcons name="run" size={12} color="#FC5200" />
                )}
                {activity.type === "Ride" && (
                  <MaterialCommunityIcons name="bike" size={12} color="#FC5200" />
                )}
                {activity.type === "Hike" && (
                  <MaterialCommunityIcons name="hiking" size={12} color="#FC5200" />
                )}
                <Text className="text-gray-300 text-xs font-semibold ml-1">
                  {activity.type}
                </Text>
              </View>
            </View>
            <Text className="text-gray-400 text-xs mt-0.5">
               • Location
            </Text>
          </View>
        </View>
      </View>

      {/* Card Title & Optional Description */}
      <View className="px-4 py-1">
        <Text className="text-white font-extrabold text-lg leading-6">
          {activity.title}
        </Text>
        {activity.description ? (
          <Text className="text-gray-300 text-sm mt-1">{activity.description}</Text>
        ) : null}
      </View>

      {/* Metrics Grid */}
      <View className="flex-row justify-between px-4 py-3 border-b border-slate-800/40">
        <View>
          <Text className="text-gray-400 text-xs uppercase font-medium">Distance</Text>
          <Text className="text-white text-xl font-black mt-0.5">
            {activity.distance}
          </Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs uppercase font-medium">
            {activity.type === "Ride" ? "Avg Speed" : "Pace"}
          </Text>
          <Text className="text-white text-xl font-black mt-0.5">
            activity.pace
          </Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs uppercase font-medium">Time</Text>
          <Text className="text-white text-xl font-black mt-0.5">
            {activity.duration}
          </Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs uppercase font-medium">Elev Gain</Text>
          <Text className="text-white text-xl font-black mt-0.5">
            {activity.elevationGain}
          </Text>
        </View>
      </View>

      {/* Real Map — lazy + error-bounded so native crashes don't take down the feed */}
      {activity.encodedPolyline && (
        <MapErrorBoundary>
          <Suspense fallback={null}>
            <ActivityMap
              encodedPolyline={activity.encodedPolyline}
              isStatic={true}
              isChangeable={false}
            />
          </Suspense>
        </MapErrorBoundary>
      )}

      {/* Action Row: Give Kudos, Comment, Share */}
      <View className="flex-row justify-around py-2.5 px-2">
        <TouchableOpacity
          className="flex-row items-center py-1 px-4 rounded-md"
        >
          <Ionicons
            name={"thumbs-up-outline"}
            size={18}
            color={"#94A3B8"}
          />
          <Text
            className={"text-xs font-bold ml-2 text-gray-400"}>Kudos</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-1 px-4 rounded-md">
          <Ionicons name="chatbubble-outline" size={18} color="#94A3B8" />
          <Text className="text-gray-400 text-xs font-bold ml-2">Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-1 px-4 rounded-md">
          <Feather name="share-2" size={17} color="#94A3B8" />
          <Text className="text-gray-400 text-xs font-bold ml-2">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
