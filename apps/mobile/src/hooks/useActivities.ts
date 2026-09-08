import { useState, useEffect, useCallback } from "react"
import type { ActivityCardType } from "@repo/types"
import { authClient } from "@/lib/auth-client"

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.31.240:3000"

export function useActivities(userId: string) {
  const [activities, setActivities] = useState<ActivityCardType[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async (isPullToRefresh = false) => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    if (isPullToRefresh) {
      setRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const res = await authClient.$fetch<ActivityCardType[]>(
        `${API_URL}/api/activities?userId=${userId}`
      )
      if (res.error) {
        throw new Error(
          res.error.message || `Failed to fetch activities (${res.error.status ?? "error"})`
        )
      }
      if (res.data) {
        setActivities(res.data)
      }
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching activities")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [userId])

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
