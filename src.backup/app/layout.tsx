import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bell24h - India's Fastest B2B Match-Making Engine",
  description: "Post RFQ. Get 3 Verified Quotes in 24 Hours. Bell24h uses 200 live data signals to match you with pre-qualified Indian suppliers.",
  keywords: "B2B marketplace, RFQ, suppliers, procurement, India, MSME, escrow, verified suppliers",
  authors: [{ name: "Bell24h Team" }],
  openGraph: {
    title: "Bell24h - India's Fastest B2B Match-Making Engine",
    description: "Post RFQ. Get 3 Verified Quotes in 24 Hours. Trust-first, AI-powered B2B marketplace.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bell24h - India's Fastest B2B Match-Making Engine",
    description: "Post RFQ. Get 3 Verified Quotes in 24 Hours. Trust-first, AI-powered B2B marketplace.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
