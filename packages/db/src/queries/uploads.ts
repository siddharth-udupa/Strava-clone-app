import { db } from "../db"
import { activities, activitiesInsertType, activityStreams, activityStreamsInsertType, activityStreamsType } from "../schema"


type CreateActivityStreamsInput = {
  activityId: string,
  streams: Omit<activityStreamsInsertType, "id" | "activityId" | "createdAt">,
}

export async function CreateActivityFromGpx(data: activitiesInsertType) {
  const [inserted] = await db
    .insert(activities)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      distance: data.distance,
      duration: data.duration,
      elevationGain: data.elevationGain,
      elevationLoss: data.elevationLoss,
      encodedPolyline: data.encodedPolyline,
      maxSpeedMps: data.maxSpeedMps,
      startTime: data.startTime,
      endTime: data.endTime,
    })
    .returning({ activityId: activities.activityId })

  return inserted
}

export async function CreateActivityStreams(data: CreateActivityStreamsInput) {
  await db
    .insert(activityStreams)
    .values({
      activityId: data.activityId,
      timeData: data.streams.timeData,
      distanceData: data.streams.distanceData,
      altitudeData: data.streams.altitudeData,
      speedData: data.streams.speedData,
    })
}