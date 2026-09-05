export type NormalizedActivityData = {
  type: string
  title: string
  description?: string | null
  location?: string | null
  distance: number
  duration: number
  elevationGain: number
  elevationLoss: number
  encodedPolyline?: string | null
  maxSpeedMps?: number | null
  startTime?: Date | null
  endTime?: Date | null
  streams?: {
    timeData: number[]
    distanceData: number[]
    altitudeData: number[]
    speedData: number[]
  } | null
}

export * from "./mobile"
export * from "./gpx"
export * from "./manual"
