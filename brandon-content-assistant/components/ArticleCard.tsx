import type { KeyboardEvent, MouseEvent } from "react";
import type { Article } from "@/types";

type ArticleCardProps = {
  article: Article;
  onCreatePost: (article: Article) => void;
  isGenerating?: boolean;
  disableCreate?: boolean;
  isSelected?: boolean;
};

function formatRelativeTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function ArticleCard({
  article,
  onCreatePost,
  isGenerating = false,
  disableCreate = false,
  isSelected = false,
}: ArticleCardProps) {
  function activateFromCard() {
    if (!disableCreate) {
      onCreatePost(article);
    }
  }

  function handleRowClick(event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a")) return;
    activateFromCard();
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateFromCard();
  }

  return (
    <article
      className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-background/70 ${
        isSelected ? "bg-accent/5" : ""
      }`}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Create Instagram post for ${article.title}`}
    >
      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {article.title}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {article.source} · {formatRelativeTime(article.publishedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 pl-2">
        {isGenerating ? (
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-strong">
            Drafting…
          </span>
        ) : (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isSelected
                ? "bg-accent-strong text-white"
                : "bg-accent/10 text-accent-strong hover:bg-accent-strong hover:text-white"
            } transition-colors`}
          >
            {isSelected ? "Selected" : "Create"}
          </span>
        )}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted transition-colors hover:text-foreground"
          aria-label="Open article"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
            <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
          </svg>
        </a>
      </div>
    </article>
  );
}