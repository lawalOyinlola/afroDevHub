import type { Metadata } from "next";
import { Suspense } from "react";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND, SEO, URLS, CREATOR, A11Y } from "@/lib/constants";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SEO.DEFAULT_TITLE,
    template: `%s | ${BRAND.NAME}`,
  },
  description: SEO.DEFAULT_DESCRIPTION,
  keywords: Array.from(SEO.KEYWORDS) as string[],
  authors: [{ name: CREATOR.NAME, url: URLS.TWITTER }],
  creator: CREATOR.NAME,
  publisher: BRAND.NAME,
  metadataBase: new URL(URLS.BASE),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: SEO.OG_TYPE,
    locale: SEO.LOCALE,
    url: URLS.BASE,
    siteName: SEO.SITE_NAME,
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    images: [
      {
        url: SEO.DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: BRAND.NAME,
      },
    ],
  },
  twitter: {
    card: SEO.TWITTER_CARD,
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    images: [SEO.DEFAULT_IMAGE],
    creator: URLS.TWITTER_HANDLE,
    site: URLS.TWITTER_HANDLE,
  },
  icons: {
    icon: SEO.DEFAULT_ICON,
    apple: SEO.DEFAULT_ICON,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes here when available
  },
};

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.NAME,
  description: SEO.DEFAULT_DESCRIPTION,
  url: URLS.BASE,
  author: {
    "@type": "Person",
    name: CREATOR.NAME,
    url: URLS.TWITTER,
    sameAs: [URLS.TWITTER],
  },
  publisher: {
    "@type": "Organization",
    name: BRAND.NAME,
    url: URLS.BASE,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${URLS.BASE}/events?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          {A11Y.SKIP_TO_CONTENT}
        </a>
        <Navbar />
        <div
          className="absolute inset-0 top-0 -z-1 min-h-screen"
          aria-hidden="true"
        >
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#5dfeca"
            raysSpeed={0.5}
            lightSpread={0.9}
            rayLength={1.4}
            followMouse={true}
            mouseInfluence={0.02}
            noiseAmount={0.0}
            distortion={0.01}
          />
        </div>
        <main id="main-content">{children}</main>
        <Suspense
          fallback={
            <footer
              className="mt-auto py-8 text-center text-sm text-muted-foreground"
              role="contentinfo"
            >
              <p className="mt-2">© {BRAND.NAME}. All rights reserved.</p>
            </footer>
          }
        >
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
