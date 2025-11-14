import type { ProjectInfo, NavLink, EventItem } from "./types";

// Branding Constants
export const BRAND = {
  NAME: "AfroDev Hub",
  TAGLINE: "The Hub for African Developer Events",
  DESCRIPTION:
    "Discover and participate in tech events across Africa, and global events accessible to Africans via remote participation or sponsorship opportunities.",
  SHORT_DESCRIPTION:
    "Your gateway to developer events in Africa and globally accessible opportunities for African tech talent.",
} as const;

// URL & Social Constants
export const URLS = {
  BASE: "https://afrodevhub.vercel.app",
  PORTFOLIO_URL: "https://lawaloyinlola.com",
  TWITTER: "https://twitter.com/HoneyzRich",
  TWITTER_HANDLE: "@HoneyzRich",
} as const;

// Creator/Credit Constants
export const CREATOR = {
  NAME: "Yero",
  CREDIT_TEXT: "Built by Yero",
  TWITTER_HANDLE: "@HoneyzRich",
  TWITTER_URL: "https://twitter.com/HoneyzRich",
} as const;

// SEO Constants
export const SEO = {
  KEYWORDS: [
    "AfroDev Hub",
    "African developer events",
    "Africa tech events",
    "African hackathons",
    "African tech meetups",
    "African developer conferences",
    "Africa tech community",
    "developer events Africa",
    "tech events Nigeria",
    "tech events Kenya",
    "tech events South Africa",
    "African developer opportunities",
    "remote tech events Africa",
    "sponsorship opportunities developers",
    "Africa tech networking",
  ],
  DEFAULT_TITLE: `${BRAND.NAME} - ${BRAND.TAGLINE}`,
  DEFAULT_DESCRIPTION: BRAND.DESCRIPTION,
  DEFAULT_IMAGE: `${URLS.BASE}/images/logo.png`,
  DEFAULT_ICON: `${URLS.BASE}/icons/logo.png`,
  OG_TYPE: "website",
  TWITTER_CARD: "summary_large_image",
  LOCALE: "en_US",
  SITE_NAME: BRAND.NAME,
} as const;

// Accessibility Constants
export const A11Y = {
  SKIP_TO_CONTENT: "Skip to main content",
  NAV_LABEL: "Main navigation",
  FOOTER_LABEL: "Site footer",
  EVENTS_SECTION: "Featured events list",
  EVENT_CARD: "View event details",
  EXPLORE_EVENTS: "Explore featured events",
  BOOK_EVENT: "Book your spot for this event",
  LOADING: "Loading content",
  ERROR: "An error occurred",
  NO_EVENTS: "No events available at this time",
  ALT: {
    LOGO: `${BRAND.NAME} logo`,
    EVENT_IMAGE: "Event banner image",
    LOCATION_ICON: "Location",
    CALENDAR_ICON: "Event date",
    CLOCK_ICON: "Event time",
    MODE_ICON: "Event mode",
    AUDIENCE_ICON: "Target audience",
    ARROW_DOWN: "Scroll down",
  },
} as const;

// Project Info (legacy support, using new constants)
export const PROJECT_INFO: ProjectInfo = {
  title: BRAND.NAME,
  description: BRAND.DESCRIPTION,
  keywords: Array.from(SEO.KEYWORDS) as string[],
  url: URLS.BASE,
  image: SEO.DEFAULT_IMAGE,
  icon: SEO.DEFAULT_ICON,
  author: CREATOR.NAME,
  authorUrl: URLS.TWITTER,
  authorEmail: `contact@${URLS.BASE.replace("https://", "").replace(
    ".vercel.app",
    ""
  )}.com`,
  authorTwitter: URLS.TWITTER,
  authorFacebook: URLS.TWITTER, // Placeholder
};

// Navigation Links
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", ariaLabel: "Navigate to home page" },
  { href: "/events", label: "Events", ariaLabel: "Browse all events" },
  // {
  //   href: "/create-event",
  //   label: "Create Event",
  //   ariaLabel: "Create a new event",
  // },
];

export const events: EventItem[] = [
  {
    image: "/images/event1.png",
    title: "React Summit US 2025",
    slug: "react-summit-us-2025",
    location: "San Francisco, CA, USA",
    date: "2025-11-07",
    time: "09:00 AM",
  },
  {
    image: "/images/event2.png",
    title: "KubeCon + CloudNativeCon Europe 2026",
    slug: "kubecon-cloudnativecon-eu-2026",
    location: "Vienna, Austria",
    date: "2026-03-18",
    time: "10:00 AM",
  },
  {
    image: "/images/event3.png",
    title: "AWS re:Invent 2025",
    slug: "aws-reinvent-2025",
    location: "Las Vegas, NV, USA",
    date: "2025-12-01",
    time: "08:30 AM",
  },
  {
    image: "/images/event4.png",
    title: "Next.js Conf 2025",
    slug: "nextjs-conf-2025",
    location: "Los Angeles, CA, USA (Hybrid)",
    date: "2025-11-12",
    time: "09:30 AM",
  },
  {
    image: "/images/event5.png",
    title: "Google Cloud Next 2026",
    slug: "google-cloud-next-2026",
    location: "San Jose, CA, USA",
    date: "2026-04-07",
    time: "09:00 AM",
  },
  {
    image: "/images/event6.png",
    title: "ETHGlobal Hackathon: Paris 2026",
    slug: "ethglobal-paris-2026",
    location: "Paris, France",
    date: "2026-07-10",
    time: "10:00 AM",
  },
  {
    image: "/images/events-full.png",
    title: "Open Source Summit North America 2026",
    slug: "oss-na-2026",
    location: "Vancouver, Canada",
    date: "2026-06-22",
    time: "09:00 AM",
  },
];
