import { useState, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSession } from "@/lib/auth-client"
import { useOnboarding, DEFAULT_PREFS, type OnboardingPrefs } from "@/hooks/useOnboarding"
import SlideIndicator from "@/components/onboarding/SlideIndicator"
import UsernameSlide from "@/components/onboarding/UsernameSlide"
import UnitsSlide from "@/components/onboarding/UnitsSlide"
import DisplaySlide from "@/components/onboarding/DisplaySlide"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const TOTAL_SLIDES = 3

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { isLoading, error, updateUsername, completeOnboarding, skipOnboarding } = useOnboarding()

  const scrollRef = useRef<ScrollView>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [username, setUsername] = useState("")
  const [prefs, setPrefs] = useState<OnboardingPrefs>(DEFAULT_PREFS)

  function updatePref<K extends keyof OnboardingPrefs>(key: K, value: OnboardingPrefs[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  function scrollTo(index: number) {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true })
    setCurrentSlide(index)
  }

  async function handleSkip() {
    Alert.alert(
      "Skip setup?",
      "Default settings will be applied. You can always update them later in your profile.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          style: "destructive",
          onPress: async () => {
            const err = await skipOnboarding()
            if (err) {
              Alert.alert("Error", err)
            } else {
              router.replace("/(app)/dashboard" as any)
            }
          },
        },
      ]
    )
  }

  async function handleFinish() {
    const err = await completeOnboarding(prefs)
    if (err) return   // DisplaySlide shows the error inline
    router.replace("/(app)/dashboard" as any)
  }

  const userName = session?.user.name ?? "there"

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        className="flex-1 bg-white dark:bg-slate-950"
        style={{ paddingTop: Math.max(insets.top, 20) }}
      >
        {/* ── Top bar ── */}
        <View className="flex-row items-center justify-between px-6 pb-4">
          {/* Left: Step counter */}
          <Text className="text-xs font-semibold text-gray-400 dark:text-slate-500">
            Step {currentSlide + 1} of {TOTAL_SLIDES}
          </Text>

          {/* Right: Skip */}
          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text className="text-xs font-semibold text-gray-400 dark:text-slate-500">
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Progress bar ── */}
        <View className="flex-row px-6 gap-2 mb-6">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <View
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= currentSlide ? "bg-strava" : "bg-gray-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </View>

        {/* ── Greeting (Slide 0 only) ── */}
        {currentSlide === 0 && (
          <View className="px-6 mb-4">
            <Text className="text-base text-gray-500 dark:text-slate-400">
              Welcome, <Text className="font-semibold text-gray-700 dark:text-white">{userName}</Text>! 👋
            </Text>
            <Text className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              Let's get your profile set up — takes under a minute.
            </Text>
          </View>
        )}

        {/* ── Slides ── */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}          // we control swiping programmatically
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ width: SCREEN_WIDTH * TOTAL_SLIDES }}
        >
          {/* Slide 1: Username */}
          <View style={{ width: SCREEN_WIDTH }}>
            <UsernameSlide
              username={username}
              onChange={setUsername}
              onSave={updateUsername}
              onNext={() => scrollTo(1)}
              isSaving={isLoading && currentSlide === 0}
            />
          </View>

          {/* Slide 2: Units */}
          <View style={{ width: SCREEN_WIDTH }}>
            <UnitsSlide
              prefs={prefs}
              onChange={updatePref}
              onNext={() => scrollTo(2)}
              onBack={() => scrollTo(0)}
            />
          </View>

          {/* Slide 3: Display */}
          <View style={{ width: SCREEN_WIDTH }}>
            <DisplaySlide
              prefs={prefs}
              onChange={updatePref}
              onFinish={handleFinish}
              onBack={() => scrollTo(1)}
              isSaving={isLoading && currentSlide === 2}
              error={currentSlide === 2 ? (error ?? null) : null}
            />
          </View>
        </ScrollView>

        {/* ── Dot Indicator ── */}
        <View style={{ paddingBottom: Math.max(insets.bottom, 24) }} className="pt-2">
          <SlideIndicator total={TOTAL_SLIDES} current={currentSlide} />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
