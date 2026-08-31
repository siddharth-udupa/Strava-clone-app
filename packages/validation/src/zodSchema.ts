import { z } from "zod"

export const CreateActivitySchema = z.object({
  distance: z.number().nonnegative(),
  duration: z.object({
    hr: z.number().int().min(0),
    min: z.number().int().min(0).max(59),
    sec: z.number().int().min(0).max(59),
  }),
  elevationGain: z.number().nonnegative(),
  elevationLoss: z.number().nonnegative(),
  type: z.enum(["Run", "Ride", "Swim", "Walk", "Hike", "Other"]),
  startTime: z.iso.datetime({ local: true }),
  endTime: z.iso.datetime({ local: true }),
  title: z.string().min(1).max(100),
  description: z.string().max(1000),
})

export const MetaDataSchema = z.object({
  distanceUnit: z.enum(["metric", "imperial"]),
  elevUnitGain: z.enum(["meters", "feet"]),
  elevUnitLoss: z.enum(["meters", "feet"]),
})

export const UploadFileSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).nullable(),
  file: z.file(),
})

export const MobileActivityPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
  timestamp: z.number(),
})

export const MobileActivitySchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  distanceMeters: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  movingTimeSeconds: z.number().nonnegative().optional(),
  avgSpeedMps: z.number().nonnegative().optional(),
  maxSpeedMps: z.number().nonnegative().optional(),
  points: z.array(MobileActivityPointSchema).optional().default([]),
})

export const GpxActivitySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  xmlContent: z.string().min(1, "GPX content cannot be empty"),
  type: z.string().optional().default("Run"),
})

export const ManualActivitySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(["Run", "Ride", "Swim", "Walk", "Hike", "Other"]),
  distance: z.number().nonnegative(),
  duration: z.union([
    z.number().nonnegative(),
    z.object({
      hr: z.number().int().min(0),
      min: z.number().int().min(0).max(59),
      sec: z.number().int().min(0).max(59),
    }),
  ]),
  elevationGain: z.number().nonnegative().optional().default(0),
  elevationLoss: z.number().nonnegative().optional().default(0),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  metaData: z
    .object({
      distanceUnit: z.enum(["metric", "imperial"]).optional().default("metric"),
      elevUnitGain: z.enum(["meters", "feet"]).optional().default("meters"),
      elevUnitLoss: z.enum(["meters", "feet"]).optional().default("meters"),
    })
    .optional()
    .default({
      distanceUnit: "metric",
      elevUnitGain: "meters",
      elevUnitLoss: "meters",
    }),
})

export type CreateActivityCardType = z.infer<typeof CreateActivitySchema>
export type MetaDataType = z.infer<typeof MetaDataSchema>
export type MobileActivityPointInput = z.infer<typeof MobileActivityPointSchema>
export type MobileActivityInput = z.infer<typeof MobileActivitySchema>
export type GpxActivityInput = z.infer<typeof GpxActivitySchema>
export type ManualActivityInput = z.infer<typeof ManualActivitySchema>