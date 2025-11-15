"use server";

import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import type { IEvent } from "@/database/event.model";
import type { Document } from "mongoose";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Type representing a lean event object (plain object from MongoDB, not a Document)
// When serialized via JSON API, _id becomes a string
export type LeanEvent = Omit<IEvent, keyof Document> & {
  _id: string;
};

export interface EventWithBookingsCount {
  event: LeanEvent;
  bookingsCount: number;
}

/**
 * Fetches an event by slug from the API endpoint.
 * Returns null if the event is not found or if there's an error.
 * This is the single source of truth for fetching event data.
 */
export async function getEventBySlug(
  slug: string
): Promise<EventWithBookingsCount | null> {
  if (!BASE_URL) {
    console.error("NEXT_PUBLIC_BASE_URL is not configured");
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
    const event = data?.event;
    const bookingsCount =
      typeof data?.bookingsCount === "number" ? data.bookingsCount : 0;

    if (!event) {
      return null;
    }

    return { event, bookingsCount };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();
    // const event = await Event.findOne({ slug });

    const event = await Event.findOne({ slug }).lean();
    if (!event || !Array.isArray(event.tags) || event.tags.length === 0) {
      return [];
    }

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch {
    return [];
  }
};
