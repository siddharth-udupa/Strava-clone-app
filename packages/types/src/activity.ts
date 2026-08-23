import type { activitiesType, activityStreamsInsertType, getActivityDetails } from "@repo/db"

export type ActivityCardType = activitiesType

export type ActivityStreams = Omit<activityStreamsInsertType, "id" | "activityId" | "createdAt">

export type ActivityDetailsType = NonNullable<Awaited<ReturnType<typeof getActivityDetails>>>

