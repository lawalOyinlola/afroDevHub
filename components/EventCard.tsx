import Link from "next/link";
import Image from "next/image";
import { A11Y } from "@/lib/constants";

interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  const eventUrl = `/events/${slug}`;
  const cardId = `event-card-${slug}`;

  return (
    <article className="event-card">
      <Link
        href={eventUrl}
        id={cardId}
        aria-label={`${title} - ${A11Y.EVENT_CARD.toLowerCase()}`}
        className="event-card-link"
      >
        <Image
          src={image}
          alt={`${title} - ${A11Y.ALT.EVENT_IMAGE}`}
          width={410}
          height={300}
          className="poster"
          loading="lazy"
        />

        <div className="flex flex-row gap-2" aria-label="Event location">
          <Image
            src="/icons/pin.svg"
            alt={A11Y.ALT.LOCATION_ICON}
            width={14}
            height={14}
            aria-hidden="true"
          />
          <p>{location}</p>
        </div>

        <h3 className="title">{title}</h3>

        <div className="datetime" aria-label="Event date and time">
          <div>
            <Image
              src="/icons/calendar.svg"
              alt={A11Y.ALT.CALENDAR_ICON}
              width={14}
              height={14}
              aria-hidden="true"
            />
            <time dateTime={date}>{date}</time>
          </div>
          <div>
            <Image
              src="/icons/clock.svg"
              alt={A11Y.ALT.CLOCK_ICON}
              width={14}
              height={14}
              aria-hidden="true"
            />
            <time dateTime={time}>{time}</time>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default EventCard;
