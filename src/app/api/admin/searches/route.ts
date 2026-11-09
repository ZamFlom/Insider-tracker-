import { NextRequest, NextResponse } from "next/server";
import { readJson } from "../../../../lib/store";
import { adminAuth } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const searches = readJson<Record<string, unknown>[]>("searches.json", []);
  const counts: Record<string, number> = {};
  for (const s of searches) counts[String(s.q || "")] = (counts[String(s.q || "")] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([q, count]) => ({ q, count }));
  return NextResponse.json({ total: searches.length, top, recent: searches.slice(-50).reverse() });
}
