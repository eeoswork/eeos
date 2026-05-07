import { generateInstagramDraft } from "@/lib/openai";
import type { Article } from "@/types";

export const runtime = "nodejs";

function isArticle(value: unknown): value is Article {
  if (!value || typeof value !== "object") {
    return false;
  }

  const article = value as Record<string, unknown>;
  return [article.id, article.title, article.source, article.publishedAt, article.snippet, article.url].every(
    (field) => typeof field === "string" && field.trim().length > 0,
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { article?: unknown };

    if (!isArticle(body.article)) {
      return Response.json({ error: "Invalid article payload." }, { status: 400 });
    }

    const draft = await generateInstagramDraft(body.article);
    return Response.json(draft);
  } catch {
    return Response.json(
      { error: "Couldn’t generate a post for this article. Try another article or refresh." },
      { status: 500 },
    );
  }
}