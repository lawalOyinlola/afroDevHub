# devfest-nextjs16

DevEvent is a Next.js 16 demo that curates developer meetups, hackathons, and conferences in a single landing page experience.

## Getting Started

```bash
pnpm install
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

If you prefer a different package manager, the following scripts are also available:

```bash
npm run dev
yarn dev
bun dev
```

## Available Scripts

- `pnpm dev` – start the development server with Turbopack file-system caching.
- `pnpm build` – create an optimized production build.
- `pnpm start` – run the production server locally.
- `pnpm lint` – run ESLint with the Next.js core web vitals setup.

## Project Highlights

- Next.js 16 App Router with React 19 and the React Compiler enabled in `next.config.ts`.
- Tailwind CSS v4 with custom theme tokens defined in `app/globals.css` and utility helpers via `lib/utils.ts`.
- WebGL-based light ray effect implemented in `components/LightRays.tsx` using `ogl`.
- Reusable UI primitives such as `Navbar`, `ExploreBtn`, and `EventCard` driven by data in `lib/constants.ts`.

## Directory Overview

- `app/` – application routes, layout, and global styles.
- `components/` – shared UI components and interactive effects.
- `lib/` – constants, types, and utility helpers.
- `public/` – static assets including icons and event imagery.

## Deployment

The project is optimized for deployment on [Vercel](https://vercel.com). Run `pnpm build` to produce the production build and follow Vercel's deployment guide for Next.js App Router projects.
