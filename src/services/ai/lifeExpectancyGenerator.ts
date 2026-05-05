const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE_URL =
  process.env.EXPO_PUBLIC_GEMINI_URL ??
  process.env.GEMINI_URL ??
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MIN_ESTIMATED_YEARS = 40;
const MAX_ESTIMATED_YEARS = 100;
const MAX_TOP_FACTORS = 5;
const DEFAULT_CONFIDENCE = "medium";

export interface LifeExpectancyAIInput {
  baseLifeExpectancyYears: number;
  smokes: boolean;
  drinks: boolean;
  sportActivity: "low" | "medium" | "high";
  energyLevel?: number;
  additionalNotes?: string;
  goalsProgress: number;
  habitConsistency: number;
  shortActionsCompletionRate: number;
  profileSnapshot?: string;
}

export interface LifeExpectancyTopFactor {
  name: string;
  impactYears: number;
}

export interface LifeExpectancyAIResult {
  estimatedYears: number;
  confidence: "low" | "medium" | "high";
  topFactors: LifeExpectancyTopFactor[];
  improvementPotentialDays: number;
}

interface GeminiGenerateContentResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function extractJsonObject(raw: string): string | null {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return raw.slice(firstBrace, lastBrace + 1);
}

function isValidConfidence(value: unknown): value is "low" | "medium" | "high" {
  return value === "low" || value === "medium" || value === "high";
}

function parseTopFactors(value: unknown): LifeExpectancyTopFactor[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is { name?: unknown; impactYears?: unknown } =>
      Boolean(item && typeof item === "object"),
    )
    .map((item) => {
      const rawName = typeof item.name === "string" ? item.name.trim() : "";
      const rawImpact = typeof item.impactYears === "number" ? item.impactYears : 0;
      return {
        name: rawName.length > 0 ? rawName : "unspecified_factor",
        impactYears: Number(rawImpact.toFixed(2)),
      };
    })
    .slice(0, MAX_TOP_FACTORS);
}

function parseLifeExpectancyResult(rawText: string): LifeExpectancyAIResult | null {
  const jsonCandidate = extractJsonObject(rawText);
  if (!jsonCandidate) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonCandidate);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;

  const record = parsed as {
    estimatedYears?: unknown;
    confidence?: unknown;
    topFactors?: unknown;
    improvementPotentialDays?: unknown;
  };
  if (typeof record.estimatedYears !== "number" || Number.isNaN(record.estimatedYears)) {
    return null;
  }

  const estimatedYears = Math.round(clamp(record.estimatedYears, MIN_ESTIMATED_YEARS, MAX_ESTIMATED_YEARS));
  const confidence = isValidConfidence(record.confidence) ? record.confidence : DEFAULT_CONFIDENCE;
  const topFactors = parseTopFactors(record.topFactors);
  const improvementPotentialDays = Math.max(
    0,
    Math.round(typeof record.improvementPotentialDays === "number" ? record.improvementPotentialDays : 0),
  );

  return {
    estimatedYears,
    confidence,
    topFactors,
    improvementPotentialDays,
  };
}

function buildFallbackResult(input: LifeExpectancyAIInput): LifeExpectancyAIResult {
  const activityBonusByLevel: Record<LifeExpectancyAIInput["sportActivity"], number> = {
    low: -2,
    medium: 0,
    high: 3,
  };
  const smokePenalty = input.smokes ? -7 : 0;
  const alcoholPenalty = input.drinks ? -2 : 0;
  const activityDelta = activityBonusByLevel[input.sportActivity];
  const adherenceDelta =
    clamp(input.habitConsistency, 0, 1) * 1.5 + clamp(input.shortActionsCompletionRate, 0, 1) * 1;

  const estimatedYears = Math.round(
    clamp(
      input.baseLifeExpectancyYears + smokePenalty + alcoholPenalty + activityDelta + adherenceDelta,
      MIN_ESTIMATED_YEARS,
      MAX_ESTIMATED_YEARS,
    ),
  );
  const gainYears = Math.max(0, estimatedYears - input.baseLifeExpectancyYears);

  return {
    estimatedYears,
    confidence: "low",
    topFactors: [
      { name: "smoking_status", impactYears: smokePenalty },
      { name: "alcohol_pattern", impactYears: alcoholPenalty },
      { name: "physical_activity", impactYears: activityDelta },
    ],
    improvementPotentialDays: Math.round(gainYears * 365),
  };
}

async function requestLifeExpectancyRaw(input: LifeExpectancyAIInput): Promise<string> {
  const prompt = `Estimate life expectancy from profile and behavior.
Return a valid JSON object ONLY. No markdown, no prose.

JSON schema:
{
  "estimatedYears": number, // clamp to ${MIN_ESTIMATED_YEARS}..${MAX_ESTIMATED_YEARS}
  "confidence": "low" | "medium" | "high",
  "topFactors": [
    { "name": string, "impactYears": number }
  ],
  "improvementPotentialDays": number // integer, >= 0
}

Rules:
- Keep output conservative and realistic.
- Use max ${MAX_TOP_FACTORS} factors sorted by absolute impact descending.
- If uncertain, choose "medium" confidence.

Data:
- baseLifeExpectancyYears: ${input.baseLifeExpectancyYears}
- smokes: ${input.smokes}
- drinks: ${input.drinks}
- sportActivity: ${input.sportActivity}
- energyLevel: ${input.energyLevel ?? "unknown"}
- goalsProgress: ${input.goalsProgress}
- habitConsistency: ${input.habitConsistency}
- shortActionsCompletionRate: ${input.shortActionsCompletionRate}
- additionalNotes: ${input.additionalNotes?.trim() || "none"}
- profileSnapshot: ${input.profileSnapshot?.trim() || "none"}`;

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
              text: `You are a health-adjusted life expectancy estimator.\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

export async function generateLifeExpectancyEstimateWithAI(
  input: LifeExpectancyAIInput,
): Promise<LifeExpectancyAIResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key");
  }

  const rawText = await requestLifeExpectancyRaw(input);
  const parsed = parseLifeExpectancyResult(rawText);
  if (!parsed) {
    throw new Error("Failed to parse AI life expectancy response");
  }
  return parsed;
}

export function generateLifeExpectancyEstimateFallback(
  input: LifeExpectancyAIInput,
): LifeExpectancyAIResult {
  return buildFallbackResult(input);
}

export async function generateLifeExpectancyYearsWithAI(
  input: LifeExpectancyAIInput,
): Promise<number> {
  const estimate = await generateLifeExpectancyEstimateWithAI(input);
  return estimate.estimatedYears;
}
