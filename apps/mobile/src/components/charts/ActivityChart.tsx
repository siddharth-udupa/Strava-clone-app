import { useState, useEffect, useMemo } from "react"
import { View, Text } from "react-native"
import { CartesianChart, Area, Line, useChartPressState } from "victory-native"
import { useDerivedValue, type SharedValue } from "react-native-reanimated"
import {
  metersToDistance,
  metersToElevation,
  speedToMps,
  type DistanceUnit,
  type ElevationUnit,
  type SpeedUnit,
} from "@repo/units"

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
      const dAlt = altitudeData[i]! - altitudeData[i - step]!   // meters
      const dDist = distanceData[i]! - distanceData[i - step]!  // meters
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

  const activeDistText = useDerivedValue(() => {
    return `${state.x.value.value.toFixed(2)} ${distLabel}`
  })

  const activeElevText = useDerivedValue(() => {
    return `${state.y.altitude.value.value.toFixed(1)} ${elevLabel}`
  })

  if (data.length === 0) return null

  return (
    <View className="my-4 w-full">
      {/* Dynamic Touch Tooltip Header */}
      <View className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-2 mb-2 flex-row justify-between items-center">
        {isActive ? (
          <>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 font-medium">Dist: </Text>
              <AnimatedText text={activeDistText} className="text-xs font-semibold text-gray-800 dark:text-gray-100" />
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 font-medium">Elev: </Text>
              <AnimatedText text={activeElevText} className="text-xs font-semibold text-gray-800 dark:text-gray-100" />
            </View>
          </>
        ) : (
          <Text className="text-xs text-gray-400 italic">
            Press and drag across graph to inspect points ({distLabel} / {elevLabel})
          </Text>
        )}
      </View>

      {/* Victory Native Cartesian Elevation Chart */}
      <View style={{ height: 200, width: "100%" }}>
        <CartesianChart
          data={data}
          xKey="distance"
          yKeys={["altitude"]}
          chartPressState={state}
          xAxis={{
            formatXLabel: (val) => `${val}`,
            labelColor: "#9ca3af",
            lineColor: "#e5e7eb",
          }}
          yAxis={[
            {
              formatYLabel: (val) => `${val}`,
              labelColor: "#9ca3af",
              lineColor: "transparent",
            },
          ]}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.altitude}
                y0={chartBounds.bottom}
                color="#36a2eb"
                opacity={0.3}
              />
              <Line
                points={points.altitude}
                color="#36a2eb"
                strokeWidth={1.5}
              />
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  )
}

function AnimatedText({ text, className }: { text: SharedValue<string>; className?: string }) {
  const [currentText, setCurrentText] = useState(text.value)

  useEffect(() => {
    const interval = setInterval(() => {
      if (text.value !== currentText) {
        setCurrentText(text.value)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [text, currentText])

  return <Text className={className}>{currentText}</Text>
}
