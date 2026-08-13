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

export type CreateActivityCardType = z.infer<typeof CreateActivitySchema>
export type MetaDataType = z.infer<typeof MetaDataSchema>