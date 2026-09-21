import { useState, useEffect, useRef, useCallback } from "react"
import { AppState, type AppStateStatus } from "react-native"
import {
  isValidLocationPoint,
  subscribeToLocationUpdates,
  startBackgroundLocationTask,
  stopBackgroundLocationTask,
} from "../lib/locationTask"
import { saveActivityLocally } from "../lib/activityStorage"
import {
  type ActiveSession,
  createActiveSession,
  getActiveSession,
  appendPointsToActiveSession,
  pauseActiveSession,
  resumeActiveSession,
  clearActiveSession,
  computeElapsedSeconds,
} from "../lib/activeSessionStorage"
import type { ActivitySummary, ActivityPoint } from "@repo/types"
import { authClient } from "../lib/auth-client"

// ---------------------------------------------------------------------------
// Expo-location (optional native module)
// ---------------------------------------------------------------------------
let Location: typeof import("expo-location") | null = null
try {
  Location = require("expo-location")
} catch {
  // Native module unavailable — will fall back to web geolocation
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type RecorderState = "idle" | "recording" | "paused" | "finished"
export type LocationStatus = "acquiring" | "acquired" | "disabled" | "denied"

type RecorderData = {
  status: RecorderState
  locationStatus: LocationStatus
  currentPoint: ActivityPoint | null
  points: ActivityPoint[]
  distanceMeters: number
  elapsedSeconds: number
  currentSpeedMps: number
  maxSpeedMps: number
  isBackgroundActive: boolean
  errorMsg: string | null
}

const INITIAL_DATA: RecorderData = {
  status: "idle",
  locationStatus: "acquiring",
  currentPoint: null,
  points: [],
  distanceMeters: 0,
  elapsedSeconds: 0,
  currentSpeedMps: 0,
  maxSpeedMps: 0,
  isBackgroundActive: false,
  errorMsg: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert raw coords (from expo-location or web geolocation) into an ActivityPoint. */
function coordsToPoint(coords: { latitude: number; longitude: number; altitude?: number | null; speed?: number | null; accuracy?: number | null }, timestamp: number): ActivityPoint {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude: coords.altitude ?? null,
    speed: coords.speed ?? null,
    accuracy: coords.accuracy ?? null,
    timestamp,
  }
}

/** Get the current position using expo-location or web geolocation. */
function getCurrentPosition(): Promise<ActivityPoint | null> {
  return new Promise((resolve) => {
    if (Location && typeof Location.getCurrentPositionAsync === "function") {
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then((loc) => resolve(loc?.coords ? coordsToPoint(loc.coords, loc.timestamp) : null))
        .catch(() => resolve(null))
    } else if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(coordsToPoint(pos.coords, pos.timestamp)),
        () => resolve(null),
        { enableHighAccuracy: true },
      )
    } else {
      resolve(null)
    }
  })
}

const hasExpoLocation = Boolean(Location && typeof Location.requestForegroundPermissionsAsync === "function")
const hasWebGeolocation = typeof navigator !== "undefined" && !!navigator.geolocation
const isLocationAvailable = hasExpoLocation || hasWebGeolocation

