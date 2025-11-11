# DevEvent · Next.js 16 Demo

DevEvent is a demo application that curates developer meetups, hackathons, and conferences in one landing experience. It showcases what’s new in Next.js 16 and React 19 while integrating Tailwind CSS v4, 3D effects, and a MongoDB-backed event API.

## Tech Stack

- Next.js 16 App Router with React Compiler enabled
- React 19 with Server Components and Suspense streaming
- Tailwind CSS v4 with design tokens layered in `app/globals.css`
- MongoDB + Mongoose for persistent event storage
- Cloudinary image uploads via Next.js Route Handlers
- PostHog analytics (optional) with an ingest proxy

## Project Tour

- `app/` – routes, layouts, and route handlers (API endpoints live under `app/api`)
- `components/` – composable UI such as `Navbar`, `EventCard`, and `LightRays`
- `lib/` – constants, types, and utility helpers (e.g. `lib/actions/event.actions.ts`)
- `database/` – Mongoose models and connection logic
- `public/` – static images and icons used across the marketing site

```text
.
├── app
│   ├── page.tsx               # Landing page composed via React Server Components
│   └── api
│       └── events             # POST (create) and GET (list) event endpoints
├── components                 # Shared UI, including the WebGL light rays effect
├── database                   # Mongoose models and connection helpers
├── lib                        # Constants, async actions, types, utility functions
└── public                     # Optimized static media assets
```

## Prerequisites

- Node.js 20.11+ (aligns with Next.js 16 support matrix)
- pnpm 9.x (recommended) or npm/yarn/bun
- MongoDB Atlas or a locally running MongoDB instance
- Cloudinary account (for event image uploads)

## Quick Start

```bash
pnpm install
pnpm dev
```

The app boots on [http://localhost:3000](http://localhost:3000). Alternative scripts are available if you prefer `npm`, `yarn`, or `bun`.

## Environment Variables

Create a `.env.local` file before running the app:

| Variable                  | Required | Description                                                               |
| ------------------------- | -------- | ------------------------------------------------------------------------- |
| `MONGODB_URI`             | ✅       | Connection string for MongoDB (e.g. `mongodb+srv://...`)                  |
| `CLOUDINARY_URL`          | ✅       | Cloudinary configuration URL (`cloudinary://<key>:<secret>@<cloud_name>`) |
| `NEXT_PUBLIC_BASE_URL`    | ➕       | Canonical URL used when constructing absolute links                       |
| `NEXT_PUBLIC_POSTHOG_KEY` | ➕       | Public API key for PostHog analytics (omit to disable)                    |

> Tip: `CLOUDINARY_URL` is consumed automatically by the `cloudinary` SDK; no extra config file is needed.

## Available Scripts

- `pnpm dev` – Start the development server with Turbopack caching.
- `pnpm build` – Generate the production build.
- `pnpm start` – Run the compiled build locally.
- `pnpm lint` – Execute ESLint using the Next.js Core Web Vitals ruleset.

## API Overview

- `POST /api/events` – Validates multipart form data, uploads an event cover image to Cloudinary, and persists metadata to MongoDB.
- `GET /api/events` – Returns the latest events sorted by creation date.

Both handlers reuse the cached MongoDB connection exported from `lib/mongodb.ts`. Errors are surfaced with appropriate HTTP status codes and JSON payloads.

## Analytics & Instrumentation

`instrumentation-client.ts` initializes PostHog in the browser when `NEXT_PUBLIC_POSTHOG_KEY` is present. Missing keys degrade gracefully with a console warning, so you can omit the variable for local development.

## Deployment

Run `pnpm build` to generate the production bundle. The project targets [Vercel](https://vercel.com) by default, but any Node.js hosting provider with support for the Next.js App Router, edge runtime, and environment variables will work. Remember to configure your secrets (`MONGODB_URI`, `CLOUDINARY_URL`, etc.) in the hosting environment.

## Contributing & Next Steps

Want to extend the demo? Ideas:

- Add authentication-gated event creation
- Expand test coverage with Jest/React Testing Library
- Replace the static marketing copy in `lib/constants.ts` with CMS-driven content

Feel free to open issues or PRs with improvements. Have fun exploring what’s possible with Next.js 16!
