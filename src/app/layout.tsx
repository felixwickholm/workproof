import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import { siteUrl } from "./for-judges/site";
import { AppShell } from "@/components/shell/app-shell";
import { themeScript } from "@/components/theme/theme";
import { TourProvider } from "@/components/tour/tour-provider";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin", "latin-ext"],
});

/** The serif has one job: greetings, headlines and the tagline. Everything else is the sans. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

/** Code blocks only. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "WorkProof: hiring that sees the work, not the name";
const description =
  "Hiring that sees the work, not the name. An Espoo company posts a short real task. A person reads the work without the name, writes a reason and decides who to meet.";

// The OG and Twitter images and their alt text come from the files next to this layout, by file name.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: title, template: "%s · WorkProof" },
  description,
  applicationName: "WorkProof",
  openGraph: { title, description, type: "website", siteName: "WorkProof" },
  twitter: { card: "summary_large_image", title, description },
};

// The browser's theme colour is set by the theme script and the toggle, so it follows the chosen theme.
export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <TourProvider>
          <AppShell>{children}</AppShell>
        </TourProvider>
      </body>
    </html>
  );
}
