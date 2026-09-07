import type { OnboardingData } from "./OnboardingWizard"

type Props = {
  data: OnboardingData
}

const labelMap: Record<keyof OnboardingData, string> = {
  theme: "Theme",
  distanceUnit: "Distance",
  elevationUnit: "Elevation",
  paceUnit: "Pace",
  speedUnit: "Speed",
  weightUnit: "Weight",
  timeFormat: "Time Format",
}

export default function ConfirmStep({ data }: Props) {
  const entries = Object.entries(data) as [keyof OnboardingData, string][]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Review & Confirm</h2>
      <p className="text-neutral-400 text-sm mb-6">
        Here's a summary of your preferences. Hit "Finish Setup" to save.
      </p>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between px-4 py-3">
            <span className="text-sm text-neutral-400">{labelMap[key]}</span>
            <span className="text-sm font-medium text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
