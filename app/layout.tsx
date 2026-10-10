import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Playfair_Display, Caveat } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Elvara Florist | Artisanal Floral Studio & Boutique",
  description: "Handcrafted floral arrangements, seasonal bouquets, bespoke botanical installations, and floral design workshops in Hyderabad.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${caveat.variable} min-h-screen bg-stone-50 text-neutral-900 antialiased flex flex-col selection:bg-stone-200 selection:text-neutral-900`}>
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

