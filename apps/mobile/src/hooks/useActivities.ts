import { useState, useEffect, useCallback } from "react"
import type { ActivityCardType } from "@repo/types"

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.31.240:3000"

export function useActivities(userId: string) {
  const [activities, setActivities] = useState<ActivityCardType[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/activities?userId=${userId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch activities (${response.status})`)
      }
      const data: ActivityCardType[] = await response.json()
      setActivities(data)
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching activities")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const refetch = useCallback(() => {
    return fetchActivities(true)
  }, [fetchActivities])

  return {
    activities,
    isLoading,
    refreshing,
    error,
    refetch,
  }
}
