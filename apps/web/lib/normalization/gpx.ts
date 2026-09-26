import { GpxActivitySchema } from "@repo/validation"
import {
  parserGPX,
  computeStats,
  douglasPeucker,
  encodePolyline,
  buildStreams,
  verifyGpx,
  type RawTrackpoint,
} from "@repo/gpx"
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  NormalizationError,
  toNonNegativeInt,
  toNullableNumber,
  toNullableText,
  type NormalizedActivityData,
} from "./shared"

/** Douglas–Peucker tolerance used everywhere we simplify a track. */
const SIMPLIFY_TOLERANCE = 0.0001

/** Hard cap so a crafted 10 MB file cannot allocate an unbounded array. */
const MAX_TRACK_POINTS = 100_000

/**
 * Drops trackpoints we cannot compute with. `parserGPX` uses `parseFloat`, so
 * a single malformed `<trkpt>` yields `NaN` coordinates which would silently
 * poison distance/elevation (and then fail the INSERT with a NaN).
 */
function usablePoints(points: RawTrackpoint[]): RawTrackpoint[] {
  return points.filter(
    (point) =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lng) <= 180
  )
}

/**
 * Normalises an uploaded GPX file.
 *
 * Everything measurable (distance, duration, elevation, speed, track) is
 * derived from the file itself — nothing is invented.
 */
export function normalizeGpxActivity(data: unknown): NormalizedActivityData {
  const parsed = GpxActivitySchema.parse(data)

  const verification = verifyGpx(parsed.xmlContent)
  if (!verification.ok) {
    throw new NormalizationError(`Invalid GPX file: ${verification.reason}`)
  }

  const rawPoints = usablePoints(parserGPX(parsed.xmlContent))

  if (rawPoints.length === 0) {
    throw new NormalizationError(
      "No usable track points found in the provided GPX file"
    )
  }

  if (rawPoints.length > MAX_TRACK_POINTS) {
    throw new NormalizationError(
      `GPX file contains too many track points (max ${MAX_TRACK_POINTS})`
    )
  }

  const stats = computeStats(rawPoints)

  if (stats.totalDurationSeconds < 0) {
    throw new NormalizationError(
      "GPX track points are not in chronological order — cannot compute duration"
    )
  }

  const simplified = douglasPeucker(rawPoints, SIMPLIFY_TOLERANCE)

  return {
    type: parsed.type,
    title: parsed.title.slice(0, MAX_TITLE_LENGTH),
    description: toNullableText(parsed.description, MAX_DESCRIPTION_LENGTH),
    location: null,
    distance: toNonNegativeInt(stats.totalDistanceMeters),
    duration: toNonNegativeInt(stats.totalDurationSeconds),
    elevationGain: toNonNegativeInt(stats.elevationGainMeters),
    elevationLoss: toNonNegativeInt(stats.elevationLossMeters),
    encodedPolyline: encodePolyline(simplified) || null,
    maxSpeedMps: toNullableNumber(stats.maxSpeedMps),
    // A GPX file is not always timestamped. Leaving these null is honest;
    // defaulting to `new Date()` would store the upload time as the activity
    // time. The columns are nullable and the UI already handles null.
    startTime: stats.startTime,
    endTime: stats.endTime,
    streams: buildStreams(rawPoints),
  }
}
