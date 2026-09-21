import type { activitiesType, activityStreamsInsertType, getActivityDetails } from "@repo/db"

export type ActivityCardType = activitiesType

export type ActivityStreams = Omit<activityStreamsInsertType, "id" | "activityId" | "createdAt">

export type ActivityDetailsType = NonNullable<Awaited<ReturnType<typeof getActivityDetails>>>

export type ActivityPoint = {
  latitude: number
  longitude: number
  altitude: number | null
  speed: number | null
  accuracy: number | null
  timestamp: number
}

export type ActivitySummary = {
  id: string
  type: "run" | "ride" | "hike" | "walk"
  title: string
  description?: string
  startedAt: number
  endedAt?: number
  distanceMeters: number
  durationSeconds: number
  movingTimeSeconds: number
  avgSpeedMps: number
  maxSpeedMps: number
  points: ActivityPoint[]
}
