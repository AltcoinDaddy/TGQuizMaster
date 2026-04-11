import "dotenv/config";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

type Difficulty = "easy" | "medium" | "hard";
type SportCategory =
  | "football"
  | "motorsports"
  | "basketball"
  | "tennis"
  | "combat_sports"
  | "esports";

interface Question {
  category: SportCategory;
  text: string;
  options: string[];
  correct_answer: string;
  difficulty: Difficulty;
  source: "ai";
}

interface BatchResponse {
  questions: Question[];
}

const SPORT_CATEGORIES: SportCategory[] = [
  "football",
  "motorsports",
  "basketball",
  "tennis",
  "combat_sports",
  "esports",
];

const categoryArg = process.argv.find((arg) => arg.startsWith("--category="));
const perCategoryArg = process.argv.find((arg) => arg.startsWith("--per-category="));
const batchSizeArg = process.argv.find((arg) => arg.startsWith("--batch-size="));
const modelArg = process.argv.find((arg) => arg.startsWith("--model="));
const outputDirArg = process.argv.find((arg) => arg.startsWith("--output-dir="));

const selectedCategories = categoryArg
  ? categoryArg
      .split("=")[1]
      .split(",")
      .map((value) => value.trim())
      .filter((value): value is SportCategory => SPORT_CATEGORIES.includes(value as SportCategory))
  : SPORT_CATEGORIES;

const perCategoryTarget = Number(perCategoryArg?.split("=")[1] || process.env.QUESTION_TARGET_PER_CATEGORY || "850");
const batchSize = Number(batchSizeArg?.split("=")[1] || process.env.QUESTION_BATCH_SIZE || "25");
const model = modelArg?.split("=")[1] || process.env.OPENAI_MODEL || "gpt-4o-mini";
const outputDir = outputDirArg?.split("=")[1]
  ? path.resolve(process.cwd(), outputDirArg.split("=")[1])
  : path.resolve(__dirname, "../data/generated");

const openAiApiKey = process.env.OPENAI_API_KEY;

const QUESTION_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          category: {
            type: "string",
            enum: SPORT_CATEGORIES,
          },
          text: {
            type: "string",
            minLength: 12,
          },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "string",
              minLength: 1,
            },
          },
          correct_answer: {
            type: "string",
            minLength: 1,
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
          source: {
            type: "string",
            enum: ["ai"],
          },
        },
        required: ["category", "text", "options", "correct_answer", "difficulty", "source"],
      },
    },
  },
  required: ["questions"],
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readJsonQuestions(filePath: string): Question[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.warn(`[GEN] Skipping unreadable JSON file: ${filePath}`);
    return [];
  }
}

function collectExistingQuestions(dirPath: string) {
  const seen = new Set<string>();
  const byCategory = new Map<SportCategory, number>();

  if (!fs.existsSync(dirPath)) {
    return { seen, byCategory };
  }

  const walk = (currentDir: string) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const resolved = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(resolved);
        continue;
      }

      if (!entry.name.endsWith(".json")) {
        continue;
      }

      const questions = readJsonQuestions(resolved);
      for (const question of questions) {
        if (!SPORT_CATEGORIES.includes(question.category)) {
          continue;
        }

        const key = normalizeText(question.text);
        if (!seen.has(key)) {
          seen.add(key);
          byCategory.set(question.category, (byCategory.get(question.category) || 0) + 1);
        }
      }
    }
  };

  walk(dirPath);
  return { seen, byCategory };
}

function validateQuestion(question: Question, expectedCategory: SportCategory) {
  if (!SPORT_CATEGORIES.includes(question.category)) {
    return { ok: false, reason: "unsupported category" };
  }

  if (question.category !== expectedCategory) {
    return { ok: false, reason: "category mismatch" };
  }

  if (!question.text || question.text.trim().length < 12) {
    return { ok: false, reason: "question text too short" };
  }

  const unstablePattern = /\b(currently|today|now|latest|this season|recently|at present)\b/i;
  if (unstablePattern.test(question.text)) {
    return { ok: false, reason: "question uses unstable wording" };
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) {
    return { ok: false, reason: "must have exactly four options" };
  }

  const trimmedOptions = question.options.map((option) => option.trim()).filter(Boolean);
  if (trimmedOptions.length !== 4) {
    return { ok: false, reason: "options contain empty values" };
  }

  const uniqueOptions = new Set(trimmedOptions.map((option) => option.toLowerCase()));
  if (uniqueOptions.size !== 4) {
    return { ok: false, reason: "options are not unique" };
  }

  if (!trimmedOptions.includes(question.correct_answer.trim())) {
    return { ok: false, reason: "correct answer is not present in options" };
  }

  return {
    ok: true,
    question: {
      category: expectedCategory,
      text: question.text.trim(),
      options: trimmedOptions,
      correct_answer: question.correct_answer.trim(),
      difficulty: question.difficulty,
      source: "ai" as const,
    },
  };
}

