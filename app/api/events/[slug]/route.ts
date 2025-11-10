import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";

// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

// GET /api/events/[slug]
// Fetches a single event by its slug
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    // Await and extract slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    // Sanitize slug (remove any potential malicious input)
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query event by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    const bookingsCount = await Booking.countDocuments({ eventId: event._id });

    // Return successful response with event data
    return NextResponse.json(
      { message: "Event fetched successfully", event, bookingsCount },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching event by slug:", error);
    }

    // Handle specific error types
    if (error instanceof Error) {
      // Handle database connection errors
      if (error.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          { message: "Database configuration error" },
          { status: 500 }
        );
      }

      // Return generic error with error message
      return NextResponse.json(
        { message: "Failed to fetch event" },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[slug]
// Updates an existing event by its slug
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    const sanitizedSlug = slug.trim().toLowerCase();

    const event = await Event.findOne({ slug: sanitizedSlug });

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const rawEventEntries = Array.from(formData.entries());
    const rawEvent = Object.fromEntries(
      rawEventEntries.filter(([key]) => key !== "image")
    ) as Record<string, FormDataEntryValue>;

    const requiredStringFields: Array<
      | "title"
      | "description"
      | "overview"
      | "venue"
      | "location"
      | "date"
      | "time"
      | "mode"
      | "audience"
      | "organizer"
    > = [
      "title",
      "description",
      "overview",
      "venue",
      "location",
      "date",
      "time",
      "mode",
      "audience",
      "organizer",
    ];

    for (const field of requiredStringFields) {
      const incomingValue = rawEvent[field];

      if (incomingValue !== undefined) {
        if (typeof incomingValue !== "string") {
          return NextResponse.json(
            { message: `${field} must be a string` },
            { status: 400 }
          );
        }

        if (incomingValue.trim() === "") {
          return NextResponse.json(
            { message: `${field} cannot be empty` },
            { status: 400 }
          );
        }

        event[field] = incomingValue.trim();
      }
    }

    // Handle tags update
    if (rawEvent.tags !== undefined) {
      if (typeof rawEvent.tags !== "string") {
        return NextResponse.json(
          { message: "Tags must be provided as a JSON string" },
          { status: 400 }
        );
      }

      let parsedTags: unknown;
      try {
        parsedTags = JSON.parse(rawEvent.tags);
      } catch {
        return NextResponse.json(
          { message: "Tags must be valid JSON" },
          { status: 400 }
        );
      }

      if (!Array.isArray(parsedTags) || parsedTags.length === 0) {
        return NextResponse.json(
          { message: "Tags must contain at least one item" },
          { status: 400 }
        );
      }

      event.tags = parsedTags.map((tag) => String(tag));
    }

    // Handle agenda update
    if (rawEvent.agenda !== undefined) {
      if (typeof rawEvent.agenda !== "string") {
        return NextResponse.json(
          { message: "Agenda must be provided as a JSON string" },
          { status: 400 }
        );
      }

      let parsedAgenda: unknown;
      try {
        parsedAgenda = JSON.parse(rawEvent.agenda);
      } catch {
        return NextResponse.json(
          { message: "Agenda must be valid JSON" },
          { status: 400 }
        );
      }

      if (!Array.isArray(parsedAgenda) || parsedAgenda.length === 0) {
        return NextResponse.json(
          { message: "Agenda must contain at least one item" },
          { status: 400 }
        );
      }

      event.agenda = parsedAgenda.map((item) => String(item));
    }

    // Handle optional image update
    const imageEntry = formData.get("image");
    const file =
      imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    const previousImagePublicId = event.imagePublicId;
    let uploadResult: { secure_url: string; public_id: string } | null = null;

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { message: "Only JPEG, PNG, and WebP images are allowed" },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { message: "Image size must not exceed 5MB" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        uploadResult = (await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "image", folder: "DevEvent" },
              (error, results) => {
                if (error) return reject(error);

                if (!results) {
                  return reject(
                    new Error("Image upload failed without a result")
                  );
                }

                resolve(results as { secure_url: string; public_id: string });
              }
            )
            .end(buffer);
        })) as { secure_url: string; public_id: string };

        event.image = uploadResult.secure_url;
        event.imagePublicId = uploadResult.public_id;
      } catch (uploadError) {
        return NextResponse.json(
          {
            message: "Image upload failed",
            error:
              uploadError instanceof Error ? uploadError.message : "Unknown",
          },
          { status: 500 }
        );
      }
    }

    try {
      await event.save();
    } catch (saveError) {
      if (uploadResult?.public_id) {
        try {
          await cloudinary.uploader.destroy(uploadResult.public_id);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up Cloudinary asset after save error:",
            cleanupError
          );
        }
      }

      throw saveError;
    }

    if (
      uploadResult?.public_id &&
      previousImagePublicId &&
      previousImagePublicId !== uploadResult.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(previousImagePublicId);
      } catch (destroyError) {
        console.error(
          "Failed to remove previous Cloudinary asset:",
          destroyError
        );
      }
    }

    const updatedEvent = event.toObject();

    return NextResponse.json(
      { message: "Event updated successfully", event: updatedEvent },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating event:", error);
    }

    if (error instanceof Error) {
      if (error.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          { message: "Database configuration error" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Failed to update event" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
