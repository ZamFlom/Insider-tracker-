import { NextRequest, NextResponse } from "next/server";
import { readJson } from "../../../../lib/store";
import { adminAuth } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const submissions = readJson<Record<string, unknown>[]>("submissions.json", []);
  return NextResponse.json({ count: submissions.length, submissions: submissions.filter((s) => s.status === "pending") });
}
