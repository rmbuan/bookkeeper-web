import type { Request, Response, NextFunction } from "express";

export interface SessionUser {
  id: string;
  username: string;
  isAdmin: boolean;
}

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.user?.isAdmin) {
    res.status(403).json({ error: "Admin required" });
    return;
  }
  next();
}
