import { describe, it, expect, beforeAll } from "@jest/globals";
import type { NextConfig } from "next";
import defaultNextConfig from "./next.config";

type RewriteRule = {
  source: string;
  destination: string;
  [key: string]: unknown;
};

const getRewrites = async (
  config: NextConfig = defaultNextConfig
): Promise<RewriteRule[]> => {
  const rewrites = config.rewrites;

  if (typeof rewrites === "function") {
    const result = await rewrites();
    return Array.isArray(result) ? (result as RewriteRule[]) : [];
  }

  return Array.isArray(rewrites) ? (rewrites as RewriteRule[]) : [];
};

describe("Next.js PostHog Configuration", () => {
  let nextConfig: NextConfig;

  beforeAll(async () => {
    // Import the config
    const configModule = await import("./next.config");
    nextConfig = configModule.default;
  });

  describe("PostHog rewrites", () => {
    it("should correctly configure the PostHog rewrites", async () => {
      // Assert rewrites function exists
      expect(nextConfig.rewrites).toBeDefined();
      expect(typeof nextConfig.rewrites).toBe("function");

      // Get rewrites
      const rewrites = await getRewrites();

      // Assert rewrites structure
      expect(Array.isArray(rewrites)).toBe(true);
      expect(rewrites).toHaveLength(2);
    });

    it("should configure static assets rewrite correctly", async () => {
      // Get rewrites
      const rewrites = await getRewrites();

      // Find static assets rewrite
      const staticRewrite = rewrites.find(
        (rewrite) => rewrite.source === "/ingest/static/:path*"
      );

      // Assert
      expect(staticRewrite).toBeDefined();
      expect(staticRewrite).toEqual({
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      });
    });

    it("should configure main ingest rewrite correctly", async () => {
      // Get rewrites
      const rewrites = await getRewrites();

      // Find main ingest rewrite
      const ingestRewrite = rewrites.find(
        (rewrite) => rewrite.source === "/ingest/:path*"
      );

      // Assert
      expect(ingestRewrite).toBeDefined();
      expect(ingestRewrite).toEqual({
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      });
    });

    it("should have static assets rewrite before main ingest rewrite", async () => {
      // Get rewrites
      const rewrites = await getRewrites();

      // Find indices
      const staticIndex = rewrites.findIndex(
        (rewrite) => rewrite.source === "/ingest/static/:path*"
      );
      const ingestIndex = rewrites.findIndex(
        (rewrite) => rewrite.source === "/ingest/:path*"
      );

      // Assert order (static should come first to be more specific)
      expect(staticIndex).toBeLessThan(ingestIndex);
    });
  });

  describe("PostHog trailing slash configuration", () => {
    it("should set skipTrailingSlashRedirect to true for PostHog compatibility", () => {
      // Assert
      expect(nextConfig.skipTrailingSlashRedirect).toBe(true);
    });
  });

  describe("Other configuration options", () => {
    it("should have React compiler enabled", () => {
      expect(nextConfig.reactCompiler).toBe(true);
    });

    it("should have Turbopack file system cache enabled for dev", () => {
      expect(nextConfig.experimental?.turbopackFileSystemCacheForDev).toBe(
        true
      );
    });
  });
});
