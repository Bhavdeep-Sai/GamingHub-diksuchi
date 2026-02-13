import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar, Footer } from "@/components/layout";
import { AutoInitializer } from "@/components/AutoInitializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GamingHub - Train Your Brain Through Competitive Gaming",
  description: "Improve your thinking and brain power through strategic games. Play Chess, Sudoku, and more while tracking your cognitive growth.",
  keywords: ["brain training", "gaming", "cognitive skills", "strategy games", "leaderboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <AutoInitializer />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
