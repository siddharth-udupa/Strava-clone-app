import { ManualActivitySchema } from "@repo/validation"
import { distanceToMeters, durationToSeconds, elevationToMeters } from "@repo/units"
import type { NormalizedActivityData } from "./index"

export function normalizeManualActivity(data: unknown): NormalizedActivityData {
  const parsed = ManualActivitySchema.parse(data)

  const distanceUnit = parsed.metaData?.distanceUnit ?? "metric"
  const elevUnitGain = parsed.metaData?.elevUnitGain ?? "meters"
  const elevUnitLoss = parsed.metaData?.elevUnitLoss ?? "meters"

  const distanceMeters = distanceToMeters(parsed.distance, distanceUnit)
  const durationSeconds =
    typeof parsed.duration === "number"
      ? parsed.duration
      : durationToSeconds(parsed.duration)

  const elevationGain = elevationToMeters(parsed.elevationGain, elevUnitGain)
  const elevationLoss = elevationToMeters(parsed.elevationLoss, elevUnitLoss)

  const startTime = parsed.startTime ? new Date(parsed.startTime) : new Date()
  const endTime = parsed.endTime ? new Date(parsed.endTime) : undefined

  return {
    type: parsed.type,
    title: parsed.title,
    description: parsed.description ?? null,
    distance: distanceMeters,
    duration: durationSeconds,
    elevationGain,
    elevationLoss,
    startTime,
    endTime,
  }
}
