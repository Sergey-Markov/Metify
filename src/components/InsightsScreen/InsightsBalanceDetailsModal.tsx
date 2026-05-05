import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { LifeBalanceItem } from "../../features/insights/types";
import { LifeBalanceCard } from "./LifeBalanceCard";

type InsightsBalanceDetailsModalProps = {
  visible: boolean;
  lifeBalanceItems: LifeBalanceItem[];
  wastedTimeEstimate: number;
  onClose: () => void;
};

export const InsightsBalanceDetailsModal = ({
  visible,
  lifeBalanceItems,
  wastedTimeEstimate,
  onClose,
}: InsightsBalanceDetailsModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <View style={s.modalIconWrap}>
            <Ionicons
              name="sparkles"
              size={18}
              color="#c8a96e"
              accessible={false}
            />
          </View>
          <Text style={s.modalTitle}>Деталі балансу життя</Text>
          <View style={s.modalCardsStack}>
            {lifeBalanceItems.map((item) => (
              <LifeBalanceCard
                key={item.id}
                item={item}
              />
            ))}
          </View>
          <Text style={s.modalText}>
            {wastedTimeEstimate > 35
              ? "Найбільший резерв зараз у поверненні розсіяного часу в короткі фокус-блоки."
              : "Баланс виглядає стабільно. Утримуйте ритм і поступово підсилюйте фокус."}
          </Text>
          <Pressable
            style={s.modalButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Закрити модальне вікно деталей інсайту"
          >
            <Text style={s.modalButtonText}>Закрити</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,11,15,0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#111318",
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  modalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(200,169,110,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    color: "#f0ede8",
    fontSize: 18,
    fontWeight: "700",
  },
  modalText: {
    color: "#8a8a9a",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  modalCardsStack: {
    width: "100%",
    gap: 8,
    marginTop: 4,
  },
  modalButton: {
    marginTop: 4,
    backgroundColor: "#c8a96e",
    borderRadius: 12,
    minHeight: 44,
    minWidth: 112,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  modalButtonText: {
    color: "#0a0b0f",
    fontWeight: "700",
    fontSize: 13,
  },
});
