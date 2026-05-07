"use client";

import { useMemo, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import DraftPanel from "@/components/DraftPanel";
import type { Article, GeneratedPost } from "@/types";

const ARTICLE_ERROR = "Couldn’t load articles right now. Try refreshing in a minute.";
const GENERATION_ERROR = "Couldn’t generate a post for this article. Try another article or refresh.";

type AssistantDashboardProps = {
  initialArticles: Article[];
  initialError: string | null;
};

export default function AssistantDashboard({
  initialArticles,
  initialError,
}: AssistantDashboardProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(initialError);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [draft, setDraft] = useState<GeneratedPost | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [generatingArticleId, setGeneratingArticleId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadArticles() {
    setArticlesLoading(true);
    setArticlesError(null);

    try {
      const response = await fetch("/api/articles", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(ARTICLE_ERROR);
      }

      const data = (await response.json()) as Article[];
      setArticles(data);

      if (data.length === 0) {
        setSelectedArticle(null);
        setDraft(null);
      } else {
        setSelectedArticle((current) =>
          current ? data.find((article) => article.id === current.id) ?? null : current,
        );
      }
    } catch {
      setArticlesError(ARTICLE_ERROR);
    } finally {
      setArticlesLoading(false);
    }
  }

  async function handleCreatePost(article: Article) {
    setSelectedArticle(article);
    setDraft(null);
    setDraftError(null);
    setCopied(false);
    setGeneratingArticleId(article.id);

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ article }),
      });

      if (!response.ok) {
        throw new Error(GENERATION_ERROR);
      }

      const data = (await response.json()) as GeneratedPost;
      setDraft(data);
    } catch {
      setDraftError(GENERATION_ERROR);
    } finally {
      setGeneratingArticleId(null);
    }
  }

  const combinedPost = useMemo(() => {
    if (!draft) {
      return "";
    }

    return `${draft.hook}\n\n${draft.caption}\n\n${draft.hashtags.join(" ")}`;
  }, [draft]);

  async function handleCopyPost() {
    if (!combinedPost) {
      return;
    }

    try {
      await navigator.clipboard.writeText(combinedPost);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setDraftError("Copy failed. You can still select and copy the draft manually.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-[28px] border border-border bg-card px-5 py-6 shadow-[0_18px_45px_rgba(31,41,55,0.06)] sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent">EEOS private workflow</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Brandon Real Estate Content Assistant
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Fresh California real estate articles turned into ready-to-edit Instagram drafts.
              </p>
              <p className="mt-4 max-w-2xl rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-muted">
                Drafts are based on article headlines and previews. Review before posting. This workflow creates a draft only and never auto-posts to Instagram.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => void loadArticles()}
                disabled={articlesLoading}
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {articlesLoading ? "Loading articles..." : "Refresh Articles"}
              </button>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-accent-strong px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
              >
                Open Instagram
              </a>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Latest Articles</h2>
                <p className="mt-1 text-sm text-muted">Los Angeles and California real estate stories pulled from Google News RSS.</p>
              </div>
            </div>

            {articlesLoading ? (
              <div className="rounded-[24px] border border-dashed border-border bg-card p-8 text-sm text-muted">
                Loading articles...
              </div>
            ) : null}

            {articlesError ? (
              <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {articlesError}
              </div>
            ) : null}

            {!articlesLoading && !articlesError && articles.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-card p-8 text-sm text-muted">
                No articles found right now.
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isGenerating={generatingArticleId === article.id}
                  disableCreate={Boolean(generatingArticleId)}
                  onCreatePost={handleCreatePost}
                />
              ))}
            </div>
          </section>

          <DraftPanel
            article={selectedArticle}
            copied={copied}
            draft={draft}
            error={draftError}
            isLoading={Boolean(generatingArticleId)}
            onCopy={handleCopyPost}
            postText={combinedPost}
          />
        </div>
      </div>
    </main>
  );
}