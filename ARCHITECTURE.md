# LifeTimer — Architecture

## Folder Structure

```
lifetimer/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout + auth gate
│   ├── onboarding/
│   │   └── index.tsx             # 3-step onboarding flow
│   └── home/
│       └── index.tsx             # Main timer screen
│
└── src/
    ├── types/
    │   └── index.ts              # All TypeScript interfaces
    │
    ├── constants/
    │   └── index.ts              # Country data, adjustments, config
    │
    ├── utils/
    │   ├── lifeCalculator.ts     # Pure functions (testable)
    │   └── __tests__/
    │       └── lifeCalculator.test.ts
    │
    ├── store/
    │   └── useLifeTimerStore.ts  # Zustand store + selectors
    │
    └── hooks/
        └── index.ts              # Custom hooks (side effects)
```

## Architecture Principles

### 1. Separation of Concerns

| Layer       | Responsibility                                  | Files                      |
|-------------|--------------------------------------------------|----------------------------|
| Types       | Data shapes only                                 | `types/index.ts`           |
| Constants   | Config, static data, adjustments table           | `constants/index.ts`       |
| Utils       | Pure functions, zero side effects, fully testable| `utils/lifeCalculator.ts`  |
| Store       | Global state + persistence                       | `store/useLifeTimerStore.ts`|
| Hooks       | Side effects, subscriptions, derived state       | `hooks/index.ts`           |
| Screens     | Rendering only, no business logic                | `app/**`                   |

### 2. Data Flow

```
UserInput (screen)
  → useOnboardingForm (hook)
    → useLifeTimerStore.completeOnboarding (store action)
      → calculateLifeExpectancy (pure util)
        → stored in Zustand + AsyncStorage

HomeScreen
  → useAppStats (hook)
    → useCountdown → buildCountdown (pure util) [ticks every 1s]
    → useLifeGrid  → buildWeekGrid  (pure util) [memoized]
    → useDailyMotivation            (pure util) [memoized]
```

### 3. Key Decisions

- **Pure utils** — `calculateLifeExpectancy`, `buildCountdown`, `buildWeekGrid` are
  plain functions with no dependencies on React or RN. Easy to unit-test.

- **Selectors** — exported from the store to prevent components from reaching into
  state shape directly, enabling refactors without touching screens.

- **AppState pause** — `useCountdown` pauses the interval when the app backgrounds,
  saving battery. It resumes on foreground.

- **memo + useMemo** — `WeeksGrid` (4680 cells) and `TimerGrid` are memoized to avoid
  re-renders on every timer tick.

- **No business logic in screens** — screens only call hooks and render. This makes
  them easy to redesign without touching logic.

## Install & Run

```bash
npx create-expo-app LifeTimer --template blank-typescript
cp -r lifetimer/* LifeTimer/

cd LifeTimer
npx expo install zustand @react-native-async-storage/async-storage \
  expo-router react-native-reanimated expo-status-bar

npx expo start
```

## Tests

```bash
npx jest src/utils/__tests__
```

## Extending to Premium Features

| Feature             | Where to add                                      |
|---------------------|---------------------------------------------------|
| AI life insights    | New util `utils/aiInsights.ts` + API hook         |
| Goals system        | New store slice `store/useGoalsStore.ts`          |
| Habit tracking      | New screen `app/habits/` + store slice            |
| Subscriptions       | `store/useSubscriptionStore.ts` + RevenueCat SDK  |
| Push notifications  | `utils/notifications.ts` + expo-notifications     |
| i18n                | `constants/i18n/` + i18next                       |
