import React from "react"
import { View, Text, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ActivityTypes } from "@repo/types"

export type ActivityTypeModalProps = {
  visible: boolean
  activityType: ActivityTypes
  onSelectActivity: (type: ActivityTypes) => void
  onClose: () => void
}

export default function ActivityTypeModal({
  visible,
  activityType,
  onSelectActivity,
  onClose,
}: ActivityTypeModalProps) {
  const options: Array<{ type: ActivityTypes; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { type: "run", label: "Run", icon: "footsteps" },
    { type: "ride", label: "Ride", icon: "bicycle" },
    { type: "walk", label: "Walk", icon: "walk" },
  ]

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-gray-200 dark:border-slate-800 shadow-2xl">
          <Text className="text-gray-900 dark:text-white text-lg font-bold mb-4">
            Select Activity Type
          </Text>

          {options.map((opt) => {
            const isSelected = activityType === opt.type
            return (
              <TouchableOpacity
                key={opt.type}
                onPress={() => {
                  onSelectActivity(opt.type)
                  onClose()
                }}
                className={`flex-row items-center p-3.5 rounded-xl mb-2.5 border ${
                  isSelected
                    ? "bg-orange-50 dark:bg-[#FC5200]/15 border-[#FC5200]"
                    : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-800"
                }`}
              >
                <Ionicons name={opt.icon} size={24} color="#FC5200" />
                <Text className="font-bold text-gray-900 dark:text-white text-base ml-3 flex-1">
                  {opt.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#FC5200" />
                )}
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity
            onPress={onClose}
            className="mt-3 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 items-center"
          >
            <Text className="font-semibold text-gray-600 dark:text-slate-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
