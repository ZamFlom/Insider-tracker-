"use client";
import { useMemo, useState } from "react";
import { CLUSTERS, DATA_AS_OF, DEFINITION, formatDate, formatMoney } from "../lib/data";

export default function Home() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"value" | "insiders" | "recent">("value");
  const [email, setEmail] = useState("");
  const [signupMsg, setSignupMsg] = useState("");

  const ranked = useMemo(() => {
    const list = [...CLUSTERS].sort((a, b) => {
      if (sort === "insiders") return b.insiderCount - a.insiderCount || b.totalValueUsd - a.totalValueUsd;
      if (sort === "recent") return b.latestDate.localeCompare(a.latestDate);
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
  }, [q, sort]);

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
        data as of {DATA_AS_OF}, newest filing Nov 6, 2026. Sources: XOOMAR, InsiderPrint and KeyVex — each cluster links its source.
      </p>

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
