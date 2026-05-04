import { useMemo, useRef } from "react";
import { Animated, PanResponder } from "react-native";

type UseSwipeToRevealDeleteParams = {
  enabled: boolean;
  threshold?: number;
  activeOffsetX?: number;
  failOffsetY?: number;
};

type UseSwipeToRevealDeleteResult = {
  panHandlers: ReturnType<typeof PanResponder.create>["panHandlers"];
  animatedStyle: { transform: [{ translateX: Animated.Value }] };
};

const DEFAULT_THRESHOLD = -80;
const DEFAULT_ACTIVE_OFFSET_X = 12;
const DEFAULT_FAIL_OFFSET_Y = 18;
const SPRING_TENSION = 120;
const SPRING_FRICTION = 16;

export function useSwipeToRevealDelete({
  enabled,
  threshold = DEFAULT_THRESHOLD,
  activeOffsetX = DEFAULT_ACTIVE_OFFSET_X,
  failOffsetY = DEFAULT_FAIL_OFFSET_Y,
}: UseSwipeToRevealDeleteParams): UseSwipeToRevealDeleteResult {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Boolean(
            enabled &&
              Math.abs(gestureState.dx) > activeOffsetX &&
              Math.abs(gestureState.dy) < failOffsetY,
          ),
        onPanResponderMove: (_, gestureState) => {
          translateX.setValue(Math.min(0, gestureState.dx));
        },
        onPanResponderRelease: (_, gestureState) => {
          const toValue = gestureState.dx < threshold ? threshold : 0;
          Animated.spring(translateX, {
            toValue,
            useNativeDriver: true,
            tension: SPRING_TENSION,
            friction: SPRING_FRICTION,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: SPRING_TENSION,
            friction: SPRING_FRICTION,
          }).start();
        },
      }),
    [activeOffsetX, enabled, failOffsetY, threshold, translateX],
  );

  return {
    panHandlers: panResponder.panHandlers,
    animatedStyle: { transform: [{ translateX }] },
  };
}
