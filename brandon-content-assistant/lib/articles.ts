import "server-only";

import * as cheerio from "cheerio";
import Parser from "rss-parser";
import type { Article } from "@/types";

const RSS_FEED_URL =
  "https://news.google.com/rss/search?q=los+angeles+real+estate&hl=en-US&gl=US&ceid=US:en";
const parser = new Parser();

type ParserItem = Parser.Item & {
  source?: unknown;
  enclosure?: {
    url?: string;
  };
};

export function stripHtml(input?: string): string {
  if (!input) {
    return "";
  }

  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength - 1).trimEnd()}…`;
}

function readSourceValue(source: unknown): string | undefined {
  if (!source) {
    return undefined;
  }

  if (typeof source === "string") {
    return stripHtml(source);
  }

  if (typeof source === "object") {
    const record = source as Record<string, unknown>;
    const candidates = [record.title, record.name, record._, record["#text"]];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return stripHtml(candidate);
      }
    }
  }

  return undefined;
}

function hostnameLabel(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return undefined;
  }
}

function extractSource(item: ParserItem, url: string): string {
  const explicitSource = readSourceValue(item.source);
  if (explicitSource) {
    return explicitSource;
  }

  const title = item.title?.trim();
  if (title && title.includes(" - ")) {
    const parts = title.split(" - ");
    const trailing = parts.at(-1)?.trim();
    if (trailing && trailing.length < 80) {
      return trailing;
    }
  }

  return hostnameLabel(url) ?? "Unknown source";
}

function imageFromUnknown(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const candidate = imageFromUnknown(entry);
      if (candidate) {
        return candidate;
      }
    }
    return undefined;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const attributes =
      record.$ && typeof record.$ === "object" ? (record.$ as Record<string, unknown>) : undefined;
    const direct = [record.url, record.href, record.content, attributes?.url];
    for (const candidate of direct) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }
  }

  return undefined;
}

function getRssImage(item: ParserItem): string | undefined {
  const record = item as Record<string, unknown>;
  const candidates = [
    item.enclosure?.url,
    record["media:content"],
    record["media:thumbnail"],
    record.mediaContent,
    record.mediaThumbnail,
    record.thumbnail,
  ];

  for (const candidate of candidates) {
    const image = imageFromUnknown(candidate);
    if (image) {
      return image;
    }
  }

  return undefined;
}

export async function fetchArticleImage(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogImage =
      $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("content");

    if (!ogImage) {
      return undefined;
    }

    return new URL(ogImage, url).toString();
  } catch {
    return undefined;
  }
}

export async function getLatestArticles(limit = 15): Promise<Article[]> {
  const response = await fetch(RSS_FEED_URL, {
    next: { revalidate: 900 },
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error("RSS request failed");
  }

  const xml = await response.text();
  const feed = await parser.parseString(xml);
  const items = (feed.items ?? []).slice(0, limit) as ParserItem[];

  const articleResults: Array<Article | null> = await Promise.all(
    items.map(async (item) => {
      const url = item.link?.trim();
      if (!url) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const snippet = truncate(
        stripHtml(item.contentSnippet || item.content || item.summary || String(record["content:encoded"] || "")),
        220,
      );
      const rssImage = getRssImage(item);
      const image = (await fetchArticleImage(url)) ?? rssImage;
      const title = stripHtml(item.title || "Untitled article");

      return {
        id: Buffer.from(url).toString("base64url"),
        title,
        source: extractSource(item, url),
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        snippet: snippet || "No preview available.",
        url,
        image,
      } satisfies Article;
    }),
  );

  return articleResults.filter((article): article is Article => article !== null);
}