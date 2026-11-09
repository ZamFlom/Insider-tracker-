import { NextRequest, NextResponse } from "next/server";
import { appendJson } from "../../../lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const q = String(body.q || "").trim();
  if (!q) return NextResponse.json({ ok: true });
  appendJson("searches.json", { q });
  return NextResponse.json({ ok: true });
}
