import type { ActivityStreams, ActivityTypes } from "@repo/types"

export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 1000

/**
 * The single shape every `normalize*Activity` function must return.
 *
 * It is intentionally a *superset* of `activitiesInsertType` minus the
 * server-owned fields: the route handler maps it onto the drizzle insert
 * payload. Absent optional values are `null` (not `undefined`) so it is
 * obvious which values were genuinely missing.
 */
export type NormalizedActivityData = {
  type: ActivityTypes
  title: string
  description: string | null
  location: string | null
  /** metres, rounded — the column is an integer */
  distance: number
  /** seconds, rounded — the column is an integer */
  duration: number
  /** metres, rounded — the column is an integer */
  elevationGain: number
  /** metres, rounded — the column is an integer */
  elevationLoss: number
  encodedPolyline: string | null
  maxSpeedMps: number | null
  startTime: Date | null
  endTime: Date | null
  streams: ActivityStreams | null
}

/**
 * Thrown when the *client* sent something we cannot turn into an activity.
 * Anything else escaping a normalizer is a server bug and must surface as a
 * 500 rather than being reported back to the user as bad input.
 */
export class NormalizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NormalizationError"
  }
}

/** Coerce an unknown value to a non-negative integer, defaulting to 0. */
export function toNonNegativeInt(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return 0
  return Math.round(value)
}

/** Keep a finite non-negative number, or `null`. */
export function toNullableNumber(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null
  return value
}

/** Trim, collapse empty strings to `null`, and cap the length. */
export function toNullableText(
  value: string | null | undefined,
  maxLength: number
): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

/**
 * Parse a date that the schema has already validated, without ever producing
 * an `Invalid Date` (which the Postgres driver would reject at INSERT time).
 */
export function toValidDate(value: Date | string | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
