import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

type Props = {
  username: string
  onChange: (val: string) => void
  onSave: (username: string) => Promise<string | null>
  onNext: () => void
  isSaving: boolean
}

function getValidationMessage(val: string): string | null {
  if (val.length === 0) return null
  if (val.length < 3) return "At least 3 characters required."
  if (val.length > 20) return "Maximum 20 characters."
  if (!/^[a-z0-9_]+$/.test(val)) return "Only letters, numbers, and underscores."
  return null
}

export default function UsernameSlide({ username, onChange, onSave, onNext, isSaving }: Props) {
  const [apiError, setApiError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const normalized = username.toLowerCase().replace(/\s/g, "")
  const validationMsg = getValidationMessage(normalized)
  const isValid = normalized.length >= 3 && !validationMsg

  const handleContinue = async () => {
    if (!isValid) return
    setApiError(null)
    setSaved(false)
    const err = await onSave(normalized)
    if (err) {
      setApiError(err)
    } else {
      setSaved(true)
      onNext()
    }
  }

  return (
    <View className="flex-1 px-6 justify-center">
      {/* Icon */}
      <View className="w-16 h-16 rounded-2xl bg-strava/10 items-center justify-center mb-6">
        <Ionicons name="person-circle-outline" size={36} color="#FC4C02" />
      </View>

      <Text className="text-3xl font-black text-gray-900 dark:text-white mb-2">
        Choose your username
      </Text>
      <Text className="text-sm text-gray-500 dark:text-slate-400 mb-8">
        This is how others will find you. You can change it later in your profile.
      </Text>

      {/* Input */}
      <View className="mb-2">
        <View
          className={`flex-row items-center border rounded-xl px-4 py-3.5 bg-gray-50 dark:bg-slate-800 ${
            apiError
              ? "border-red-400"
              : isValid
              ? "border-green-400"
              : "border-gray-200 dark:border-slate-700"
          }`}
        >
          <Text className="text-gray-400 dark:text-slate-500 mr-1 text-base font-medium">@</Text>
          <TextInput
            className="flex-1 text-base text-gray-900 dark:text-white font-medium"
            placeholder="your_username"
            placeholderTextColor="#9CA3AF"
            value={normalized}
            onChangeText={(t) => {
              setApiError(null)
              setSaved(false)
              onChange(t.toLowerCase().replace(/\s/g, ""))
            }}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
          {isValid && !apiError && (
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          )}
        </View>

        {/* Inline feedback */}
        {(validationMsg || apiError) && (
          <Text className="text-xs text-red-500 mt-1.5 ml-1">
            {apiError ?? validationMsg}
          </Text>
        )}
        {!validationMsg && !apiError && normalized.length > 0 && (
          <Text className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 ml-1">
            {20 - normalized.length} characters remaining
          </Text>
        )}
      </View>

      {/* CTA */}
      <TouchableOpacity
        onPress={handleContinue}
        disabled={!isValid || isSaving}
        className={`mt-6 rounded-xl py-4 items-center ${
          isValid && !isSaving ? "bg-strava" : "bg-gray-200 dark:bg-slate-700"
        }`}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            className={`text-base font-bold ${
              isValid ? "text-white" : "text-gray-400 dark:text-slate-500"
            }`}
          >
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
