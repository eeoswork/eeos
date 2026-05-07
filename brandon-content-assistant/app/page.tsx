import AssistantDashboard from "@/components/AssistantDashboard";
import { getLatestArticles } from "@/lib/articles";
import type { Article } from "@/types";

const ARTICLE_ERROR = "Couldn’t load articles right now. Try refreshing in a minute.";

export default async function Home() {
  let initialArticles: Article[] = [];
  let initialError: string | null = ARTICLE_ERROR;

  try {
    initialArticles = await getLatestArticles(15);
    initialError = null;
  } catch {
    initialArticles = [];
  }

  return <AssistantDashboard initialArticles={initialArticles} initialError={initialError} />;
}
