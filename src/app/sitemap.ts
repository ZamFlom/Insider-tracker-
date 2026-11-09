import { MetadataRoute } from "next";
import { CLUSTERS } from "../lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://insider-tracker-.vercel.app";
  return [
    { url: `${base}/`, lastModified: new Date("2026-11-09"), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/submit`, lastModified: new Date("2026-11-09"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/sponsors`, lastModified: new Date("2026-11-09"), changeFrequency: "monthly", priority: 0.6 },
    ...CLUSTERS.map((c) => ({
      url: `${base}/clusters/${c.ticker}`,
      lastModified: new Date(c.latestDate),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
