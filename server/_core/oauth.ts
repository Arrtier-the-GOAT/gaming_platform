import type { Express, Request, Response } from "express";

// OAuth flow has been replaced by local email/password authentication.
export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", (_req: Request, res: Response) => {
    res.status(410).json({
      error: "OAuth flow is disabled",
      message: "Use /login with email and password.",
    });
  });
}
