import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StarknetProvider } from "@/lib/starknet";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloakr | Private Proof of Payment",
  description: "Prove Bitcoin payments without revealing your wallet. ZK-powered privacy on Starknet.",
  keywords: ["Bitcoin", "Privacy", "ZK", "Zero Knowledge", "Starknet", "Proof of Payment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fafaf7] text-[#0a0a0a]`}
      >
        <StarknetProvider>
          <Header />
          {children}
          <Footer />
        </StarknetProvider>
      </body>
    </html>
  );
}
