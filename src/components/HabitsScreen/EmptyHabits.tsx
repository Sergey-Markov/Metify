import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    fontSize: 22,
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

export type EmptyHabitsProps = {
  onAdd: () => void;
};

export const EmptyHabits = ({ onAdd }: EmptyHabitsProps) => {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🌱</Text>
      <Text style={styles.emptyTitle}>Немає звичок</Text>
      <Text style={styles.emptySub}>
        Додайте першу звичку і починайте будувати кращу версію себе
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={onAdd}
      >
        <Text style={styles.emptyBtnText}>Додати звичку</Text>
      </TouchableOpacity>
    </View>
  );
};
