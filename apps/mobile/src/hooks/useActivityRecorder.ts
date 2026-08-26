import { useState, useEffect, useRef, useCallback } from "react";
import { haversineDistance } from "@repo/gpx";
import {
  LOCATION_TASK_NAME,
  ActivityPoint,
  subscribeToLocationUpdates,
} from "../lib/locationTask";
import { saveActivityLocally, ActivitySummary } from "../lib/activityStorage";

// Safely require expo-location inside try/catch so missing native module doesn't throw top-level uncaught exception
let Location: typeof import("expo-location") | null = null;
try {
  Location = require("expo-location");
} catch (e) {
  console.warn("[useActivityRecorder] expo-location native module unavailable:", e);
}

export type RecorderState = "idle" | "recording" | "paused" | "finished";

export function useActivityRecorder(activityType: "run" | "ride" = "run") {
  const [status, setStatus] = useState<RecorderState>("idle");
  const [points, setPoints] = useState<ActivityPoint[]>([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSpeedMps, setCurrentSpeedMps] = useState(0);
  const [maxSpeedMps, setMaxSpeedMps] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPointRef = useRef<ActivityPoint | null>(null);

  const isNativeSupported = Boolean(
    Location &&
      typeof Location.requestForegroundPermissionsAsync === "function" &&
      typeof Location.startLocationUpdatesAsync === "function"
  );

  useEffect(() => {
    if (!isNativeSupported) {
      setErrorMsg(
        "Native Location module not linked in this app build. Run 'npx expo run:android' or 'npx expo run:ios' to rebuild your dev client binary."
      );
    }
  }, [isNativeSupported]);

  // Handle incoming GPS points using @repo/gpx haversineDistance
  const handleNewPoint = useCallback((point: ActivityPoint) => {
    setPoints((prev) => [...prev, point]);

    if (point.speed !== null && point.speed >= 0) {
      setCurrentSpeedMps(point.speed);
      setMaxSpeedMps((prevMax) => Math.max(prevMax, point.speed || 0));
    }

    if (lastPointRef.current) {
      const dist = haversineDistance(
        lastPointRef.current.latitude,
        lastPointRef.current.longitude,
        point.latitude,
        point.longitude
      );
      setDistanceMeters((prev) => prev + dist);
    }
    lastPointRef.current = point;
  }, []);

  // Subscribe to background location events
  useEffect(() => {
    if (status === "recording") {
      const unsubscribe = subscribeToLocationUpdates(handleNewPoint);
      return () => unsubscribe();
    }
  }, [status, handleNewPoint]);

  // Elapsed timer
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Request permissions & start recording
  const startRecording = async () => {
    try {
      setErrorMsg(null);
      if (!isNativeSupported || !Location) {
        setErrorMsg(
          "Native Location module not linked in this app build. Run 'npx expo run:android' or 'npx expo run:ios' to rebuild your dev client binary."
        );
        return;
      }

      const fgPerm = await Location.requestForegroundPermissionsAsync();
      if (fgPerm.status !== "granted") {
        setErrorMsg("Foreground location permission is required.");
        return;
      }

      const bgPerm = await Location.requestBackgroundPermissionsAsync();
      if (bgPerm.status !== "granted") {
        setErrorMsg("Background location permission is required for activity recording.");
        return;
      }

      const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (!isRunning) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 5,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Recording Activity",
            notificationBody: "Strava Clone is tracking your route in the background.",
            notificationColor: "#FC5200",
          },
        });
      }

      startTimeRef.current = Date.now();
      setStatus("recording");
    } catch (err: any) {
      console.error("Start activity error:", err);
      setErrorMsg(err.message || "Failed to start recording.");
    }
  };

  // Pause recording
  const pauseRecording = () => {
    setStatus("paused");
  };

  // Resume recording
  const resumeRecording = () => {
    setStatus("recording");
  };

  // Stop & Save Activity
  const stopAndSaveRecording = async (): Promise<ActivitySummary | null> => {
    try {
      setStatus("finished");
      if (Location) {
        const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (isRunning) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
      }

      const avgSpeedMps = elapsedSeconds > 0 ? distanceMeters / elapsedSeconds : 0;
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
      };

      await saveActivityLocally(summary);
      return summary;
    } catch (err: any) {
      console.error("Stop activity error:", err);
      setErrorMsg("Error stopping activity recording.");
      return null;
    }
  };

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
  };
}
