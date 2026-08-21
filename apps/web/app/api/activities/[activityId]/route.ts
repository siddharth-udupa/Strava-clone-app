import { auth } from "@/lib/auth";
import { getActivityDetails } from "@repo/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }) {

  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { activityId } = await params

    // TODO: add proper zod validation before accepting the activity id  

    const activity = await getActivityDetails(activityId)
    if (!activity) return NextResponse.json({ error: "Fetch failed" }, {status: 400})


    return NextResponse.json({ data: activity, status: 200 })
  }
  catch (err) {
    return NextResponse.json({ error: err, status: 500 })
  }
}