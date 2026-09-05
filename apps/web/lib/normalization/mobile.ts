import { MobileActivitySchema, type MobileActivityPointInput } from "@repo/validation"
import {
  douglasPeucker,
  encodePolyline,
  buildStreams,
  computeStats,
  type RawTrackpoint,
} from "@repo/gpx"
import type { NormalizedActivityData } from "./index"

export function normalizeMobileActivity(data: unknown): NormalizedActivityData {
  const parsed = MobileActivitySchema.parse(data)

  const formattedType =
    parsed.type.charAt(0).toUpperCase() + parsed.type.slice(1).toLowerCase()

  const startTime = new Date(parsed.startedAt)
  const endTime = parsed.endedAt
    ? new Date(parsed.endedAt)
    : new Date(parsed.startedAt + parsed.durationSeconds * 1000)

  let encodedPolyline: string | null = null
  let streams: NormalizedActivityData["streams"] = null
  let elevationGain = 0
  let elevationLoss = 0
  let maxSpeedMps: number | null = parsed.maxSpeedMps ?? null

  if (parsed.points && parsed.points.length > 0) {
    const rawPoints: RawTrackpoint[] = parsed.points.map((p: MobileActivityPointInput) => ({
      lat: p.latitude,
      lng: p.longitude,
      ele: p.altitude ?? null,
      time: new Date(p.timestamp),
    }))

    const stats = computeStats(rawPoints)
    const simplified = douglasPeucker(rawPoints, 0.0001)
    encodedPolyline = encodePolyline(simplified)
    streams = buildStreams(rawPoints)
    elevationGain = stats.elevationGainMeters
    elevationLoss = stats.elevationLossMeters
    if (!maxSpeedMps) {
      maxSpeedMps = stats.maxSpeedMps
    }
  }

  return {
    type: formattedType,
    title: parsed.title,
    description: parsed.description ?? null,
    distance: Math.round(parsed.distanceMeters),
    duration: Math.round(parsed.durationSeconds),
    elevationGain,
    elevationLoss,
    encodedPolyline,
    maxSpeedMps,
    startTime,
    endTime,
    streams,
  }
}
