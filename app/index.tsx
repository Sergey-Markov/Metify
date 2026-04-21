import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";

import {
  useLifeTimerStore,
  selectOnboarding,
} from "../src/store/useLifeTimerStore";

export default function Index() {
  const [hydrated, setHydrated] = useState(() => useLifeTimerStore.persist.hasHydrated());
  const isOnboardingComplete = useLifeTimerStore(selectOnboarding);

  useEffect(() => {
    const unsub = useLifeTimerStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useLifeTimerStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={s.boot} accessibilityLabel="Завантаження">
        <ActivityIndicator color="#c8a96e" size="large" />
      </View>
    );
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/home" />;
}

const s = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: "#0a0b0f",
    alignItems: "center",
    justifyContent: "center",
  },
});
