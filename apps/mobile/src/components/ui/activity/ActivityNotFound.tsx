import React from "react"
import { View, Text, TouchableOpacity, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type ActivityNotFoundProps = {
  onBack: () => void
}

export default function ActivityNotFound({ onBack }: ActivityNotFoundProps) {
  return (
    <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center px-6">
      <StatusBar barStyle="dark-content" />

      <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 items-center justify-center mb-4">
        <Ionicons name="alert-circle-outline" size={40} color="#FC5200" />
      </View>
      <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
        Activity Not Found
      </Text>

      <Text className="text-gray-500 dark:text-slate-400 text-sm text-center mt-2 mb-6 leading-5">
        This activity doesn't exist, may have been deleted, or is temporarily unavailable.
      </Text>
      <TouchableOpacity
        onPress={onBack}
        className="bg-[#FC5200] px-6 py-3 rounded-xl flex-row items-center active:opacity-80"
      >
        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        <Text className="text-white font-bold text-sm ml-2">Go Back</Text>
      </TouchableOpacity>
    </View>
  )
}
