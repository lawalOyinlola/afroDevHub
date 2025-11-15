import { notFound } from "next/navigation";
import {
  getSimilarEventsBySlug,
  getEventBySlug,
} from "@/lib/actions/event.actions";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { cacheLife } from "next/cache";
import { A11Y } from "@/lib/constants";

type SimilarEventsResult = Awaited<ReturnType<typeof getSimilarEventsBySlug>>;
type SimilarEvent = SimilarEventsResult extends Array<infer Item>
  ? Item
  : never;

const EventDetailItem = ({
  icon,

  label,
}: {
  icon: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt="" width={17} height={17} aria-hidden="true" />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetails = async ({ params }: { params: Promise<string> }) => {
  "use cache";
  cacheLife("hours");
  const slug = await params;

  const result = await getEventBySlug(slug);

  if (!result) {
    notFound();
  }

  const { event, bookingsCount } = result;

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags,
    organizer,
  } = event;

  if (!description) return notFound();

  const bookings = bookingsCount;

  const similarEvents = await getSimilarEventsBySlug(slug);

  return (
    <article id="event" itemScope itemType="https://schema.org/Event">
      <header className="event-header">
        <h1 itemProp="name">{event.title || "Event"}</h1>
        <p itemProp="description">{description}</p>
      </header>

      <div className="details">
        {/*    Left Side - Event Content */}
        <div className="content">
          <Image
            src={image}
            alt={`${event.title || "Event"} - ${A11Y.ALT.EVENT_IMAGE}`}
            width={800}
            height={800}
            className="banner"
            itemProp="image"
            priority
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <time
              itemProp="startDate"
              dateTime={`${date}T${time}`}
              className="sr-only"
            >
              {date} at {time}
            </time>

            <EventDetailItem icon="/icons/calendar.svg" label={date} />
            <EventDetailItem icon="/icons/clock.svg" label={time} />
            <EventDetailItem icon="/icons/pin.svg" label={location} />
            <div
              itemProp="location"
              itemScope
              itemType="https://schema.org/Place"
              className="sr-only"
            >
              <span itemProp="name">{location}</span>
            </div>
            <EventDetailItem icon="/icons/mode.svg" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" label={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/*    Right Side - Booking Form */}
        <aside className="booking" aria-label="Event booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm" role="status" aria-live="polite">
                Join {bookings} {bookings === 1 ? "person" : "people"} who{" "}
                {bookings === 1 ? "has" : "have"} already booked their spot!
              </p>
            ) : (
              <p className="text-sm" role="status" aria-live="polite">
                Be the first to book your spot!
              </p>
            )}

            <div aria-label={A11Y.BOOK_EVENT}>
              <BookEvent eventId={event._id} />
            </div>
          </div>
        </aside>
      </div>

      <section
        className="flex w-full flex-col gap-4 pt-20"
        aria-labelledby="similar-events-heading"
      >
        <h2 id="similar-events-heading">Similar Events</h2>
        {similarEvents.length > 0 ? (
          <ul className="events" role="list" aria-label="Similar events list">
            {similarEvents.map((similarEvent: SimilarEvent) => (
              <li
                key={similarEvent._id?.toString() || similarEvent.slug}
                className="list-none"
                role="listitem"
              >
                <EventCard {...similarEvent} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground" role="status">
            No similar events found at this time.
          </p>
        )}
      </section>
    </article>
  );
};
export default EventDetails;
