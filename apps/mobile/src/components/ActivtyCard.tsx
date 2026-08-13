import React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

export interface ActivityItem {
  id: string
  user: {
    name: string
    avatar: string
    location: string
  }
  timestamp: string
  type: "Run" | "Ride" | "Hike" | "Walk" | string
  title: string
  description?: string
  stats: {
    distance: string
    paceOrSpeed: string
    time: string
    elevation: string
  }
  kudosCount: number
  commentsCount: number
  isKudosed?: boolean
  hasMapPreview?: boolean
}

interface ActivityCardProps {
  activity: ActivityItem
}

export default function ActivtyCard({ activity }: ActivityCardProps) {
  return (
    <View className="bg-slate-900 mb-3 border-y border-slate-800/80">
      {/* Card Header: Avatar + User Details */}
      <View className="flex-row items-center justify-between p-4 pb-2">
        <View className="flex-row items-center flex-1">
          <Image
            source={{ uri: activity.user.avatar }}
            className="w-11 h-11 rounded-full bg-slate-800"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-base mr-2">
                {activity.user.name}
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
              {activity.timestamp} • {activity.user.location}
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
            {activity.stats.distance}
          </Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs uppercase font-medium">
            {activity.type === "Ride" ? "Avg Speed" : "Pace"}
          </Text>
          <Text className="text-white text-xl font-black mt-0.5">
            {activity.stats.paceOrSpeed}
          </Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs uppercase font-medium">Time</Text>
          <Text className="text-white text-xl font-black mt-0.5">
            {activity.stats.time}
          </Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs uppercase font-medium">Elev Gain</Text>
          <Text className="text-white text-xl font-black mt-0.5">
            {activity.stats.elevation}
          </Text>
        </View>
      </View>

      {/* Map Polyline Visual Mockup */}
      {activity.hasMapPreview && (
        <View className="h-44 bg-slate-950 my-1 justify-center items-center relative overflow-hidden">
          <View className="absolute inset-0 opacity-20 bg-slate-800" />
          <View className="w-full h-full items-center justify-center">
            <MaterialCommunityIcons
              name="map-marker-path"
              size={72}
              color="#FC5200"
              opacity={0.8}
            />
          </View>
        </View>
      )}

      {/* Action Row: Give Kudos, Comment, Share */}
      <View className="flex-row justify-around py-2.5 px-2">
        <TouchableOpacity
          className="flex-row items-center py-1 px-4 rounded-md"
        >
          <Ionicons
            name={activity.isKudosed ? "thumbs-up" : "thumbs-up-outline"}
            size={18}
            color={activity.isKudosed ? "#FC5200" : "#94A3B8"}
          />
          <Text
            className={`text-xs font-bold ml-2 ${activity.isKudosed ? "text-[#FC5200]" : "text-gray-400"
              }`} >Kudos</Text>
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
