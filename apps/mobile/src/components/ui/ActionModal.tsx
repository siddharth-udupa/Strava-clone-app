import React from "react"
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type ModalButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"

export type ModalButtonConfig = {
  label: string
  onPress: () => void | Promise<void>
  variant?: ModalButtonVariant
  isLoading?: boolean
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode
}

export type ActionModalProps = {
  /** Controls visibility of the modal */
  visible: boolean

  /** Title text displayed at the top of the modal */
  title: string

  /** Description/body text or custom component */
  description?: React.ReactNode

  /** Primary button options object */
  primaryButton?: ModalButtonConfig

  /** Optional secondary button options object */
  secondaryButton?: ModalButtonConfig

  /* Direct convenience props */
  /** Label for primary button */
  primaryText?: string
  /** Callback for primary button */
  onPrimaryPress?: () => void | Promise<void>
  /** Variant for primary button (defaults to 'primary') */
  primaryVariant?: ModalButtonVariant
  /** Loading state for primary button */
  isPrimaryLoading?: boolean

  /** Label for secondary button */
  secondaryText?: string
  /** Callback for secondary button */
  onSecondaryPress?: () => void | Promise<void>
  /** Variant for secondary button (defaults to 'outline') */
  secondaryVariant?: ModalButtonVariant
  /** Loading state for secondary button */
  isSecondaryLoading?: boolean

  /** Called when modal backdrop is pressed or modal close is requested */
  onClose?: () => void

  /** Whether clicking the backdrop closes the modal (defaults to true) */
  closeOnBackdropPress?: boolean

  /** Optional icon displayed at the top center of the modal */
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode

  /** Preset variant for top icon container style */
  iconVariant?: "default" | "warning" | "danger" | "success" | "info"

  /** Custom container class name for extra tailwind styling */
  className?: string
}

