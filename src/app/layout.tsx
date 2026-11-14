import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoryProvider } from "@/components/story/story-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = "Skip the CV. Do the work. A person at the company reads it and decides who to meet.";

export const metadata: Metadata = {
  title: "Tryout",
  description,
  applicationName: "Tryout",
  openGraph: { title: "Tryout", description, type: "website", siteName: "Tryout" },
  twitter: { card: "summary", title: "Tryout", description },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh">
        <StoryProvider>{children}</StoryProvider>
      </body>
    </html>
  );
}
