import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Btn } from "../../UI/Btn";

type InsightsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export const InsightsErrorState = ({ message, onRetry }: InsightsErrorStateProps) => {
  return (
    <View style={s.centerState}>
      <Text style={s.stateText}>{message}</Text>
      <Btn
        variant="accent"
        onPress={onRetry}
        accessibilityLabel="Спробувати завантажити інсайти ще раз"
        style={s.retryBtn}
        textStyle={s.retryBtnText}
      >
        Спробувати ще раз
      </Btn>
    </View>
  );
};

const s = StyleSheet.create({
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  stateText: {
    color: "#8a8a9a",
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    minWidth: 190,
    paddingHorizontal: 16,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