const API_URL = process.env.EXPO_PUBLIC_API_URL!

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useActivityRecorder(activityType: "run" | "ride" = "run") {
  const [data, setData] = useState<RecorderData>(INITIAL_DATA)
  const sessionRef = useRef<ActiveSession | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fgSubRef = useRef<{ remove: () => void } | null>(null)
  const webWatchRef = useRef<number | null>(null)

  // ---- Request foreground & background location permissions on open ----
  const requestLocationPermissions = useCallback(async (): Promise<boolean> => {
    setData((prev) => ({ ...prev, locationStatus: "acquiring", errorMsg: null }))

    if (hasExpoLocation && Location) {
      try {
        // Check if device location services are enabled
        const checkEnabled = (Location as any).hasServicesEnabledAsync || (Location as any).isLocationEnabledAsync
        if (typeof checkEnabled === "function") {
          const isEnabled = await checkEnabled.call(Location)
          if (!isEnabled) {
            setData((prev) => ({
              ...prev,
              locationStatus: "disabled",
              errorMsg: "Location services are turned off on your device.",
            }))
            return false
          }
        }

        // Request Foreground Permission
        const fgPerm = await Location.requestForegroundPermissionsAsync()
        if (fgPerm.status !== "granted") {
          setData((prev) => ({
            ...prev,
            locationStatus: "denied",
            errorMsg: "Foreground location permission is required.",
          }))
          return false
        }

        // Request Background Permission
        if (typeof Location.requestBackgroundPermissionsAsync === "function") {
          try {
            await Location.requestBackgroundPermissionsAsync()
          } catch {
            // Ignore background permission prompt rejection if foreground is granted
          }
        }

        // Acquire initial current position
        const initialPos = await getCurrentPosition()
        setData((prev) => ({
          ...prev,
          locationStatus: "acquired",
          currentPoint: initialPos || prev.currentPoint,
        }))
        return true
      } catch (err: any) {
        console.error("Location permission error:", err)
        setData((prev) => ({
          ...prev,
          locationStatus: "disabled",
          errorMsg: err.message || "Failed to access location services.",
        }))
        return false
      }
    } else if (hasWebGeolocation) {
      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const point = coordsToPoint(pos.coords, pos.timestamp)
            setData((prev) => ({
              ...prev,
              locationStatus: "acquired",
              currentPoint: point,
            }))
            resolve(true)
          },
          (err) => {
            const isDenied = err.code === err.PERMISSION_DENIED
            setData((prev) => ({
              ...prev,
              locationStatus: isDenied ? "denied" : "disabled",
              errorMsg: isDenied
                ? "Location permission denied."
                : "Location service turned off.",
            }))
            resolve(false)
          },
          { enableHighAccuracy: true, timeout: 15000 }
        )
      })
    } else {
      setData((prev) => ({
        ...prev,
        locationStatus: "disabled",
        errorMsg: "Location services are unavailable on this device or build.",
      }))
      return false
    }
  }, [])

  // ---- Run permission check and initial position acquisition on mount ----
  useEffect(() => {
    requestLocationPermissions()
  }, [requestLocationPermissions])

  // ---- Sync all UI state from a session object ----
  const syncFromSession = useCallback((session: ActiveSession) => {
    sessionRef.current = session
    setData((prev) => ({
      ...prev,
      status: session.status,
      points: session.points,
      distanceMeters: session.distanceMeters,
      currentSpeedMps: session.currentSpeedMps,
      maxSpeedMps: session.maxSpeedMps,
      isBackgroundActive: session.isBackgroundActive,
      elapsedSeconds: computeElapsedSeconds(session),
    }))
  }, [])

  // ---- Hydrate from disk on mount ----
  useEffect(() => {
    let mounted = true
    getActiveSession().then((session) => {
      if (mounted && session) syncFromSession(session)
    })
    return () => { mounted = false }
  }, [syncFromSession])

  // ---- Re-sync when app returns to foreground ----
  useEffect(() => {
    const onAppState = async (state: AppStateStatus) => {
      if (state === "active") {
        const session = await getActiveSession()
        if (session) syncFromSession(session)
      }
    }
    const sub = AppState.addEventListener("change", onAppState)
    return () => sub.remove()
  }, [syncFromSession])

  // ---- Elapsed-time ticker (1 s) ----
  useEffect(() => {
    if (data.status !== "recording" && data.status !== "paused") {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      const s = sessionRef.current
      if (s) setData((prev) => ({ ...prev, elapsedSeconds: computeElapsedSeconds(s) }))
    }, 1000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [data.status])

  // ---- Handle a new GPS point from any source ----
  const handleLivePoint = useCallback((point: ActivityPoint) => {
    if (!isValidLocationPoint(point)) return

    setData((prev) => ({
      ...prev,
      currentPoint: point,
      locationStatus: "acquired",
      points: prev.status === "recording" ? [...prev.points, point] : prev.points,
      currentSpeedMps: point.speed !== null && point.speed >= 0 ? point.speed : prev.currentSpeedMps,
      maxSpeedMps: point.speed !== null && point.speed >= 0 ? Math.max(prev.maxSpeedMps, point.speed) : prev.maxSpeedMps,
    }))

    // Keep session ref fresh for the timer
    getActiveSession().then((session) => {
      if (session) {
        sessionRef.current = session
        setData((prev) => ({ ...prev, distanceMeters: session.distanceMeters }))
      }
    })
  }, [])

  // ---- Location subscription management ----
  useEffect(() => {
    // Clean up watchers when not recording
    if (data.status !== "recording") {
      if (fgSubRef.current) { fgSubRef.current.remove(); fgSubRef.current = null }
      if (webWatchRef.current !== null && hasWebGeolocation) {
        navigator.geolocation.clearWatch(webWatchRef.current)
        webWatchRef.current = null
      }
      return
    }

    // Always listen to background-task events for live UI
    const unsubBg = subscribeToLocationUpdates(handleLivePoint)

    // If background tracking is active, that's all we need
    if (data.isBackgroundActive) {
      return () => unsubBg()
    }

    // Foreground fallback: start a watcher
    if (Location && typeof Location.watchPositionAsync === "function") {
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 },
        async (loc) => {
          if (!loc?.coords) return
          const point = coordsToPoint(loc.coords, loc.timestamp)
          handleLivePoint(point)
          await appendPointsToActiveSession([point])
        },
      )
        .then((sub) => { fgSubRef.current = sub })
        .catch(() => { })
    } else if (hasWebGeolocation) {
      webWatchRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const point = coordsToPoint(pos.coords, pos.timestamp)
          handleLivePoint(point)
          await appendPointsToActiveSession([point])
        },
        () => { },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 },
      )
    }

    return () => {
      unsubBg()
      if (fgSubRef.current) { fgSubRef.current.remove(); fgSubRef.current = null }
      if (webWatchRef.current !== null && hasWebGeolocation) {
        navigator.geolocation.clearWatch(webWatchRef.current)
        webWatchRef.current = null
      }
    }
  }, [data.status, data.isBackgroundActive, handleLivePoint])

  // ===========================================================================
  // Actions
  // ===========================================================================

  const startRecording = async () => {
    try {
      setData((prev) => ({ ...prev, errorMsg: null }))

      // Verify location permissions
      const granted = await requestLocationPermissions()
      if (!granted) return

      // Attempt background tracking
      let bgActive = false
      try { bgActive = await startBackgroundLocationTask() } catch { }

      // Create session & start recording
      const session = await createActiveSession(activityType, bgActive)
      sessionRef.current = session
      setData((prev) => ({ ...prev, status: "recording", isBackgroundActive: bgActive }))

      // Grab initial position
      const initialPoint = await getCurrentPosition()
      if (initialPoint) {
        handleLivePoint(initialPoint)
        await appendPointsToActiveSession([initialPoint])
      }
    } catch (err: any) {
      console.error("Start activity error:", err)
      setData((prev) => ({ ...prev, errorMsg: err.message || "Failed to start recording." }))
    }
  }

  const pauseRecording = async () => {
    const session = await pauseActiveSession()
    if (session) syncFromSession(session)
    else setData((prev) => ({ ...prev, status: "paused" }))
  }

  const resumeRecording = async () => {
    const session = await resumeActiveSession()
    if (session) syncFromSession(session)
    else setData((prev) => ({ ...prev, status: "recording" }))
  }

  const finishRecordingSession = async () => {
    try {
      setData((prev) => ({ ...prev, status: "finished" }))
      await stopBackgroundLocationTask()
      const session = (await getActiveSession()) || sessionRef.current
      return session
    } catch (err: any) {
      console.error("Finish activity session error:", err)
      setData((prev) => ({ ...prev, errorMsg: "Error finishing activity recording." }))
      return null
    }
  }

  const saveRecordedActivity = async (customDetails?: {
    title?: string
    description?: string
    activityType?: "run" | "ride" | "hike" | "walk" | string
  }): Promise<ActivitySummary | null> => {
    try {
      await stopBackgroundLocationTask()

      const session = (await getActiveSession()) || sessionRef.current
      const finalPoints = session?.points || data.points
      const finalDistance = session?.distanceMeters || data.distanceMeters
      const finalDuration = session ? computeElapsedSeconds(session) : data.elapsedSeconds
      const finalMaxSpeed = session?.maxSpeedMps || data.maxSpeedMps
      const selectedType = customDetails?.activityType || session?.type || activityType

      const defaultTitle = selectedType === "run" ? "Morning Run" : selectedType === "ride" ? "Ride" : "Activity"

      const summary: ActivitySummary = {
        id: session?.id || `act_${Date.now()}`,
        type: selectedType as any,
        title: customDetails?.title?.trim() || defaultTitle,
        description: customDetails?.description?.trim() || undefined,
        startedAt: session?.startedAt || Date.now(),
        endedAt: Date.now(),
        distanceMeters: finalDistance,
        durationSeconds: finalDuration,
        movingTimeSeconds: finalDuration,
        avgSpeedMps: finalDuration > 0 ? finalDistance / finalDuration : 0,
        maxSpeedMps: finalMaxSpeed,
        points: finalPoints,
      }

      await saveActivityLocally(summary)

      try {
        await authClient.$fetch(`${API_URL}/api/activities`, {
          method: "POST",
          body: { source: "mobile", data: summary },
        })
      } catch {
        console.warn("Failed to post activity to server")
      }

      await clearActiveSession()
      sessionRef.current = null
      setData((prev) => ({ ...INITIAL_DATA, locationStatus: prev.locationStatus, currentPoint: prev.currentPoint }))

      return summary
    } catch (err: any) {
      console.error("Save activity error:", err)
      setData((prev) => ({ ...prev, errorMsg: "Error saving activity recording." }))
      return null
    }
  }

  const discardRecordingSession = async (): Promise<void> => {
    try {
      await stopBackgroundLocationTask()
      await clearActiveSession()
      sessionRef.current = null
      setData((prev) => ({ ...INITIAL_DATA, locationStatus: prev.locationStatus, currentPoint: prev.currentPoint }))
    } catch (err: any) {
      console.error("Discard activity error:", err)
    }
  }

  const stopAndSaveRecording = async (): Promise<ActivitySummary | null> => {
    await finishRecordingSession()
    return saveRecordedActivity()
  }

  // ===========================================================================
  // Public API
  // ===========================================================================
  return {
    status: data.status,
    locationStatus: data.locationStatus,
    currentPoint: data.currentPoint,
    points: data.points,
    distanceMeters: data.distanceMeters,
    elapsedSeconds: data.elapsedSeconds,
    currentSpeedMps: data.currentSpeedMps,
    maxSpeedMps: data.maxSpeedMps,
    isBackgroundActive: data.isBackgroundActive,
    errorMsg: data.errorMsg,
    isNativeSupported: isLocationAvailable,
    requestLocationPermissions,
    startRecording,
    pauseRecording,
    resumeRecording,
    finishRecordingSession,
    saveRecordedActivity,
    discardRecordingSession,
    stopAndSaveRecording,
  }
}

