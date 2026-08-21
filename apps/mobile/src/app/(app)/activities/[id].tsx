import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, Animated, PanResponder, Dimensions, ActivityIndicator, StatusBar } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Redirect, useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import Map from "@/components/map/Map"
import TileProviderPicker from "@/components/map/TileProviderPicker"
import { DEFAULT_TILE_PROVIDER, type TileProviderId } from "@repo/maps"
import { metersToDistance, metersToElevation, formatDurationShort, computePace } from "@repo/units"
import type { ActivityDetailsType } from "@repo/types"
import { authClient, useSession } from "@/lib/auth-client"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.20
const MID_SHEET_HEIGHT = SCREEN_HEIGHT * 0.50
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.88

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.31.240:3000"

type TabType = "overview" | "analysis" | "segments" | "best_efforts"

export default function ActivityDetailScreen() {
  const { data: session } = useSession()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [data, setdata] = useState<ActivityDetailsType | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [currentProviderId, setCurrentProviderId] = useState<TileProviderId>(DEFAULT_TILE_PROVIDER)

  // Animated Bottom Sheet height state
  const sheetAnimHeight = useRef(new Animated.Value(MID_SHEET_HEIGHT)).current

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        sheetAnimHeight.extractOffset()
      },
      onPanResponderMove: (_, gestureState) => {
        sheetAnimHeight.setValue(-gestureState.dy)
      },
      onPanResponderRelease: (_, gestureState) => {
        sheetAnimHeight.flattenOffset()
        const currentVal = (sheetAnimHeight as any)._value
        let targetVal = MID_SHEET_HEIGHT
        if (currentVal > (MID_SHEET_HEIGHT + MAX_SHEET_HEIGHT) / 2) {
          targetVal = MAX_SHEET_HEIGHT
        } else if (currentVal < (MIN_SHEET_HEIGHT + MID_SHEET_HEIGHT) / 2) {
          targetVal = MIN_SHEET_HEIGHT
        }
        Animated.spring(sheetAnimHeight, {
          toValue: targetVal,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start()
      },
    })
  ).current

  useEffect(() => {
    async function fetchActivityData() {
      if (!id) {
        setIsLoading(false)
        return
      }
      try {
        const res = await authClient.$fetch<{ data: ActivityDetailsType }>(
          `${API_URL}/api/activities/${id}`
        )
        if (res?.data) {
          setdata(res.data.data)
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setdata(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchActivityData()
  }, [id])

  if (!session) {
    return <Redirect href={"/(auth)/sign-in" as any} />
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#FC5200" />
      </View>
    )
  }

  if (!data) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center px-6">
        <StatusBar barStyle="light-content" />

        <View className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={40} color="#FC5200" />
        </View>
        <Text className="text-white text-xl font-bold tracking-tight">
          Activity Not Found
        </Text>

        <Text className="text-slate-400 text-sm text-center mt-2 mb-6 leading-5">
          This activity doesn't exist, may have been deleted, or is temporarily unavailable.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#FC5200] px-6 py-3 rounded-xl flex-row items-center active:opacity-80"
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <Text className="text-white font-bold text-sm ml-2">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const distance = metersToDistance(data.distance, data.user?.preferences.distanceUnit)
  const elevGain = metersToElevation(data.elevationGain, data.user?.preferences.elevationUnit)
  const elevLoss = metersToElevation(data.elevationLoss, data.user?.preferences.elevationUnit)
  const duration = formatDurationShort(data.duration)
  const pace = computePace(data.duration, data.distance, data.user?.preferences.paceUnit)

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle={"dark-content"} backgroundColor={"black"} />

      {/* MAP LAYER (Interactive & Changeable Map) */}
      <View className="flex-1">
        <Map
          encodedPolyline={data.encodedPolyline || undefined}
          isStatic={false}
          providerId={currentProviderId}
          style={{ width: "100%", height: "100%" }}
          boundsPadding={{
            top: Math.max(insets.top, 16) + 60,
            bottom: SCREEN_HEIGHT * 0.50 + 24,
            left: 28,
            right: 28,
          }}
        />

        {/* Top Header Floating Overlay (Back, Share, Actions) */}
        <View
          style={{ paddingTop: Math.max(insets.top, 16) }}
          className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between z-20 pointer-events-box-none"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/80 items-center justify-center shadow-lg active:opacity-80"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => { }}
              className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/80 items-center justify-center shadow-lg active:opacity-80"
            >
              <Feather name="share-2" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { }}
              className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/80 items-center justify-center shadow-lg active:opacity-80"
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Tile Provider Picker Button - Positioned under top header action buttons on this page */}
        <TileProviderPicker
          currentProviderId={currentProviderId}
          onSelectProvider={(newProvider) => setCurrentProviderId(newProvider)}
          triggerStyle={{ top: Math.max(insets.top, 16) + 52, right: 16 }}
        />
      </View>

      {/* DRAGGABLE BOTTOM SHEET MODAL */}
      <Animated.View
        style={{
          height: sheetAnimHeight,
          paddingBottom: Math.max(insets.bottom, 12),
          position: "absolute",
          left: -2,
          right: -2,
          bottom: -4,
        }}
        className="bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl z-30"
      >
        {/* Drag Handle Bar */}
        <View {...panResponder.panHandlers} className="w-full items-center py-3 active:opacity-70">
          <View className="w-12 h-1.5 rounded-full bg-slate-700" />
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FC5200" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          >
            {/* Athlete Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden items-center justify-center mr-3">
                  <Image
                    source={{ uri: "https://avatar.iran.liara.run/public/48" }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[#FC5200] font-bold text-base">{data.user.name}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {new Date(data.createdAt).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              {/* Activity Type Badge */}
              <View className="bg-[#FC5200]/15 border border-[#FC5200]/40 px-3 py-1 rounded-full flex-row items-center">
                <MaterialCommunityIcons
                  name={data.type === "Ride" ? "bike" : data.type === "Hike" ? "hiking" : "run"}
                  size={14}
                  color="#FC5200"
                />
                <Text className="text-[#FC5200] font-bold text-xs ml-1.5">{data.type}</Text>
              </View>
            </View>

            {/* Activity Title & Description */}
            <Text className="text-white text-2xl font-black tracking-tight mb-1">
              {data.title || "Untitled Activity"}
            </Text>
            {data.description ? (
              <Text className="text-slate-300 text-sm mb-4 leading-5">{data.description}</Text>
            ) : (
              <TouchableOpacity className="mb-4 self-start">
                <Text className="text-slate-400 text-xs italic bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                  + Add a description
                </Text>
              </TouchableOpacity>
            )}

            {/* Kudos & Social Action Bar */}
            <View className="flex-row items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 mb-4">
              <TouchableOpacity
                className={"flex-1 flex-row items-center justify-center py-1.5 rounded-lg mr-1 bg-transparent"}
              >
                <Ionicons
                  name={"thumbs-up-outline"}
                  size={18}
                  color={"#94A3B8"}
                />
                <Text
                  className={`text-xs font-bold ml-1.5 text-slate-400`}
                >
                  Kudos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 flex-row items-center justify-center py-1.5 rounded-lg border-x border-slate-800">
                <Ionicons name="chatbubble-outline" size={18} color="#94A3B8" />
                <Text className="text-slate-400 text-xs font-bold ml-1.5">Comments</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 flex-row items-center justify-center py-1.5 rounded-lg ml-1">
                <Feather name="share-2" size={16} color="#94A3B8" />
                <Text className="text-slate-400 text-xs font-bold ml-1.5">Share</Text>
              </TouchableOpacity>
            </View>

            {/* TAB NAVIGATION HEADER (Overview, Analysis, Segments, Best Efforts) */}
            <View className="flex-row border-b border-slate-800 mb-4 -mx-1">
              {(
                [
                  { key: "overview", label: "Overview" },
                  { key: "analysis", label: "Analysis" },
                  { key: "segments", label: "Segments" },
                  { key: "best_efforts", label: "Best Efforts" },
                ] as const
              ).map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className={`px-3 py-2.5 mr-1 border-b-2 ${activeTab === tab.key ? "border-[#FC5200]" : "border-transparent"
                    }`}
                >
                  <Text
                    className={`text-xs font-bold ${activeTab === tab.key ? "text-[#FC5200]" : "text-slate-400"
                      }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === "overview" && (
              <View>
                {/* Main 3 Metrics */}
                <View className="flex-row justify-between bg-slate-950 border border-slate-800/80 rounded-2xl p-4 mb-4 shadow-sm">
                  <View className="items-start">
                    <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      Distance
                    </Text>
                    <View className="flex-row items-baseline mt-1">
                      <Text className="text-white text-2xl font-black">{distance}</Text>
                      <Text className="text-slate-400 text-xs ml-1 font-semibold">km</Text>
                    </View>
                  </View>

                  <View className="items-start border-x border-slate-800/80 px-4">
                    <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      Moving Time
                    </Text>
                    <Text className="text-white text-2xl font-black mt-1">{duration}</Text>
                  </View>

                  <View className="items-start">
                    <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      Pace
                    </Text>
                    <View className="flex-row items-baseline mt-1">
                      <Text className="text-white text-2xl font-black">{pace}</Text>
                      <Text className="text-slate-400 text-xs ml-1 font-semibold">/km</Text>
                    </View>
                  </View>
                </View>

                {/* Secondary Detailed Metrics Grid */}
                <View className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-800/60">
                    <Text className="text-slate-400 text-xs font-semibold">Elevation Gain</Text>
                    <Text className="text-white text-sm font-extrabold">{elevGain} m</Text>
                  </View>

                  <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-800/60">
                    <Text className="text-slate-400 text-xs font-semibold">Elevation Loss</Text>
                    <Text className="text-white text-sm font-extrabold">{elevLoss} m</Text>
                  </View>

                  <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-800/60">
                    <Text className="text-slate-400 text-xs font-semibold">Elapsed Time</Text>
                    <Text className="text-white text-sm font-extrabold">{duration}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-400 text-xs font-semibold">Calories</Text>
                    <Text className="text-white text-sm font-extrabold">640 kcal</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB CONTENT: ANALYSIS */}
            {activeTab === "analysis" && (
              <View className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 items-center justify-center py-8">
                <Ionicons name="stats-chart-outline" size={36} color="#FC5200" />
                <Text className="text-white font-bold text-sm mt-2">Analysis</Text>
                <Text className="text-slate-400 text-xs mt-1 text-center">
                  Detailed analysis and split performance for this effort.
                </Text>
              </View>
            )}

            {/* TAB CONTENT: SEGMENTS */}
            {activeTab === "segments" && (
              <View className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 items-center justify-center py-8">
                <Ionicons name="git-commit-outline" size={36} color="#FC5200" />
                <Text className="text-white font-bold text-sm mt-2">Matched Segments</Text>
                <Text className="text-slate-400 text-xs mt-1 text-center">
                  2 segment efforts recorded on this route.
                </Text>
              </View>
            )}

            {/* TAB CONTENT: BEST EFFORTS */}
            {activeTab === "best_efforts" && (
              <View className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 items-center justify-center py-8">
                <Ionicons name="trophy-outline" size={36} color="#EAB308" />
                <Text className="text-white font-bold text-sm mt-2">Personal Records</Text>
                <Text className="text-slate-400 text-xs mt-1 text-center">
                  Best 5k pace effort achieved during this run!
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  )
}
