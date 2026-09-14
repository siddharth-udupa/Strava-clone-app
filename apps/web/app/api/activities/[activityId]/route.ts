import { auth } from "@/lib/auth"
import { DeleteActivity, getActivityDetails } from "@repo/db"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { activityId } = await params

    const activity = await getActivityDetails(activityId)
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }

    return NextResponse.json({ data: activity }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { activityId } = await params

    const deleted = await DeleteActivity(activityId, session.user.id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Activity not found or already deleted" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Activity deleted successfully", data: deleted },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    )
  }
}