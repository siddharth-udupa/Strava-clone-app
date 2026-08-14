import React, { useState } from "react"
import { View, Text, TouchableOpacity, StatusBar } from "react-native"
import { type EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context"
import { useSession, signOut } from "@/lib/auth-client"
import { Redirect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import ActivityFeed from "@/components/ActivityFeed"
import { useActivities } from "@/hooks/useActivities"

type ActiveTabType = "home" | "maps" | "record" | "groups" | "you"


export default function DashboardScreen() {
  const { data: session } = useSession()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<ActiveTabType>("home")
  
  if (!session) {
    return <Redirect href={"/(auth)/sign-in" as any} />
  }
  
  const { activities, isLoading, refreshing, error, refetch } = useActivities(session?.user.id)

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
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={handleSignOut}
              className="p-2 rounded-full bg-red-500/20 border border-red-500/40"
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {/* SEPARATED ACTIVITY FEED COMPONENT */}
      <ActivityFeed
        activities={activities}
        isLoading={isLoading}
        refreshing={refreshing}
        onRefresh={refetch}
        error={error}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
      />

      <BottomBar insets={insets} activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  )
}

function BottomBar(
  { insets, activeTab, setActiveTab }:
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