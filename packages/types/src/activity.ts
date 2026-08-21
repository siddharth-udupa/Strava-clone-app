import type { getActivityDetails } from "@repo/db"

export type ActivityCardType = {
    userName: string,
    activityId: string,
    userId: string | null,
    type: string,
    title: string | null,
    description: string | null,
    distance: number,
    duration: number,
    encodedPolyline: string | null,
    elevationGain: number,
    elevationLoss: number,
    startTime?: Date | null,
    endTime?: Date | null,
    createdAt: Date,
}

export type ActivityStreams = {
    // All arrays are the same length. Index i corresponds to the same moment in time.
    time: number[],        // seconds since start (e.g. [0, 1, 2, 5, 6, ...])
    distance: number[],    // cumulative distance in metres at each point
    altitude: number[],    // elevation in metres at each point
    lat: number[],         // raw lat (for GPS trace — NOT for map display, use polyline)
    lng: number[],         // raw lng
    speed: number[],       // speed in m/s at each point (rolling window smoothed)
    heartrate?: number[],  // BPM if GPX has Garmin HR extension
}

export type ActivityDetailsType = NonNullable<Awaited<ReturnType<typeof getActivityDetails>>>;