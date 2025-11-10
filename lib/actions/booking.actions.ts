"use server";

import mongoose from "mongoose";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";

import connectDB from "@/lib/mongodb";

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
}) => {
  try {
    await connectDB();

    // Validate inputs
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return { success: false, error: "Invalid event ID" };
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Invalid email address" };
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Check for duplicate booking
    const existingBooking = await Booking.findOne({
      eventId,
      email: email.toLowerCase().trim(),
    });
    if (existingBooking) {
      return { success: false, error: "You have already booked this event" };
    }

    await Booking.create({ eventId, email });

    return { success: true };
  } catch (e) {
    console.error("create booking failed", e);
    return { success: false, error: "Booking creation failed" };
  }
};
