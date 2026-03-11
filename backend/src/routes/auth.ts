import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  req.session!.user = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  };
  res.json({
    user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
  });
});

authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username?.trim() || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing) {
    res.status(409).json({ error: "Username already exists" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username: username.trim(), passwordHash, isAdmin: false },
    select: { id: true, username: true, isAdmin: true },
  });
  res.status(201).json({ user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
});

authRouter.post("/logout", (req, res) => {
  req.session?.destroy(() => {});
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: req.session.user });
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current password and new password required" });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.session!.user!.id } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  res.json({ ok: true });
});
