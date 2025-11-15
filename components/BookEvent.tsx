"use client";

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId }: { eventId: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    const { success, error } = await createBooking({ eventId, email });
    setLoading(false);

    if (success) {
      setSubmitted(true);
      posthog.capture("event_booked", { eventId });
    } else {
      console.error("Booking creation failed");

      setError(error || "Booking failed. Please try again.");
      posthog.capture("booking_failed", { eventId });
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm" role="status" aria-live="polite">
          Thank you for signing up!
        </p>
      ) : (
        <form onSubmit={handleSubmit} aria-label="Event booking form">
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              required
              disabled={loading}
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "email-error" : undefined}
            />
          </div>

          {error && (
            <p
              id="email-error"
              className="text-red-500 text-sm"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button-submit"
            disabled={loading}
            aria-label={loading ? "Submitting booking" : "Submit booking"}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
