import { NextRequest, NextResponse } from "next/server";
import { readJson } from "../../../../lib/store";
import { adminAuth } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const clicks = readJson<Record<string, unknown>[]>("clicks.json", []);
  const bySponsor: Record<string, number> = {};
  for (const c of clicks) bySponsor[String(c.slug || "")] = (bySponsor[String(c.slug || "")] || 0) + 1;
  return NextResponse.json({
    pricePerWeekUsd: 50,
    currentSponsors: [],
    availableSlots: [{ slug: "placeholder-sponsor", name: "Sponsor slot — your company here", pricePerWeekUsd: 50 }],
    clicksBySponsor: bySponsor,
    totalClicks: clicks.length,
    note: "No paying sponsor yet. The placeholder slot links to /sponsors.",
  });
}
