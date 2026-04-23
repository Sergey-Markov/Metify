import React, { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

const palette = {
  green: "#4ecb8d",
  accent: "#c8a96e",
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0.5,
  },
  success: {
    backgroundColor: "rgba(78,203,141,0.12)",
    borderColor: "rgba(78,203,141,0.3)",
  },
  accent: {
    backgroundColor: "rgba(200,169,110,0.08)",
    borderColor: "rgba(200,169,110,0.15)",
  },
  textBase: { fontSize: 14 },
  textSuccess: { color: palette.green, fontWeight: "500" },
  textAccent: { color: palette.accent },
});

export type BtnVariant = "success" | "accent";

export type BtnProps = {
  children: ReactNode;
  onPress: () => void;
  variant: BtnVariant;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const Btn = ({
  children,
  onPress,
  variant,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
}: BtnProps) => {
  return (
    <TouchableOpacity
      style={[styles.base, variant === "success" ? styles.success : styles.accent, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Text
        style={[
          styles.textBase,
          variant === "success" ? styles.textSuccess : styles.textAccent,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
