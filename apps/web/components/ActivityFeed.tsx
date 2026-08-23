"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ActivityCardType, PreferencesType } from "@repo/types"
import ActivityCard from "./ActivityCard"

export default function ActivityFeed({ initialActivities, userPreferences, userId, userName }: {
  initialActivities: ActivityCardType[],
  userPreferences: PreferencesType,
  userId: string,
  userName: string
}) {

  const [activities, setActivities] = useState(initialActivities)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)


  const fetchMore = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/activities?userId=${userId}&page=${page}&limit=5`)
    const data: ActivityCardType[] = await res.json()

    if (data.length === 0) {
      setHasMore(false)
    }
    else {
      setActivities((prev) => [...prev, ...data])
      setPage((prev) => prev + 1)
    }
    setLoading(false)
  }, [userId, page])


  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchMore()
      }
    },
      { threshold: 0.1 }  // trigger when div is 10% visible
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [fetchMore, hasMore, loading])


  return (
    <div>
      {activities.map((a) => (
        <ActivityCard key={a.activityId} activities={a} userPreferences={userPreferences} userName={userName} />
      ))}

      {/* The invisible div observer */}
      <div ref={sentinelRef} className="h-1" />

      {loading && <p>Loading more activities</p>}
      {!hasMore && <p>You&apos;ve seen all activities</p>}
    </div>
  )
}