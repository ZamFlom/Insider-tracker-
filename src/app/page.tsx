"use client";
import { useMemo, useState } from "react";
import {
  CLUSTERS,
  DATA_AS_OF,
  DEFINITION,
  FILTERED_CLUSTERS,
  FILTERED_VIEW,
  FOLLOW_THROUGH,
  formatCap,
  formatDate,
  formatMoney,
  formatPct,
} from "../lib/data";

export default function Home() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"value" | "insiders" | "recent" | "follow">("value");
  const [view, setView] = useState<"filtered" | "all">("filtered");
  const [email, setEmail] = useState("");
  const [signupMsg, setSignupMsg] = useState("");

  const base = view === "filtered" ? FILTERED_CLUSTERS : CLUSTERS;

  const ranked = useMemo(() => {
    const list = [...base].sort((a, b) => {
      if (sort === "insiders") return b.insiderCount - a.insiderCount || b.totalValueUsd - a.totalValueUsd;
      if (sort === "recent") return b.latestDate.localeCompare(a.latestDate);
      if (sort === "follow")
        return (b.followThrough.pctChangeToNov9 ?? -999) - (a.followThrough.pctChangeToNov9 ?? -999);
      return b.totalValueUsd - a.totalValueUsd;
    });
    const query = q.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.ticker.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.buyers.some((b) => b.name.toLowerCase().includes(query))
    );
  }, [q, sort, base]);

  async function logSearch(query: string) {
    if (!query.trim()) return;
    try {
      await fetch("/api/searches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: query }) });
    } catch { /* search logging is best-effort */ }
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    setSignupMsg("");
    const res = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    setSignupMsg(data.message || data.error || "Done.");
    if (res.ok) setEmail("");
  }

  const totalValue = CLUSTERS.reduce((s, c) => s + c.totalValueUsd, 0);
  const totalBuyers = CLUSTERS.reduce((s, c) => s + c.insiderCount, 0);

  return (
    <>
      <h1>Insider cluster buys, this week</h1>
      <p>{DEFINITION}</p>
      <p className="muted">
        {CLUSTERS.length} clusters · {totalBuyers} insiders buying · {formatMoney(totalValue)} combined ·
        data as of {DATA_AS_OF}, newest filing Nov 10, 2026. Sources: XOOMAR, InsiderPrint and KeyVex — each cluster links its source.
      </p>

      <h2>What happened next</h2>
      <p>
        Since the filing, to the Nov 9, 2026 close: <strong>{FOLLOW_THROUGH.up} up, {FOLLOW_THROUGH.down} down</strong> out
        of {CLUSTERS.length}. Median {formatPct(FOLLOW_THROUGH.medianPct)}, mean {formatPct(FOLLOW_THROUGH.meanPct)}.
        Best so far {FOLLOW_THROUGH.best.ticker} {formatPct(FOLLOW_THROUGH.best.pct)}, worst {FOLLOW_THROUGH.worst.ticker} {formatPct(FOLLOW_THROUGH.worst.pct)}.
      </p>
      <p>
        +10 days after filing: <strong>{FOLLOW_THROUGH.plus10Up} up, {FOLLOW_THROUGH.plus10Down} down</strong> of{" "}
        {FOLLOW_THROUGH.plus10Elapsed} clusters whose 10-day window had closed by Nov 9. +30 days:{" "}
        <strong>{FOLLOW_THROUGH.plus30Elapsed} elapsed</strong> — {FOLLOW_THROUGH.plus30Note}
      </p>
      <p className="muted">{FOLLOW_THROUGH.note} Prices: Yahoo Finance chart API, cross-checked against Nasdaq historical data. Follow-through is measured from the filing-date close to the Nov 9 close, and from the filing-date close to the first trading day on or after filing +10 / +30 calendar days.</p>

      <h2>{FILTERED_VIEW.name}</h2>
      <p>{FILTERED_VIEW.definition}</p>
      <p className="muted">
        {FILTERED_CLUSTERS.length} of {CLUSTERS.length} clusters qualify. This is the default view because it is the
        one thing here OpenInsider does not give you in one place. The full list is still below the toggle.
      </p>

      <div>
        <button type="button" onClick={() => setView("filtered")} aria-pressed={view === "filtered"}>
          Small-cap, officer-only ({FILTERED_CLUSTERS.length})
        </button>{" "}
        <button type="button" onClick={() => setView("all")} aria-pressed={view === "all"}>
          All clusters ({CLUSTERS.length})
        </button>
      </div>

      <label htmlFor="search">Search by ticker, company, or insider</label>
      <input
        id="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => logSearch(q)}
        placeholder="Try RAPP, Stride, or Haggart"
      />
      <label htmlFor="sort">Sort by</label>
      <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as any)}>
        <option value="value">Biggest buy first</option>
        <option value="insiders">Most insiders first</option>
        <option value="recent">Most recent first</option>
        <option value="follow">Best since filing first</option>
      </select>

      {ranked.length === 0 && <p>No clusters match that search yet. Try a ticker like RAPP or UPBD.</p>}
      {ranked.map((c, i) => (
        <div className="card" key={c.ticker}>
          <div>
            <span className="muted">#{i + 1}</span> <a className="ticker" href={`/clusters/${c.ticker}`}>{c.ticker}</a>{" "}
            <span>{c.company}</span>
          </div>
          <div className="total">{formatMoney(c.totalValueUsd)}</div>
          <div>
            <span className="pill">{c.insiderCount} insiders</span>
            {c.tradeCount ? <span className="pill">{c.tradeCount} trades</span> : null}
            <span className="pill">latest {formatDate(c.latestDate)}</span>
            <span className="pill">since filing: {formatPct(c.followThrough.pctChangeToNov9)}</span>
            <span className="pill">cap {formatCap(c.marketCapUsd)} ({c.marketCapClass})</span>
            <span className="pill">{c.officerCount} officer/director buyers</span>
            {c.dip20pct === true ? <span className="pill">bought after a 20%+ dip</span> : null}
            {c.dip20pct === null ? <span className="pill">dip: unknown (recent IPO)</span> : null}
          </div>
          <p className="muted">{c.buyers.map((b) => b.name).join(", ")}</p>
          <p><a href={`/clusters/${c.ticker}`}>See the cluster →</a></p>
        </div>
      ))}

      <h2>Get the weekly email</h2>
      <p>5 cluster buys, one line each, every week. No spam. Unsubscribe anytime — the newsletter is sent with Resend once it is connected; for now signups are stored on the site only.</p>
      <form onSubmit={signup}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <button type="submit">Sign up for the weekly email</button>
      </form>
      {signupMsg && <p>{signupMsg}</p>}

      <h2>How to read this</h2>
      <p>
        A cluster is several insiders buying together, which usually means they agree the shares
        are worth buying. It is not a buy signal on its own — insiders can be early, wrong, or
        buying for reasons that have nothing to do with the next quarter. Check the filing linked
        on each cluster page before you act on anything here.
      </p>
    </>
  );
}
