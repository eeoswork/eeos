/* eslint-disable @next/next/no-img-element */

import type { Article } from "@/types";

type ArticleCardProps = {
  article: Article;
  onCreatePost: (article: Article) => void;
  isGenerating?: boolean;
  disableCreate?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return dateFormatter.format(date);
}

export default function ArticleCard({
  article,
  onCreatePost,
  isGenerating = false,
  disableCreate = false,
}: ArticleCardProps) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_16px_35px_rgba(31,41,55,0.05)]">
      <div className="relative aspect-[16/9] border-b border-border bg-[#edf1f4]">
        {article.image ? (
          <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted">
            No image available
          </div>
        )}
      </div>

      <div className="flex h-full flex-col p-5">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{article.source}</span>
            <span className="text-border">•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          <h3 className="mt-3 text-xl font-semibold leading-8 tracking-tight text-foreground">{article.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{article.snippet}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onCreatePost(article)}
            disabled={disableCreate}
            className="inline-flex items-center justify-center rounded-full bg-accent-strong px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating Instagram draft..." : "Create Instagram Post"}
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent-strong"
          >
            Open Article
          </a>
        </div>
      </div>
    </article>
  );
}