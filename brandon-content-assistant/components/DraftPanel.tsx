import type { Article, GeneratedPost } from "@/types";

type DraftPanelProps = {
  article: Article | null;
  draft: GeneratedPost | null;
  error: string | null;
  isLoading: boolean;
  copied: boolean;
  postText: string;
  onCopy: () => void;
};

export default function DraftPanel({
  article,
  draft,
  error,
  isLoading,
  copied,
  postText,
  onCopy,
}: DraftPanelProps) {
  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <div className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_45px_rgba(31,41,55,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent">Draft</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Facebook Draft</h2>
          </div>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent-strong"
          >
            Open Facebook
          </a>
        </div>

        {!article ? (
          <div className="mt-6 rounded-[22px] border border-dashed border-border bg-background p-5 text-sm leading-6 text-muted">
            Select an article to generate a draft. This workflow is review-and-copy only, so Brandon can check the draft before posting.
          </div>
        ) : null}

        {article ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-[22px] border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Selected article</p>
              <h3 className="mt-2 text-lg font-semibold leading-7 text-foreground">{article.title}</h3>
              <p className="mt-2 text-sm text-muted">{article.source}</p>
              <div className="mt-4 flex flex-wrap gap-3">
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

            {isLoading ? (
              <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-sm text-muted">
                Generating Facebook draft...
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : null}

            {draft ? (
              <div className="space-y-4">
                <section className="rounded-[22px] border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Hook</p>
                  <p className="mt-2 text-base leading-7 text-foreground">{draft.hook}</p>
                </section>

                <section className="rounded-[22px] border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Summary</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{draft.summary}</p>
                </section>

                <section className="rounded-[22px] border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Caption</p>
                  <div className="mt-2 rounded-2xl border border-border bg-card p-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
                    {draft.caption}
                  </div>
                </section>

                <section className="rounded-[22px] border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Hashtags</p>
                  <p className="mt-2 text-sm leading-7 text-foreground">{draft.hashtags.join(" ")}</p>
                </section>

                <section className="rounded-[22px] border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Full post</p>
                  <div className="mt-2 rounded-2xl border border-border bg-card p-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
                    {postText}
                  </div>
                </section>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="inline-flex items-center justify-center rounded-full bg-accent-strong px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
                  >
                    {copied ? "Copied" : "Copy Post"}
                  </button>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent-strong"
                  >
                    Open Facebook
                  </a>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent-strong"
                  >
                    Open Article
                  </a>
                </div>

                <p className="rounded-[22px] border border-border bg-background px-4 py-3 text-sm leading-6 text-muted">
                  Review the draft, confirm the facts in the source article, and post manually. This MVP does not auto-post to Facebook.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}