async function requestBatch(category: SportCategory, count: number, bannedQuestions: string[]) {
  if (!openAiApiKey) {
    throw new Error("Missing OPENAI_API_KEY in backend/.env");
  }

  const payload = {
    model,
    input: [
      {
        role: "system",
        content:
          "You generate high-quality sports trivia in strict JSON. Use only evergreen facts that do not depend on the current season, current roster, or current standings. Avoid duplicate questions, trick wording, and ambiguous answers. Every question must have exactly four plausible options and exactly one correct answer.",
      },
      {
        role: "user",
        content: [
          `Generate ${count} unique ${category} trivia questions.`,
          "Return JSON only.",
          "Use category, text, options, correct_answer, difficulty, and source fields.",
          'Set source to "ai".',
          "Difficulty should be a balanced mix of easy, medium, and hard.",
          "Do not use relative-time wording like currently, now, this season, latest, or recently.",
          bannedQuestions.length > 0
            ? `Avoid these existing question texts:\n- ${bannedQuestions.join("\n- ")}`
            : "There are no banned examples for this batch.",
        ].join("\n\n"),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "sports_questions_batch",
        schema: QUESTION_RESPONSE_SCHEMA,
        strict: true,
      },
    },
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { output_text?: string };
  if (!data.output_text) {
    throw new Error("OpenAI response did not include output_text");
  }

  return JSON.parse(data.output_text) as BatchResponse;
}

async function generateForCategory(
  category: SportCategory,
  targetCount: number,
  globalSeen: Set<string>
) {
  const outputFile = path.join(outputDir, `generated_${category}.json`);
  const existingOutput = readJsonQuestions(outputFile).filter((question) => question.category === category);
  const generated: Question[] = [...existingOutput];

  for (const question of existingOutput) {
    globalSeen.add(normalizeText(question.text));
  }

  let attempts = 0;
  while (generated.length < targetCount) {
    attempts += 1;
    const remaining = targetCount - generated.length;
    const requestCount = Math.min(batchSize, remaining);
    const bannedQuestions = generated.slice(-15).map((question) => question.text);

    console.log(
      `[GEN] ${category}: requesting ${requestCount} questions (progress ${generated.length}/${targetCount}, attempt ${attempts})`
    );

    const batch = await requestBatch(category, requestCount, bannedQuestions);
    let accepted = 0;

    for (const candidate of batch.questions || []) {
      const result = validateQuestion(candidate, category);
      if (!result.ok || !result.question) {
        continue;
      }

      const dedupeKey = normalizeText(result.question.text);
      if (globalSeen.has(dedupeKey)) {
        continue;
      }

      generated.push(result.question);
      globalSeen.add(dedupeKey);
      accepted += 1;

      if (generated.length >= targetCount) {
        break;
      }
    }

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(generated, null, 2));
    console.log(`[GEN] ${category}: accepted ${accepted}, saved ${generated.length} total to ${outputFile}`);

    if (accepted === 0) {
      throw new Error(`No valid new questions accepted for ${category}. Try a smaller batch size or different model.`);
    }
  }
}

async function main() {
  if (selectedCategories.length === 0) {
    throw new Error(`No valid categories selected. Allowed: ${SPORT_CATEGORIES.join(", ")}`);
  }

  const dataDir = path.resolve(__dirname, "../data");
  const { seen: existingSeen, byCategory } = collectExistingQuestions(dataDir);

  console.log(`[GEN] Existing sports question counts in data directory:`);
  for (const category of SPORT_CATEGORIES) {
    console.log(`  - ${category}: ${byCategory.get(category) || 0}`);
  }

  for (const category of selectedCategories) {
    await generateForCategory(category, perCategoryTarget, existingSeen);
  }

  console.log("[GEN] Question generation complete.");
}

main().catch((error) => {
  console.error("[GEN] Fatal error:", error);
  process.exit(1);
});
