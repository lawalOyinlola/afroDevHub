import mongoose from "mongoose";

/**
 * Global type declaration for caching the Mongoose connection
 * This prevents TypeScript errors when accessing global.mongoose
 */
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

/**
 * MongoDB connection URI from environment variables
 * Throws an error if MONGODB_URI is not defined
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Cached connection object to prevent multiple connections in development
 * In production, Next.js will not reinitialize the module, so caching is less critical
 * In development, hot reloading can cause multiple connections without caching
 */
let cached = global.__mongooseCache;

if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null };
}

/**
 * Establishes and returns a cached MongoDB connection using Mongoose
 *
 * @returns Promise<mongoose.Connection> - The active Mongoose connection
 *
 * How it works:
 * 1. Checks if a connection already exists and returns it
 * 2. If no connection promise exists, creates a new connection with optimized options
 * 3. Caches both the promise and the resolved connection for future use
 * 4. Ensures only one connection is active at a time, even with hot reloading
 */
async function connectDB(): Promise<mongoose.Connection> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create a new connection promise if one doesn't exist
  if (!cached.promise) {
    const options: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable Mongoose buffering for better error handling
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, options)
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      });
  }

  try {
    // Wait for the connection promise to resolve and cache the connection
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise cache on connection failure to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
