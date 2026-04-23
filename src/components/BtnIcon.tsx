import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const colors = {
  accent: "#c8a96e",
};

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(200,169,110,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export type BtnIconProps = {
  onPress: () => void;
  /** Назва іконки з Ionicons (див. @expo/vector-icons) */
  name?: IoniconsName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

export const BtnIcon = ({
  onPress,
  name = "add",
  size = 24,
  color = colors.accent,
  accessibilityLabel = "Add",
}: BtnIconProps) => (
  <TouchableOpacity
    style={styles.btn}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
  >
    <Ionicons
      name={name}
      size={size}
      color={color}
    />
  </TouchableOpacity>
);
