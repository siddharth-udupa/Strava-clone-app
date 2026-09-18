import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { OnboardingPrefs } from "@/hooks/useOnboarding"

type Props = {
  prefs: OnboardingPrefs
  onChange: <K extends keyof OnboardingPrefs>(key: K, value: OnboardingPrefs[K]) => void
  onFinish: () => Promise<void>
  onBack: () => void
  isSaving: boolean
  error: string | null
}

const THEME_OPTIONS: { label: string; value: OnboardingPrefs["theme"]; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "System", value: "system", icon: "phone-portrait-outline" },
  { label: "Light", value: "light", icon: "sunny-outline" },
  { label: "Dark", value: "dark", icon: "moon-outline" },
]

const TIME_OPTIONS: { label: string; value: OnboardingPrefs["timeFormat"] }[] = [
  { label: "24-hour", value: "24h" },
  { label: "12-hour", value: "12h" },
]

export default function DisplaySlide({ prefs, onChange, onFinish, onBack, isSaving, error }: Props) {
  return (
    <View className="flex-1 px-6 justify-between">
      <View>
        {/* Header */}
        <View className="w-16 h-16 rounded-2xl bg-strava/10 items-center justify-center mb-6">
          <Ionicons name="color-palette-outline" size={32} color="#FC4C02" />
        </View>

        <Text className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Appearance
        </Text>
        <Text className="text-sm text-gray-500 dark:text-slate-400 mb-8">
          Customize how the app looks and feels. Changeable any time from your profile.
        </Text>

        {/* Theme */}
        <Text className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Theme
        </Text>
        <View className="flex-row gap-2 mb-8">
          {THEME_OPTIONS.map((opt) => {
            const active = prefs.theme === opt.value
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onChange("theme", opt.value)}
                className={`flex-1 py-4 rounded-xl items-center gap-1.5 border ${
                  active
                    ? "bg-strava border-strava"
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={active ? "#fff" : "#9CA3AF"}
                />
                <Text className={`text-xs font-semibold ${active ? "text-white" : "text-gray-600 dark:text-slate-400"}`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Time format */}
        <Text className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Time Format
        </Text>
        <View className="flex-row gap-2">
          {TIME_OPTIONS.map((opt) => {
            const active = prefs.timeFormat === opt.value
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onChange("timeFormat", opt.value)}
                className={`flex-1 py-3.5 rounded-xl items-center border ${
                  active
                    ? "bg-strava border-strava"
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                <Text className={`text-sm font-semibold ${active ? "text-white" : "text-gray-600 dark:text-slate-400"}`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* API error */}
        {error && (
          <Text className="text-xs text-red-500 mt-4 text-center">{error}</Text>
        )}
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3 pb-2">
        <TouchableOpacity
          onPress={onBack}
          disabled={isSaving}
          className="flex-1 py-4 rounded-xl border border-gray-200 dark:border-slate-700 items-center"
        >
          <Text className="text-sm font-semibold text-gray-600 dark:text-slate-400">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFinish}
          disabled={isSaving}
          className={`flex-[2] py-4 rounded-xl items-center ${isSaving ? "bg-strava/50" : "bg-strava"}`}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-sm font-bold text-white">Get Started</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
