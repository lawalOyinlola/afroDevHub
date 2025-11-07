// Central export point for all database models
// Import Event first to ensure it's registered before Booking (which references it)

export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";

// Re-export types for convenience
export type { IEvent } from "./event.model";
export type { IBooking } from "./booking.model";
