import { CreateActivity, CreateActivityStreams, getActivitiesByUser } from "@repo/db"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
  normalizeMobileActivity,
  normalizeGpxActivity,
  normalizeManualActivity,
  type NormalizedActivityData,
} from "@/lib/normalization"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = req.nextUrl
    const userId: string | null = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const page = Number(searchParams.get("page") ?? 0)
    const limit = Number(searchParams.get("limit") ?? 5)
    const offset = page * limit
    const data = await getActivitiesByUser(userId, limit, offset)
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { source, data } = body ?? {}

    if (!source || !data) {
      return NextResponse.json(
        { error: "Missing required fields: 'source' and 'data'" },
        { status: 400 }
      )
    }

    let normalized: NormalizedActivityData

    try {
      switch (source) {
        case "mobile":
          normalized = normalizeMobileActivity(data)
          break
        case "gpx":
          normalized = normalizeGpxActivity(data)
          break
        case "manual":
          normalized = normalizeManualActivity(data)
          break
        default:
          return NextResponse.json(
            { error: `Unsupported activity source: '${source}'` },
            { status: 400 }
          )
      }
    } catch (err: any) {
      return NextResponse.json(
        {
          error: "Invalid input or normalization failed",
          detailedError: err?.errors ?? err?.message ?? err,
        },
        { status: 400 }
      )
    }

    const dbPayload = {
      userId,
      type: normalized.type,
      title: normalized.title,
      description: normalized.description ?? undefined,
      location: normalized.location ?? undefined,
      distance: normalized.distance,
      duration: normalized.duration,
      elevationGain: normalized.elevationGain,
      elevationLoss: normalized.elevationLoss,
      encodedPolyline: normalized.encodedPolyline ?? undefined,
      maxSpeedMps: normalized.maxSpeedMps ?? undefined,
      startTime: normalized.startTime ?? undefined,
      endTime: normalized.endTime ?? undefined,
    }

    const res = await CreateActivity(dbPayload)
    const createdActivity = Array.isArray(res) ? res[0] : res

    if (normalized.streams && createdActivity?.activityId) {
      await CreateActivityStreams({
        activityId: createdActivity.activityId,
        streams: normalized.streams,
      })
    }

    return NextResponse.json({ success: true, data: res }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}