const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";

export interface LifeExpectancyAIInput {
  baseLifeExpectancyYears: number;
  smokes: boolean;
  drinks: boolean;
  sportActivity: "low" | "medium" | "high";
  energyLevel?: number;
  goalsProgress: number;
  habitConsistency: number;
  shortActionsCompletionRate: number;
}

function extractYears(text: string): number | null {
  const match = text.match(/(\d{2,3}(?:\.\d+)?)/);
  if (!match) return null;
  const years = Number(match[1]);
  if (Number.isNaN(years)) return null;
  return Math.min(100, Math.max(40, years));
}

export async function generateLifeExpectancyYearsWithAI(
  input: LifeExpectancyAIInput,
): Promise<number> {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API key.");
  }

  const prompt = `Estimate life expectancy years from profile and behavior.
Rules:
- Return ONLY one number (years), no explanation.
- Keep realistic range 40..100.
- Be conservative; avoid extreme jumps.

Data:
- baseLifeExpectancyYears: ${input.baseLifeExpectancyYears}
- smokes: ${input.smokes}
- drinks: ${input.drinks}
- sportActivity: ${input.sportActivity}
- energyLevel: ${input.energyLevel ?? "unknown"}
- goalsProgress: ${input.goalsProgress}
- habitConsistency: ${input.habitConsistency}
- shortActionsCompletionRate: ${input.shortActionsCompletionRate}`;

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a health-adjusted life expectancy estimator." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content?.trim() ?? "";
  const years = extractYears(content);
  if (years === null) {
    throw new Error("Could not parse life expectancy years.");
  }
  return years;
}
