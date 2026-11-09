import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "../../../../lib/store";
import { adminAuth } from "../../../../lib/auth";

// Approve / reject a submission by its index in submissions.json.
// Approving marks it approved for curation — it does NOT auto-publish to the
// live clusters list. A curator must still verify the Form 4 filing and add
// the cluster to src/data/clusters.json. This is deliberate: it stops fake entries.
export async function POST(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const index = Number(body.index);
  const decision = String(body.decision || "");
  if (!Number.isInteger(index) || !["approved", "rejected"].includes(decision)) {
    return NextResponse.json({ error: "Send { index, decision: 'approved' | 'rejected' }." }, { status: 400 });
  }
  const submissions = readJson<Record<string, unknown>[]>("submissions.json", []);
  if (!submissions[index]) return NextResponse.json({ error: "No submission at that index." }, { status: 404 });
  submissions[index] = { ...submissions[index], status: decision, reviewedAt: new Date().toISOString() };
  writeJson("submissions.json", submissions);
  return NextResponse.json({
    ok: true,
    submission: submissions[index],
    note: decision === "approved"
      ? "Approved for curation. It is NOT live yet — verify the Form 4 filing and add the cluster to src/data/clusters.json, then redeploy."
      : "Rejected. It will not be published.",
  });
}
