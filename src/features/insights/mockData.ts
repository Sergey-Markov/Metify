import type { InsightsMockData } from "./types";

export const insightsMockData: InsightsMockData = {
  dailyInsight: {
    label: "Інсайт дня",
    text: "Цього тижня ви на 12% ближче до своєї головної цілі. Ваша стабільність дає накопичувальний ефект.",
    badge: "AI-рефлексія",
  },
  lifeBalance: [
    { id: "sleep", title: "Сон", percent: 29, tone: "soft" },
    { id: "work", title: "Робота", percent: 34, tone: "neutral" },
    { id: "goals", title: "Цілі", percent: 14, tone: "accent" },
    { id: "habits", title: "Звички", percent: 9, tone: "accent" },
    { id: "rest", title: "Відновлення", percent: 8, tone: "soft" },
    { id: "lost-time", title: "Втрачений час", percent: 6, tone: "neutral" },
  ],
  goalsProgress: [
    {
      id: "goal-1",
      title: "Запуск Metify v1",
      progressPercent: 46,
      projectedMessage: "Якщо збережете цей темп, зможете завершити приблизно за 74 дні.",
      insight: "По ключових фічах хороший темп. Важливо втримати той самий ритм.",
    },
    {
      id: "goal-2",
      title: "Покращити ранковий фокус",
      progressPercent: 31,
      projectedMessage: "За поточного темпу прогноз завершення — близько 52 днів.",
      insight: "У дні, коли сон понад 7 годин, ваш фокус відчутно кращий.",
    },
  ],
  habitInsight: {
    streakDays: 6,
    missedDays: 2,
    strongestHabit: "Ранкове планування",
    weakestHabit: "Вечірнє читання",
    recommendation: "Після 3-го дня стабільність зазвичай падає. Зменшіть щоденний обсяг і збережіть ланцюжок.",
  },
  redZoneItems: [
    {
      id: "red-1",
      title: "Пасивний скролінг",
      message: "Цього тижня найбільший витік часу — пасивний скролінг після 21:00.",
    },
    {
      id: "red-2",
      title: "Зсув сну",
      message: "На 4 дні відбій зсунувся пізніше. Навіть невеликий зсув сну впливає на фокус наступного дня.",
    },
  ],
  recommendedActions: [
    {
      id: "action-1",
      title: "Завершіть сьогодні одну 10-хвилинну задачу",
      note: "Оберіть найменшу незакриту задачу та зробіть її до обіду.",
    },
    {
      id: "action-2",
      title: "Спростіть одну звичку до легкої версії",
      note: "Зробіть найслабшу звичку максимально легкою на найближчі 3 дні.",
    },
    {
      id: "action-3",
      title: "Виділіть 20 хвилин на головну ціль",
      note: "Захистіть один фокус-блок до початку вечірніх відволікань.",
    },
  ],
};
