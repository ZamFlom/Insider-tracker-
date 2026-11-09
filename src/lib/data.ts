import clustersData from "../data/clusters.json";

export type Buyer = { name: string; role: string; amountUsd: number | null };
export type FollowThrough = {
  filingClose: number | null;
  filingCloseDate: string;
  closeNov6: number | null;
  closeNov6Date: string;
  pctChangeToNov6: number | null;
  plus10Date: string | null;
  plus10Close: number | null;
  plus10Pct: number | null;
  plus30Date: string | null;
  plus30Close: number | null;
  plus30Pct: number | null;
  followThroughAsOf: string;
  priceSource: string;
};

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
  followThrough: FollowThrough;
  high90d: number | null;
  pctDownFrom90dHigh: number | null;
  dip20pct: boolean | null;
  marketCapUsd: number | null;
  marketCapClass: "small" | "mid" | "large" | "unknown";
  marketCapSource: string;
  marketCapAsOf: string;
  marketCapNote: string;
  officerCount: number;
  officerNames: string[];
  qualifiesSmallCapOfficer: boolean;
  priceNotes: string;
};

export const CLUSTERS: Cluster[] = (clustersData as any).clusters;
export const DATA_AS_OF = (clustersData as any).asOf as string;
export const DATA_NEWEST_FILING = (clustersData as any).newestFiling as string;
export const DEFINITION = (clustersData as any).definition as string;
export const FOLLOW_THROUGH = (clustersData as any).followThrough as {
  asOf: string; up: number; down: number; medianPct: number; meanPct: number;
  best: { ticker: string; pct: number }; worst: { ticker: string; pct: number };
  plus10Elapsed: number; plus10Up: number; plus10Down: number;
  plus30Elapsed: number; plus30Note: string; note: string;
};
export const FILTERED_VIEW = (clustersData as any).filteredView as {
  name: string; definition: string; qualifyingTickers: string[];
};
export const FILTERED_CLUSTERS: Cluster[] = CLUSTERS.filter((c) => c.qualifiesSmallCapOfficer);

export function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function formatCap(n: number | null | undefined): string {
  if (n === null || n === undefined) return "unknown";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  return `$${Math.round(n / 1_000_000)}M`;
}

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
