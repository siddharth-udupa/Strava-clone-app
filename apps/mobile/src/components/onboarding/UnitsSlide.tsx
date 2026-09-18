import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { OnboardingPrefs } from "@/hooks/useOnboarding"

type Props = {
  prefs: OnboardingPrefs
  onChange: <K extends keyof OnboardingPrefs>(key: K, value: OnboardingPrefs[K]) => void
  onNext: () => void
  onBack: () => void
}

type OptionGroup<K extends keyof OnboardingPrefs> = {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  key: K
  options: { label: string; value: OnboardingPrefs[K] }[]
}

// Discriminated union — each entry keeps its concrete K so indexing prefs[group.key] is type-safe
type AnyOptionGroup =
  | OptionGroup<"distanceUnit">
  | OptionGroup<"elevationUnit">
  | OptionGroup<"paceUnit">
  | OptionGroup<"speedUnit">
  | OptionGroup<"weightUnit">

const GROUPS: AnyOptionGroup[] = [
  {
    label: "Distance",
    icon: "footsteps-outline",
    key: "distanceUnit",
    options: [
      { label: "Kilometers", value: "metric" },
      { label: "Miles", value: "imperial" },
    ],
  },
  {
    label: "Elevation",
    icon: "trending-up-outline",
    key: "elevationUnit",
    options: [
      { label: "Meters", value: "meters" },
      { label: "Feet", value: "feet" },
    ],
  },
  {
    label: "Pace",
    icon: "timer-outline",
    key: "paceUnit",
    options: [
      { label: "min/km", value: "min/km" },
      { label: "min/mi", value: "min/mi" },
    ],
  },
  {
    label: "Speed",
    icon: "speedometer-outline",
    key: "speedUnit",
    options: [
      { label: "km/h", value: "km/h" },
      { label: "mph", value: "mph" },
      { label: "m/s", value: "m/s" },
    ],
  },
  {
    label: "Weight",
    icon: "barbell-outline",
    key: "weightUnit",
    options: [
      { label: "Kilograms (kg)", value: "kg" },
      { label: "Pounds (lb)", value: "lb" },
    ],
  },
]

// Typed render helper \u2014 K is inferred at each call so prefs[group.key] is fully typed
function renderGroup<K extends keyof OnboardingPrefs>(
  group: OptionGroup<K>,
  prefs: OnboardingPrefs,
  onChange: <K extends keyof OnboardingPrefs>(key: K, value: OnboardingPrefs[K]) => void
) {
  return (
    <View key={group.key}>
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name={group.icon} size={15} color="#9CA3AF" />
        <Text className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          {group.label}
        </Text>
      </View>
      <View className="flex-row gap-2">
        {group.options.map((opt) => {
          const active = prefs[group.key] === opt.value
          return (
            <TouchableOpacity
              key={String(opt.value)}
              onPress={() => onChange(group.key, opt.value)}
              className={`flex-1 py-3 rounded-xl items-center border ${
                active
                  ? "bg-strava border-strava"
                  : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? "text-white" : "text-gray-700 dark:text-slate-300"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default function UnitsSlide({ prefs, onChange, onNext, onBack }: Props) {

  return (
    <View className="flex-1 px-6">
      {/* Header */}
      <View className="w-16 h-16 rounded-2xl bg-strava/10 items-center justify-center mb-6">
        <Ionicons name="options-outline" size={32} color="#FC4C02" />
      </View>

      <Text className="text-3xl font-black text-gray-900 dark:text-white mb-2">
        Your units
      </Text>
      <Text className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Pick the measurement system that feels natural. You can change these later.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ gap: 20, paddingBottom: 16 }}>
        {GROUPS.map((group) => renderGroup(group, prefs, onChange))}
      </ScrollView>

      {/* Navigation */}
      <View className="flex-row gap-3 pt-4 pb-2">
        <TouchableOpacity
          onPress={onBack}
          className="flex-1 py-4 rounded-xl border border-gray-200 dark:border-slate-700 items-center"
        >
          <Text className="text-sm font-semibold text-gray-600 dark:text-slate-400">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          className="flex-[2] py-4 rounded-xl bg-strava items-center"
        >
          <Text className="text-sm font-bold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
