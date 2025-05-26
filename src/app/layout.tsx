import '@coinbase/onchainkit/styles.css';
import React from 'react';
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from '../providers';
import MetaTags from './meta-tags';
import { Footer } from '../components/Footer';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Removed static metadata in favor of the dynamic MetaTags component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <MetaTags />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>Astro Clock</title>
      </head>
      <body
        suppressHydrationWarning={true}
        className="antialiased bg-gray-900 text-white flex flex-col min-h-screen sm:text-sm sm:px-2"
      >
        <Providers>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
