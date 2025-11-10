import mongoose, { Schema, Document, Model, Types } from "mongoose";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Schema definition with validation and references
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event", // Reference to Event model
      required: [true, "Event ID is required"],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // Basic email validation; for full RFC compliance, prefer a dedicated library
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook to ensure dependencies are loaded and booking data is valid
bookingSchema.pre<IBooking>("save", async function (next) {
  try {
    // Only validate eventId if it's new or has been modified
    if (this.isNew || this.isModified("eventId")) {
      // Check if Event model exists to avoid circular dependency issues
      const EventModel = mongoose.models.Event;

      if (!EventModel) {
        throw new Error(
          "Event model not found. Ensure Event model is imported before Booking."
        );
      }
    }

    // Validate email is not empty after trimming
    if (this.email.trim() === "") {
      throw new Error("Email cannot be empty");
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Create and export Booking model
// Uses existing model if already compiled (prevents OverwriteModelError in development)
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
