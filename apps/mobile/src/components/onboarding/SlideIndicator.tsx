import { View } from "react-native"
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated"

type Props = {
  total: number
  current: number
}

export default function SlideIndicator({ total, current }: Props) {
  return (
    <View className="flex-row justify-center items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  )
}

function Dot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, { damping: 15, stiffness: 120 }),
    opacity: withSpring(active ? 1 : 0.35, { damping: 15 }),
  }))

  return (
    <Animated.View
      style={[
        style,
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: "#FC4C02",
        },
      ]}
    />
  )
}
