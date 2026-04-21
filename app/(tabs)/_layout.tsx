import { Tabs } from "expo-router";
import { Text, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#c8a96e";
const MUTED = "#8a8a9a";
const BG = "#0a0b0f";
const BORDER = "#3a3d4a";

/** Іконка + лейбл над системною зоною (без safe area). */
const TAB_CONTENT_HEIGHT = Platform.select({ ios: 52, default: 54 });

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 4 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: BORDER,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 6,
          paddingBottom: bottomInset,
          height: TAB_CONTENT_HEIGHT + bottomInset + 6,
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Таймер",
          tabBarIcon: ({ color }) => (
            <Text accessible={false} style={{ color, fontSize: 18 }}>
              ◎
            </Text>
          ),
          tabBarAccessibilityLabel: "Таймер життя",
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Цілі",
          tabBarIcon: ({ color }) => (
            <Text accessible={false} style={{ color, fontSize: 18 }}>
              ✦
            </Text>
          ),
          tabBarAccessibilityLabel: "Цілі",
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Звички",
          tabBarIcon: ({ color }) => (
            <Text accessible={false} style={{ color, fontSize: 18 }}>
              ▦
            </Text>
          ),
          tabBarAccessibilityLabel: "Звички",
        }}
      />
    </Tabs>
  );
}
