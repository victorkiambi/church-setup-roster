import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Church Setup Roster",
  description: "Mobile-friendly app to manage church setup duties and assignments",
  keywords: "church, roster, setup, duties, assignments, schedule",
  authors: [{ name: "Church Setup Team" }],
  openGraph: {
    title: "Church Setup Roster",
    description: "See who's on setup duty this Sunday and upcoming events",
    type: "website",
    locale: "en_US",
    siteName: "Church Setup Roster",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Church Setup Roster - Who's On Duty",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Church Setup Roster",
    description: "See who's on setup duty this Sunday and upcoming events",
    images: ["/og-image.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Church Roster",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-screen bg-background">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
