import { NextRequest, NextResponse } from "next/server";
import { appendJson } from "../../../lib/store";

const BLOCKED = ["example.com", "test.com", "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const domain = email.split("@")[1] || "";
  if (BLOCKED.includes(domain) || domain.endsWith(".test") || domain.endsWith(".example")) {
    return NextResponse.json({ error: "That looks like a test or throwaway address. Please use a real email." }, { status: 400 });
  }
  appendJson("signups.json", { email });
  // NOTE: Resend is NOT connected yet. Signups are stored locally only (see README).
  // Once Resend is connected, this route should also add the address to the Resend audience.
  return NextResponse.json({ message: "You're on the list. The first weekly email goes out once the newsletter is live — check back here for the send date." });
}
