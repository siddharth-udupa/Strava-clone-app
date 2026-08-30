import { Platform } from "react-native"
import { appendPointsToActiveSession } from "./activeSessionStorage"

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

/**
 * Attempt to start background location tracking using Expo Location & TaskManager with Android Foreground Service.
 */
export async function startBackgroundLocationTask(): Promise<boolean> {
  if (!Location || typeof Location.requestBackgroundPermissionsAsync !== "function") {
    console.warn("[LOCATION_TASK] Location module unavailable for background tracking.")
    return false
  }

  try {
    const isTaskAvailable = typeof (Location as any)?.isTaskManagerAvailableAsync === "function"
      ? await (Location as any).isTaskManagerAvailableAsync()
      : true

    if (!isTaskAvailable) {
      console.warn("[LOCATION_TASK] TaskManager is not available on this platform.")
      return false
    }

    const bgPerm = await Location.requestBackgroundPermissionsAsync()
    if (bgPerm.status !== "granted") {
      console.warn("[LOCATION_TASK] Background location permission denied.")
      return false
    }

    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
    if (!isRunning) {
      const taskOptions: any = {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 2,
        deferredUpdatesInterval: 2000,
        deferredUpdatesDistance: 2,
        showsBackgroundLocationIndicator: true,
        pausesLocationUpdatesAutomatically: false,
      }

      if (Platform.OS === "android") {
        taskOptions.foregroundService = {
          notificationTitle: "Recording Activity",
          notificationBody: "Strava Clone is recording your route in the background.",
          notificationColor: "#FC5200",
        }
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, taskOptions)
    }

    const verifiedRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
    console.log("[LOCATION_TASK] Background location started successfully:", verifiedRunning)
    return verifiedRunning
  } catch (err) {
    console.warn("[LOCATION_TASK] Error starting background location task:", err)
    return false
  }
}

/**
 * Stop background location tracking task if active.
 */
export async function stopBackgroundLocationTask(): Promise<void> {
  if (!Location || typeof Location.hasStartedLocationUpdatesAsync !== "function") return
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
    if (isRunning && typeof Location.stopLocationUpdatesAsync === "function") {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      console.log("[LOCATION_TASK] Stopped background location task.")
    }
  } catch (err) {
    console.warn("[LOCATION_TASK] Error stopping background location task:", err)
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

        const validPoints: ActivityPoint[] = []

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
            validPoints.push(point)
            listeners.forEach((listener) => listener(point))
          } else {
            console.log("[LOCATION_TASK] Rejected inaccurate point:", loc.coords.accuracy)
          }
        }

        if (validPoints.length > 0) {
          await appendPointsToActiveSession(validPoints)
        }
      } catch (err) {
        console.warn("[LOCATION_TASK] Error processing background location payload:", err)
      }
    })
  } catch (e) {
    console.warn("[LOCATION_TASK] defineTask registration warning:", e)
  }
}
