import { useState } from "react"
import { View, Text, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { metersToDistance, formatDurationShort, formatPace, mpsToSpeed } from "@repo/units"
import { useActivityRecorder } from "@/hooks/useActivityRecorder"

export default function RecorderScreen() {
  const router = useRouter()
  const [activityType, setActivityType] = useState<"run" | "ride">("run")
  const {
    status,
    points,
    distanceMeters,
    elapsedSeconds,
    currentSpeedMps,
    errorMsg,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopAndSaveRecording,
  } = useActivityRecorder(activityType)

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(app)/dashboard" as any)
    }
  }

  const handleFinish = async () => {
    const saved = await stopAndSaveRecording()
    if (saved) {
      const distKm = metersToDistance(saved.distanceMeters, "metric")
      Alert.alert("Activity Saved!", `Total distance: ${distKm} km`)
      handleGoBack()
    }
  }

  const formattedDistance = metersToDistance(distanceMeters, "metric").toFixed(2)
  const formattedTime = formatDurationShort(elapsedSeconds)
  const formattedPace = formatPace(elapsedSeconds, distanceMeters, "min/km")
  const formattedSpeed = mpsToSpeed(currentSpeedMps, "km/h")

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ flex: 1, padding: 16, justifyContent: "space-between" }}>
        
        {/* Top Header & Type Switcher */}
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#1C1C1E",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={{ color: "#8E8E93", fontSize: 14, fontWeight: "600", textTransform: "uppercase" }}>
              GPS Activity Recorder
            </Text>

            <View style={{ width: 40 }} />
          </View>
          
          {status === "idle" && (
            <View style={{ flexDirection: "row", marginTop: 16, backgroundColor: "#1C1C1E", borderRadius: 8, padding: 4, alignSelf: "center" }}>
              <TouchableOpacity
                onPress={() => setActivityType("run")}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                  backgroundColor: activityType === "run" ? "#FC5200" : "transparent",
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700" }}>Run</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivityType("ride")}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                  backgroundColor: activityType === "ride" ? "#FC5200" : "transparent",
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700" }}>Ride</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Error Notification */}
        {errorMsg && (
          <View style={{ backgroundColor: "#3A0D0D", padding: 12, borderRadius: 8, marginVertical: 8 }}>
            <Text style={{ color: "#FF453A", textAlign: "center", fontWeight: "600" }}>{errorMsg}</Text>
          </View>
        )}

        {/* Live Metrics Grid */}
        <View style={{ backgroundColor: "#1C1C1E", borderRadius: 16, padding: 24 }}>
          {/* Main Distance Metric */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={{ color: "#8E8E93", fontSize: 14, fontWeight: "600", letterSpacing: 1 }}>
              DISTANCE (KM)
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 64, fontWeight: "800", marginTop: 4 }}>
              {formattedDistance}
            </Text>
          </View>

          {/* Secondary Stats Grid */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderColor: "#2C2C2E", paddingTop: 16 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#8E8E93", fontSize: 12, fontWeight: "600" }}>TIME</Text>
              <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "700", marginTop: 4 }}>
                {formattedTime}
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#8E8E93", fontSize: 12, fontWeight: "600" }}>
                {activityType === "run" ? "PACE" : "SPEED (KM/H)"}
              </Text>
              <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "700", marginTop: 4 }}>
                {activityType === "run" ? formattedPace : `${formattedSpeed}`}
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#8E8E93", fontSize: 12, fontWeight: "600" }}>GPS PTS</Text>
              <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "700", marginTop: 4 }}>
                {points.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={{ marginBottom: 20 }}>
          {status === "idle" && (
            <TouchableOpacity
              onPress={startRecording}
              style={{
                backgroundColor: "#FC5200",
                height: 64,
                borderRadius: 32,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#FC5200",
                shadowOpacity: 0.4,
                shadowRadius: 10,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "800", letterSpacing: 1 }}>
                START
              </Text>
            </TouchableOpacity>
          )}

          {status === "recording" && (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={pauseRecording}
                style={{
                  flex: 1,
                  backgroundColor: "#FF9500",
                  height: 60,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700" }}>PAUSE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinish}
                style={{
                  flex: 1,
                  backgroundColor: "#FF3B30",
                  height: 60,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700" }}>FINISH</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === "paused" && (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={resumeRecording}
                style={{
                  flex: 1,
                  backgroundColor: "#30D158",
                  height: 60,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700" }}>RESUME</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinish}
                style={{
                  flex: 1,
                  backgroundColor: "#FF3B30",
                  height: 60,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700" }}>FINISH</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  )
}
