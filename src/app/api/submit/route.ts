import { NextRequest, NextResponse } from "next/server";
import { appendJson } from "../../../lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ticker = String(body.ticker || "").trim().toUpperCase();
  if (!ticker || ticker.length > 10) {
    return NextResponse.json({ error: "Please enter a ticker." }, { status: 400 });
  }
  appendJson("submissions.json", {
    ticker,
    company: String(body.company || ""),
    insider: String(body.insider || ""),
    notes: String(body.notes || ""),
    email: String(body.email || ""),
    name: String(body.name || ""),
    status: "pending",
  });
  return NextResponse.json({ message: "Thanks — it's in the review queue. We check every submission against the SEC Form 4 filing before anything is published." });
}
