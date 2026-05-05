import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICON_SIZE = 22;

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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              accessible={false}
              name={focused ? "hourglass" : "hourglass-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Таймер життя",
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Цілі",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              accessible={false}
              name={focused ? "flag" : "flag-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Цілі",
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Інсайти",
          tabBarIcon: ({ focused }) => (
            <View style={[s.centerIconWrap, focused && s.centerIconWrapFocused]}>
              <Ionicons
                accessible={false}
                name={focused ? "sparkles" : "sparkles-outline"}
                size={20}
                color={focused ? "#0a0b0f" : ACCENT}
              />
            </View>
          ),
          tabBarButton: (props) => {
            const isSelected = props.accessibilityState?.selected ?? false;
            return (
              <Pressable
                {...props}
                style={[props.style, s.centerButton]}
                accessibilityRole="tab"
                accessibilityLabel="Інсайти"
                accessibilityHint="Відкрити персональні інсайти й рефлексію"
              >
                <View style={[s.centerButtonInner, isSelected && s.centerButtonInnerFocused]}>
                  {props.children}
                </View>
              </Pressable>
            );
          },
          tabBarAccessibilityLabel: "Інсайти",
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Звички",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              accessible={false}
              name={focused ? "repeat" : "repeat-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Звички",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профіль",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              accessible={false}
              name={focused ? "person-circle" : "person-circle-outline"}
              size={ICON_SIZE}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Профіль",
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  centerButton: {
    marginTop: -16,
  },
  centerButtonInner: {
    minWidth: 74,
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: "#111318",
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  centerButtonInnerFocused: {
    backgroundColor: "rgba(200,169,110,0.2)",
    borderColor: "rgba(200,169,110,0.8)",
  },
  centerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200,169,110,0.14)",
  },
  centerIconWrapFocused: {
    backgroundColor: ACCENT,
  },
});
