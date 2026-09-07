"use client"

import { useState, useTransition } from "react"
import { PreferencesType } from "@repo/types"
import UsernameStep from "./Username"
import UnitsStep from "./UnitsStep"
import DisplayStep from "./DisplayStep"
import ConfirmStep from "./ConfirmStep"

type OnboardingWizardProps = {
  userName: string
  userId: string
  submitPreferences: (data: PreferencesType) => Promise<void>
}

export type OnboardingData = {
  theme: "system" | "dark" | "light"
  distanceUnit: "metric" | "imperial"
  elevationUnit: "meters" | "feet"
  paceUnit: "min/km" | "min/mi"
  speedUnit: "km/h" | "mph" | "m/s"
  weightUnit: "kg" | "lb"
  timeFormat: "12h" | "24h"
}

const TOTAL_STEPS = 4

export default function OnboardingWizard({ userName, userId, submitPreferences }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState<OnboardingData>({
    theme: "system",
    distanceUnit: "metric",
    elevationUnit: "meters",
    paceUnit: "min/km",
    speedUnit: "km/h",
    weightUnit: "kg",
    timeFormat: "12h",
  })

  function updateField<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function next() {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  function handleSubmit() {
    startTransition(async () => {
      await submitPreferences({
        userId,
        onBoarded: true,
        updatedAt: new Date(),
        theme: data.theme,
        distanceUnit: data.distanceUnit,
        elevationUnit: data.elevationUnit,
        paceUnit: data.paceUnit,
        speedUnit: data.speedUnit,
        weightUnit: data.weightUnit,
        timeFormat: data.timeFormat,
      })
    })
  }

  const slides = [
    <UsernameStep key="username" userName={userName} />,
    <UnitsStep key="units" data={data} updateField={updateField} />,
    <DisplayStep key="display" data={data} updateField={updateField} />,
    <ConfirmStep key="confirm" data={data} />,
  ]

  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-stravaorange" : "bg-neutral-800"
              }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <p className="text-neutral-500 text-sm mb-6">
          Step {step + 1} of {TOTAL_STEPS}
        </p>

        {/* Slide content */}
        <div className="min-h-[340px]">
          {slides[step]}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={back}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            Back
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-stravaorange text-white hover:bg-stravaorange/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-stravaorange text-white hover:bg-stravaorange/90 transition-colors disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Finish Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
