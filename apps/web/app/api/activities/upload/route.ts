import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import {
  parserGPX,
  computeStats,
  douglasPeucker,
  encodePolyline,
  buildStreams
} from "@repo/gpx"
import { CreateActivityFromGpx, CreateActivityStreams } from "@repo/db"
import { UploadFileSchema } from "@repo/validation"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()

    const safeData = UploadFileSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      file: formData.get("file"),
    })
    if(!safeData.success) {
      return NextResponse.json({ error: "Data is corrupted" }, { status: 400 })
    }

    const { title, description, file } = safeData.data
    if (!file || !file.name.endsWith(".gpx")) {
      return NextResponse.json({ error: "A valild .gpx file is requried" }, { status: 400 })
    }

    const xmlString = await file.text()

    const rawPoints = parserGPX(xmlString)
    if (rawPoints.length === 0) {
      return NextResponse.json({ error: "No track points from the file" }, { status: 422 })
    }

    const stats = computeStats(rawPoints)
    const simplified = douglasPeucker(rawPoints, 0.0001)
    const encodedPolyline = encodePolyline(simplified)
    const streams = buildStreams(rawPoints)

    const activity = await CreateActivityFromGpx({
      userId: session.user.id,
      type: "Run", // or detect from GPX <type> tag
      title: title,
      description: description,
      distance: stats.totalDistanceMeters,
      duration: stats.totalDurationSeconds,
      elevationGain: stats.elevationGainMeters,
      elevationLoss: stats.elevationLossMeters,
      maxSpeedMps: stats.maxSpeedMps,
      encodedPolyline,
      startTime: (stats.startTime ?? new Date()),
      endTime: (stats.endTime ?? new Date()),
    })

    await CreateActivityStreams({
      activityId: activity.activityId,
      streams,
    })


    return Response.json({ activityId: activity.activityId }, { status: 201 })
  }
  catch (err) {
    return Response.json({ error: "Internal server error", detailedError: err }, { status: 500 })
  }
}