import type { Metadata } from "next";
import { Cinzel, EB_Garamond, Geist, Geist_Mono, Lexend } from "next/font/google";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { ThemePanel } from "@/shared/components/ThemePanel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuestLog Pro",
  description: "RPG-themed task management for adventurers and agile teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${ebGaramond.variable} ${lexend.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <ThemePanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