export function ActionModal({
  visible,
  title,
  description,
  primaryButton,
  secondaryButton,
  primaryText,
  onPrimaryPress,
  primaryVariant = "primary",
  isPrimaryLoading = false,
  secondaryText,
  onSecondaryPress,
  secondaryVariant = "outline",
  isSecondaryLoading = false,
  onClose,
  closeOnBackdropPress = true,
  icon,
  iconVariant = "default",
  className = "",
}: ActionModalProps) {
  // Resolve primary button configuration
  const resolvedPrimary: ModalButtonConfig | null = primaryButton
    ? primaryButton
    : onPrimaryPress || primaryText
      ? {
          label: primaryText || "Confirm",
          onPress: onPrimaryPress || (() => {}),
          variant: primaryVariant,
          isLoading: isPrimaryLoading,
        }
      : null

  // Resolve secondary button configuration (optional)
  const resolvedSecondary: ModalButtonConfig | null = secondaryButton
    ? secondaryButton
    : onSecondaryPress || secondaryText
      ? {
          label: secondaryText || "Cancel",
          onPress: onSecondaryPress || (() => {}),
          variant: secondaryVariant,
          isLoading: isSecondaryLoading,
        }
      : null

  const handleBackdropPress = () => {
    if (closeOnBackdropPress && onClose) {
      onClose()
    }
  }

  const renderIcon = () => {
    if (!icon) return null

    let bgClass = "bg-orange-500/10 dark:bg-orange-500/20"
    let iconColor = "#FC5200"

    if (iconVariant === "danger") {
      bgClass = "bg-red-500/10 dark:bg-red-500/20"
      iconColor = "#EF4444"
    } else if (iconVariant === "warning") {
      bgClass = "bg-amber-500/10 dark:bg-amber-500/20"
      iconColor = "#F59E0B"
    } else if (iconVariant === "success") {
      bgClass = "bg-emerald-500/10 dark:bg-emerald-500/20"
      iconColor = "#10B981"
    } else if (iconVariant === "info") {
      bgClass = "bg-blue-500/10 dark:bg-blue-500/20"
      iconColor = "#3B82F6"
    }

    return (
      <View className="items-center mb-4">
        <View className={`w-14 h-14 rounded-full items-center justify-center ${bgClass}`}>
          {typeof icon === "string" ? (
            <Ionicons name={icon as any} size={28} color={iconColor} />
          ) : (
            icon
          )}
        </View>
      </View>
    )
  }

  const getButtonStyles = (variant: ModalButtonVariant = "primary") => {
    switch (variant) {
      case "destructive":
        return {
          container: "bg-red-600 dark:bg-red-600 border border-transparent active:bg-red-700",
          text: "text-white font-bold",
          spinnerColor: "#FFFFFF",
        }
      case "secondary":
        return {
          container: "bg-slate-900 dark:bg-slate-100 border border-transparent active:bg-slate-800 dark:active:bg-white",
          text: "text-white dark:text-slate-900 font-bold",
          spinnerColor: "#FFFFFF",
        }
      case "outline":
        return {
          container: "bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 active:bg-gray-200 dark:active:bg-slate-700",
          text: "text-gray-900 dark:text-slate-100 font-semibold",
          spinnerColor: "#6B7280",
        }
      case "ghost":
        return {
          container: "bg-transparent border border-transparent active:bg-gray-100 dark:active:bg-slate-800",
          text: "text-gray-600 dark:text-slate-400 font-semibold",
          spinnerColor: "#6B7280",
        }
      case "primary":
      default:
        return {
          container: "bg-[#FC5200] border border-transparent active:opacity-90 shadow-sm",
          text: "text-white font-bold",
          spinnerColor: "#FFFFFF",
        }
    }
  }

  const renderButton = (btn: ModalButtonConfig, isFullWidth = false) => {
    const variantStyle = getButtonStyles(btn.variant)
    const isDisabled = btn.disabled || btn.isLoading

    return (
      <TouchableOpacity
        key={btn.label}
        onPress={btn.onPress}
        disabled={isDisabled}
        className={`py-3.5 px-4 rounded-xl flex-row items-center justify-center ${variantStyle.container} ${
          isFullWidth ? "w-full" : "flex-1"
        } ${isDisabled ? "opacity-50" : ""}`}
        activeOpacity={0.8}
      >
        {btn.isLoading ? (
          <ActivityIndicator size="small" color={variantStyle.spinnerColor} />
        ) : (
          <View className="flex-row items-center justify-center">
            {btn.icon && (
              <View className="mr-2">
                {typeof btn.icon === "string" ? (
                  <Ionicons name={btn.icon as any} size={18} color={variantStyle.spinnerColor} />
                ) : (
                  btn.icon
                )}
              </View>
            )}
            <Text className={`text-center text-base ${variantStyle.text}`}>
              {btn.label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="flex-1 justify-center items-center p-5 bg-black/60 dark:bg-slate-950/75">
          {/* Glassmorphic backdrop blur card */}
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={styles.modalCard}
              className={`bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 w-full max-w-sm border border-gray-100 dark:border-slate-800 shadow-2xl ${className}`}
            >
              {/* Close Icon in top-right */}
              {onClose && (
                <TouchableOpacity
                  onPress={onClose}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-gray-100 dark:bg-slate-800 active:opacity-75"
                  accessibilityLabel="Close modal"
                >
                  <Ionicons name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {/* Optional Top Icon Header */}
              {renderIcon()}

              {/* Title */}
              <Text className="text-gray-900 dark:text-white text-xl font-bold text-center mb-2">
                {title}
              </Text>

              {/* Description / Body text */}
              {description ? (
                typeof description === "string" ? (
                  <Text className="text-gray-600 dark:text-slate-300 text-sm font-normal text-center leading-5 mb-6">
                    {description}
                  </Text>
                ) : (
                  <View className="mb-6">{description}</View>
                )
              ) : (
                <View className="mb-4" />
              )}

              {/* Action Buttons */}
              <View className="w-full">
                {resolvedPrimary && resolvedSecondary ? (
                  <View className="flex-row items-center space-x-3 gap-3">
                    {renderButton(resolvedSecondary, false)}
                    {renderButton(resolvedPrimary, false)}
                  </View>
                ) : resolvedPrimary ? (
                  renderButton(resolvedPrimary, true)
                ) : resolvedSecondary ? (
                  renderButton(resolvedSecondary, true)
                ) : null}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

export default ActionModal

const styles = StyleSheet.create({
  modalCard: {
    ...Platform.select({
      web: {
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      },
    }),
  },
})
