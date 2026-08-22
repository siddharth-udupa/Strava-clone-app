"use client"

import { ActivityCardType } from "@repo/types"
import Image from "next/image"
import Map from "./map/Map"
import { PreferencesType } from "@repo/types"
import { metersToDistance, metersToElevation, formatDateAndTime, formatDurationShort } from "@repo/units"
import { useRouter } from "next/navigation"


type ActivityProp = {
  activities: ActivityCardType,
  userPreferences: PreferencesType,
}


export default function ActivityCard({ activities, userPreferences }: ActivityProp) {

  const router = useRouter()

  let elev = { name: "", value: 0 }
  if (activities.elevationGain > activities.elevationLoss) {
    elev = { name: "Elev Gain", value: activities.elevationGain }
  } else {
    elev = { name: "Elev Loss", value: activities.elevationLoss }
  }

  const { date: formattedDate, time: formattedTime } = formatDateAndTime(activities.createdAt, userPreferences?.timeFormat)

  const stats: { name: string, value: number | string, unit: string }[] = [{
    name: "Distance",
    value: metersToDistance(activities.distance, userPreferences?.distanceUnit),
    unit: userPreferences.distanceUnit === "metric" ? "km" : "M",
  }, {
    name: "Time",
    value: formatDurationShort(activities.duration),
    unit: "",
  }, {
    name: elev.name,
    value: metersToElevation(elev.value, userPreferences.elevationUnit),
    unit: userPreferences.elevationUnit === "meters" ? "m" : "ft",
  }]

  const clickHandler = () => {
    router.push(`/activities/${activities.activityId}`)
  }

  return (
    <div className="mt-8 p-4 m-auto w-[90%] md:w-[60%] lg:w-[35%] bg-amber-200 rounded-md">
      <div className="flex justify-start">
        <Image
          width={48}
          height={48}
          src="/temphoto.png"
          alt="Profile"
          className="mr-3 mt-3 w-12 rounded-full cursor-pointer"
          onClick={clickHandler} />
        <div className="mt-3 h-0 flex flex-col justify-start">
          <h3 className="mb-0 text-lg/tight font-semibold cursor-pointer"
            onClick={clickHandler}>{activities.userName}</h3>
          <p className="mt-0 text-sm/tight">{formattedDate} at {formattedTime}</p>
          <p className="mt-0 text-sm/tight">location</p>
        </div>
      </div>


      <h1 className="mt-4 text-2xl font-semibold cursor-pointer"
        onClick={clickHandler}>{activities.title ?? "Untitled Activity"}</h1>
      <p className="mt-2 text-lg font-light">{activities.description ?? ""}</p>
      <div className="mt-2 flex gap-8">
        {
          stats.map((s) => {
            return (
              <div key={s.value}>
                <p>{s.name}</p>
                <h2 className="text-2xl font-semibold">{s.value}{s.unit.padStart(3)}</h2>
              </div>
            )
          })
        }
      </div>



      {activities.encodedPolyline ? (
        <div className="mt-4 w-full h-80 bg-amber-50 rounded-md overflow-hidden  cursor-pointer"
          onClick={clickHandler}>
          <Map encodedPolyline={activities.encodedPolyline} isStatic={true} isChangeable={false} />
        </div>
      ) : (
        <div className="my-8 flex items-center justify-center border border-gray-400/20">
        </div>
      )}


      <div className="mt-8 mb-4 flex justify-around md:justify-start gap-12">
        <svg fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="24" height="24" data-testid="unfilled_kudos"><path d="M6.18.36A.625.625 0 016.746 0h.366a2.625 2.625 0 012.609 2.918L9.374 6h3.69a2.185 2.185 0 011.68 3.584l-.119.142v1.291c0 .458-.16.902-.454 1.254l-.171.205v.399A2.125 2.125 0 0111.875 15H5.703c-.256 0-.507-.077-.72-.22l-1.157-.777a.042.042 0 00-.024-.007l-1.483.031A1.292 1.292 0 011 12.736V8.81c0-.38.168-.742.46-.988l2.032-1.711zm.964.89L4.566 6.765a.625.625 0 01-.163.213l-2.138 1.8a.042.042 0 00-.015.032v3.926c0 .023.02.042.043.041l1.483-.03c.266-.006.527.07.748.219l1.156.777a.042.042 0 00.023.007h6.172a.875.875 0 00.875-.875v-.851l.46-.553a.708.708 0 00.165-.454V9.274l.408-.49a.935.935 0 00-.718-1.534h-5.09l.504-4.471c.09-.805-.53-1.51-1.335-1.529z" fill=""></path></svg>
        <svg fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g fill=""><path d="M3 5.75h10V7H3zM3 8v1.25h7V8z"></path><path d="M0 3.958C0 2.877.877 2 1.958 2h12.084C15.123 2 16 2.877 16 3.958v7.084A1.958 1.958 0 0114.042 13H7.759l-2.636 2.636A1.243 1.243 0 013 14.756V13H1.958A1.958 1.958 0 010 11.042zm1.958-.708a.708.708 0 00-.708.708v7.084c0 .39.317.708.708.708H4.25v2.991l2.991-2.991h6.8a.708.708 0 00.709-.708V3.958a.708.708 0 00-.708-.708z"></path></g></svg>
        <svg fill="#000000" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#000000" strokeWidth="0.00024">
          <g strokeWidth="0" />
          <g strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.528" />
          <path d="M1160,104a3.986,3.986,0,0,1-3.19-1.6l-8.84,5.292c0.01,0.105.03,0.2,0.03,0.312,0,0.128-.03.249-0.04,0.374l8.8,5.3A3.986,3.986,0,1,1,1156,116c0-.149.03-0.291,0.04-0.436l-8.82-5.216a4,4,0,1,1-.06-4.777l8.88-5.189c-0.01-.127-0.04-0.251-0.04-0.382A4,4,0,1,1,1160,104Zm0,14a2,2,0,1,0-2-2A2,2,0,0,0,1160,118Zm-16-12a2,2,0,1,0,2,2A2,2,0,0,0,1144,106Zm16-8a2,2,0,1,0,2,2A2,2,0,0,0,1160,98Z" transform="translate(-1140 -96)" />
        </svg>
      </div>
    </div>
  )
}