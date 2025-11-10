import posthog from "posthog-js";

const posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();

let posthogClient: typeof posthog | null = null;

if (posthogApiKey) {
  posthog.init(posthogApiKey, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
    debug: process.env.NODE_ENV === "development",
  });

  posthogClient = posthog;
} else {
  console.warn(
    "PostHog analytics key missing. Skipping PostHog initialization."
  );
}

export { posthogClient };
