import { NextRequest } from "next/server";

// Admin routes are protected by ADMIN_TOKEN (set as a Vercel env var).
// The token is never hardcoded and never appears in the repo.
export function adminAuth(req: NextRequest): { ok: boolean; error?: string; status?: number } {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return { ok: false, error: "ADMIN_TOKEN is not set. Set it in Vercel project settings (Environment Variables) and redeploy.", status: 503 };
  }
  const supplied = req.headers.get("x-admin-token") || new URL(req.url).searchParams.get("token") || "";
  if (supplied !== token) {
    return { ok: false, error: "Unauthorized: supply the admin token as the x-admin-token header.", status: 401 };
  }
  return { ok: true };
}
