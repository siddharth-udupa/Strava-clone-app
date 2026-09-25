import React from "react"
import { View, Text, TouchableOpacity } from "react-native"

export type TabType = "overview" | "analysis" | "segments" | "best_efforts"

export type ActivityTabNavigationProps = {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
}

const TABS: { key: TabType; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "analysis", label: "Analysis" },
  { key: "segments", label: "Segments" },
  { key: "best_efforts", label: "Best efforts" },
]

export default function ActivityTabNavigation({
  activeTab,
  onSelectTab,
}: ActivityTabNavigationProps) {
  return (
    <View className="mb-6 bg-[#0B1220] px-5">
      <View className="flex-row bg-[#0F1929] border border-[#223149] rounded-2xl p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              className={`flex-1 items-center justify-center rounded-xl py-3 ${
                isActive ? "bg-[#FC5200]" : "bg-transparent"
              }`}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                className={`text-[11px] font-bold tracking-wide text-center ${
                  isActive ? "text-white" : "text-[#8A9AB2]"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
