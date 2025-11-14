import { Suspense } from "react";
import type { Metadata } from "next";
import EventDetails from "@/components/EventDetails";
import { BRAND, SEO, URLS, A11Y } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function getEvent(slug: string) {
  if (!BASE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.event || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return {
      title: `Event Not Found | ${BRAND.NAME}`,
      description: SEO.DEFAULT_DESCRIPTION,
    };
  }

  const title = `${event.title} | ${BRAND.NAME}`;
  const description =
    event.description || event.overview || SEO.DEFAULT_DESCRIPTION;
  const image = event.image || SEO.DEFAULT_IMAGE;
  const eventUrl = `${URLS.BASE}/events/${slug}`;

  return {
    title,
    description,
    keywords: [...SEO.KEYWORDS, ...(event.tags || [])],
    alternates: {
      canonical: eventUrl,
    },
    openGraph: {
      type: "website",
      locale: SEO.LOCALE,
      url: eventUrl,
      siteName: SEO.SITE_NAME,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: SEO.TWITTER_CARD,
      title,
      description,
      images: [image],
      creator: URLS.TWITTER_HANDLE,
      site: URLS.TWITTER_HANDLE,
    },
  };
}

const EventDetailsContent = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return <EventDetails params={Promise.resolve(slug)} />;
};

const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <main>
      <Suspense
        fallback={
          <div role="status" aria-live="polite">
            {A11Y.LOADING}
          </div>
        }
      >
        <EventDetailsContent params={params} />
      </Suspense>
    </main>
  );
};
export default EventDetailsPage;
