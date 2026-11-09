import { NextRequest, NextResponse } from "next/server";
import { readJson } from "../../../../lib/store";
import { adminAuth } from "../../../../lib/auth";
import { CLUSTERS } from "../../../../lib/data";

export async function GET(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const signups = readJson<unknown[]>("signups.json", []);
  const submissions = readJson<Record<string, unknown>[]>("submissions.json", []);
  const searches = readJson<unknown[]>("searches.json", []);
  const clicks = readJson<unknown[]>("clicks.json", []);
  return NextResponse.json({
    asOf: new Date().toISOString(),
    clusters: CLUSTERS.length,
    totalClusterValueUsd: CLUSTERS.reduce((s, c) => s + c.totalValueUsd, 0),
    signups: signups.length,
    submissionsPending: submissions.filter((s) => s.status === "pending").length,
    submissionsTotal: submissions.length,
    searchesLogged: searches.length,
    sponsorClicks: clicks.length,
    pageviews: "not tracked yet — no analytics connected",
    note: "Counts are from this site's own local stores only. Signups, submissions, searches and clicks are stored ephemerally on Vercel (/tmp) until Postgres is connected, so they can reset on redeploy. Do not treat them as permanent.",
  });
}
