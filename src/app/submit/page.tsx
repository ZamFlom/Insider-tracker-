"use client";
import { useState } from "react";

export default function SubmitPage() {
  const [form, setForm] = useState({ ticker: "", company: "", insider: "", notes: "", email: "" });
  const [msg, setMsg] = useState("");
  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(data.message || data.error || "Done.");
    if (res.ok) setForm({ ticker: "", company: "", insider: "", notes: "", email: "" });
  }
  return (
    <>
      <h1>Flag a ticker</h1>
      <p>
        Spotted a cluster we missed — 2 or more insiders buying the same stock on the open market
        in the last 30 days? Tell us. Submissions go to a review queue. Nothing is published
        automatically; every submission is checked against the SEC Form 4 filing first.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="ticker">Ticker *</label>
        <input id="ticker" required value={form.ticker} onChange={(e) => set("ticker", e.target.value.toUpperCase())} placeholder="e.g. RAPP" />
        <label htmlFor="company">Company</label>
        <input id="company" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Rapport Therapeutics, Inc." />
        <label htmlFor="insider">Insider name(s)</label>
        <input id="insider" value={form.insider} onChange={(e) => set("insider", e.target.value)} placeholder="Who bought?" />
        <label htmlFor="notes">Notes / link to the filing</label>
        <textarea id="notes" rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Paste a link to the Form 4 or tracker page if you have one" />
        <label htmlFor="email">Your email (optional, so we can follow up)</label>
        <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
        <button type="submit">Submit for review</button>
      </form>
      {msg && <p>{msg}</p>}
    </>
  );
}
