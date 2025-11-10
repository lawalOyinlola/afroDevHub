import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Types } from "mongoose";

import connectDB from "@/lib/mongodb";
import Event, {
  generateSlug,
  normalizeDate,
  normalizeTime,
} from "@/database/event.model";
import Booking from "@/database/booking.model";

// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

async function generateUniqueSlugForUpdate(
  title: string,
  eventId: Types.ObjectId
): Promise<string> {
  const baseSlug = generateSlug(title);
  let candidateSlug = baseSlug;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const conflict = await Event.exists({
      slug: candidateSlug,
      _id: { $ne: eventId },
    });

    if (!conflict) {
      return candidateSlug;
    }

    attempts += 1;
    candidateSlug = `${baseSlug}-${Date.now()}-${attempts}`;
  }

  throw new Error("Failed to generate a unique slug");
}

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

    const eventId = event._id as Types.ObjectId;

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

    const setOperations: Record<string, unknown> = {};
    let nextTitle: string | null = null;

    for (const field of requiredStringFields) {
      const incomingValue = rawEvent[field];

      if (incomingValue === undefined) {
        continue;
      }

      if (typeof incomingValue !== "string") {
        return NextResponse.json(
          { message: `${field} must be a string` },
          { status: 400 }
        );
      }

      const trimmedValue = incomingValue.trim();

      if (trimmedValue === "") {
        return NextResponse.json(
          { message: `${field} cannot be empty` },
          { status: 400 }
        );
      }

      if (field === "title") {
        nextTitle = trimmedValue;
        setOperations.title = trimmedValue;
        continue;
      }

      if (field === "date") {
        try {
          setOperations.date = normalizeDate(trimmedValue);
        } catch {
          return NextResponse.json(
            { message: "Invalid date format" },
            { status: 400 }
          );
        }
        continue;
      }

      if (field === "time") {
        setOperations.time = normalizeTime(trimmedValue);
        continue;
      }

      setOperations[field] = trimmedValue;
    }

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

      setOperations.tags = parsedTags.map((tag) => String(tag));
    }

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

      setOperations.agenda = parsedAgenda.map((item) => String(item));
    }

    if (nextTitle !== null && nextTitle !== event.title) {
      try {
        setOperations.slug = await generateUniqueSlugForUpdate(
          nextTitle,
          eventId
        );
      } catch (slugError) {
        return NextResponse.json(
          {
            message:
              slugError instanceof Error
                ? slugError.message
                : "Failed to generate event slug",
          },
          { status: 500 }
        );
      }
    }

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

        setOperations.image = uploadResult.secure_url;
        setOperations.imagePublicId = uploadResult.public_id;
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

    if (Object.keys(setOperations).length === 0) {
      const existingEvent = event.toObject();
      return NextResponse.json(
        {
          message: "No changes provided",
          event: existingEvent,
        },
        { status: 200 }
      );
    }

    const currentVersion =
      typeof event.__v === "number" ? event.__v : event.__v ?? 0;

    const filter = { _id: eventId, __v: currentVersion };
    const updateInstruction: Record<string, unknown> = {
      $set: setOperations,
      $inc: { __v: 1 },
    };

    let updatedEvent;

    try {
      updatedEvent = await Event.findOneAndUpdate(filter, updateInstruction, {
        new: true,
        runValidators: true,
        context: "query",
        timestamps: true,
      });
    } catch (updateError) {
      if (uploadResult?.public_id) {
        try {
          await cloudinary.uploader.destroy(uploadResult.public_id);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up Cloudinary asset after update error:",
            cleanupError
          );
        }
      }

      throw updateError;
    }

    if (!updatedEvent) {
      if (uploadResult?.public_id) {
        try {
          await cloudinary.uploader.destroy(uploadResult.public_id);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up Cloudinary asset after conflict:",
            cleanupError
          );
        }
      }

      return NextResponse.json(
        { message: "Event update conflict. Please retry." },
        { status: 409 }
      );
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

    const updatedEventObject = updatedEvent.toObject();

    return NextResponse.json(
      { message: "Event updated successfully", event: updatedEventObject },
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
