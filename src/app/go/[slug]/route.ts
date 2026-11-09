import { NextRequest, NextResponse } from "next/server";
import { appendJson } from "../../../lib/store";

// Sponsor redirect: /go/<slug> logs the click, then redirects.
// Known slugs go to their sponsor URL; anything else goes to /sponsors.
const DESTINATIONS: Record<string, string> = {
  "placeholder-sponsor": "/sponsors",
};

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug.toLowerCase();
  appendJson("clicks.json", { slug });
  const dest = DESTINATIONS[slug] || "/sponsors";
  return NextResponse.redirect(new URL(dest, _req.url), 302);
}
