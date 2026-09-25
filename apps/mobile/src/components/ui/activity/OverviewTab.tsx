import React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type ActivityOverviewTabProps = {
  distance: string | number
  duration: string
  pace: string | number
  elevGain: string | number
  elevLoss: string | number
  averageSpeed?: string
  maxSpeed?: string
  distanceUnit?: "metric" | "imperial"
  elevationUnit?: "meters" | "feet"
  speedUnit?: "km/h" | "mph" | "m/s"
  location?: string | null
  startTime?: string | Date | null
  endTime?: string | Date | null
}

type IconName = React.ComponentProps<typeof Ionicons>["name"]

type StatCardProps = {
  icon: IconName
  label: string
  value: string
  unit?: string
  accent?: "orange" | "green" | "purple" | "blue"
}

const accentStyles = {
  orange: { icon: "#FC5200", background: "#FC5200" },
  green: { icon: "#34D399", background: "#12372D" },
  purple: { icon: "#A78BFA", background: "#2A2144" },
  blue: { icon: "#60A5FA", background: "#172E4D" },
} as const

function StatCard({ icon, label, value, unit, accent = "orange" }: StatCardProps) {
  const colors = accentStyles[accent]

  return (
    <View className="flex-1 min-h-[108px] bg-[#111C2D] border border-[#223149] rounded-2xl p-3.5 mr-2 mb-3">
      <View className="w-8 h-8 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: colors.background }}>
        <Ionicons name={icon} size={16} color={colors.icon} />
      </View>
      <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#8A9AB2] mb-1">
        {label}
      </Text>
      <View className="flex-row items-baseline">
        <Text className="text-[19px] font-black text-white tracking-tight">{value}</Text>
        {unit ? <Text className="text-[11px] font-bold text-[#8A9AB2] ml-1">{unit}</Text> : null}
      </View>
    </View>
  )
}

