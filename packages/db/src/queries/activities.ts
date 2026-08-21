import { desc, eq } from "drizzle-orm"
import { db } from "../db"
import { activities, user } from "../schema"

type CreateActivityInput = {
  userId: string,
  type: string,
  title: string,
  description: string,
  distance: number,
  duration: number,
  elevationGain: number,
  elevationLoss: number,
  startTime?: Date,
  endTime?: Date,
}

export async function getActivitiesByUser(userId: any, limit = 5, offset = 0) {
  const UserActivities = await db
    .select({
      userName: user.name,
      activityId: activities.activityId,
      userId: activities.userId,
      type: activities.type,
      title: activities.title,
      description: activities.description,
      distance: activities.distance,
      duration: activities.duration,
      encodedPolyline: activities.encodedPolyline,
      elevationGain: activities.elevationGain,
      elevationLoss: activities.elevationLoss,
      // startTime: activities.startTime,
      // endTime: activities.endTime,
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

export async function CreateActivity(data: CreateActivityInput) {
  const res = await db
    .insert(activities)
    .values(data)
    .returning()

  return res
}