import { useState, useEffect, useRef } from "react"
import {
  View,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Redirect, useLocalSearchParams, useRouter } from "expo-router"
import Map from "@/components/map/Map"
import TileProviderPicker from "@/components/map/TileProviderPicker"
import { DEFAULT_TILE_PROVIDER, type TileProviderId } from "@repo/maps"
import { metersToDistance, metersToElevation, formatDurationShort, computePace } from "@repo/units"
import type { ActivityDetailsType } from "@repo/types"
import { authClient, useSession } from "@/lib/auth-client"
import {
  ActivityNotFound,
  ActivityHeaderOverlay,
  ActivityAthleteHeader,
  ActivitySocialBar,
  ActivityTabNavigation,
  ActivityOverviewTab,
  ActivityTabViews,
  type TabType,
} from "@/components/ui/activity"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.2
const MID_SHEET_HEIGHT = SCREEN_HEIGHT * 0.5
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.88

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.31.240:3000"

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
        console.error("Fetch error:", err)
        setdata(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivityData()
  }, [id])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(app)/dashboard" as any)
    }
  }

  if (!session) {
    return <Redirect href={"/(auth)/sign-in" as any} />
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center">
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#FC5200" />
      </View>
    )
  }

  if (!data) {
    return <ActivityNotFound onBack={handleBack} />
  }

  const distance = metersToDistance(data.distance, data.user?.preferences.distanceUnit)
  const elevGain = metersToElevation(data.elevationGain, data.user?.preferences.elevationUnit)
  const elevLoss = metersToElevation(data.elevationLoss, data.user?.preferences.elevationUnit)
  const duration = formatDurationShort(data.duration)
  const pace = computePace(data.duration, data.distance, data.user?.preferences.paceUnit)

  return (
    <View className="flex-1 bg-gray-100 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* MAP LAYER (Interactive & Changeable Map) */}
      <View className="flex-1">
        <Map
          encodedPolyline={data.encodedPolyline || undefined}
          isStatic={false}
          providerId={currentProviderId}
          style={{ width: "100%", height: "100%" }}
          boundsPadding={{
            top: Math.max(insets.top, 16) + 60,
            bottom: SCREEN_HEIGHT * 0.5 + 24,
            left: 28,
            right: 28,
          }}
        />

        {/* Top Header Floating Overlay (Back, Share, Actions) */}
        <ActivityHeaderOverlay topInset={insets.top} onBack={handleBack} />

        {/* Floating Tile Provider Picker Button */}
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
        className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 rounded-t-3xl shadow-2xl z-30"
      >
        {/* Drag Handle Bar */}
        <View {...panResponder.panHandlers} className="w-full items-center py-3 active:opacity-70">
          <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />
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
            <ActivityAthleteHeader
              userName={data.user.name}
              createdAt={data.createdAt}
              activityType={data.type}
              title={data.title}
              description={data.description}
            />

            {/* Kudos & Social Action Bar */}
            <ActivitySocialBar />

            {/* TAB NAVIGATION HEADER (Overview, Analysis, Segments, Best Efforts) */}
            <ActivityTabNavigation activeTab={activeTab} onSelectTab={setActiveTab} />

            {/* TAB CONTENT */}
            {activeTab === "overview" ? (
              <ActivityOverviewTab
                distance={distance}
                duration={duration}
                pace={pace}
                elevGain={elevGain}
                elevLoss={elevLoss}
              />
            ) : (
              <ActivityTabViews activeTab={activeTab} />
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  )
}
