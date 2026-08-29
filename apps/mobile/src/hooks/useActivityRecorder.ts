import { useState, useEffect, useRef, useCallback } from "react"
import { Platform } from "react-native"
import { haversineDistance } from "@repo/gpx"
import {
  LOCATION_TASK_NAME,
  ActivityPoint,
  isValidLocationPoint,
  subscribeToLocationUpdates,
} from "../lib/locationTask"
import { saveActivityLocally, ActivitySummary } from "../lib/activityStorage"

// Safely require expo-location inside try/catch so missing native module doesn't throw top-level uncaught exception
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastPointRef = useRef<ActivityPoint | null>(null)
  const statusRef = useRef<RecorderState>("idle")

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const isNativeSupported = Boolean(
    (Location && typeof Location.requestForegroundPermissionsAsync === "function") ||
      (typeof navigator !== "undefined" && navigator.geolocation)
  )

  useEffect(() => {
    if (!isNativeSupported) {
      setErrorMsg(
        "Location services are unavailable on this device or build."
      )
    }
  }, [isNativeSupported])

  // Handle incoming GPS points using @repo/gpx haversineDistance
  const handleNewPoint = useCallback((point: ActivityPoint) => {
    if (!isValidLocationPoint(point)) return

    if (
      lastPointRef.current &&
      lastPointRef.current.latitude === point.latitude &&
      lastPointRef.current.longitude === point.longitude
    ) {
      return // Skip duplicate coordinates
    }

    setPoints((prev) => [...prev, point])

    if (point.speed !== null && point.speed >= 0) {
      setCurrentSpeedMps(point.speed)
      setMaxSpeedMps((prevMax) => Math.max(prevMax, point.speed || 0))
    }

    if (lastPointRef.current) {
      const dist = haversineDistance(
        lastPointRef.current.latitude,
        lastPointRef.current.longitude,
        point.latitude,
        point.longitude
      )
      if (dist > 0.5) {
        setDistanceMeters((prev) => prev + dist)
      }
    }
    lastPointRef.current = point
  }, [])

  // Subscribe to both background and foreground location events when recording
  useEffect(() => {
    if (status !== "recording") return

    // 1. Background task updates (if active)
    const unsubscribeBg = subscribeToLocationUpdates(handleNewPoint)

    // 2. Foreground watcher for real-time live GPS stream
    let fgSub: { remove: () => void } | null = null
    let webWatchId: number | null = null

    if (Location && typeof Location.watchPositionAsync === "function") {
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          if (loc?.coords) {
            handleNewPoint({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              altitude: loc.coords.altitude ?? null,
              speed: loc.coords.speed ?? null,
              accuracy: loc.coords.accuracy ?? null,
              timestamp: loc.timestamp,
            })
          }
        }
      ).then((sub) => {
        fgSub = sub
      }).catch((err) => {
        console.warn("[useActivityRecorder] Foreground location watch notice:", err)
      })
    } else if (typeof navigator !== "undefined" && navigator.geolocation) {
      webWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          handleNewPoint({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          })
        },
        (err) => console.warn("[useActivityRecorder] Web watchPosition notice:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      )
    }

    return () => {
      unsubscribeBg()
      if (fgSub) fgSub.remove()
      if (webWatchId !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(webWatchId)
      }
    }
  }, [status, handleNewPoint])

  // Safety unmount cleanup to stop background updates if active session is left
  useEffect(() => {
    return () => {
      if (
        Location &&
        typeof Location.hasStartedLocationUpdatesAsync === "function" &&
        typeof Location.stopLocationUpdatesAsync === "function"
      ) {
        Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then((isRunning) => {
          if (isRunning && statusRef.current !== "recording" && statusRef.current !== "paused") {
            Location?.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch((err) => {
              console.warn("[useActivityRecorder] Safety unmount cleanup notice:", err)
            })
          }
        }).catch(() => {})
      }
    }
  }, [])

  // Elapsed timer
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  // Request permissions & start recording
  const startRecording = async () => {
    try {
      setErrorMsg(null)
      let isPermitted = false

      if (Location && typeof Location.requestForegroundPermissionsAsync === "function") {
        const fgPerm = await Location.requestForegroundPermissionsAsync()
        if (fgPerm.status === "granted") {
          isPermitted = true
        } else {
          setErrorMsg("Foreground location permission is required.")
          return
        }

        let hasBgPermission = false
        try {
          const bgPerm = await Location.requestBackgroundPermissionsAsync()
          if (bgPerm.status === "granted") {
            hasBgPermission = true
          } else {
            console.warn("[Recorder] Background location permission not granted. Operating in foreground mode.")
          }
        } catch (bgErr: any) {
          console.warn("[Recorder] Background location permission notice:", bgErr?.message || bgErr)
        }

        if (hasBgPermission) {
          try {
            const isTaskAvailable = typeof (Location as any)?.isTaskManagerAvailableAsync === "function"
              ? await (Location as any).isTaskManagerAvailableAsync()
              : true

            if (
              isTaskAvailable &&
              typeof Location.hasStartedLocationUpdatesAsync === "function" &&
              typeof Location.startLocationUpdatesAsync === "function"
            ) {
              const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
              if (!isRunning) {
                const taskOptions: any = {
                  accuracy: Location.Accuracy.High,
                  timeInterval: 3000,
                  distanceInterval: 3,
                }
                if (Platform.OS === "ios") {
                  taskOptions.showsBackgroundLocationIndicator = true
                }
                if (Platform.OS === "android") {
                  taskOptions.foregroundService = {
                    notificationTitle: "Recording Activity",
                    notificationBody: "Strava Clone is tracking your route.",
                    notificationColor: "#FC5200",
                  }
                }
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, taskOptions)
              }
            }
          } catch (taskErr: any) {
            console.warn("[Recorder] Background location task registration notice:", taskErr?.message || taskErr)
          }
        }

        // Get immediate location fix
        try {
          if (typeof Location.getCurrentPositionAsync === "function") {
            const currentLoc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            })
            if (currentLoc?.coords) {
              handleNewPoint({
                latitude: currentLoc.coords.latitude,
                longitude: currentLoc.coords.longitude,
                altitude: currentLoc.coords.altitude ?? null,
                speed: currentLoc.coords.speed ?? null,
                accuracy: currentLoc.coords.accuracy ?? null,
                timestamp: currentLoc.timestamp,
              })
            }
          }
        } catch (posErr: any) {
          console.warn("[Recorder] Immediate location fix notice:", posErr?.message || posErr)
        }
      } else if (typeof navigator !== "undefined" && navigator.geolocation) {
        isPermitted = true
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            handleNewPoint({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude,
              speed: pos.coords.speed,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            })
          },
          (err) => console.warn("[Recorder] Web initial position error:", err),
          { enableHighAccuracy: true }
        )
      } else {
        setErrorMsg("Location services are not available on this device.")
        return
      }

      if (!isPermitted) return

      startTimeRef.current = Date.now()
      setStatus("recording")
    } catch (err: any) {
      console.error("Start activity error:", err)
      setErrorMsg(err.message || "Failed to start recording.")
    }
  }

  // Pause recording
  const pauseRecording = () => {
    setStatus("paused")
  }

  // Resume recording
  const resumeRecording = () => {
    setStatus("recording")
  }

  // Stop & Save Activity
  const stopAndSaveRecording = async (): Promise<ActivitySummary | null> => {
    try {
      setStatus("finished")
      if (
        Location &&
        typeof Location.hasStartedLocationUpdatesAsync === "function" &&
        typeof Location.stopLocationUpdatesAsync === "function"
      ) {
        try {
          const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
          if (isRunning) {
            console.log(points, distanceMeters, elapsedSeconds, maxSpeedMps, currentSpeedMps)
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
          }
        } catch (e) {
          console.warn("[Recorder] Error stopping background location updates:", e)
        }
      }

      const avgSpeedMps = elapsedSeconds > 0 ? distanceMeters / elapsedSeconds : 0
      const summary: ActivitySummary = {
        id: `act_${Date.now()}`,
        type: activityType,
        title: `${activityType === "run" ? "Morning Run" : "Ride"}`,
        startedAt: startTimeRef.current || Date.now(),
        endedAt: Date.now(),
        distanceMeters,
        durationSeconds: elapsedSeconds,
        movingTimeSeconds: elapsedSeconds,
        avgSpeedMps,
        maxSpeedMps,
        points,
      }

      await saveActivityLocally(summary)
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
    errorMsg,
    isNativeSupported,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopAndSaveRecording,
  }
}

