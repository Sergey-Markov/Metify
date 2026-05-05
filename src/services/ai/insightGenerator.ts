import type { InsightInput } from "../../features/insights/types";

const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE_URL =
  process.env.EXPO_PUBLIC_GEMINI_URL ??
  process.env.GEMINI_URL ??
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SHARED_RULES =
  "Tone: calm, supportive, human. Output: 1-2 short sentences. Avoid fear-based framing.";

async function requestInsight(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key.");
  }

  const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You write concise personal productivity insights.\n${SHARED_RULES}\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: {
      content?: {
        parts?: { text?: string }[];
      };
    }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Empty AI response");
  return text;
}

export function fallbackHeroInsight(input: InsightInput): string {
  if (
    input.shortActionsPlannedToday > 0 &&
    input.shortActionsCompletionRate >= 0.7
  ) {
    return "Ви добре переводите інсайти в конкретні кроки. Продовжуйте цей ритм виконання коротких дій.";
  }
  if (input.goalDelay > 20) {
    return "Ви почали відставати від своїх цілей. Спробуйте трохи скоригувати темп і зменшити розпорошення.";
  }
  if (input.habitConsistency < 0.5) {
    return "Вашим звичкам зараз бракує стабільності. Зменшіть складність дій, щоб легше тримати ритм.";
  }
  return "Ви рухаєтесь у здоровому темпі. Продовжуйте фокусуватися на маленьких щоденних кроках.";
}

export async function generateHeroInsight(
  input: InsightInput,
): Promise<string> {
  return requestInsight(
    `Create a daily hero insight.\nData:\n- goalProgress: ${input.goalProgress}%\n- expectedProgress: ${input.expectedProgress}%\n- goalDelay: ${input.goalDelay}\n- habitConsistency: ${input.habitConsistency}\n- missedHabits: ${input.missedHabits}\n- lifeRemainingDays: ${input.lifeRemainingDays}\n- activityScore: ${input.activityScore}\n- shortActionsPlannedToday: ${input.shortActionsPlannedToday}\n- shortActionsDoneToday: ${input.shortActionsDoneToday}\n- shortActionsCompletionRate: ${input.shortActionsCompletionRate}`,
  );
}

export async function generateGoalInsight(
  input: InsightInput,
): Promise<string> {
  return requestInsight(
    `Generate a concise goals insight.\nData:\n- goalProgress: ${input.goalProgress}%\n- expectedProgress: ${input.expectedProgress}%\n- goalDelay: ${input.goalDelay}`,
  );
}

export async function generateHabitInsight(
  input: InsightInput,
): Promise<string> {
  return requestInsight(
    `Generate a concise habits behavior insight.\nData:\n- habitConsistency: ${input.habitConsistency}\n- missedHabits: ${input.missedHabits}\n- activityScore: ${input.activityScore}\n- shortActionsCompletionRate: ${input.shortActionsCompletionRate}`,
  );
}

export async function generateRedZone(input: InsightInput): Promise<string[]> {
  const text = await requestInsight(
    `Generate 2 short red-zone observations as separate lines.\nData:\n- goalDelay: ${input.goalDelay}\n- habitConsistency: ${input.habitConsistency}\n- missedHabits: ${input.missedHabits}\n- activityScore: ${input.activityScore}\n- shortActionsCompletionRate: ${input.shortActionsCompletionRate}`,
  );
  return text
    .split("\n")
    .map((line) => line.replace(/^[\-\d\.\)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 2);
}

export async function generateRecommendations(
  input: InsightInput,
): Promise<string[]> {
  const text = await requestInsight(
    `Generate 3 executable recommendations as separate lines.\nData:\n- goalDelay: ${input.goalDelay}\n- habitConsistency: ${input.habitConsistency}\n- missedHabits: ${input.missedHabits}\n- activityScore: ${input.activityScore}\n- shortActionsCompletionRate: ${input.shortActionsCompletionRate}\n- energyLevel: ${input.energyLevel ?? "unknown"}`,
  );
  return text
    .split("\n")
    .map((line) => line.replace(/^[\-\d\.\)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function fallbackRedZone(input: InsightInput): string[] {
  const items: string[] = [];
  if (input.goalDelay > 20) {
    items.push(
      "Цього тижня найслабша зона — відставання від запланованого темпу цілей.",
    );
  }
  if (input.habitConsistency < 0.5) {
    items.push("Низька стабільність звичок зменшує накопичувальний прогрес.");
  }
  if (
    input.shortActionsPlannedToday > 0 &&
    input.shortActionsCompletionRate < 0.4
  ) {
    items.push(
      "Короткі дії часто залишаються незавершеними, тому інсайти не переходять у результат.",
    );
  }
  if (items.length === 0) {
    items.push(
      "Критичних зон зараз небагато, але важливо утримувати регулярність.",
    );
  }
  return items.slice(0, 2);
}

export function fallbackRecommendations(input: InsightInput): string[] {
  const result: string[] = [];
  if (input.goalDelay > 20)
    result.push(
      "Завершіть сьогодні одну важливу 10-хвилинну задачу по головній цілі.",
    );
  if (input.habitConsistency < 0.5)
    result.push(
      "Спростіть найскладнішу звичку до мінімальної версії на 3 дні.",
    );
  if (input.activityScore < 40)
    result.push("Виділіть один короткий фокус-блок у застосунку до вечора.");
  if (
    input.shortActionsPlannedToday > 0 &&
    input.shortActionsCompletionRate < 0.6
  ) {
    result.push(
      "Закрийте хоча б одну додану коротку дію до кінця дня, щоб закріпити імпульс.",
    );
  }
  if (!result.length)
    result.push(
      "Продовжуйте поточний ритм і закріпіть один маленький виграш сьогодні.",
    );
  return result.slice(0, 3);
}
