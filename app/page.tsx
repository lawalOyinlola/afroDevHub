import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import type { IEvent } from "@/database";
import { cacheLife } from "next/cache";
import { BRAND, A11Y } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  console.error("NEXT_PUBLIC_BASE_URL environment variable is not configured");
}

export default async function Home() {
  "use cache";
  cacheLife("hours");

  let events: IEvent[] = [];
  if (!BASE_URL) {
    console.error(
      "NEXT_PUBLIC_BASE_URL environment variable is not configured"
    );
  } else {
    try {
      const response = await fetch(`${BASE_URL}/api/events`, {
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      const data = await response.json();
      events = data?.events || [];
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  return (
    <section aria-label="Home page">
      <header className="flex-center flex-col *:text-center">
        <h1 className="max-w-[20ch]">{BRAND.TAGLINE}</h1>
        <p className="mt-5 max-w-[64ch]">
          Discover tech events across Africa, and global events accessible to
          African developers via remote participation or sponsorship
          opportunities.
        </p>
      </header>

      <ExploreBtn />

      <section
        id="events"
        tabIndex={-1}
        className="mt-20 space-y-7"
        aria-labelledby="events-heading"
      >
        <h2 id="events-heading">Featured Events</h2>

        {events && events.length > 0 ? (
          <ul className="events" role="list" aria-label={A11Y.EVENTS_SECTION}>
            {events.map((event: IEvent) => (
              <li
                key={event.slug ?? event.title ?? event._id?.toString()}
                className="list-none"
                role="listitem"
              >
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="text-center text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {A11Y.NO_EVENTS}
          </p>
        )}
      </section>
    </section>
  );
}
