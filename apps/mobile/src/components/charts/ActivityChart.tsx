import React, { useMemo } from "react"
import { TextInput } from "react-native"
import { View } from "react-native"
import Animated, {
  useAnimatedProps,
  useDerivedValue,
} from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"
import { CartesianChart, Area, useChartPressState } from "victory-native"
import { Circle, Line as SkiaLine, Group } from "@shopify/react-native-skia"

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
    // Calculated from the raw meter arrays so unit conversion doesn't affect it.
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

  // Derive tooltip text directly from Victory's chart press state — entirely on
  // the UI thread. state.x.value and state.y.altitude.value are SharedValues,
  // so their actual numbers live one more `.value` deep.
  //
  // NOTE: `useChartPressState` returns `isActive` as a plain React boolean
  // (driven by useState). The actual SharedValue<boolean> is `state.isActive`.
  // Always use `state.isActive` inside worklets.
  const tooltipText = useDerivedValue(() => {
    if (!state.isActive.value) {
      return "Tap or drag across graph to inspect points"
    }

    const distance = state.x.value.value
    const altitude = state.y.altitude.value.value

    return (
      `Dist: ${distance.toFixed(2)} ${distLabel}` +
      `  ·  Elev: ${altitude.toFixed(0)} ${elevLabel}`
    )
  })

  // Drive the TextInput text from the UI thread — zero React re-renders.
  const tooltipAnimatedProps = useAnimatedProps(() => ({
    text: tooltipText.value,
    defaultValue: "Tap or drag across graph to inspect points",
  }))

  if (data.length === 0) return null

  return (
    <View className="my-4 w-full">
      {/* Tooltip row — updated on the UI thread, never causes a React re-render */}
      <AnimatedTextInput
        animatedProps={tooltipAnimatedProps}
        editable={false}
        className="text-[11px] text-gray-500 dark:text-slate-400 italic px-3 py-1.5 mb-1 border-0 bg-transparent"
      />

      {/* Victory's ChartWrapper already includes its own GestureHandlerRootView
          internally, so we only need a plain View here. We must use an explicit
          numeric `style` height so Victory's `onLayout` fires correctly —
          NativeWind className alone on a non-View component won't propagate
          layout dimensions reliably and would leave hasMeasuredLayoutSize=false,
          causing the chart to render nothing. */}
      <View className="w-full" style={{ height: 200 }}>
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
                  opacity on the Skia Group — avoids treating a SharedValue as
                  a React boolean (which would always be truthy as an object). */}
              <ToolTip
                x={state.x.position}
                y={state.y.altitude.position}
                bottom={chartBounds.bottom}
                isActive={state.isActive}
              />
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  )
}

// ── ToolTip ───────────────────────────────────────────────────────────────────
// Receives Victory's SharedValue positions directly and uses a DerivedValue for
// opacity so the crosshair shows/hides entirely on the UI thread.
//
// `isActive` here is `state.isActive` — the SharedValue<boolean> that lives
// inside ChartPressState, not the plain boolean returned by useChartPressState.
type ToolTipProps = {
  x: SharedValue<number>
  y: SharedValue<number>
  bottom: number
  isActive: SharedValue<boolean>
}

function ToolTip({ x, y, bottom, isActive }: ToolTipProps) {
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
