import type { Metadata } from "next";
import "./globals.css";
import SponsorBar from "./SponsorBar";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://insider-tracker-.vercel.app"),
  title: "Insider Cluster Buys Tracker — 2+ insiders buying the same stock",
  description:
    "Companies where 2 or more insiders bought on the open market (SEC Form 4, code P) in the last 30 days. Ranked weekly, with a free weekly newsletter.",
  openGraph: {
    title: "Insider Cluster Buys Tracker",
    description:
      "Companies where 2+ insiders bought on the open market in the last 30 days. Ranked weekly.",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Insider Cluster Buys Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insider Cluster Buys Tracker",
    description:
      "Companies where 2+ insiders bought on the open market in the last 30 days. Ranked weekly.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SponsorBar />
        <header className="top">
          <a className="brand" href="/">Insider Cluster Buys</a>
          <nav>
            <a href="/">Clusters</a>
            <a href="/submit">Flag a ticker</a>
            <a href="/sponsors">Sponsors</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>
            Educational research, not investment advice. Data is SEC Form 4 open-market
            purchases (code P) as reported by the tracker linked on each cluster. Insiders
            buy for many reasons; a cluster is a reason to research a stock, not a buy signal.
          </p>
          <p>Data as of Nov 10, 2026. Newest filing in this set: Nov 10, 2026.</p>
        </footer>
      </body>
    </html>
  );
}
