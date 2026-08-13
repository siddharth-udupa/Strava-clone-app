import React, { useState } from "react"
import { View, Text, TouchableOpacity, StatusBar } from "react-native"
import { type EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context"
import { useSession, signOut } from "@/lib/auth-client"
import { Redirect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import ActivityFeed from "@/components/ActivityFeed"
import { ActivityItem } from "@/components/ActivtyCard"

type ActiveTabType = "home" | "maps" | "record" | "groups" | "you"

// Mock Activity Data for Mobile Feed
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    user: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      location: "San Francisco, California",
    },
    timestamp: "Today at 7:30 AM",
    type: "Run",
    title: "Morning Golden Gate Loop 🏃💨",
    stats: {
      distance: "10.42 km",
      paceOrSpeed: "4:48 /km",
      time: "50m 02s",
      elevation: "142 m",
    },
    kudosCount: 24,
    commentsCount: 5,
    isKudosed: false,
    hasMapPreview: true,
  },
  {
    id: "act-2",
    user: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      location: "Marin Headlands",
    },
    timestamp: "Yesterday at 5:15 PM",
    type: "Ride",
    title: "Hawk Hill Repeat Sunset Session 🚴‍♀️🌄",
    stats: {
      distance: "32.8 km",
      paceOrSpeed: "26.4 km/h",
      time: "1h 14m",
      elevation: "610 m",
    },
    kudosCount: 42,
    commentsCount: 8,
    isKudosed: true,
    hasMapPreview: true,
  },
  {
    id: "act-3",
    user: {
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      location: "Redwood National Park",
    },
    timestamp: "2 days ago",
    type: "Hike",
    title: "Trail Exploring & Ridge Views 🥾🌲",
    stats: {
      distance: "8.15 km",
      paceOrSpeed: "12:30 /km",
      time: "1h 41m",
      elevation: "380 m",
    },
    kudosCount: 18,
    commentsCount: 2,
    isKudosed: false,
    hasMapPreview: true,
  },
]

export default function DashboardScreen() {
  const { data: session } = useSession()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<ActiveTabType>("home")

  if (!session) {
    return <Redirect href={"/(auth)/sign-in" as any} />
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* TOP NAV BAR - Safe Area Inset Top */}
      <View
        style={{ paddingTop: Math.max(insets.top, 35) }}
        className="bg-slate-900 border-b border-slate-800 px-4 pb-3"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[#FC5200] text-2xl font-black tracking-wider">
            STRAVA - CLONE
          </Text>
        </View>
      </View>

      {/* SEPARATED ACTIVITY FEED COMPONENT */}
      <ActivityFeed
        activities={MOCK_ACTIVITIES}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
      />

      <BottomBar insets={insets} activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  )
}

function BottomBar(
  {insets, activeTab, setActiveTab }: 
  { insets: EdgeInsets, activeTab: ActiveTabType, setActiveTab: React.Dispatch<React.SetStateAction<ActiveTabType>> }) {
  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 25) }}
      className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex-row justify-around items-center pt-2 px-2"
    >
      <TouchableOpacity
        onPress={() => setActiveTab("home")}
        className="items-center justify-center flex-1 py-1"
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={22}
          color={activeTab === "home" ? "#FC5200" : "#94A3B8"}
        />
        <Text
          className={`text-[10px] font-bold mt-1 ${activeTab === "home" ? "text-[#FC5200]" : "text-gray-400"
            }`}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("maps")}
        className="items-center justify-center flex-1 py-1"
      >
        <Ionicons
          name={activeTab === "maps" ? "map" : "map-outline"}
          size={22}
          color={activeTab === "maps" ? "#FC5200" : "#94A3B8"}
        />
        <Text
          className={`text-[10px] font-bold mt-1 ${activeTab === "maps" ? "text-[#FC5200]" : "text-gray-400"
            }`}>Maps</Text>
      </TouchableOpacity>

      {/* Record CTA Center Button */}
      <TouchableOpacity
        onPress={() => setActiveTab("record")}
        className="items-center justify-center flex-1 -mt-4"
      >
        <View className="w-13 h-13 rounded-full bg-[#FC5200] items-center justify-center shadow-lg shadow-[#FC5200]/50 border-4 border-slate-950 p-2">
          <Ionicons name="reload-circle-outline" size={26} color="#FFFFFF" />
        </View>
        <Text className="text-[10px] font-bold text-gray-400 mt-0.5">Record</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("groups")}
        className="items-center justify-center flex-1 py-1"
      >
        <Ionicons
          name={activeTab === "groups" ? "people" : "people-outline"}
          size={22}
          color={activeTab === "groups" ? "#FC5200" : "#94A3B8"}
        />
        <Text
          className={`text-[10px] font-bold mt-1 ${activeTab === "groups" ? "text-[#FC5200]" : "text-gray-400"
            }`}>Groups</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("you")}
        className="items-center justify-center flex-1 py-1"
      >
        <Ionicons
          name={activeTab === "you" ? "person" : "person-outline"}
          size={22}
          color={activeTab === "you" ? "#FC5200" : "#94A3B8"}
        />
        <Text
          className={`text-[10px] font-bold mt-1 ${activeTab === "you" ? "text-[#FC5200]" : "text-gray-400"
            }`}>You</Text>
      </TouchableOpacity>
    </View>
  )
}