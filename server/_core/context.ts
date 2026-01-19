import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { SESSION_TIMEOUT_MS, COOKIE_NAME, LOCAL_AUTH_COOKIE_NAME } from "@shared/const";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
    
    // Validate session timeout: check if user's lastSignedIn exceeds timeout
    if (user && user.lastSignedIn) {
      const now = new Date().getTime();
      const lastSignedInTime = new Date(user.lastSignedIn).getTime();
      const timeSinceLastSignIn = now - lastSignedInTime;
      
      if (timeSinceLastSignIn > SESSION_TIMEOUT_MS) {
        console.log(
          `[Auth] Session expired for user ${user.openId}. ` +
          `Inactive for ${Math.round(timeSinceLastSignIn / 1000 / 60)} minutes`
        );
        // Clear session cookies to force re-login
        const cookieOptions = getSessionCookieOptions(opts.req);
        opts.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        opts.res.clearCookie(LOCAL_AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        user = null;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
