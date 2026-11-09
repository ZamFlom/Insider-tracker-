"use client";
import { useState } from "react";

export default function SponsorBar() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div className="sponsor-bar">
      <span>
        Sponsor slot available — $50/week. <a href="/go/placeholder-sponsor">Your company here</a> ·{" "}
        <a href="/sponsors">See sponsor page</a>
      </span>
      <button aria-label="Close sponsor bar" onClick={() => setClosed(true)}>✕</button>
    </div>
  );
}
