import type { Metadata } from "next";
import { Space_Mono, Inter } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://oracle2026.io'),
  title: "$ORACLE 2026 - AI Crypto Predictions Terminal | Agentic Finance",
  description: "The most advanced AI-powered crypto oracle for 2026. Get real-time predictions for AI Agents, RWA, and Memecoin sectors. Scientific analysis meets quantum prophecy.",
  keywords: [
    "AI Crypto Agent 2026",
    "Best AI Crypto Agent 2026",
    "RWA Market Outlook 2026",
    "AI Memecoin Predictions",
    "Crypto Oracle",
    "AI Trading Terminal",
    "Agentic Finance",
    "FET price prediction",
    "TAO crypto analysis",
    "ONDO RWA token",
    "PEPE forecast 2026",
    "Solana predictions",
    "Crypto technical analysis",
    "RSI Bollinger Bands crypto",
  ],
  authors: [{ name: "$ORACLE Team" }],
  creator: "$ORACLE 2026",
  publisher: "$ORACLE 2026",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://oracle2026.io",
    siteName: "$ORACLE 2026",
    title: "$ORACLE 2026 - AI Crypto Predictions Terminal",
    description: "The most advanced AI-powered crypto oracle for 2026. Predictions for AI Agents, RWA, and Memecoins.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "$ORACLE 2026 Terminal Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "$ORACLE 2026 - AI Crypto Predictions Terminal",
    description: "The most advanced AI-powered crypto oracle. Get predictions for AI Agents, RWA, and Memecoins.",
    images: ["/og-image.png"],
    creator: "@ORACLE2026",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#050505",
  category: "cryptocurrency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#050505" />
      </head>
      <body
        className={`${spaceMono.variable} ${inter.variable} antialiased min-h-screen`}
      >
        {/* Floating Particles Background */}
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Grid Background */}
        <div className="fixed inset-0 grid-bg pointer-events-none opacity-30" />

        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "$ORACLE 2026",
              description: "AI-powered cryptocurrency prediction terminal for 2026",
              url: "https://oracle2026.io",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
