import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Btn } from "../../UI/Btn";

type RecommendedActionsPlaceholderProps = {
  onGoToTimer: () => void;
};

export const RecommendedActionsPlaceholder = ({
  onGoToTimer,
}: RecommendedActionsPlaceholderProps) => {
  return (
    <View style={s.card}>
      <Text style={s.title}>Усі дії вже додано на сьогодні</Text>
      <Text style={s.text}>
        Виконайте додані короткі дії на головному екрані в блоці «Короткі дії».
      </Text>
      <Btn
        variant="accent"
        onPress={onGoToTimer}
        accessibilityLabel="Перейти на головний екран до коротких дій"
      >
        Перейти
      </Btn>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: "#111318",
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  title: {
    color: "#f0ede8",
    fontSize: 15,
    fontWeight: "600",
  },
  text: {
    color: "#8a8a9a",
    fontSize: 12,
    lineHeight: 18,
  },
});
