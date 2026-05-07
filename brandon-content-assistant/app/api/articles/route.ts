import { getLatestArticles } from "@/lib/articles";

export const runtime = "nodejs";

export async function GET() {
  try {
    const articles = await getLatestArticles(15);
    return Response.json(articles);
  } catch {
    return Response.json(
      { error: "Couldn’t load articles right now. Try refreshing in a minute." },
      { status: 500 },
    );
  }
}