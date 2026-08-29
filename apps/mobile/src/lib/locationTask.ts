export const LOCATION_TASK_NAME = "activity-location-task"

export type ActivityPoint = {
  latitude: number
  longitude: number
  altitude: number | null
  speed: number | null
  accuracy: number | null
  timestamp: number
}

type LocationListener = (point: ActivityPoint) => void
const listeners = new Set<LocationListener>()

/**
 * Subscribe to live GPS updates received by the background location task.
 */
export function subscribeToLocationUpdates(listener: LocationListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Check if a GPS coordinate is sufficiently accurate.
 */
export function isValidLocationPoint(point: ActivityPoint): boolean {
  if (point.accuracy !== null && point.accuracy > 100) {
    return false // Filter out points with accuracy worse than 100 meters
  }
  if (point.latitude === 0 && point.longitude === 0) {
    return false
  }
  return true
}

// Safely require native modules inside try/catch so unlinked native builds don't crash at import time
let TaskManager: typeof import("expo-task-manager") | null = null
let Location: typeof import("expo-location") | null = null

try {
  TaskManager = require("expo-task-manager")
  Location = require("expo-location")
} catch (e) {
  console.warn("[LOCATION_TASK] Native expo-location or expo-task-manager unavailable:", e)
}

/**
 * Safely unregister / stop any stale or orphaned location background task on startup.
 */
export async function cleanupStaleLocationTasks(): Promise<void> {
  if (!Location || typeof Location.hasStartedLocationUpdatesAsync !== "function") return
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
    if (isRunning && typeof Location.stopLocationUpdatesAsync === "function") {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      console.log("[LOCATION_TASK] Successfully cleaned up stale background location task.")
    }
  } catch (e) {
    console.warn("[LOCATION_TASK] Cleanup stale location tasks notice:", e)
  }
}

if (TaskManager && typeof TaskManager.defineTask === "function") {
  try {
    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error("[LOCATION_TASK] Task manager error:", error)
        return
      }

      if (!data) return

      try {
        const { locations } = data as { locations: any[] }
        if (!Array.isArray(locations)) return

        for (const loc of locations) {
          if (!loc || !loc.coords) continue
          const point: ActivityPoint = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            altitude: loc.coords.altitude ?? null,
            speed: loc.coords.speed ?? null,
            accuracy: loc.coords.accuracy ?? null,
            timestamp: loc.timestamp,
          }

          if (isValidLocationPoint(point)) {
            listeners.forEach((listener) => listener(point))
          } else {
            console.log("[LOCATION_TASK] Rejected inaccurate point:", loc.coords.accuracy)
          }
        }
      } catch (err) {
        console.warn("[LOCATION_TASK] Error processing background location payload:", err)
      }
    })
  } catch (e) {
    console.warn("[LOCATION_TASK] defineTask registration warning:", e)
  }
}

