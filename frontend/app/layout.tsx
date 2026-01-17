import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWAInstaller } from "./pwa-installer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Twin Sensor Hub";
const APP_DESCRIPTION = "A Progressive Web App for monitoring and managing twin sensors with real-time data synchronization";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  applicationName: APP_NAME,
  keywords: ["sensors", "IoT", "monitoring", "real-time", "dashboard"],
  authors: [{ name: "Pancrace Dev" }],
  creator: "Pancrace Dev",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  // PWA Meta Tags
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#121212",
  colorScheme: "light dark",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
    startupImage: [
      { url: "/splash/splash-640x1136.png" },
      { url: "/splash/splash-750x1334.png" },
      { url: "/splash/splash-1125x2436.png" },
    ],
  },
  // Open Graph
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: APP_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
    type: "website",
  },
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Twin Sensor Hub" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}
