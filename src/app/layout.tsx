import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Lato, JetBrains_Mono } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorDisplay";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lunar Practitioner — Moon Intelligence for Sound Healing",
  description:
    "Real-time lunar phase, zodiac transit, and session intelligence for sound healing practitioners. Zero infrastructure, fully client-side.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${lato.variable} ${jetbrains.variable} antialiased`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
        <Script
          src="https://plausible.io/js/pa-ZqKyEhbiJfRrJm3EgzV3w.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
        </Script>
      </body>
    </html>
  );
}
