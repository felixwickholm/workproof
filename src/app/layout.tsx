import type { Metadata, Viewport } from "next";
import { Geist_Mono, Lato, Work_Sans } from "next/font/google";
import { SUMMARY } from "./for-judges/facts";
import { jsonLdScript, structuredData } from "./for-judges/json-ld";
import { repoUrl, siteUrl, TEXT_MAPS } from "./for-judges/site";
import { AppShell } from "@/components/shell/app-shell";
import { themeScript } from "@/components/theme/theme";
import { TourProvider } from "@/components/tour/tour-provider";
import "./globals.css";

/** Business Espoo's text face: body, controls, tables. */
const workSans = Work_Sans({
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

/** Business Espoo's heading face, at the two weights its scale uses. */
const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
});

/** Code blocks only. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "WorkProof: companies score real work at City of Espoo talent events";
const description =
  "For City of Espoo talent events: companies see real work and score it, 1 to 5 per skill, with a written reason. The AI never scores. Names stay hidden until the person accepts.";

// The OG and Twitter images and their alt text come from the files next to this layout, by file name.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: title, template: "%s · WorkProof" },
  description,
  applicationName: "WorkProof",
  alternates: { types: TEXT_MAPS },
  openGraph: { title, description, type: "website", siteName: "WorkProof", locale: "en_GB" },
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
      className={`${workSans.variable} ${lato.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData(siteUrl(), repoUrl())) }} />
        {/* The same summary as /for-judges, in the HTML of every page; shown to screen readers, hidden on screen. */}
        <section aria-label="About WorkProof" className="sr-only">
          <p>{SUMMARY}</p>
          <p>
            Evidence for each judging criterion: <a href="/for-judges">/for-judges</a>. Full text: <a href="/llms-full.txt">/llms-full.txt</a>. Source code:{" "}
            <a href={repoUrl()}>{repoUrl()}</a>.
          </p>
        </section>
        <TourProvider>
          <AppShell>{children}</AppShell>
        </TourProvider>
      </body>
    </html>
  );
}
