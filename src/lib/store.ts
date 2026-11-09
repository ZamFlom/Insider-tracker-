import fs from "fs";
import path from "path";

// Runtime stores (signups, submissions, searches, clicks).
// On Vercel the filesystem is ephemeral except /tmp, so stores live in /tmp there.
// Locally they live in ./data (gitignored). This is a placeholder until a
// Postgres database is connected — rows here do NOT survive redeploys.
function baseDir(): string {
  if (process.env.VERCEL) {
    const dir = "/tmp/insider-tracker-data";
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function readJson<T>(file: string, fallback: T): T {
  try {
    const p = path.join(baseDir(), file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(file: string, value: unknown): void {
  const p = path.join(baseDir(), file);
  fs.writeFileSync(p, JSON.stringify(value, null, 2));
}

export function appendJson(file: string, row: Record<string, unknown>): void {
  const rows = readJson<Record<string, unknown>[]>(file, []);
  rows.push({ ...row, at: new Date().toISOString() });
  writeJson(file, rows);
}
