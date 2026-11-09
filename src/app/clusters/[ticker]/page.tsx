import { notFound } from "next/navigation";
import { CLUSTERS, formatDate, formatMoney, getCluster } from "../../../lib/data";

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
      </p>
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
