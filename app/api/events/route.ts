import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    let rawEvent: Record<string, FormDataEntryValue>;

    try {
      rawEvent = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON data format" },
        { status: 400 }
      );
    }

    const file = formData.get("image") as File | null;

    if (!file)
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );

    let tags: string[];
    let agenda: string[];

    try {
      tags = JSON.parse(String(rawEvent.tags ?? "[]"));
      agenda = JSON.parse(String(rawEvent.agenda ?? "[]"));
    } catch {
      return NextResponse.json(
        { message: "Tags and agenda must be valid JSON arrays" },
        { status: 400 }
      );
    }

    const eventPayload = {
      title: String(rawEvent.title ?? ""),
      description: String(rawEvent.description ?? ""),
      overview: String(rawEvent.overview ?? ""),
      image: "",
      venue: String(rawEvent.venue ?? ""),
      location: String(rawEvent.location ?? ""),
      date: String(rawEvent.date ?? ""),
      time: String(rawEvent.time ?? ""),
      mode: String(rawEvent.mode ?? ""),
      audience: String(rawEvent.audience ?? ""),
      organizer: String(rawEvent.organizer ?? ""),
      tags,
      agenda,
    };

    const requiredStringFields: Array<keyof typeof eventPayload> = [
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
      const value = eventPayload[field];
      if (typeof value === "string" && value.trim() === "") {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { message: "Tags must contain at least one item" },
        { status: 400 }
      );
    }

    if (!Array.isArray(agenda) || agenda.length === 0) {
      return NextResponse.json(
        { message: "Agenda must contain at least one item" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let uploadResult: { secure_url: string; public_id: string } | null = null;

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
    } catch (error) {
      return NextResponse.json(
        {
          message: "Image upload failed",
          error: error instanceof Error ? error.message : "Unknown",
        },
        { status: 502 }
      );
    }

    eventPayload.image = uploadResult.secure_url;

    try {
      const createdEvent = await Event.create(eventPayload);

      return NextResponse.json(
        { message: "Event created successfully", event: createdEvent },
        { status: 201 }
      );
    } catch (error) {
      if (uploadResult?.public_id) {
        try {
          await cloudinary.uploader.destroy(uploadResult.public_id);
        } catch (destroyError) {
          console.error("Failed to clean up Cloudinary asset:", destroyError);
        }
      }

      throw error;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Event fetching failed", error: e },
      { status: 500 }
    );
  }
}
