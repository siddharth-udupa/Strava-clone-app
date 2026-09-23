"use client"

import { lazy, Suspense, useEffect, useRef, useState } from "react"
import type { ActivityCardType, PreferencesType } from "@repo/types"
import Image from "next/image"
import {
  metersToDistance,
  metersToElevation,
  formatDateAndTime,
  formatDurationShort,
  formatPace,
  mpsToSpeed,
} from "@repo/units"
import { useRouter } from "next/navigation"
import { Footprints, Bike, Mountain, Activity, ThumbsUp, MessageSquare } from "lucide-react"

const Map = lazy(() => import("./map/Map"))

type ActivityProp = {
  activities: ActivityCardType
  userPreferences: PreferencesType
  userName: string
  isVisible?: boolean
}

const getSportIcon = (type: string) => {
  const normalizedType = type?.toLowerCase() || ""
  if (normalizedType.includes("run") || normalizedType.includes("walk")) {
    return <Footprints className="w-6 h-6 text-gray-800" />
  }
  if (normalizedType.includes("ride") || normalizedType.includes("cycle") || normalizedType.includes("bike")) {
    return <Bike className="w-6 h-6 text-gray-800" />
  }
  if (normalizedType.includes("hike")) {
    return <Mountain className="w-6 h-6 text-gray-800" />
  }
  return <Activity className="w-6 h-6 text-gray-800" />
}

export default function ActivityCard({
  activities,
  userPreferences,
  userName,
  isVisible: explicitIsVisible,
}: ActivityProp) {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [internalIsVisible, setInternalIsVisible] = useState(false)

  const isVisible = explicitIsVisible ?? internalIsVisible

  useEffect(() => {
    if (explicitIsVisible !== undefined) return

    const el = mapContainerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInternalIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [explicitIsVisible])

  const { date: formattedDate, time: formattedTime } = formatDateAndTime(
    activities.createdAt,
    userPreferences?.timeFormat
  )

  const isRunOrWalk = ["run", "walk", "hike"].some((t) =>
    activities.type?.toLowerCase().includes(t)
  )
  const isRide = ["ride", "cycle", "bike"].some((t) =>
    activities.type?.toLowerCase().includes(t)
  )

  const distanceVal = metersToDistance(activities.distance, userPreferences?.distanceUnit)
  const distanceUnitLabel = userPreferences?.distanceUnit === "imperial" ? "mi" : "km"

  const durationStr = formatDurationShort(activities.duration)

  let elev = { name: "Elev Gain", value: activities.elevationGain }
  if (activities.elevationLoss > activities.elevationGain) {
    elev = { name: "Elev Loss", value: activities.elevationLoss }
  }

  let middleStatLabel = elev.name
  let middleStatVal = `${metersToElevation(elev.value, userPreferences?.elevationUnit)} ${userPreferences?.elevationUnit === "feet" ? "ft" : "m"}`

  if (isRunOrWalk && activities.distance > 0) {
    middleStatLabel = "Pace"
    middleStatVal = formatPace(
      activities.duration,
      activities.distance,
      userPreferences?.paceUnit ?? "min/km"
    )
  } else if (isRide && activities.distance > 0 && activities.duration > 0) {
    middleStatLabel = "Speed"
    const avgMps = activities.distance / activities.duration
    const speedVal = mpsToSpeed(avgMps, userPreferences?.speedUnit ?? "km/h")
    const speedUnitLabel =
      userPreferences?.speedUnit === "mph"
        ? "mph"
        : userPreferences?.speedUnit === "m/s"
          ? "m/s"
          : "km/h"
    middleStatVal = `${speedVal} ${speedUnitLabel}`
  }

  const clickHandler = () => {
    router.push(`/activities/${activities.activityId}`)
  }

  return (
    <div className="my-6 p-4 md:p-5 mx-auto w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow-xs text-gray-900 font-sans">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-3">
        <Image
          width={44}
          height={44}
          src="/temphoto.png"
          alt={userName || "User Profile"}
          className="w-11 h-11 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={clickHandler}
        />
        <div className="flex flex-col justify-center">
          <h3
            className="text-base font-semibold text-gray-900 leading-snug cursor-pointer hover:underline"
            onClick={clickHandler}
          >
            {userName}
          </h3>
          <p className="text-xs text-gray-500 font-normal">
            {formattedDate} at {formattedTime}
            <span className="mx-1">•</span>
            Strava App
            {activities.location && (
              <>
                <span className="mx-1">•</span>
                {activities.location}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Activity Title & Sport Icon */}
      <div className="flex items-start gap-3 my-3">
        <div className="mt-0.5 shrink-0 text-gray-900">
          {getSportIcon(activities.type)}
        </div>
        <div>
          <h2
            className="text-xl md:text-2xl font-bold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors leading-tight"
            onClick={clickHandler}
          >
            {activities.title ?? "Untitled Activity"}
          </h2>
          {activities.description && (
            <p className="mt-1 text-sm text-gray-600 font-normal">{activities.description}</p>
          )}
        </div>
      </div>

      {/* Stats 3-Column Grid with Vertical Dividers */}
      <div className="my-4 flex items-center divide-x divide-gray-200">
        <div className="pr-4 md:pr-6">
          <span className="block text-xs font-normal text-gray-500 mb-0.5">Distance</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {distanceVal} <span className="text-base md:text-lg font-normal">{distanceUnitLabel}</span>
          </span>
        </div>
        <div className="px-4 md:px-6">
          <span className="block text-xs font-normal text-gray-500 mb-0.5">{middleStatLabel}</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {middleStatVal}
          </span>
        </div>
        <div className="pl-4 md:pl-6">
          <span className="block text-xs font-normal text-gray-500 mb-0.5">Time</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {durationStr}
          </span>
        </div>
      </div>

      {/* Map Section */}
      {activities.encodedPolyline ? (
        <div
          ref={mapContainerRef}
          className="relative my-4 w-full h-72 md:h-80 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
          onClick={clickHandler}
        >
          {isVisible ? (
            <Suspense
              fallback={<div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />}
            >
              <Map
                encodedPolyline={activities.encodedPolyline}
                isStatic={true}
                isChangeable={false}
              />
            </Suspense>
          ) : (
            <div className="h-full w-full bg-gray-100 rounded-lg" />
          )}
        </div>
      ) : null}

      {/* Footer Action Buttons */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
        <button
          type="button"
          className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Kudos"
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Comment"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}