import { notFound } from "next/navigation";
import { CLUSTERS, formatCap, formatDate, formatMoney, formatPct, getCluster } from "../../../lib/data";

export function generateStaticParams() {
  return CLUSTERS.map((c) => ({ ticker: c.ticker }));
}

export function generateMetadata({ params }: { params: { ticker: string } }) {
  const c = getCluster(params.ticker);
  if (!c) return { title: "Cluster not found — Insider Cluster Buys Tracker" };
  return {
    title: `${c.ticker} — ${c.insiderCount} insiders bought ${formatMoney(c.totalValueUsd)} | Insider Cluster Buys Tracker`,
    description: `${c.company}: ${c.insiderCount} insiders bought ${formatMoney(c.totalValueUsd)} on the open market, latest ${formatDate(c.latestDate)}. SEC Form 4 cluster buy.`,
  };
}

export default function ClusterPage({ params }: { params: { ticker: string } }) {
  const c = getCluster(params.ticker);
  if (!c) notFound();
  return (
    <>
      <p><a href="/">← All clusters</a></p>
      <h1>{c.ticker} — {c.company}</h1>
      <p className="total" style={{ fontSize: 28, fontWeight: 800 }}>{formatMoney(c.totalValueUsd)}</p>
      <p>
        <span className="pill">{c.insiderCount} insiders buying</span>
        {c.tradeCount ? <span className="pill">{c.tradeCount} open-market trades</span> : null}
        <span className="pill">window: {c.window}</span>
        <span className="pill">latest: {formatDate(c.latestDate)}</span>
        <span className="pill">market cap {formatCap(c.marketCapUsd)} ({c.marketCapClass})</span>
        <span className="pill">{c.officerCount} officer/director buyers (named)</span>
        {c.dip20pct === true ? <span className="pill">bought {c.pctDownFrom90dHigh !== null ? `${Math.abs(c.pctDownFrom90dHigh).toFixed(2)}%` : ""} below its 90-day high</span> : null}
        {c.dip20pct === null ? <span className="pill">dip vs 90-day high: unknown — recent IPO, no 90 days of trading before the filing</span> : null}
      </p>
      <h2>What happened next</h2>
      <p>
        Filing-date close ({formatDate(c.followThrough.filingCloseDate)}):{" "}
        {c.followThrough.filingClose !== null ? `$${c.followThrough.filingClose.toFixed(2)}` : "unknown"} ·{" "}
        Nov 10, 2026 close: {c.followThrough.closeNov10 !== null ? `$${c.followThrough.closeNov10.toFixed(2)}` : "unknown"} ·{" "}
        <strong>since filing: {formatPct(c.followThrough.pctChangeToNov10)}</strong>
      </p>
      <p>
        +10 days: {c.followThrough.plus10Pct !== null
          ? `${formatPct(c.followThrough.plus10Pct)} (close ${c.followThrough.plus10Close !== null ? `$${c.followThrough.plus10Close.toFixed(2)}` : ""} on ${c.followThrough.plus10Date ? formatDate(c.followThrough.plus10Date) : ""})`
          : "not yet elapsed — tracking"}{" "}
        · +30 days: {c.followThrough.plus30Pct !== null
          ? formatPct(c.followThrough.plus30Pct)
          : "not yet elapsed — tracking"}
      </p>
      <p className="muted">
        Prices: {c.followThrough.priceSource}. Follow-through is measured from the filing-date close to the first
        trading day on or after filing +10 / +30 calendar days, and to the Nov 10, 2026 close. 90-day high:{" "}
        {c.high90d !== null ? `$${c.high90d.toFixed(2)}` : "unknown"}; the stock was{" "}
        {c.pctDownFrom90dHigh !== null ? `${Math.abs(c.pctDownFrom90dHigh).toFixed(2)}% below` : "an unknown amount below"} that high at filing.
        This is tracking, not a prediction — a few days of price movement proves nothing on its own.
      </p>
      {c.marketCapNote ? <p className="muted">Market-cap note: {c.marketCapNote}</p> : null}
      <h2>Who bought</h2>
      <table>
        <thead><tr><th>Insider</th><th>Role</th><th>Amount</th></tr></thead>
        <tbody>
          {c.buyers.map((b) => (
            <tr key={b.name}>
              <td>{b.name}</td>
              <td>{b.role}</td>
              <td>{b.amountUsd ? formatMoney(b.amountUsd) : "Not broken out in source"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {c.insiderCount > c.buyers.length && (
        <p className="muted">{c.insiderCount - c.buyers.length} further insider(s) are named in the source filing list.</p>
      )}
      {c.note && <p className="muted">Note: {c.note}</p>}
      <h2>Source</h2>
      <p>
        {c.source}. <a href={c.sourceUrl} target="_blank" rel="noreferrer">{c.sourceUrl}</a>
      </p>
      <p className="muted">
        Totals are as reported by that source. Different trackers count related entities and
        share classes differently, so the same cluster can show a different total on another tracker.
        Always check the original SEC Form 4 filing before acting.
      </p>
      <p><a href="/submit">Think we missed a cluster here? Flag a ticker →</a></p>
    </>
  );
}
