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
  { key: "best_efforts", label: "Best Efforts" },
]

export default function ActivityTabNavigation({
  activeTab,
  onSelectTab,
}: ActivityTabNavigationProps) {
  return (
    <View className="flex-row border-b border-gray-200 dark:border-slate-800 mb-4 -mx-1">
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onSelectTab(tab.key)}
          className={`px-3 py-2.5 mr-1 border-b-2 ${
            activeTab === tab.key ? "border-[#FC5200]" : "border-transparent"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === tab.key ? "text-[#FC5200]" : "text-gray-500 dark:text-slate-400"
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
