import mongoose, { Schema, Document, Model } from "mongoose";

//  TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  imagePublicId: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

//  Event Schema definition with validation and constraints
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be less than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description must be less than 1000 characters"],
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
      maxlength: [500, "Overview must be less than 500 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: [true, "Image public ID is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must contain at least one tag",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Generate URL-friendly slug from title
// Converts to lowercase, replaces spaces and special chars with hyphens
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Normalize date to ISO format (YYYY-MM-DD)
// Accepts various date formats and converts to standard ISO date string
export function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Normalize time to 24-hour format (HH:MM)
export function normalizeTime(timeString: string): string {
  // Remove whitespace
  const cleaned = timeString.trim();

  // Check if already in HH:MM format (24-hour)
  const time24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (time24Regex.test(cleaned)) {
    return cleaned;
  }

  // Parse 12-hour format (e.g., "2:30 PM", "02:30PM", "2:30pm")
  const time12Regex = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/;
  const match = cleaned.match(time12Regex);

  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3].toUpperCase();

    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  // If format is not recognized, return as is
  // In production, you might want to throw an error instead
  return cleaned;
}

// Pre-save hook for slug generation, date/time normalization, and validation
//  Runs before document is saved to the database
eventSchema.pre<IEvent>("save", async function (next) {
  try {
    // Generate slug only if title is new or modified
    if (this.isModified("title")) {
      const EventModel = this.constructor as Model<IEvent>;
      const baseSlug = generateSlug(this.title);
      let candidateSlug = baseSlug;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const conflict = await EventModel.exists({
          slug: candidateSlug,
          ...(this.isNew ? {} : { _id: { $ne: this._id } }),
        });

        if (!conflict) {
          this.slug = candidateSlug;
          break;
        }

        attempts += 1;
        candidateSlug = `${baseSlug}-${Date.now()}-${attempts}`;
      }

      if (!this.slug) {
        throw new Error("Failed to generate a unique slug");
      }
    }

    // Normalize date to ISO format if modified
    if (this.isModified("date")) {
      this.date = normalizeDate(this.date);
    }

    // Normalize time to 24-hour format if modified
    if (this.isModified("time")) {
      this.time = normalizeTime(this.time);
    }

    // Validate non-empty required fields
    const requiredFields = [
      "title",
      "description",
      "overview",
      "image",
      "imagePublicId",
      "venue",
      "location",
      "date",
      "time",
      "mode",
      "audience",
      "organizer",
    ];

    for (const field of requiredFields) {
      const value = this[field as keyof IEvent];
      if (typeof value === "string" && value.trim() === "") {
        throw new Error(`${field} cannot be empty`);
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

eventSchema.post(
  "save",
  async function (
    error: unknown,
    doc: IEvent,
    next: (err?: Error | null) => void
  ) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000 &&
      error.keyPattern?.slug
    ) {
      const eventDoc = doc as IEvent & { __slugRetryCount?: number };
      const retryCount = eventDoc.__slugRetryCount ?? 0;
      if (retryCount >= 3) {
        return next(error);
      }

      eventDoc.__slugRetryCount = retryCount + 1;

      const baseSlug = generateSlug(eventDoc.title);
      eventDoc.slug = `${baseSlug}-${Date.now()}-${retryCount + 1}`;

      try {
        await eventDoc.save();
        return next();
      } catch (retryError) {
        return next(
          retryError instanceof Error
            ? retryError
            : new Error("Failed to retry event save")
        );
      }
    }

    next(error instanceof Error ? error : undefined);
  }
);

//  Create and export Event model
// Uses existing model if already compiled (prevents OverwriteModelError in development)
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
