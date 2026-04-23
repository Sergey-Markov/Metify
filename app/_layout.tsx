import { useEffect, useState } from "react";
import {
  useRouter,
  usePathname,
  Stack,
  useNavigationContainerRef,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  useLifeTimerStore,
  selectOnboarding,
} from "../src/store/useLifeTimerStore";

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const rootNav = useNavigationContainerRef();
  const isOnboardingComplete = useLifeTimerStore(selectOnboarding);
  const [hydrated, setHydrated] = useState(() => useLifeTimerStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useLifeTimerStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useLifeTimerStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const applyAuth = () => {
      if (!rootNav.isReady()) return false;

      const onOnboarding =
        pathname === "/onboarding" || pathname.startsWith("/onboarding/");

      if (!isOnboardingComplete) {
        if (!onOnboarding) {
          router.replace("/onboarding");
        }
      } else if (onOnboarding) {
        router.replace("/home");
      }
      return true;
    };

    if (applyAuth()) return;

    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (applyAuth() || tries > 80) {
        clearInterval(id);
      }
    }, 16);

    return () => clearInterval(id);
  }, [hydrated, isOnboardingComplete, pathname, router, rootNav]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar style="light" />
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0a0b0f" },
              animation: "slide_from_right",
            }}
          />
        </AuthGate>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
