import { RawTrackpoint } from "./parser"
import { haversineDistance } from "./haversine"
import { ActivityStreams } from "@repo/types"

/**
 * Builds time-series stream arrays from raw trackpoints.
 * These are stored in the activity_streams DB table and used to power:
 * - Elevation profile charts
 * - Pace-over-time graphs
 * - Split calculations
 */
export function buildStreams(points: RawTrackpoint[]): ActivityStreams {
  const time: number[] = []
  const distance: number[] = []
  const altitude: number[] = []
  const lat: number[] = []
  const lng: number[] = []
  const speed: number[] = []

  const startTime = points[0]?.time?.getTime() ?? 0
  let cumulativeDistance = 0

  for (let i = 0; i < points.length; i++) {
    const p = points[i]

    // Time
    const t = p.time ? (p.time.getTime() - startTime) / 1000 : i
    time.push(Math.round(t))

    // Distance
    if (i > 0) {
      const prev = points[i - 1]
      cumulativeDistance += haversineDistance(prev.lat, prev.lng, p.lat, p.lng)
    }
    distance.push(Math.round(cumulativeDistance))

    // Elevation
    altitude.push(p.ele ?? 0)

    // Coordinates
    lat.push(p.lat)
    lng.push(p.lng)

    // Speed: use 3-point rolling window to smooth GPS noise
    if (i === 0) {
      speed.push(0)
    } else {
      const prev = points[i - 1]
      const segDist = haversineDistance(prev.lat, prev.lng, p.lat, p.lng)
      const segTime =
        prev.time && p.time
          ? (p.time.getTime() - prev.time.getTime()) / 1000
          : 1
      speed.push(segTime > 0 ? parseFloat((segDist / segTime).toFixed(3)) : 0)
    }
  }

  return { timeData: time, distanceData: distance, altitudeData: altitude, speedData: speed }
}