# Insider Cluster Buys Tracker

Companies where 2+ insiders bought on the open market (SEC Form 4, code P) within 30 days.
Weekly newsletter: 5 picks, one line each. Sponsor slot: $50/week.

Live site: set after Vercel deploy (see Vercel project `insider-tracker-`).
Repo: https://github.com/ZamFlom/Insider-tracker-

## What a cluster buy is

2 or more insiders buying the same company's stock on the open market within 30 days.
Open-market purchases only (Form 4 code P). Grants, option exercises and 10b5-1 sales are excluded.
This is educational research, not investment advice.

## Data — read this before trusting a number

- **Seeded Nov 9, 2026. 28 clusters, 98 named insider buyers, $213.2M combined cluster value.**
- **Primary source:** XOOMAR cluster table, SEC EDGAR Form 4 filings, as of Nov 6, 2026 —
  https://staging.xoomar.com/markets/insiders (25 of the 28 clusters).
- **Extra clusters:** HEI from InsiderPrint (https://www.insiderprint.com/cluster-buys);
  LRN and PAM from KeyVex (https://keyvex.com/insiders, updated Nov 9, 2026).
- Every cluster in `src/data/clusters.json` cites its own source and source URL.

## What happened next (follow-through, added Nov 9, 2026)

- For every cluster: filing-date close, Nov 6, 2026 close, % change since filing,
  +10-day and +30-day returns (first trading day on or after filing +10 / +30
  calendar days). **Result to Nov 6: 12 up, 16 down, median −0.48%, mean +1.72%.**
  +10 days: 7 up, 2 down of the 9 clusters whose window had closed. +30 days: none
  had elapsed by Nov 6 (earliest is HEI, Nov 7) — all marked "not yet elapsed".
- Prices: Yahoo Finance chart API, cross-checked against Nasdaq historical data
  (filing and Nov 6 closes agreed to the cent). Stooq was unreachable from this VM.
- This is a tiny sample over days, not months. It is tracking, not a prediction.

## The niche: small-cap, officer-only clusters (added Nov 9, 2026)

- Definition: market cap under $2B (as of Nov 6, 2026) AND at least 2 named buyers
  who are natural-person officers/directors (CEO, CFO, President, EVP/SVP,
  Director, Chairman). Fund/10% owner entities, trustees, portfolio managers and
  "See remarks" buyers do not count.
- **14 of 28 clusters qualify** and are the default home view: BPRE, CHCO, LBRT,
  NPB, NVA, OCFC, RAPP, STC, STRZ, SYNX, TBBK, TRTX, UMH, UPBD.
- Market caps are shares outstanding x Nov 6 close, or a Nasdaq quoted cap, cited
  per cluster. Two are borderline: CHCO ($1.99B, other sources $2.04B) and LBRT
  ($1.95B, Nasdaq quoted $2.004B at the Nov 9 pre-market price) — both flagged
  on their cluster pages. ASPE and BBTX are recent IPOs (first traded Oct 30,
  2026), so no 90-day high exists for them — dip is "unknown", not guessed.
- Dip flag: filing close 20%+ below the 90-day high (highest daily close in the
  90 calendar days before filing). 11 of 28 clusters were bought after a 20%+ dip.
- **Per-buyer amounts are included only where InsiderPrint published them.** Everywhere else
  the amount is null and the site shows "Not broken out in source" — never guessed.
- **Totals differ between trackers.** Different trackers count related entities (e.g. a director
  plus their fund's GP/LP entities) and share classes (HEI vs HEI.A) differently. Examples in
  this data set: ASPE is $68.0M on InsiderPrint vs $53.0M on XOOMAR; BBTX is $58.6M vs $52.6M.
  Each cluster page names its source and notes the discrepancy where it matters. LRN's
  Haggart/Fivespan entities are related filings for one economic buyer; PAM's three buyers
  are members of the same family. Those notes are on the cluster pages.
- Newest filing in this seed set: Nov 6, 2026. The data is a snapshot, not a live feed.
  A live SEC feed is a follow-up job — see `scripts/daily-update.mjs`, which
  documents the EDGAR pull, the code-P filter, the cluster rule and the
  follow-through fields. It is NOT automated on Vercel yet; no cron is connected.

## What works now

- Home page: "What happened next" follow-through summary, default view is the
  14 small-cap officer-only clusters (toggle to all 28), ranked by value /
  insiders / recency / best since filing, search by ticker, company or insider.
- Company page per ticker: `/clusters/RAPP` etc., with buyers, roles, amounts, source link,
  plus follow-through prices, market cap, dip flag and officer count.
- Submit form (`/submit`): saves to a review queue. Nothing auto-publishes.
- Email signup (`/`): validates the address, blocks test/throwaway domains, stores it locally.
- Sponsor bar (closable), sponsor page (`/sponsors`) with honest stats (traffic is new, 0 tracked),
  Get in touch form, and `/go/<sponsor>` redirect that logs clicks.
- Admin APIs (all require `ADMIN_TOKEN`, see below):
  `GET /api/admin/queue`, `POST /api/admin/approve`, `GET /api/admin/stats`,
  `GET /api/admin/searches`, `GET /api/admin/sponsors`.
- SEO: titles, descriptions, Open Graph / Twitter cards, `sitemap.xml`, `robots.txt`, `og.svg`.

## What is still a placeholder (do not mistake for done)

- **Newsletter sending: NOT connected.** Resend is not set up. Signups are stored locally only
  (`/tmp/insider-tracker-data/signups.json` on Vercel, `./data/signups.json` locally). No email
  is sent yet. To go live: connect Resend, verify a domain, add the address to a Resend audience
  in `src/app/api/signup/route.ts`, and send the weekly broadcast from Resend.
- **Database: NOT connected.** There is no Postgres yet. Signups, submissions, searches and
  clicks live in local JSON files that are ephemeral on Vercel and reset on redeploy. The
  `/api/admin/stats` endpoint says this in its response. Connect Vercel Postgres (Marketplace)
  and move `src/lib/store.ts` to it before relying on these counts.
- **Traffic / pageviews: not tracked.** No analytics is connected. The sponsor page says 0.
- **Admin approve does NOT publish.** Approving a submission marks it approved for curation.
  A human must still verify the Form 4 filing and add the cluster to `src/data/clusters.json`.

## Admin token

Set `ADMIN_TOKEN` as a Vercel environment variable (Production + Preview). Never commit it.
Send it as the `x-admin-token` header (or `?token=` query param) to the `/api/admin/*` routes.
If it is not set, admin routes return 503 with that explanation.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Vercel project imports this GitHub repo (main branch). Every push to main redeploys.
Set `ADMIN_TOKEN` in Vercel env vars. Optionally set `NEXT_PUBLIC_SITE_URL` to the
production URL so the sitemap uses the real domain (defaults to the vercel.app URL).
