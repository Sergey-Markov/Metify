import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  text: "#f0ede8",
  muted: "#8a8a9a",
  accent: "#c8a96e",
};

const styles = StyleSheet.create({
  empty: { alignItems: "center", padding: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.4 },
  emptyTitle: {
    fontFamily: SERIF,
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: "rgba(200,169,110,0.12)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.3)",
  },
  emptyBtnText: { fontSize: 14, color: colors.accent },
});

export type EmptyGoalsProps = {
  onAdd: () => void;
  filtered: boolean;
};

export const EmptyGoals = ({ onAdd, filtered }: EmptyGoalsProps) => {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🎯</Text>
      <Text style={styles.emptyTitle}>{filtered ? "Немає цілей" : "Ваші цілі"}</Text>
      <Text style={styles.emptySub}>
        {filtered
          ? "У цій категорії немає активних цілей"
          : "Визначте, чого хочете досягти.\nВізуалізуйте прогрес кожного дня."}
      </Text>
      {!filtered && (
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={onAdd}
        >
          <Text style={styles.emptyBtnText}>Поставити першу ціль</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
