import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";

type PosthogMock = {
  init: jest.Mock;
};

describe("PostHog Client Initialization", () => {
  let posthogMock: PosthogMock;
  let originalEnv: NodeJS.ProcessEnv;
  const setNodeEnv = (value: NodeJS.ProcessEnv["NODE_ENV"]) => {
    process.env = { ...process.env, NODE_ENV: value };
  };

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Mock posthog-js module
    posthogMock = {
      init: jest.fn(),
    };

    jest.unstable_mockModule("posthog-js", () => ({
      default: posthogMock,
    }));
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.resetModules();
  });

  it("should initialize PostHog client with the correct API key from environment variables", async () => {
    // Arrange
    const mockApiKey = "test-api-key-12345";
    process.env.NEXT_PUBLIC_POSTHOG_KEY = mockApiKey;

    // Act
    const { posthogClient } = await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).toHaveBeenCalledWith(
      mockApiKey,
      expect.any(Object)
    );
    expect(posthogClient).toBe(posthogMock);
  });

  it("should configure PostHog client with the correct api_host and ui_host", async () => {
    // Arrange
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-api-key";

    // Act
    await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        api_host: "/ingest",
        ui_host: "https://eu.posthog.com",
      })
    );
  });

  it("should enable exception capturing when capture_exceptions is true", async () => {
    // Arrange
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-api-key";

    // Act
    await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        capture_exceptions: true,
      })
    );
  });

  it("should set debug mode to true when NODE_ENV is development", async () => {
    // Arrange
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-api-key";
    setNodeEnv("development");

    // Act
    await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        debug: true,
      })
    );
  });

  it("should set debug mode to false when NODE_ENV is production", async () => {
    // Arrange
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-api-key";
    setNodeEnv("production");

    // Act
    await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        debug: false,
      })
    );
  });

  it("should set debug mode to false when NODE_ENV is test", async () => {
    // Arrange
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-api-key";
    setNodeEnv("test");

    // Act
    await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        debug: false,
      })
    );
  });

  it("should configure PostHog with defaults version", async () => {
    // Arrange
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-api-key";

    // Act
    await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        defaults: "2025-05-24",
      })
    );
  });

  it("should skip initialization and warn when API key is missing", async () => {
    // Arrange
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    // Act
    const { posthogClient } = await import("./instrumentation-client");

    // Assert
    expect(posthogMock.init).not.toHaveBeenCalled();
    expect(posthogClient).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "PostHog analytics key missing. Skipping PostHog initialization."
    );

    warnSpy.mockRestore();
  });
});
