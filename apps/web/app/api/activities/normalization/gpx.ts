import { GpxActivitySchema } from "@repo/validation"
import {
  parserGPX,
  computeStats,
  douglasPeucker,
  encodePolyline,
  buildStreams,
} from "@repo/gpx"
import type { NormalizedActivityData } from "./index"

export function normalizeGpxActivity(data: unknown): NormalizedActivityData {
  const parsed = GpxActivitySchema.parse(data)
  const rawPoints = parserGPX(parsed.xmlContent)

  if (rawPoints.length === 0) {
    throw new Error("No track points found in the provided GPX file")
  }

  const stats = computeStats(rawPoints)
  const simplified = douglasPeucker(rawPoints, 0.0001)
  const encodedPolyline = encodePolyline(simplified)
  const streams = buildStreams(rawPoints)

  return {
    type: parsed.type,
    title: parsed.title,
    description: parsed.description ?? null,
    distance: stats.totalDistanceMeters,
    duration: stats.totalDurationSeconds,
    elevationGain: stats.elevationGainMeters,
    elevationLoss: stats.elevationLossMeters,
    encodedPolyline,
    maxSpeedMps: stats.maxSpeedMps,
    startTime: stats.startTime ?? new Date(),
    endTime: stats.endTime ?? new Date(),
    streams,
  }
}
