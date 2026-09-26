import ActivityChartWrapper from "@/components/charts/ActivityChartWrapper"
import MapView from "@/components/map/Map"
import { auth } from "@/lib/auth"
import { getActivityDetails } from "@repo/db"
import { computePace, formatDurationShort, metersToDistance, metersToElevation } from "@repo/units"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"


export default async function Activity({ params }: { params: Promise<{ id: string }> }) {

  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/auth")
  }

  const { id: activityId } = await params

  const data = await getActivityDetails(activityId)
  if (!data) {
    notFound()
  }

  const distance = metersToDistance(data.distance, data.user.preferences.distanceUnit)
  const elevationGain = metersToElevation(data.elevationGain, data.user.preferences.elevationUnit)
  const elevationLoss = metersToElevation(data.elevationLoss, data.user.preferences.elevationUnit)
  const duration = formatDurationShort(data.duration)
  const pace = computePace(data.duration, data.distance, "min/km")

  const elapsedTime = duration

  const elevationUnit = data.user.preferences.elevationUnit === "meters" ? "m" : "ft"

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {data ? (
        <div className="max-w-300 mx-auto mt-10 flex gap-8 px-4">

          {/* Left Sidebar Menu */}
          <div className="w-46 h-46 shrink-0 flex flex-col">
            <div className="flex flex-col mb-6">
              <Link
                href={`/activities/${activityId}`}
                className="border-l-4 border-orange-500 pl-4 py-2 text-sm font-bold text-gray-900">Overview
              </Link>
              <Link
                href={`/activities/${activityId}/analysis`}
                className="pl-5 py-3 text-sm text-gray-700 hover:text-gray-900 cursor-pointer">Analysis
              </Link>

              <div className="border-t border-gray-200 my-1"></div>
              <Link
                href={`/activities/${activityId}/segments`}
                className="pl-5 py-3 text-sm text-gray-700 hover:text-gray-900 cursor-pointer">Segments
              </Link>

              <div className="border-t border-gray-200 my-1"></div>
              <Link
                href={`/activities/${activityId}/best-efforts`}
                className="pl-5 py-3 text-sm text-gray-700 hover:text-gray-900 cursor-pointer">Best Efforts
              </Link>
            </div>

            {/* Bottom Actions */}
            <div className="flex border border-gray-200 rounded-sm mt-auto w-max">
              <button className="px-4 py-2 hover:bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button className="px-4 py-2 hover:bg-gray-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M6 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" /></svg>
              </button>
            </div>
          </div>

          {/* Main Activity Details */}
          <div className="flex-1 bg-white border border-gray-200 shadow-sm mb-10">

            {/* Header */}
            <div className="flex justify-between items-center bg-[#f8f8f9] border-b border-gray-200 px-6 py-3">
              <h1 className="text-xl text-gray-800"> {data.user.name} - {data.type}</h1>
              <div className="flex items-center  text-gray-500 border border-gray-300 rounded bg-white overflow-hidden h-7">
                <button className="flex items-center gap-1.5 hover:bg-gray-50 px-3 py-1 border-r border-gray-300 h-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  <span className="text-xs font-semibold text-gray-700">0</span>
                </button>
                <button className="flex items-center gap-1.5 hover:bg-gray-50 px-3 py-1 h-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span className="text-xs font-semibold text-gray-700">0</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">

              {/* Top Section (Info & Stats) */}
              <div className="flex flex-col md:flex-row gap-6">

                {/* Left Info */}
                <div className="flex-1 flex gap-4">
                  {/* Avatar/Graphic */}
                  <div className="w-28 h-28 shrink-0 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
                    <Image
                      width={112}
                      height={112}
                      loading={"eager"}
                      src="/temphoto.png"
                      alt="Profile"
                    />
                  </div>

                  <div>
                    <div className="text-[13px] text-gray-500 mb-1">
                      {data.createdAt.toDateString()}
                    </div>
                    <h2 className="max-w-50 text-[28px] font-bold text-gray-900 mb-3 tracking-tight text-wrap overflow-auto">{data.title}</h2>
                    <button className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      Add a description
                    </button>
                  </div>
                </div>

                {/* Right Stats */}
                <div className="w-80 shrink-0">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[28px] font-light leading-none">{distance}</span>
                        <span className="text-sm text-gray-600">km</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Distance</div>
                    </div>
                    <div>
                      <div className="text-[28px] font-light leading-none">{duration}</div>
                      <div className="text-xs text-gray-500 mt-1">Moving Time</div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[28px] font-light leading-none">{pace}</span>
                        <span className="text-sm text-gray-600">{data.user.preferences.paceUnit}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Pace</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px] border-t border-gray-100 pt-3">
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-24">Elevation Gain</span>
                      <span className="font-semibold">{elevationGain}  {elevationUnit}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-24">Elevation Loss</span>
                      <span className="font-semibold">{elevationLoss} {elevationUnit}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-16">Calories</span>
                      <span className="font-semibold">-</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-24">Elapsed Time</span>
                      <span className="font-semibold">{elapsedTime}</span>
                    </div>
                  </div>


                </div>
              </div>

              {/* Divider line */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Map */}
              {
                data.encodedPolyline &&
                <div className="w-full h-100">
                  <MapView encodedPolyline={data.encodedPolyline} isChangeable={true} />
                </div>
              }

            </div>

            {/* Charts */}
            <div className="flex-1 mx-6">
              {data.streams && data.streams.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-6"></div>
                  <ActivityChartWrapper
                    distanceData={data.streams[0]!.distanceData}
                    altitudeData={data.streams[0]!.altitudeData}
                    speedData={data.streams[0]!.speedData}
                    distanceUnit={data.user.preferences.distanceUnit}
                    elevationUnit={data.user.preferences.elevationUnit}
                    speedUnit={data.user.preferences.speedUnit}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">no data</div>
      )
      }
    </div>
  )
}