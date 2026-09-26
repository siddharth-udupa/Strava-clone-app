import { ManualActivitySchema } from "@repo/validation"
import { distanceToMeters, durationToSeconds, elevationToMeters } from "@repo/units"
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  toNonNegativeInt,
  toNullableText,
  toValidDate,
  type NormalizedActivityData,
} from "./shared"

/**
 * Normalises a hand-entered activity.
 *
 * `ManualActivitySchema` already lowercases and validates `type`, so it can be
 * handed to the `activity_type` pgEnum untouched. There is no track, so no
 * polyline, no streams and no derived speed.
 */
export function normalizeManualActivity(data: unknown): NormalizedActivityData {
  const parsed = ManualActivitySchema.parse(data)

  const distanceUnit = parsed.metaData.distanceUnit
  const elevUnitGain = parsed.metaData.elevUnitGain
  const elevUnitLoss = parsed.metaData.elevUnitLoss

  const distanceMeters = distanceToMeters(parsed.distance, distanceUnit)
  const durationSeconds =
    typeof parsed.duration === "number"
      ? parsed.duration
      : durationToSeconds(parsed.duration)

  const elevationGain = elevationToMeters(parsed.elevationGain, elevUnitGain)
  const elevationLoss = elevationToMeters(parsed.elevationLoss, elevUnitLoss)

  // A manual entry is being logged right now, so "now" is a correct fallback
  // for a missing start time. The end time stays null unless supplied.
  const startTime = toValidDate(parsed.startTime) ?? new Date()
  const parsedEndTime = toValidDate(parsed.endTime)
  const endTime =
    parsedEndTime && parsedEndTime.getTime() >= startTime.getTime()
      ? parsedEndTime
      : null

  return {
    type: parsed.type,
    title: parsed.title.slice(0, MAX_TITLE_LENGTH),
    description: toNullableText(parsed.description, MAX_DESCRIPTION_LENGTH),
    location: null,
    distance: toNonNegativeInt(distanceMeters),
    duration: toNonNegativeInt(durationSeconds),
    elevationGain: toNonNegativeInt(elevationGain),
    elevationLoss: toNonNegativeInt(elevationLoss),
    encodedPolyline: null,
    maxSpeedMps: null,
    startTime,
    endTime,
    streams: null,
  }
}
