import React from "react"
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type RouteSelectionModalProps = {
  visible: boolean
  selectedRoute: string | null
  onSelectRoute: (routeName: string | null) => void
  onClose: () => void
}

export default function RouteSelectionModal({
  visible,
  selectedRoute,
  onSelectRoute,
  onClose,
}: RouteSelectionModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl">
          <View className="flex-row items-center justify-between mb-4 border-b border-gray-200 dark:border-slate-800 pb-3">
            <View className="flex-row items-center">
              <Ionicons name="git-network" size={20} color="#FC5200" />
              <Text className="text-gray-900 dark:text-white font-bold text-lg ml-2">
                Select Route
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-full"
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              onSelectRoute("Custom 5K Loop")
              onClose()
              Alert.alert("Route Loaded", "Custom 5K Loop route attached.")
            }}
            className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${
              selectedRoute === "Custom 5K Loop"
                ? "bg-orange-50 dark:bg-[#FC5200]/15 border-[#FC5200]"
                : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-800"
            }`}
          >
            <View>
              <Text className="font-bold text-gray-900 dark:text-white text-base">
                Custom 5K Loop
              </Text>
              <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                5.0 km • 45m elevation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {selectedRoute && (
            <TouchableOpacity
              onPress={() => {
                onSelectRoute(null)
                onClose()
              }}
              className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 items-center justify-center mb-4"
            >
              <Text className="text-xs font-semibold text-red-500 dark:text-red-400">
                Clear Selected Route
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  )
}
