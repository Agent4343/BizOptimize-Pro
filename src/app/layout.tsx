import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bizoptimize.pro"),
  title: {
    default: "BizOptimize Pro | AI Ops Platform",
    template: "%s · BizOptimize Pro",
  },
  description: "Wow clients with AI-generated cost plans, multi-agent insights, and guided operations dashboards for construction, trucking, restaurants, and beyond.",
  openGraph: {
    title: "BizOptimize Pro | AI Ops Platform",
    description: "AI copilots for cost reduction. Generate professional-grade estimates and share client-ready reports in minutes.",
    url: "https://bizoptimize.pro",
    siteName: "BizOptimize Pro",
    images: [
      {
        url: "https://placehold.co/1200x630/091836/12f7d6?text=BizOptimize+Pro+AI+Ops",
        width: 1200,
        height: 630,
        alt: "BizOptimize Pro hero",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BizOptimize Pro | AI Ops Platform",
    description: "AI copilots for operations, finance, and field teams.",
    images: ["https://placehold.co/1200x630/091836/12f7d6?text=BizOptimize+Pro+AI+Ops"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body className={`${inter.variable} bg-background font-sans text-foreground`}>
          {children}
        </body>
      </html>
  );
}