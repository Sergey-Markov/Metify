import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const colors = {
  accent: "#c8a96e",
};

const styles = StyleSheet.create({
  btnBase: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200,169,110,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.3)",
  },
});

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export type BtnIconShape = "round" | "square";

export type BtnIconProps = {
  onPress: () => void;
  /** Назва іконки з Ionicons (див. @expo/vector-icons) */
  name?: IoniconsName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  /**
   * `round` — круг (радіус = половина сторони).
   * `square` — квадрат зі скругленими кутами (радіус пропорційний розміру).
   */
  shape?: BtnIconShape;
  /** Ширина й висота кнопки в dp (дефолт 40) */
  dimension?: number;
};

const DEFAULT_DIM = 40;

export const BtnIcon = ({
  onPress,
  name = "add",
  size = 24,
  color = colors.accent,
  accessibilityLabel = "Add",
  disabled = false,
  shape = "round",
  dimension = DEFAULT_DIM,
}: BtnIconProps) => {
  const dim = dimension;
  const borderRadius =
    shape === "round" ? dim / 2 : Math.max(8, Math.round(dim * 0.28));

  const hitSlop =
    dim < 44
      ? {
          top: Math.ceil((44 - dim) / 2),
          bottom: Math.ceil((44 - dim) / 2),
          left: Math.ceil((44 - dim) / 2),
          right: Math.ceil((44 - dim) / 2),
        }
      : undefined;

  return (
    <TouchableOpacity
      style={[styles.btnBase, { width: dim, height: dim, borderRadius }]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons
        name={name}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
};
