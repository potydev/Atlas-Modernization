import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://modernization-atlas.vercel.app"),
  title: "The Modernization Atlas | Growing the Economy Through Modernization",
  description:
    "An interactive exploration of how modernization transforms economies worldwide. Discover the pillars, data, and human stories behind the global shift toward digital infrastructure, AI, green economy, and financial inclusion.",
  keywords: [
    "modernization",
    "economy",
    "digital transformation",
    "AI",
    "green economy",
    "financial inclusion",
    "GDP",
    "developing nations",
    "technology",
    "innovation",
  ],
  authors: [{ name: "The Modernization Atlas Team" }],
  openGraph: {
    title: "The Modernization Atlas",
    description: "Growing the Economy Through Modernization",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Modernization Atlas",
    description: "Growing the Economy Through Modernization",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0f] text-[#e8e8e8]`}
      >
        {children}
        <div className="grain-overlay" />
        <Toaster />
      </body>
    </html>
  );
}
