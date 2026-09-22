import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import type { DistanceUnit, ElevationUnit } from "@repo/units"
import { durationToSeconds } from "@repo/units"
import type { ManualActivityInput } from "@repo/validation"
import { authClient } from "@/lib/auth-client"
import { invalidateActivitiesCache } from "@/hooks/useActivities"

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL!

// Matches ManualActivitySchema type enum exactly
const SPORTS: ManualActivityInput["type"][] = ["Run", "Ride", "Swim", "Walk", "Hike", "Other"]

const DISTANCE_UNITS: DistanceUnit[] = ["metric", "imperial"]
const ELEVATION_UNITS: ElevationUnit[] = ["meters", "feet"]

// ─── Types ────────────────────────────────────────────────────────────────────

// Duration sub-shape from ManualActivityInput (the object branch of the union)
type DurationObj = Extract<ManualActivityInput["duration"], { hr: number }>

// MetaData sub-shape from ManualActivityInput
type MetaData = NonNullable<ManualActivityInput["metaData"]>

interface FormState {
  distance: string          // held as string for TextInput, parsed on submit
  duration: DurationObj
  elevationGain: string
  elevationLoss: string
  type: ManualActivityInput["type"]
  startTime: string         // "YYYY-MM-DDTHH:mm" local string
  endTime: string
  title: string
  description: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a local datetime string in "YYYY-MM-DDTHH:mm" format for the default start time. */
function getLocalDateTimeString(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/** Formats server-side Zod / API error responses into a readable string. */
function formatErrorMessage(resData: any): string {
  if (!resData) return "An unexpected error occurred while saving."

  if (resData.detailedError) {
    const errs = resData.detailedError
    if (typeof errs === "string") return errs
    if (Array.isArray(errs)) {
      return errs
        .map((e: any) => {
          const field =
            Array.isArray(e.path) && e.path.length > 0
              ? e.path
                  .map((p: any) => String(p).charAt(0).toUpperCase() + String(p).slice(1))
                  .join(" > ")
              : ""
          let msg = e.message || "Invalid value"
          if (e.code === "too_small") msg = e.minimum ? `must be at least ${e.minimum} character(s)` : "is required"
          else if (e.code === "too_big") msg = `must be at most ${e.maximum} character(s)`
          else if (e.code === "invalid_type") msg = "is invalid"
          return field ? `${field} ${msg}` : msg
        })
        .join(". ")
    }
  }

  if (resData.error) {
    return typeof resData.error === "string" ? resData.error : "Validation failed on the server."
  }

  return "Failed to save activity."
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      className="bg-white dark:bg-slate-900 rounded-2xl mx-4 mb-3 p-4 border border-gray-100 dark:border-slate-800"
    >
      {children}
    </View>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
      {label}
      {required && <Text className="text-[#FC5200]"> *</Text>}
    </Text>
  )
}

function NumericInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
}) {
  return (
    <View className="flex-row items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 h-11 flex-1">
      <TextInput
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "0"}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-base text-gray-900 dark:text-white font-medium"
        style={{ paddingVertical: 0 }}
      />
    </View>
  )
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  labels?: Partial<Record<T, string>>
}) {
  return (
    <View className="flex-row bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mt-1">
      {options.map((opt) => {
        const isActive = opt === value
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={
              isActive
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }
                : undefined
            }
            className={`flex-1 py-1.5 rounded-lg items-center ${
              isActive ? "bg-white dark:bg-slate-700" : ""
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-semibold capitalize ${
                isActive ? "text-[#FC5200]" : "text-gray-500 dark:text-slate-400"
              }`}
            >
              {labels?.[opt] ?? opt}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function SportSelector({
  value,
  onChange,
}: {
  value: ManualActivityInput["type"]
  onChange: (v: ManualActivityInput["type"]) => void
}) {
  const SPORT_ICONS: Record<ManualActivityInput["type"], React.ComponentProps<typeof Ionicons>["name"]> = {
    Run: "walk",
    Ride: "bicycle",
    Swim: "water",
    Walk: "footsteps",
    Hike: "trail-sign",
    Other: "ellipsis-horizontal-circle",
  }

  return (
    <View className="flex-row flex-wrap gap-2 mt-1">
      {SPORTS.map((sport) => {
        const isActive = sport === value
        return (
          <TouchableOpacity
            key={sport}
            onPress={() => onChange(sport)}
            activeOpacity={0.75}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
              isActive
                ? "bg-[#FC5200] border-[#FC5200]"
                : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            }`}
          >
            <Ionicons name={SPORT_ICONS[sport]} size={14} color={isActive ? "#FFF" : "#9CA3AF"} />
            <Text
              className={`text-xs font-semibold ${isActive ? "text-white" : "text-gray-600 dark:text-slate-300"}`}
            >
              {sport}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function DurationInput({
  value,
  onChange,
}: {
  value: DurationObj
  onChange: (key: keyof DurationObj, v: number) => void
}) {
  const fields: { key: keyof DurationObj; label: string; max?: number }[] = [
    { key: "hr", label: "hr" },
    { key: "min", label: "min", max: 59 },
    { key: "sec", label: "sec", max: 59 },
  ]

  return (
    <View className="flex-row gap-2 mt-1">
      {fields.map(({ key, label, max }) => (
        <View key={key} className="flex-1 items-center">
          <View className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl h-11 w-full justify-center items-center">
            <TextInput
              keyboardType="number-pad"
              value={String(value[key])}
              onChangeText={(v) => {
                const parsed = parseInt(v) || 0
                onChange(key, max !== undefined ? Math.min(parsed, max) : parsed)
              }}
              maxLength={2}
              className="text-base font-bold text-gray-900 dark:text-white text-center w-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
          <Text className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-medium">{label}</Text>
        </View>
      ))}
    </View>
  )
}

function DateTimeInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <View className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 h-11 flex-row items-center mt-1">
      <Ionicons name="calendar-outline" size={16} color="#9CA3AF" style={{ marginRight: 6 }} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? "YYYY-MM-DDTHH:mm"}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-sm text-gray-900 dark:text-white"
        style={{ paddingVertical: 0 }}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ManualUploadScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [formState, setFormState] = useState<FormState>({
    distance: "",
    duration: { hr: 0, min: 30, sec: 0 },
    elevationGain: "",
    elevationLoss: "",
    type: "Run",
    startTime: getLocalDateTimeString(),
    endTime: "",
    title: "",
    description: "",
  })

  const [metaData, setMetaData] = useState<MetaData>({
    distanceUnit: "metric",
    elevUnitGain: "meters",
    elevUnitLoss: "meters",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Derived validation ─────────────────────────────────────────────────────
  // Use durationToSeconds from @repo/units to validate duration > 0
  const isTitleValid = (formState.title || "").trim().length > 0
  const isDistanceValid = parseFloat(formState.distance || "0") > 0
  const isDurationValid = durationToSeconds(formState.duration) > 0
  const isFormValid = isTitleValid && isDistanceValid && isDurationValid

  // ── Update helpers ─────────────────────────────────────────────────────────

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setFormState((prev) => ({ ...prev, [key]: value }))

  const updateMeta = <K extends keyof MetaData>(key: K, value: MetaData[K]) =>
    setMetaData((prev) => ({ ...prev, [key]: value }))

  const updateDuration = (key: keyof DurationObj, value: number) =>
    setFormState((prev) => ({ ...prev, duration: { ...prev.duration, [key]: value } }))

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Missing Fields",
        "Please fill in the required fields: Title, Distance, and Duration."
      )
      return
    }

    setIsSubmitting(true)

    try {
      // Build a payload that matches ManualActivityInput exactly,
      // nested under { source: "manual", data: ... } as the web page does.
      const payload: { source: "manual"; data: ManualActivityInput } = {
        source: "manual",
        data: {
          title: (formState.title || "").trim(),
          description: (formState.description || "").trim() || undefined,
          type: formState.type,
          distance: parseFloat(formState.distance) || 0,
          duration: formState.duration,           // { hr, min, sec } — the schema accepts this shape
          elevationGain: parseFloat(formState.elevationGain) || 0,
          elevationLoss: parseFloat(formState.elevationLoss) || 0,
          startTime: formState.startTime || undefined,
          endTime: formState.endTime || undefined,
          metaData,
        },
      }

      const res = await authClient.$fetch(`${API_URL}/api/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.error) {
        Alert.alert("Error", formatErrorMessage(res.error))
        return
      }

      invalidateActivitiesCache()

      Alert.alert("Activity Saved!", "Your activity has been logged successfully.", [
        {
          text: "Go to Dashboard",
          onPress: () => router.replace("/(app)/dashboard" as any),
        },
      ])
    } catch (err: any) {
      console.error("Submit error:", err)
      Alert.alert(
        "Network Error",
        "Could not connect to the server. Please check your connection and try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Go Back ────────────────────────────────────────────────────────────────

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(app)/dashboard" as any)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-gray-100 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View
        style={{ paddingTop: Math.max(insets.top, 40) }}
        className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 pb-3"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-base font-bold text-gray-900 dark:text-white">Manual Entry</Text>
            <Text className="text-xs text-gray-400 dark:text-slate-500">Log your activity</Text>
          </View>

          {/* Spacer to balance the back button */}
          <View className="w-9" />
        </View>
      </View>

      {/* ── Scrollable Form ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
        className="flex-1"
      >
        <View className="pt-4">

          {/* ── Section: Distance & Duration ── */}
          <Text className="px-4 pb-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Activity Stats
          </Text>

          <SectionCard>
            <FieldLabel label="Distance" required />
            <View className="flex-row gap-2 items-end">
              <NumericInput
                value={formState.distance}
                onChangeText={(v) => updateField("distance", v)}
                placeholder="0.00"
              />
              <View className="w-28">
                <SegmentedControl<DistanceUnit>
                  options={DISTANCE_UNITS}
                  value={metaData.distanceUnit}
                  onChange={(v) => updateMeta("distanceUnit", v)}
                  labels={{ metric: "km", imperial: "mi" }}
                />
              </View>
            </View>

            <View className="h-px bg-gray-100 dark:bg-slate-800 my-4" />

            {/* durationToSeconds from @repo/units is used for validation above */}
            <FieldLabel label="Duration" required />
            <DurationInput value={formState.duration} onChange={updateDuration} />
          </SectionCard>

          {/* ── Section: Elevation ── */}
          <Text className="px-4 pb-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Elevation
          </Text>

          <SectionCard>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <FieldLabel label="Gain" />
                <NumericInput
                  value={formState.elevationGain}
                  onChangeText={(v) => updateField("elevationGain", v)}
                  placeholder="0"
                />
                <SegmentedControl<ElevationUnit>
                  options={ELEVATION_UNITS}
                  value={metaData.elevUnitGain}
                  onChange={(v) => updateMeta("elevUnitGain", v)}
                  labels={{ meters: "m", feet: "ft" }}
                />
              </View>
              <View className="flex-1">
                <FieldLabel label="Loss" />
                <NumericInput
                  value={formState.elevationLoss}
                  onChangeText={(v) => updateField("elevationLoss", v)}
                  placeholder="0"
                />
                <SegmentedControl<ElevationUnit>
                  options={ELEVATION_UNITS}
                  value={metaData.elevUnitLoss}
                  onChange={(v) => updateMeta("elevUnitLoss", v)}
                  labels={{ meters: "m", feet: "ft" }}
                />
              </View>
            </View>
          </SectionCard>

          {/* ── Section: Sport Type ── */}
          <Text className="px-4 pb-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Sport
          </Text>

          <SectionCard>
            <FieldLabel label="Activity Type" />
            <SportSelector value={formState.type} onChange={(v) => updateField("type", v)} />
          </SectionCard>

          {/* ── Section: Timing ── */}
          <Text className="px-4 pb-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Timing
          </Text>

          <SectionCard>
            <FieldLabel label="Start Time" />
            <DateTimeInput
              value={formState.startTime}
              onChange={(v) => updateField("startTime", v)}
              placeholder="YYYY-MM-DDTHH:mm"
            />

            <View className="h-px bg-gray-100 dark:bg-slate-800 my-4" />

            <FieldLabel label="End Time" />
            <DateTimeInput
              value={formState.endTime}
              onChange={(v) => updateField("endTime", v)}
              placeholder="YYYY-MM-DDTHH:mm (optional)"
            />
          </SectionCard>

          {/* ── Section: Details ── */}
          <Text className="px-4 pb-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Details
          </Text>

          <SectionCard>
            <FieldLabel label="Title" required />
            <View className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 h-11 flex-row items-center">
              <TextInput
                value={formState.title}
                onChangeText={(v) => updateField("title", v)}
                placeholder="e.g. Morning Run"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-base text-gray-900 dark:text-white"
                style={{ paddingVertical: 0 }}
                maxLength={100}
              />
            </View>

            <View className="h-px bg-gray-100 dark:bg-slate-800 my-4" />

            <FieldLabel label="Description" />
            <View className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
              <TextInput
                value={formState.description}
                onChangeText={(v) => updateField("description", v)}
                placeholder="How'd it go? Share more about your activity..."
                placeholderTextColor="#9CA3AF"
                className="text-sm text-gray-900 dark:text-white"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 90 }}
                maxLength={500}
              />
            </View>
            {(formState.description || "").length > 400 && (
              <Text className="text-right text-xs text-gray-400 dark:text-slate-500 mt-1">
                {(formState.description || "").length}/500
              </Text>
            )}
          </SectionCard>

        </View>
      </ScrollView>

      {/* ── Sticky Submit Button ── */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 pt-3"
      >
        {!isFormValid && (
          <Text className="text-xs text-gray-400 dark:text-slate-500 text-center mb-2 italic">
            Title, distance, and duration are required.
          </Text>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.85}
          style={
            isFormValid && !isSubmitting
              ? {
                  shadowColor: "#FC5200",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }
              : undefined
          }
          className={`h-12 rounded-2xl items-center justify-center flex-row gap-2 ${
            isFormValid && !isSubmitting
              ? "bg-[#FC5200]"
              : "bg-gray-200 dark:bg-slate-800"
          }`}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white font-bold text-sm">Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={isFormValid ? "#FFFFFF" : "#9CA3AF"}
              />
              <Text
                className={`font-bold text-sm ${
                  isFormValid ? "text-white" : "text-gray-400 dark:text-slate-500"
                }`}
              >
                Save Activity
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
