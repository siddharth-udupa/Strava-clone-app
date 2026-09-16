import React, { useMemo, useEffect } from "react"
import { View, TextInput, StyleSheet } from "react-native"
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"
import { CartesianChart, Area, useChartPressState } from "victory-native"
import { Circle, Line as SkiaLine, Group } from "@shopify/react-native-skia"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  metersToDistance,
  metersToElevation,
  speedToMps,
  type DistanceUnit,
  type ElevationUnit,
  type SpeedUnit,
} from "@repo/units"

// AnimatedTextInput lets us update displayed text entirely on the UI thread
// via useAnimatedProps — no React re-renders, no JS-thread setState calls.
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export type ActivityChartsClientProps = {
  distanceData: number[]
  altitudeData: number[]
  speedData: number[]
  distanceUnit: DistanceUnit
  elevationUnit: ElevationUnit
  speedUnit: SpeedUnit
}

export type ChartPoint = {
  distance: number
  altitude: number
  speed: number
  grade: number
}

export function buildChartData(
  distanceData: number[],
  altitudeData: number[],
  speedData: number[],
  distanceUnit: DistanceUnit,
  elevationUnit: ElevationUnit,
  speedUnit: SpeedUnit
): ChartPoint[] {
  const len = Math.min(distanceData.length, altitudeData.length, speedData.length)
  if (len === 0) return []

  // Downsample to ~500 points max for performance
  const step = Math.max(1, Math.floor(len / 500))
  const points: ChartPoint[] = []

  let prevAlt: number | null = null
  let prevDist: number | null = null

  for (let i = 0; i < len; i += step) {
    const dist = metersToDistance(distanceData[i]!, distanceUnit)
    const alt = metersToElevation(altitudeData[i]!, elevationUnit)
    const spd = speedToMps(speedData[i]!, speedUnit)

    // Grade: (vertical change / horizontal distance) × 100
    let grade = 0
    if (prevAlt !== null && prevDist !== null) {
      const dAlt = altitudeData[i]! - altitudeData[i - step]!
      const dDist = distanceData[i]! - distanceData[i - step]!
      if (dDist !== 0) {
        grade = (dAlt / dDist) * 100
      }
    }
    prevAlt = altitudeData[i]!
    prevDist = distanceData[i]!

    points.push({
      distance: dist,
      altitude: alt,
      speed: spd,
      grade: parseFloat(grade.toFixed(1)),
    })
  }
  return points
}

export default function ActivityChart({
  distanceData,
  altitudeData,
  speedData,
  distanceUnit,
  elevationUnit,
  speedUnit,
}: ActivityChartsClientProps) {
  const data = useMemo(
    () => buildChartData(distanceData, altitudeData, speedData, distanceUnit, elevationUnit, speedUnit),
    [distanceData, altitudeData, speedData, distanceUnit, elevationUnit, speedUnit]
  )

  const { state, isActive } = useChartPressState({ x: 0, y: { altitude: 0 } })

  const distLabel = distanceUnit === "imperial" ? "mi" : "km"
  const elevLabel = elevationUnit === "feet" ? "ft" : "m"

  // ── UI-thread data access ─────────────────────────────────────────────────
  // Store the chart data in a SharedValue so worklets can read it without
  // crossing the JS/UI thread boundary via runOnJS.
  const dataShared = useSharedValue<ChartPoint[]>(data)
  useEffect(() => {
    dataShared.value = data
  }, [data, dataShared])

  // Find the closest data point to the pressed x-position — entirely on the
  // UI thread. No runOnJS, no setState, no React re-render triggered here.
  const closestPoint = useDerivedValue<ChartPoint | null>(() => {
    if (!isActive.value) return null
    const pts = dataShared.value
    if (!pts.length) return null

    let closest = pts[0]!
    let minDiff = Infinity
    for (const p of pts) {
      const diff = Math.abs(p.distance - state.x.value.value)
      if (diff < minDiff) {
        minDiff = diff
        closest = p
      }
    }
    return closest
  })

  // Derive the tooltip text on the UI thread. distLabel/elevLabel are plain
  // strings captured in the worklet closure — safe and cheap.
  const tooltipText = useDerivedValue(() => {
    const p = closestPoint.value
    if (!p) return "Tap or drag across graph to inspect points"
    return (
      `Dist: ${p.distance.toFixed(2)} ${distLabel}` +
      `  ·  Elev: ${p.altitude.toFixed(0)} ${elevLabel}` +
      `  ·  Grade: ${p.grade.toFixed(1)}%`
    )
  })

  // useAnimatedProps drives the TextInput text from the UI thread —
  // zero React re-renders, zero risk of stale navigation context.
  const tooltipAnimatedProps = useAnimatedProps(() => ({
    text: tooltipText.value,
    defaultValue: "Tap or drag across graph to inspect points",
  }))

  if (data.length === 0) return null

  return (
    <View style={styles.wrapper}>
      {/* Tooltip row — updated on the UI thread, never causes a React re-render */}
      <AnimatedTextInput
        animatedProps={tooltipAnimatedProps}
        editable={false}
        style={styles.tooltip}
      />

      {/* Elevation Chart wrapped in its own GestureHandlerRootView so
          victory-native's internal gestures are scoped independently from
          the surrounding bottom-sheet GestureDetector / Animated.ScrollView. */}
      <GestureHandlerRootView style={styles.chartContainer}>
        <CartesianChart
          data={data}
          xKey="distance"
          yKeys={["altitude"]}
          chartPressState={state}
          axisOptions={{
            tickCount: 5,
            formatXLabel: (val) => `${val} ${distLabel}`,
            formatYLabel: (val) => `${val} ${elevLabel}`,
            labelColor: "#9ca3af",
            lineColor: "#e5e7eb",
          }}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.altitude}
                y0={chartBounds.bottom}
                color="rgba(54, 162, 235, 0.25)"
                animate={{ type: "timing", duration: 300 }}
              />
              {/* Always render ToolTip; visibility is controlled by animated
                  opacity on the Skia Group — safe to use a SharedValue here. */}
              <ToolTip
                x={state.x.position}
                y={state.y.altitude.position}
                bottom={chartBounds.bottom}
                isActive={isActive}
              />
            </>
          )}
        </CartesianChart>
      </GestureHandlerRootView>
    </View>
  )
}

// ── ToolTip ───────────────────────────────────────────────────────────────────
// Uses Skia Group opacity (animated by a DerivedValue) instead of a React
// conditional `{isActive && ...}`. isActive is a SharedValue<boolean>, so
// using it in a React expression would always evaluate truthy (object != false).
function ToolTip({
  x,
  y,
  bottom,
  isActive,
}: {
  x: SharedValue<number>
  y: SharedValue<number>
  bottom: number
  isActive: SharedValue<boolean>
}) {
  // Drives opacity on the UI thread — no React render needed to show/hide.
  const opacity = useDerivedValue(() => (isActive.value ? 1 : 0))

  // Skia's Line requires animated SkPoint objects, not raw SharedValue numbers.
  const p1 = useDerivedValue(() => ({ x: x.value, y: 0 }))
  const p2 = useDerivedValue(() => ({ x: x.value, y: bottom }))

  return (
    <Group opacity={opacity}>
      <SkiaLine p1={p1} p2={p2} color="#36a2eb" strokeWidth={1.5} />
      <Circle cx={x} cy={y} r={5} color="#36a2eb" />
    </Group>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 16,
    width: "100%",
  },
  tooltip: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    // Prevent the TextInput chrome from showing
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  chartContainer: {
    height: 200,
    width: "100%",
  },
})
