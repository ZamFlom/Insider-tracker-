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
- **Per-buyer amounts are included only where InsiderPrint published them.** Everywhere else
  the amount is null and the site shows "Not broken out in source" — never guessed.
- **Totals differ between trackers.** Different trackers count related entities (e.g. a director
  plus their fund's GP/LP entities) and share classes (HEI vs HEI.A) differently. Examples in
  this data set: ASPE is $68.0M on InsiderPrint vs $53.0M on XOOMAR; BBTX is $58.6M vs $52.6M.
  Each cluster page names its source and notes the discrepancy where it matters. LRN's
  Haggart/Fivespan entities are related filings for one economic buyer; PAM's three buyers
  are members of the same family. Those notes are on the cluster pages.
- Newest filing in this seed set: Nov 6, 2026. The data is a snapshot, not a live feed.
  A live SEC feed is a follow-up job.

## What works now

- Home page: clusters ranked by value / insiders / recency, search by ticker, company or insider.
- Company page per ticker: `/clusters/RAPP` etc., with buyers, roles, amounts, source link.
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
