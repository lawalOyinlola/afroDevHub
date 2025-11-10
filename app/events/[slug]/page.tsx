// import { Suspense } from "react";
// import EventDetails from "@/components/EventDetails";

import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// "use cache";

// cacheLife("hours");

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  // const slug = params.then((p) => p.slug);

  const { slug } = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const { event } = await request.json();

  if (!event) {
    return notFound();
  }

  return (
    <section>
      {/* <Suspense fallback={<div>Loading...</div>}>
                <EventDetails params={slug} />
            </Suspense> */}
      <h1>Event Details : {slug}</h1>
    </section>
  );
};
export default EventDetailsPage;
