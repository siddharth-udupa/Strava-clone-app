"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { metersToDistance, metersToElevation, speedToMps, type DistanceUnit, type ElevationUnit, type SpeedUnit } from "@repo/units"

type ActivityChartsClientProps = {
  distanceData: number[]
  altitudeData: number[]
  speedData: number[]
  distanceUnit: DistanceUnit
  elevationUnit: ElevationUnit
  speedUnit: SpeedUnit
}

type ChartPoint = {
  distance: number
  altitude: number
  speed: number
  grade: number
}

function buildChartData(
  distanceData: number[],
  altitudeData: number[],
  speedData: number[],
  distanceUnit: DistanceUnit,
  elevationUnit: ElevationUnit,
  speedUnit: SpeedUnit
): ChartPoint[] {
  const len = Math.min(distanceData.length, altitudeData.length, speedData.length)
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
    // Both deltas use raw meter values for accuracy
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

function ChartTooltip(
  { active, payload, distLabel, elevLabel }: {
    active?: string,
    payload?: any,
    distLabel: string,
    elevLabel: string
  }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as ChartPoint
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded px-3 py-2 text-xs text-gray-600 space-y-0.5">
      <p>Dist: <span className="font-semibold text-gray-800">{point.distance}</span> {distLabel}</p>
      <p>Elev: <span className="font-semibold text-gray-800">{point.altitude}</span> {elevLabel}</p>
      <p>Grade: <span className="font-semibold text-gray-800">{point.grade}</span> %</p>
    </div>
  )
}


export default function ActivityChart({ distanceData, altitudeData, speedData, distanceUnit, elevationUnit, speedUnit }: ActivityChartsClientProps) {

  const data = buildChartData(
    distanceData,
    altitudeData,
    speedData,
    distanceUnit,
    elevationUnit,
    speedUnit
  )

  if (data.length === 0) return null
  const distLabel = distanceUnit === "imperial" ? "mi" : "km"
  const elevLabel = elevationUnit === "feet" ? "ft" : "m"
  return (
    <div className="flex flex-col gap-8 my-10">
      {/* ── Elevation Chart ── */}
      <div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 6 }}>
            <defs>
              <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#36a2eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#36a2eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="distance"
              type="number"
              domain={[0, "dataMax"]}
              ticks={(() => {
                const max = data[data.length - 1]?.distance ?? 0
                const count = Math.ceil(max)
                return Array.from({ length: count }, (_, i) => i + 1)
              })()}
              tickFormatter={(v: number) => `${v}`}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              label={{ value: distLabel, position: "insideBottomRight", offset: -4, fontSize: 11, fill: "#9ca3af" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              label={{ value: elevLabel, position: "insideTopLeft", offset: 10, fontSize: 11, fill: "#9ca3af" }}
            />
            <Tooltip
              content={
                <ChartTooltip
                  distLabel={distLabel}
                  elevLabel={elevLabel}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="altitude"
              stroke="#36a2eb"
              strokeWidth={1.5}
              fill="url(#elevGrad)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 1.5, fill: "#fff", stroke: "#36a2eb" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* ── Speed Chart ── */}
      {/* <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Speed</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="distance"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              label={{ value: distLabel, position: "insideBottomRight", offset: -4, fontSize: 11, fill: "#9ca3af" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              label={{ value: speedUnit, position: "insideTopLeft", offset: 10, fontSize: 11, fill: "#9ca3af" }}
            />
            <Tooltip
              content={
                <ChartTooltip
                  distLabel={distLabel}
                  elevLabel={elevLabel}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#fc5200"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 1.5, fill: "#fff", stroke: "#fc5200" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div> */}
    </div>
  )
}