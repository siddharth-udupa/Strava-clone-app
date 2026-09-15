import type { DistanceUnit, ElevationUnit, SpeedUnit } from "@repo/units"
import ActivityChart from "./ActivityChart"

export type ActivityChartsProps = {
  distanceData: number[]
  altitudeData: number[]
  speedData: number[]
  distanceUnit: DistanceUnit
  elevationUnit: ElevationUnit
  speedUnit: SpeedUnit
}

export default function ActivityChartWrapper({
  distanceData,
  altitudeData,
  speedData,
  distanceUnit,
  elevationUnit,
  speedUnit,
}: ActivityChartsProps) {
  return (
    <ActivityChart
      distanceData={distanceData}
      altitudeData={altitudeData}
      speedData={speedData}
      distanceUnit={distanceUnit}
      elevationUnit={elevationUnit}
      speedUnit={speedUnit}
    />
  )
}
