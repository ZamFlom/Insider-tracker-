import clustersData from "../data/clusters.json";

export type Buyer = { name: string; role: string; amountUsd: number | null };
export type Cluster = {
  ticker: string;
  company: string;
  insiderCount: number;
  tradeCount: number | null;
  totalValueUsd: number;
  latestDate: string;
  window: string;
  buyers: Buyer[];
  source: string;
  sourceUrl: string;
  note?: string;
};

export const CLUSTERS: Cluster[] = (clustersData as any).clusters;
export const DATA_AS_OF = (clustersData as any).asOf as string;
export const DATA_NEWEST_FILING = (clustersData as any).newestFiling as string;
export const DEFINITION = (clustersData as any).definition as string;

export function getCluster(ticker: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.ticker.toLowerCase() === ticker.toLowerCase());
}

export function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
