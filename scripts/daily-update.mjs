#!/usr/bin/env node
/**
 * daily-update.mjs — DAILY UPDATE, NOT YET AUTOMATED.
 *
 * What this is: the documented procedure (and a starter script) for adding
 * new insider cluster buys to src/data/clusters.json every day. It does NOT
 * run automatically on Vercel yet — there is no cron / scheduled job wired
 * up. A human (or a scheduled agent run) runs it, verifies the output, and
 * commits the result. Do not claim the site updates itself until a scheduler
 * is actually connected.
 *
 * Data flow
 * 1. Source: SEC EDGAR Form 4 filings. The authoritative feed is the EDGAR
 *    full-text search / submissions API:
 *      https://www.sec.gov/files/company_tickers.json  (ticker -> CIK map)
 *      https://data.sec.gov/submissions/CIK##########.json  (per-company filings)
 *    and the EDGAR full-text search for Form 4:
 *      https://efts.sec.gov/LATEST/search-index?q=%22Form%204%22&dateRange=custom
 *    Bulk alternative: SEC's daily Form 4 XML index at
 *      https://www.sec.gov/Archives/edgar/daily-index/ (form-4 idx files).
 *    Every cluster in this repo ultimately traces to a Form 4 on EDGAR; the
 *    XOOMAR / InsiderPrint / KeyVex pages cited in clusters.json are
 *    aggregators of the same filings, used here as a cross-check.
 * 2. Filter to open-market purchases only: Form 4 transaction code "P".
 *    Exclude grants (A), option exercises (M), sales (S), gifts (G) and
 *    10b5-1 pre-scheduled trades.
 * 3. Cluster rule: 2+ distinct natural-person officers/directors OR
 *    10% owners buying the same ticker on the open market within 30 days.
 *    Count distinct buyers, not filings — one buyer filing twice is one buyer.
 *    Related entities (a director plus their fund's GP/LP) count as ONE
 *    economic buyer; note the relationship on the cluster page.
 * 4. For each new cluster, add ONE entry to src/data/clusters.json with:
 *    ticker, company, insiderCount, tradeCount, totalValueUsd, latestDate,
 *    window, buyers[{name, role, amountUsd|null}], source, sourceUrl.
 *    Amounts are null unless the source publishes them — never guess.
 * 5. Follow-through (same day you add a cluster, and again when windows close):
 *    - filingClose: close on latestDate (or first trading day after).
 *    - closeNov6-style field: latest available close; record its date.
 *    - plus10Pct / plus30Pct: close on the first trading day on or after
 *      filing date +10 / +30 calendar days. If that date has not arrived
 *      yet, leave the value null and the site shows "not yet elapsed — tracking".
 *    - high90d: highest daily close in the 90 calendar days before filing.
 *    - marketCapUsd: shares outstanding x latest close (or a quoted cap
 *      from Nasdaq/Yahoo, cited). Class: small < $2B, mid $2-10B, large > $10B.
 *    - officerCount: named buyers who are natural-person officers/directors
 *      (CEO, CFO, President, EVP/SVP, Director, Chairman). Fund/10% owner
 *      entities, trustees, portfolio managers and "See remarks" do not count.
 *    - qualifiesSmallCapOfficer: marketCapClass === "small" && officerCount >= 2.
 *    Price source used for this seed set: Yahoo Finance chart API
 *    (query1.finance.yahoo.com/v8/finance/chart/<TICKER>), cross-checked
 *    against Nasdaq historical data. Stooq was unreachable from this VM.
 * 6. Recompute the top-level "followThrough" summary in clusters.json
 *    (up/down vs latest close, median, mean, +10d elapsed/up, +30d elapsed).
 * 7. Verify: `npm run build` must pass, then commit and redeploy.
 *
 * Run (manual, from the repo root):
 *   node scripts/daily-update.mjs --since 2026-11-09
 * Today this script only prints the checklist above and exits — the EDGAR
 * fetch is intentionally NOT implemented as an unattended auto-publish, because
 * a wrong cluster (e.g. a fund's 10% owner counted as 3 buyers) would go live
 * with no human check. Implement step 1-3 as a fetch + candidate list first,
 * review the candidates, then append the verified ones.
 */
const since = process.argv.find((a) => a.startsWith("--since="))?.split("=")[1]
  ?? process.argv[process.argv.indexOf("--since") + 1]
  ?? "today";
console.log("Daily update checklist for", since);
console.log("1. Pull new Form 4 code-P filings from SEC EDGAR (see header).");
console.log("2. Cluster: 2+ distinct buyers, same ticker, within 30 days.");
console.log("3. Add verified clusters to src/data/clusters.json (amounts null unless published).");
console.log("4. Add follow-through prices, market cap, officer count, dip flag per cluster.");
console.log("5. Recompute the top-level followThrough summary.");
console.log("6. Run: npm run build — must pass. Then commit and redeploy.");
console.log("NOT automated on Vercel yet. No cron is connected.");
