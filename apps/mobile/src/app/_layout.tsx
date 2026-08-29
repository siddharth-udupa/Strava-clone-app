import "../../global.css"
import { useEffect } from "react"
import { cleanupStaleLocationTasks } from "../lib/locationTask"
import { Slot } from "expo-router"

export default function RootLayout() {
  useEffect(() => {
    cleanupStaleLocationTasks().catch((err) => {
      console.warn("[RootLayout] Stale task cleanup warning:", err)
    })
  }, [])

  return <Slot />
}