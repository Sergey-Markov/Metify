import React, { useCallback, useEffect, useMemo } from "react";
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const DISMISS_DRAG_PX = 96;
const DISMISS_VELOCITY_Y = 700;
const DRAG_RUBBER_BAND = 0.22;
const OFFSCREEN_MS = 240;

const sheetHandleTrack = "#3a3d4a";

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  sheet: {
    backgroundColor: "#111318",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 0,
  },
  sheetHandleDragZone: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 3,
    backgroundColor: sheetHandleTrack,
    borderRadius: 2,
    alignSelf: "center",
  },
});

export type BottomSheetModalProps = {
  onClose: () => void;
  children: React.ReactNode;
  /** Applied to the sheet panel (default `"90%"`). */
  sheetMaxHeight?: DimensionValue;
  handleAccessibilityLabel?: string;
  handleAccessibilityHint?: string;
};

export function BottomSheetModal({
  onClose,
  children,
  sheetMaxHeight = "90%",
  handleAccessibilityLabel = "Ручка вікна",
  handleAccessibilityHint = "Перетягніть вниз, щоб закрити",
}: BottomSheetModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const offscreenY = useSharedValue(windowHeight);

  useEffect(() => {
    offscreenY.value = windowHeight;
  }, [windowHeight, offscreenY]);

  const closeSheet = useCallback(() => {
    onClose();
  }, [onClose]);

  const sheetPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .failOffsetX([-28, 28])
        .onStart(() => {
          dragStartY.value = translateY.value;
        })
        .onUpdate((e) => {
          const next = dragStartY.value + e.translationY;
          translateY.value = next > 0 ? next : next * DRAG_RUBBER_BAND;
        })
        .onEnd((e) => {
          const shouldDismiss =
            translateY.value > DISMISS_DRAG_PX ||
            e.velocityY > DISMISS_VELOCITY_Y;
          if (shouldDismiss) {
            translateY.value = withTiming(
              offscreenY.value,
              { duration: OFFSCREEN_MS },
              (finished) => {
                if (finished) runOnJS(closeSheet)();
              },
            );
          } else {
            translateY.value = withSpring(0, {
              damping: 28,
              stiffness: 320,
            });
          }
        }),
    [closeSheet, dragStartY, offscreenY, translateY],
  );

  const sheetPanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
      <Animated.View
        style={styles.overlay}
        entering={FadeIn}
        exiting={FadeOut}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Animated.View
          style={[styles.sheet, { maxHeight: sheetMaxHeight }, sheetPanStyle]}
          entering={SlideInDown}
          exiting={SlideOutDown}
        >
          <GestureDetector gesture={sheetPanGesture}>
            <View
              style={styles.sheetHandleDragZone}
              accessibilityLabel={handleAccessibilityLabel}
              accessibilityHint={handleAccessibilityHint}
            >
              <View style={styles.sheetHandle} />
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}
