export type ProjectInfo = {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image: string;
  icon: string;
  author: string;
  authorUrl: string;
  authorEmail: string;
  authorTwitter: string;
  authorFacebook: string;
};

export type NavLink = {
  href: string;
  label: string;
  ariaLabel?: string;
};

export type EventItem = {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string; // e.g., "2025-11-07"
  time: string; // e.g., "09:00 AM"
};
