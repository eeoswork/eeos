export type Article = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  snippet: string;
  url: string;
  image?: string;
};

export type GeneratedPost = {
  hook: string;
  summary: string;
  caption: string;
  hashtags: string[];
};