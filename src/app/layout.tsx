import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Cinzel, EB_Garamond, Geist, Geist_Mono } from "next/font/google";
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

const lexend = Atkinson_Hyperlegible({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${ebGaramond.variable} ${lexend.variable}`}
    >
      <body className="overflow-x-hidden antialiased">
        <ThemeProvider>
          {children}
          <ThemePanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
