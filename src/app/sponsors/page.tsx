"use client";
import { useState } from "react";

export default function SponsorsPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [msg, setMsg] = useState("");
  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, ticker: "SPONSOR", notes: form.message }) });
    const data = await res.json();
    setMsg(res.ok ? "Thanks — your message is in the review queue. We reply by email." : (data.error || "Something went wrong."));
    if (res.ok) setForm({ name: "", email: "", company: "", message: "" });
  }
  return (
    <>
      <h1>Sponsor this tracker</h1>
      <p><strong>$50/week</strong> for the sponsor bar on every page plus a “Sponsored by” line in the weekly email.</p>
      <h2>Real stats — no made-up numbers</h2>
      <p>
        This site launched Nov 9, 2026. Traffic so far: <strong>new — 0 visitors tracked yet</strong>.
        Signups so far: <strong>0 — the list just opened</strong>. We will update these numbers
        weekly from the site’s own counts, and we will never invent traffic, subscribers, or testimonials.
      </p>
      <p>
        What we can say honestly today: 28 real clusters seeded from SEC Form 4 filings, 98 named
        insider buyers, $213.2M in combined cluster buys in the data set. The audience is retail
        stock traders who check insider buying every week.
      </p>
      <p>
        Sponsor links go through <code>/go/&lt;sponsor&gt;</code> so clicks are counted. No checkout
        on this page yet — if you want the slot, get in touch and we will set it up.
      </p>
      <h2>Get in touch</h2>
      <form onSubmit={submit}>
        <label htmlFor="name">Your name *</label>
        <input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        <label htmlFor="email">Email *</label>
        <input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        <label htmlFor="company">Company</label>
        <input id="company" value={form.company} onChange={(e) => set("company", e.target.value)} />
        <label htmlFor="message">Message *</label>
        <textarea id="message" rows={4} required value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us about your product and when you want to start" />
        <button type="submit">Send</button>
      </form>
      {msg && <p>{msg}</p>}
    </>
  );
}
