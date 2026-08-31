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


// Safely require expo-location inside try/catch
let Location: typeof import("expo-location") | null = null
try {
  Location = require("expo-location")
} catch (e) {
  console.warn("[useActivityRecorder] expo-location native module unavailable:", e)
}

export type RecorderState = "idle" | "recording" | "paused" | "finished"

export function useActivityRecorder(activityType: "run" | "ride" = "run") {
  const [status, setStatus] = useState<RecorderState>("idle")
  const [points, setPoints] = useState<ActivityPoint[]>([])
  const [distanceMeters, setDistanceMeters] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentSpeedMps, setCurrentSpeedMps] = useState(0)
  const [maxSpeedMps, setMaxSpeedMps] = useState(0)
  const [isBackgroundActive, setIsBackgroundActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const activeSessionRef = useRef<ActiveSession | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fgSubRef = useRef<{ remove: () => void } | null>(null)
  const webWatchIdRef = useRef<number | null>(null)

  const isNativeSupported = Boolean(
    (Location && typeof Location.requestForegroundPermissionsAsync === "function") ||
      (typeof navigator !== "undefined" && navigator.geolocation)
  )

  useEffect(() => {
    if (!isNativeSupported) {
      setErrorMsg("Location services are unavailable on this device or build.")
    }
  }, [isNativeSupported])

  // Sync state from storage session object
  const syncWithSession = useCallback((session: ActiveSession | null) => {
    if (!session) return
    activeSessionRef.current = session
    setStatus(session.status)
    setPoints(session.points)
    setDistanceMeters(session.distanceMeters)
    setCurrentSpeedMps(session.currentSpeedMps)
    setMaxSpeedMps(session.maxSpeedMps)
    setIsBackgroundActive(session.isBackgroundActive)
    setElapsedSeconds(computeElapsedSeconds(session))
  }, [])

  // Hydrate active session on initial mount
  useEffect(() => {
    let isMounted = true
    getActiveSession().then((session) => {
      if (isMounted && session) {
        syncWithSession(session)
      }
    })
    return () => {
      isMounted = false
    }
  }, [syncWithSession])

  // Re-sync with disk state whenever AppState transitions back to active (e.g. phone unlocked)
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === "active") {
        const session = await getActiveSession()
        if (session) {
          syncWithSession(session)
        }
      }
    }

    const sub = AppState.addEventListener("change", handleAppStateChange)
    return () => {
      sub.remove()
    }
  }, [syncWithSession])

  // Periodic elapsed timer calculation using precise timestamps
  useEffect(() => {
    if (status === "recording" || status === "paused") {
      timerRef.current = setInterval(() => {
        if (activeSessionRef.current) {
          setElapsedSeconds(computeElapsedSeconds(activeSessionRef.current))
        } else {
          getActiveSession().then((session) => {
            if (session) {
              activeSessionRef.current = session
              setElapsedSeconds(computeElapsedSeconds(session))
            }
          })
        }
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  // Handler for live updates received by UI listeners
  const handleLivePoint = useCallback((point: ActivityPoint) => {
    if (!isValidLocationPoint(point)) return
    setPoints((prev) => [...prev, point])
    if (point.speed !== null && point.speed >= 0) {
      setCurrentSpeedMps(point.speed)
      setMaxSpeedMps((prevMax) => Math.max(prevMax, point.speed || 0))
    }

    // Refresh metrics periodically from storage for accuracy
    getActiveSession().then((session) => {
      if (session) {
        activeSessionRef.current = session
        setDistanceMeters(session.distanceMeters)
        setMaxSpeedMps(session.maxSpeedMps)
        setElapsedSeconds(computeElapsedSeconds(session))
      }
    })
  }, [])

  // Priority 1 vs Priority 2 Subscription Handling
  useEffect(() => {
    if (status !== "recording") {
      // Clean up watchers if recording stops or pauses
      if (fgSubRef.current) {
        fgSubRef.current.remove()
        fgSubRef.current = null
      }
      if (webWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(webWatchIdRef.current)
        webWatchIdRef.current = null
      }
      return
    }

    // Always subscribe to background task events for live UI updates
    const unsubscribeBg = subscribeToLocationUpdates(handleLivePoint)

    // Priority 1: If Background tracking is active, DO NOT start foreground watcher
    if (isBackgroundActive) {
      console.log("[useActivityRecorder] Background location tracking active (Priority 1). Foreground watcher disabled.")
      return () => {
        unsubscribeBg()
      }
    }

    // Priority 2 Fallback: Background tracking inactive, start Foreground Watcher
    console.warn("[useActivityRecorder] Operating in Foreground Fallback mode (Priority 2).")

    if (Location && typeof Location.watchPositionAsync === "function") {
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (loc) => {
          if (loc?.coords) {
            const point: ActivityPoint = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              altitude: loc.coords.altitude ?? null,
              speed: loc.coords.speed ?? null,
              accuracy: loc.coords.accuracy ?? null,
              timestamp: loc.timestamp,
            }
            handleLivePoint(point)
            await appendPointsToActiveSession([point])
          }
        }
      )
        .then((sub) => {
          fgSubRef.current = sub
        })
        .catch((err) => {
          console.warn("[useActivityRecorder] Foreground position watch notice:", err)
        })
    } else if (typeof navigator !== "undefined" && navigator.geolocation) {
      webWatchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const point: ActivityPoint = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          }
          handleLivePoint(point)
          await appendPointsToActiveSession([point])
        },
        (err) => console.warn("[useActivityRecorder] Web watchPosition notice:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      )
    }

    return () => {
      unsubscribeBg()
      if (fgSubRef.current) {
        fgSubRef.current.remove()
        fgSubRef.current = null
      }
      if (webWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(webWatchIdRef.current)
        webWatchIdRef.current = null
      }
    }
  }, [status, isBackgroundActive, handleLivePoint])

  // Start Recording Action
  const startRecording = async () => {
    try {
      setErrorMsg(null)

      // Step 1: Request Foreground Location Permission
      if (Location && typeof Location.requestForegroundPermissionsAsync === "function") {
        const fgPerm = await Location.requestForegroundPermissionsAsync()
        if (fgPerm.status !== "granted") {
          setErrorMsg("Foreground location permission is required.")
          return
        }
      } else if (typeof navigator === "undefined" || !navigator.geolocation) {
        setErrorMsg("Location services are not available on this device.")
        return
      }

      // Step 2: Priority 1 - Attempt Background Location Task
      let bgSuccess = false
      try {
        bgSuccess = await startBackgroundLocationTask()
      } catch (bgErr: any) {
        console.warn("[useActivityRecorder] Background location start notice:", bgErr?.message || bgErr)
      }

      const activeBg = bgSuccess
      setIsBackgroundActive(activeBg)

      // Create persistent active session in AsyncStorage
      const session = await createActiveSession(activityType, activeBg)
      activeSessionRef.current = session
      setStatus("recording")

      // Get initial position fix to populate starting point immediately
      if (Location && typeof Location.getCurrentPositionAsync === "function") {
        try {
          const currentLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          })
          if (currentLoc?.coords) {
            const initialPoint: ActivityPoint = {
              latitude: currentLoc.coords.latitude,
              longitude: currentLoc.coords.longitude,
              altitude: currentLoc.coords.altitude ?? null,
              speed: currentLoc.coords.speed ?? null,
              accuracy: currentLoc.coords.accuracy ?? null,
              timestamp: currentLoc.timestamp,
            }
            handleLivePoint(initialPoint)
            await appendPointsToActiveSession([initialPoint])
          }
        } catch (posErr: any) {
          console.warn("[useActivityRecorder] Initial location fix notice:", posErr?.message || posErr)
        }
      } else if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const initialPoint: ActivityPoint = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude,
              speed: pos.coords.speed,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            }
            handleLivePoint(initialPoint)
            await appendPointsToActiveSession([initialPoint])
          },
          (err) => console.warn("[useActivityRecorder] Web initial position error:", err),
          { enableHighAccuracy: true }
        )
      }
    } catch (err: any) {
      console.error("Start activity error:", err)
      setErrorMsg(err.message || "Failed to start recording.")
    }
  }

  // Pause Recording Action
  const pauseRecording = async () => {
    const updated = await pauseActiveSession()
    if (updated) {
      syncWithSession(updated)
    } else {
      setStatus("paused")
    }
  }

  // Resume Recording Action
  const resumeRecording = async () => {
    const updated = await resumeActiveSession()
    if (updated) {
      syncWithSession(updated)
    } else {
      setStatus("recording")
    }
  }

  // Stop & Save Activity Action
  const stopAndSaveRecording = async (): Promise<ActivitySummary | null> => {
    try {
      setStatus("finished")

      // Stop background task if active
      await stopBackgroundLocationTask()

      // Fetch final active session state from disk
      const session = (await getActiveSession()) || activeSessionRef.current
      const finalPoints = session?.points || points
      const finalDistance = session?.distanceMeters || distanceMeters
      const finalDuration = session ? computeElapsedSeconds(session) : elapsedSeconds
      const finalMaxSpeed = session?.maxSpeedMps || maxSpeedMps

      const avgSpeedMps = finalDuration > 0 ? finalDistance / finalDuration : 0
      const summary: ActivitySummary = {
        id: session?.id || `act_${Date.now()}`,
        type: activityType,
        title: `${activityType === "run" ? "Morning Run" : "Ride"}`,
        startedAt: session?.startedAt || Date.now(),
        endedAt: Date.now(),
        distanceMeters: finalDistance,
        durationSeconds: finalDuration,
        movingTimeSeconds: finalDuration,
        avgSpeedMps,
        maxSpeedMps: finalMaxSpeed,
        points: finalPoints,
      }

      await saveActivityLocally(summary)
      await clearActiveSession()

      activeSessionRef.current = null
      setPoints([])
      setDistanceMeters(0)
      setElapsedSeconds(0)
      setCurrentSpeedMps(0)
      setMaxSpeedMps(0)
      setIsBackgroundActive(false)

      return summary
    } catch (err: any) {
      console.error("Stop activity error:", err)
      setErrorMsg("Error stopping activity recording.")
      return null
    }
  }

  return {
    status,
    points,
    distanceMeters,
    elapsedSeconds,
    currentSpeedMps,
    maxSpeedMps,
    isBackgroundActive,
    errorMsg,
    isNativeSupported,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopAndSaveRecording,
  }
}
