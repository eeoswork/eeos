import "server-only";

import OpenAI from "openai";
import type { Article, GeneratedPost } from "@/types";

const DEFAULT_MODEL = "gpt-4o-mini";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

function normalizeHashtags(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (value.startsWith("#") ? value : `#${value.replace(/^#+/, "")}`))
    .slice(0, 6);
}

function parseGeneratedPost(content: string): GeneratedPost {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("OpenAI returned an invalid payload");
  }

  const record = parsed as Record<string, unknown>;
  const hook = typeof record.hook === "string" ? record.hook.trim() : "";
  const summary = typeof record.summary === "string" ? record.summary.trim() : "";
  const caption = typeof record.caption === "string" ? record.caption.trim() : "";
  const hashtags = normalizeHashtags(record.hashtags);

  if (!hook || !summary || !caption || hashtags.length === 0) {
    throw new Error("OpenAI response was missing required fields");
  }

  return {
    hook,
    summary,
    caption,
    hashtags,
  };
}

export async function generateInstagramDraft(article: Article): Promise<GeneratedPost> {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are helping a California real estate agent create educational Instagram content based on real estate news. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Create a clear, useful Instagram caption based on the article information below.

Important rules:
- Do not pretend you read the full article if only headline/snippet/link are provided.
- Do not exaggerate.
- Do not make unsupported claims.
- Do not give legal, tax, or financial advice.
- Do not sound like an AI.
- Keep the tone conversational, helpful, professional, and local.
- Write for homeowners, buyers, sellers, and real estate followers.
- Include a short line encouraging people to reach out with local real estate questions.
- Include 3-6 relevant hashtags.
- Keep the caption suitable for Instagram.

Return valid JSON only:
{
  "hook": "...",
  "summary": "...",
  "caption": "...",
  "hashtags": ["...", "..."]
}

Article data:
Title:
${article.title}

Source:
${article.source}

Published:
${article.publishedAt}

Snippet:
${article.snippet}

URL:
${article.url}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return parseGeneratedPost(content);
}