function formatTime(value: string | Date | null | undefined) {
  if (!value) return "Not recorded"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not recorded"

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function ActivityOverviewTab({
  distance,
  duration,
  pace,
  elevGain,
  elevLoss,
  averageSpeed = "-",
  maxSpeed = "-",
  distanceUnit = "metric",
  elevationUnit = "meters",
  speedUnit = "km/h",
  location,
  startTime,
  endTime,
}: ActivityOverviewTabProps) {
  const distanceLabel = distanceUnit === "imperial" ? "mi" : "km"
  const elevationLabel = elevationUnit === "feet" ? "ft" : "m"
  const speedLabel = speedUnit === "m/s" ? "m/s" : speedUnit

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-[#FC5200]">
            The workout
          </Text>
          <Text className="text-[#8A9AB2] text-xs mt-1">Your session at a glance</Text>
        </View>
        <View className="flex-row items-center bg-[#13251F] rounded-full px-2.5 py-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-[#34D399] mr-1.5" />
          <Text className="text-[10px] font-bold text-[#8EE8C0]">COMPLETED</Text>
        </View>
      </View>

      {/* Primary distance metric */}
      <View className="bg-[#FC5200] rounded-[26px] p-5 mb-3 overflow-hidden">
        <View className="absolute -right-8 -top-12 w-36 h-36 rounded-full border-[18px] border-white/10" />
        <View className="absolute -right-1 -bottom-16 w-40 h-40 rounded-full border-[20px] border-white/10" />
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-white/80 text-[11px] font-black uppercase tracking-[1.8px]">
            Total distance
          </Text>
          <Ionicons name="map-outline" size={20} color="rgba(255,255,255,0.85)" />
        </View>
        <View className="flex-row items-baseline">
          <Text className="text-white text-[54px] font-black leading-none tracking-[-2px]">
            {distance}
          </Text>
          <Text className="text-white/80 text-lg font-bold ml-2">{distanceLabel}</Text>
        </View>
        <View className="flex-row items-center mt-4">
          <Ionicons name="flag-outline" size={14} color="rgba(255,255,255,0.8)" />
          <Text className="text-white/80 text-xs font-semibold ml-1.5">Route completed</Text>
        </View>
      </View>

      {/* Time and pace */}
      <View className="flex-row mb-4">
        <View className="flex-1 bg-[#111C2D] border border-[#223149] rounded-2xl p-4 mr-2">
          <View className="flex-row items-center mb-3">
            <View className="w-7 h-7 rounded-lg bg-[#2A2144] items-center justify-center mr-2">
              <Ionicons name="timer-outline" size={15} color="#A78BFA" />
            </View>
            <Text className="text-[#8A9AB2] text-[10px] font-bold uppercase tracking-[1.2px]">
              Duration
            </Text>
          </View>
          <Text className="text-white text-[25px] font-black tracking-tight">{duration}</Text>
        </View>

        <View className="flex-1 bg-[#111C2D] border border-[#223149] rounded-2xl p-4 ml-1">
          <View className="flex-row items-center mb-3">
            <View className="w-7 h-7 rounded-lg bg-[#12372D] items-center justify-center mr-2">
              <Ionicons name="speedometer-outline" size={15} color="#34D399" />
            </View>
            <Text className="text-[#8A9AB2] text-[10px] font-bold uppercase tracking-[1.2px]">
              Avg pace
            </Text>
          </View>
          <Text className="text-white text-[25px] font-black tracking-tight">{pace}</Text>
        </View>
      </View>

      {/* Detailed metrics */}
      <View className="bg-[#0F1929] border border-[#223149] rounded-2xl px-3 pt-3 mb-4">
        <View className="flex-row items-center justify-between px-1 pb-3">
          <Text className="text-white font-black text-base">Performance metrics</Text>
          <Ionicons name="analytics-outline" size={18} color="#FC5200" />
        </View>
        <View className="flex-row">
          <StatCard
            icon="trending-up-outline"
            label="Elevation gain"
            value={String(elevGain)}
            unit={elevationLabel}
            accent="orange"
          />
          <StatCard
            icon="trending-down-outline"
            label="Elevation loss"
            value={String(elevLoss)}
            unit={elevationLabel}
            accent="purple"
          />
        </View>
        <View className="flex-row">
          <StatCard
            icon="speedometer-outline"
            label="Average speed"
            value={averageSpeed}
            unit={speedLabel}
            accent="green"
          />
          <StatCard
            icon="flash-outline"
            label="Max speed"
            value={maxSpeed}
            unit={speedLabel}
            accent="blue"
          />
        </View>
      </View>

      {/* Session facts */}
      <View className="bg-[#0F1929] border border-[#223149] rounded-2xl px-4">
        <View className="flex-row items-center py-4 border-b border-[#223149]">
          <View className="w-8 h-8 rounded-xl bg-[#172E4D] items-center justify-center mr-3">
            <Ionicons name="location-outline" size={16} color="#60A5FA" />
          </View>
          <View className="flex-1">
            <Text className="text-[#8A9AB2] text-[10px] font-bold uppercase tracking-[1.3px] mb-1">
              Location
            </Text>
            <Text className="text-white text-sm font-semibold" numberOfLines={1}>
              {location || "No location added"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center py-4">
          <View className="w-8 h-8 rounded-xl bg-[#2A2144] items-center justify-center mr-3">
            <Ionicons name="time-outline" size={16} color="#A78BFA" />
          </View>
          <View className="flex-1">
            <Text className="text-[#8A9AB2] text-[10px] font-bold uppercase tracking-[1.3px] mb-1">
              Started
            </Text>
            <Text className="text-white text-sm font-semibold">{formatTime(startTime)}</Text>
          </View>
          {endTime ? (
            <View className="items-end">
              <Text className="text-[#8A9AB2] text-[10px] font-bold uppercase tracking-[1.3px] mb-1">
                Finished
              </Text>
              <Text className="text-white text-sm font-semibold">{formatTime(endTime)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}
