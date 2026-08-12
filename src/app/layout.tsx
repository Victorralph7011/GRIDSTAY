import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "GridStay — The Digital Operating System for Managed Living",
  description:
    "GridStay transforms unorganized hostels and PGs into high-performance, standardized business assets. Bed-level inventory, Aadhaar eSign contracts, and automated rent collection.",
  keywords: [
    "hostel management",
    "PG management software",
    "student housing",
    "co-living platform",
    "rent automation",
    "bed management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fontshare — Clash Display + Satoshi */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
