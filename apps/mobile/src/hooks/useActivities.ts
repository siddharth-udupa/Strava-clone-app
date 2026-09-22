import { useState, useEffect, useCallback } from "react"
import type { ActivityCardType } from "@repo/types"
import { authClient } from "@/lib/auth-client"

const API_URL = process.env.EXPO_PUBLIC_API_URL!

// Global listener registry so all active useActivities hooks update instantly when an activity is deleted anywhere
const deleteListeners = new Set<(activityId: string) => void>()

// Module-level cache so fetched activities persist across component unmounts and tab navigation
let cachedUserId: string | null = null
let cachedActivities: ActivityCardType[] | null = null

/**
 * Remove an activity by ID from all active `useActivities` caches/states across the app.
 */
export function removeActivityFromCache(activityId: string) {
  if (cachedActivities) {
    cachedActivities = cachedActivities.filter(
      (a) => a.activityId !== activityId && (a as any).id !== activityId
    )
  }
  deleteListeners.forEach((listener) => listener(activityId))
}

/**
 * Invalidate the in-memory activities cache so next fetch gets fresh data from server.
 */
export function invalidateActivitiesCache() {
  cachedUserId = null
  cachedActivities = null
}

export function useActivities(userId: string) {
  const isCacheValid = cachedUserId === userId && cachedActivities !== null
  const [activities, setActivities] = useState<ActivityCardType[]>(
    isCacheValid ? (cachedActivities as ActivityCardType[]) : []
  )
  const [isLoading, setIsLoading] = useState<boolean>(!isCacheValid)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(
    async (isPullToRefresh = false) => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      if (isPullToRefresh) {
        setRefreshing(true)
      } else {
        if (cachedUserId !== userId || cachedActivities === null) {
          setIsLoading(true)
        }
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
          cachedUserId = userId
          cachedActivities = res.data
          setActivities(res.data)
        }
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError(err instanceof Error ? err.message : "An error occurred while fetching activities")
      } finally {
        setIsLoading(false)
        setRefreshing(false)
      }
    },
    [userId]
  )

  useEffect(() => {
    if (cachedUserId !== userId || cachedActivities === null) {
      fetchActivities(false)
    }
  }, [userId, fetchActivities])

  // Subscribe to deletion events so deleted activities get filtered out of state immediately
  useEffect(() => {
    const handleActivityDeleted = (deletedId: string) => {
      setActivities((prev) =>
        prev.filter((a) => a.activityId !== deletedId && (a as any).id !== deletedId)
      )
    }

    deleteListeners.add(handleActivityDeleted)
    return () => {
      deleteListeners.delete(handleActivityDeleted)
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchActivities(true)
  }, [fetchActivities])

  const deleteActivity = useCallback((activityId: string) => {
    removeActivityFromCache(activityId)
  }, [])

  return {
    activities,
    setActivities,
    deleteActivity,
    isLoading,
    refreshing,
    error,
    refetch,
  }
}


