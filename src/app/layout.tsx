import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizOptimize Pro - AI-Powered Business Optimization",
  description: "Reduce costs and increase profits with AI-powered business optimization tools for construction, trucking, restaurants, and more.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}