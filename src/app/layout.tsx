import type { Metadata } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Parley — A few good games for the team you already have",
  description:
    "Parley is a small platform of multiplayer games designed for retros, kickoffs, and the time between meetings. No accounts. Share a code, play in a minute.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${dmSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
