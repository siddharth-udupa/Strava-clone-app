import type { OnboardingData } from "./OnboardingWizard"

type Props = {
  data: OnboardingData
  updateField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
}

type OptionGroup<K extends keyof OnboardingData> = {
  label: string
  field: K
  options: { value: OnboardingData[K]; label: string }[]
}

export default function DisplayStep({ data, updateField }: Props) {
  const groups: [
    OptionGroup<"theme">,
    OptionGroup<"timeFormat">,
    OptionGroup<"paceUnit">,
    OptionGroup<"speedUnit">,
  ] = [
    {
      label: "Theme",
      field: "theme",
      options: [
        { value: "system", label: "System" },
        { value: "dark", label: "Dark" },
        { value: "light", label: "Light" },
      ],
    },
    {
      label: "Time Format",
      field: "timeFormat",
      options: [
        { value: "12h", label: "12-hour" },
        { value: "24h", label: "24-hour" },
      ],
    },
    {
      label: "Pace",
      field: "paceUnit",
      options: [
        { value: "min/km", label: "min/km" },
        { value: "min/mi", label: "min/mi" },
      ],
    },
    {
      label: "Speed",
      field: "speedUnit",
      options: [
        { value: "km/h", label: "km/h" },
        { value: "mph", label: "mph" },
        { value: "m/s", label: "m/s" },
      ],
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Display Settings</h2>
      <p className="text-neutral-400 text-sm mb-6">Customize how things look and feel.</p>

      <div className="space-y-5">
        {groups.map(group => (
          <div key={group.field}>
            <p className="text-sm font-medium text-neutral-300 mb-2">{group.label}</p>
            <div className="flex gap-2">
              {group.options.map(opt => {
                const selected = data[group.field] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateField(group.field, opt.value)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      selected
                        ? "border-stravaorange bg-stravaorange/10 text-stravaorange"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
