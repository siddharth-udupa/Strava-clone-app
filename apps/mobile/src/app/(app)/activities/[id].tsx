import { useState, useEffect } from "react"
import { View, Dimensions, ActivityIndicator, StatusBar, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Redirect, useLocalSearchParams, useRouter } from "expo-router"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
} from "react-native-reanimated"
import Map from "@/components/map/Map"
import TileProviderPicker from "@/components/map/TileProviderPicker"
import { DEFAULT_TILE_PROVIDER, type TileProviderId } from "@repo/maps"
import { metersToDistance, metersToElevation, formatDurationShort, computePace } from "@repo/units"
import type { ActivityDetailsType } from "@repo/types"
import { authClient, useSession } from "@/lib/auth-client"
import { removeActivityFromCache } from "@/hooks/useActivities"
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

const API_URL = process.env.EXPO_PUBLIC_API_URL!

export default function ActivityDetailScreen() {
  const { data: session } = useSession()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [data, setdata] = useState<ActivityDetailsType | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [currentProviderId, setCurrentProviderId] = useState<TileProviderId>(DEFAULT_TILE_PROVIDER)

  // 3 Strava-like snap positions (Y coordinate offset from top of screen)
  const EXPANDED_Y = SCREEN_HEIGHT * 0.08  // 8% from top
  const HALF_Y = SCREEN_HEIGHT * 0.50      // 50% from top
  const COLLAPSED_Y = SCREEN_HEIGHT * 0.78 // 78% from top

  // Reanimated bottom sheet shared values
  const translateY = useSharedValue(HALF_Y)
  const contextY = useSharedValue(HALF_Y)
  const scrollY = useSharedValue(0)

  // Pan gesture for the drag handle bar and athlete header area
  const handlePanGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value
    })
    .onUpdate((event) => {
      let nextY = contextY.value + event.translationY
      if (nextY < EXPANDED_Y) {
        nextY = EXPANDED_Y + (nextY - EXPANDED_Y) * 0.2
      } else if (nextY > COLLAPSED_Y) {
        nextY = COLLAPSED_Y + (nextY - COLLAPSED_Y) * 0.2
      }
      translateY.value = nextY
    })
    .onEnd((event) => {
      const velocityY = event.velocityY
      const currentY = translateY.value

      let targetY = HALF_Y

      if (velocityY < -400) {
        // Fast swipe UP
        targetY = currentY > HALF_Y ? HALF_Y : EXPANDED_Y
      } else if (velocityY > 400) {
        // Fast swipe DOWN
        targetY = currentY < HALF_Y ? HALF_Y : COLLAPSED_Y
      } else {
        // Nearest snap point distance calculation
        const distToExpanded = Math.abs(currentY - EXPANDED_Y)
        const distToHalf = Math.abs(currentY - HALF_Y)
        const distToCollapsed = Math.abs(currentY - COLLAPSED_Y)

        if (distToExpanded <= distToHalf && distToExpanded <= distToCollapsed) {
          targetY = EXPANDED_Y
        } else if (distToCollapsed <= distToHalf && distToCollapsed <= distToExpanded) {
          targetY = COLLAPSED_Y
        } else {
          targetY = HALF_Y
        }
      }

      translateY.value = withSpring(targetY, {
        damping: 25,
        stiffness: 220,
        mass: 0.8,
      })
    })

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y
  })

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

  const handleDeleteActivity = () => {
    if (!id) return

    Alert.alert(
      "Delete Activity",
      "Are you sure you want to delete this activity? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true)
              const res: any = await authClient.$fetch(
                `${API_URL}/api/activities/${id}`,
                {
                  method: "DELETE",
                }
              )

              if (res?.error) {
                const errorMsg =
                  typeof res.error === "string"
                    ? res.error
                    : res.error?.message || "Failed to delete activity"
                Alert.alert("Error", errorMsg)
              } else {
                removeActivityFromCache(id)
                if (router.canGoBack()) {
                  router.back()
                } else {
                  router.replace("/(app)/dashboard" as any)
                }
              }
            } catch (err: any) {
              console.error("Delete error:", err)
              const errorMessage =
                err?.data?.error || err?.message || "Failed to delete activity. Please try again."
              Alert.alert("Error", errorMessage)
            } finally {
              setIsDeleting(false)
            }
          },
        },
      ]
    )
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

      {/* MAP LAYER (Interactive & Fixed Background Map) */}
      <View className="flex-1">
        <Map
          encodedPolyline={data.encodedPolyline || undefined}
          isStatic={false}
          providerId={currentProviderId}
          style={{ width: "100%", height: "100%" }}
          boundsPadding={{
            top: Math.max(insets.top, 16) + 60,
            bottom: HALF_Y + 24,
            left: 28,
            right: 28,
          }}
        />

        {/* Top Header Floating Overlay (Back, Share, Actions) */}
        <ActivityHeaderOverlay
          topInset={insets.top}
          onBack={handleBack}
          onDeleteActivity={handleDeleteActivity}
          isDeleting={isDeleting}
        />

        {/* Floating Tile Provider Picker Button */}
        <TileProviderPicker
          currentProviderId={currentProviderId}
          onSelectProvider={(newProvider) => setCurrentProviderId(newProvider)}
          triggerStyle={{ top: Math.max(insets.top, 16) + 52, right: 16 }}
        />
      </View>

      {/* REANIMATED BOTTOM SHEET MODAL (Fixed Full Height with translateY Transform) */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: SCREEN_HEIGHT,
          },
          animatedSheetStyle,
        ]}
        className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 rounded-t-3xl shadow-2xl z-30 overflow-hidden"
      >
        {/* Drag Handle & Top Athlete Header Region */}
        <GestureDetector gesture={handlePanGesture}>
          <View className="w-full bg-white dark:bg-slate-900">
            <View
              className="w-full items-center py-3.5 active:opacity-70"
              hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
              style={{ cursor: "grab" as any }}
            >
              <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />
            </View>

            <View className="px-4 pb-2">
              <ActivityAthleteHeader
                userName={data.user.name}
                createdAt={data.createdAt}
                activityType={data.type}
                title={data.title}
                description={data.description}
              />
            </View>
          </View>
        </GestureDetector>

        {/* Scrollable Activity Content */}
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom + 80, 100),
          }}
        >
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
        </Animated.ScrollView>
      </Animated.View>
    </View>
  )
}
