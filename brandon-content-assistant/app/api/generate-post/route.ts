import { generateFacebookDraft } from "@/lib/openai";
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
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it to .env.local, then restart the dev server.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { article?: unknown };

    if (!isArticle(body.article)) {
      return Response.json({ error: "Invalid article payload." }, { status: 400 });
    }

    const draft = await generateFacebookDraft(body.article);
    return Response.json(draft);
  } catch (error) {
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return Response.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it to .env.local, then restart the dev server.",
        },
        { status: 500 },
      );
    }

    if (
      error instanceof Error &&
      /(incorrect api key|invalid api key|authentication|401)/i.test(error.message)
    ) {
      return Response.json(
        {
          error:
            "OpenAI authentication failed. Check OPENAI_API_KEY in .env.local and restart the dev server.",
        },
        { status: 500 },
      );
    }

    return Response.json(
      { error: "Couldn’t generate a post for this article. Try another article or refresh." },
      { status: 500 },
    );
  }
}