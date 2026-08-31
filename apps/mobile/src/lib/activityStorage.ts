import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ActivitySummary } from "@repo/types"


const ACTIVITIES_KEY = "@strava_clone_activities_v1"

export async function saveActivityLocally(activity: ActivitySummary): Promise<void> {
  try {
    const existing = await getSavedActivitiesLocally()
    const updated = [activity, ...existing]
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error("Failed to save activity locally:", err)
  }
}

export async function getSavedActivitiesLocally(): Promise<ActivitySummary[]> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITIES_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (err) {
    console.error("Failed to load local activities:", err)
    return []
  }
}
