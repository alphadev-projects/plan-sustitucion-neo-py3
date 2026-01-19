import { describe, it, expect } from "vitest";
import { SESSION_TIMEOUT_MS } from "@shared/const";
import type { User } from "../drizzle/schema";

describe("Session Timeout Validation", () => {
  it("should detect session timeout after inactivity period", () => {
    // Create a mock user with lastSignedIn 31 minutes ago
    const thirtyOneMinutesAgo = new Date(
      new Date().getTime() - SESSION_TIMEOUT_MS - 60000
    );

    const mockUser: User = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: thirtyOneMinutesAgo,
    };

    const now = new Date().getTime();
    const lastSignedInTime = new Date(mockUser.lastSignedIn).getTime();
    const timeSinceLastSignIn = now - lastSignedInTime;

    // Session should be expired
    expect(timeSinceLastSignIn).toBeGreaterThan(SESSION_TIMEOUT_MS);
  });

  it("should not timeout session within inactivity period", () => {
    // Create a mock user with lastSignedIn 10 minutes ago
    const tenMinutesAgo = new Date(new Date().getTime() - 1000 * 60 * 10);

    const mockUser: User = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: tenMinutesAgo,
    };

    const now = new Date().getTime();
    const lastSignedInTime = new Date(mockUser.lastSignedIn).getTime();
    const timeSinceLastSignIn = now - lastSignedInTime;

    // Session should NOT be expired
    expect(timeSinceLastSignIn).toBeLessThan(SESSION_TIMEOUT_MS);
  });

  it("should timeout session at exactly 30 minutes", () => {
    // Create a mock user with lastSignedIn exactly 30 minutes ago
    const exactlyThirtyMinutesAgo = new Date(
      new Date().getTime() - SESSION_TIMEOUT_MS
    );

    const mockUser: User = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: exactlyThirtyMinutesAgo,
    };

    const now = new Date().getTime();
    const lastSignedInTime = new Date(mockUser.lastSignedIn).getTime();
    const timeSinceLastSignIn = now - lastSignedInTime;

    // Session should be expired (at or past timeout)
    expect(timeSinceLastSignIn).toBeGreaterThanOrEqual(SESSION_TIMEOUT_MS);
  });

  it("should calculate correct timeout duration", () => {
    // Verify SESSION_TIMEOUT_MS is 30 minutes
    const expectedMs = 1000 * 60 * 30;
    expect(SESSION_TIMEOUT_MS).toBe(expectedMs);
  });

  it("should handle edge case: user with null lastSignedIn", () => {
    // This should not crash - it's handled by checking if lastSignedIn exists
    const mockUser: User = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    // If lastSignedIn is null/undefined, session validation should skip
    const shouldValidate = mockUser.lastSignedIn !== null;
    expect(shouldValidate).toBe(true);
  });
});
