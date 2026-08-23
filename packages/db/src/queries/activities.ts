import { desc, eq } from "drizzle-orm"
import { db } from "../db"
import { activities, activitiesInsertType, user } from "../schema"


export async function getActivitiesByUser(userId: string, limit = 5, offset = 0) {
  const UserActivities = await db
    .select({
      userName: user.name,
      activityId: activities.activityId,
      userId: activities.userId,
      type: activities.type,
      title: activities.title,
      description: activities.description,
      location: activities.location,
      distance: activities.distance,
      duration: activities.duration,
      encodedPolyline: activities.encodedPolyline,
      maxSpeedMps: activities.maxSpeedMps,
      elevationGain: activities.elevationGain,
      elevationLoss: activities.elevationLoss,
      startTime: activities.startTime,
      endTime: activities.endTime,
      createdAt: activities.createdAt,
    })
    .from(user)
    .innerJoin(activities, eq(activities.userId, user.id))
    .where(eq(activities.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(activities.createdAt))

  return UserActivities
}

export async function getActivityDetails(activityId: string) {
  const activity = await db.query.activities.findFirst({
    where: eq(activities.activityId, activityId),
    with: {
      streams: true,
      user: {
        with: {
          preferences: true,
        },
      },
    },
  })

  return activity
}

export type ActivityDetailsType = NonNullable<Awaited<ReturnType<typeof getActivityDetails>>>

export async function CreateActivity(data: activitiesInsertType) {
  const res = await db
    .insert(activities)
    .values(data)
    .returning()

  return res
}