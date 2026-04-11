import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  category: string;
  text: string;
  options: string[];
  correct_answer: string;
  difficulty: Difficulty;
  source?: string;
}

const SPORT_CATEGORIES = new Set([
  "football",
  "motorsports",
  "basketball",
  "tennis",
  "combat_sports",
  "esports",
]);

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function walkJsonFiles(dirPath: string, output: string[] = []) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const resolved = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkJsonFiles(resolved, output);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      output.push(resolved);
    }
  }

  return output.sort();
}

async function loadExistingQuestionKeys() {
  const seen = new Set<string>();
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("questions")
      .select("text")
      .range(from, to);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const row of data) {
      if (row.text) {
        seen.add(normalizeText(row.text));
      }
    }

    if (data.length < pageSize) {
      break;
    }

    page += 1;
  }

  return seen;
}

function validateQuestion(question: Question) {
  if (!SPORT_CATEGORIES.has(question.category)) {
    return { ok: false, reason: "non-sports category" };
  }

  if (!question.text || question.text.trim().length < 12) {
    return { ok: false, reason: "question text too short" };
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) {
    return { ok: false, reason: "must have exactly four options" };
  }

  const options = question.options.map((option) => option.trim()).filter(Boolean);
  if (options.length !== 4) {
    return { ok: false, reason: "contains empty options" };
  }

  const uniqueOptions = new Set(options.map((option) => option.toLowerCase()));
  if (uniqueOptions.size !== 4) {
    return { ok: false, reason: "duplicate options" };
  }

  const correctAnswer = question.correct_answer?.trim();
  if (!correctAnswer || !options.includes(correctAnswer)) {
    return { ok: false, reason: "correct answer missing from options" };
  }

  return {
    ok: true,
    question: {
      category: question.category,
      text: question.text.trim(),
      options,
      correct_answer: correctAnswer,
      difficulty: question.difficulty || "medium",
      source: question.source || "local",
    },
  };
}

async function main() {
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    throw new Error(`Directory not found: ${dataDir}`);
  }

  const files = walkJsonFiles(dataDir);
  console.log(`[IMPORT] Found ${files.length} JSON files under ${dataDir}`);

  const existingKeys = await loadExistingQuestionKeys();
  const localSeen = new Set<string>();
  const rowsToInsert: Question[] = [];

  let skippedExisting = 0;
  let skippedLocalDupes = 0;
  let skippedInvalid = 0;

  for (const filePath of files) {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!Array.isArray(raw)) {
      console.warn(`[IMPORT] Skipping non-array file: ${filePath}`);
      continue;
    }

    let acceptedFromFile = 0;
    for (const candidate of raw as Question[]) {
      const result = validateQuestion(candidate);
      if (!result.ok || !result.question) {
        skippedInvalid += 1;
        continue;
      }

      const key = normalizeText(result.question.text);
      if (existingKeys.has(key)) {
        skippedExisting += 1;
        continue;
      }

      if (localSeen.has(key)) {
        skippedLocalDupes += 1;
        continue;
      }

      localSeen.add(key);
      rowsToInsert.push(result.question);
      acceptedFromFile += 1;
    }

    console.log(`[IMPORT] ${path.relative(dataDir, filePath)} -> accepted ${acceptedFromFile}`);
  }

  console.log(`[IMPORT] Prepared ${rowsToInsert.length} new sports questions`);
  console.log(`[IMPORT] Skipped existing=${skippedExisting}, localDuplicates=${skippedLocalDupes}, invalid=${skippedInvalid}`);

  const batchSize = 200;
  for (let index = 0; index < rowsToInsert.length; index += batchSize) {
    const batch = rowsToInsert.slice(index, index + batchSize);
    const { error } = await supabase.from("questions").insert(batch);
    if (error) {
      throw error;
    }
    console.log(`[IMPORT] Inserted batch ${index / batchSize + 1} (${batch.length} rows)`);
  }

  console.log("[IMPORT] Import complete.");
}

main().catch((error) => {
  console.error("[IMPORT] Fatal error:", error);
  process.exit(1);
});
