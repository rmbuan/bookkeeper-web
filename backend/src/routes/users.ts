import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.use(requireAdmin);

usersRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { username: "asc" },
    select: { id: true, username: true, isAdmin: true, createdAt: true },
  });
  res.json(users);
});

usersRouter.post("/", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username?.trim() || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing) {
    res.status(409).json({ error: "Username already exists" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username: username.trim(), passwordHash },
    select: { id: true, username: true, isAdmin: true },
  });
  res.status(201).json(user);
});

usersRouter.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const { username, password, isAdmin } = req.body as {
    username?: string;
    password?: string;
    isAdmin?: boolean;
  };
  const data: { username?: string; passwordHash?: string; isAdmin?: boolean } = {};
  if (username !== undefined) data.username = username.trim();
  if (password !== undefined && password !== "") data.passwordHash = await bcrypt.hash(password, 10);
  if (isAdmin !== undefined) data.isAdmin = Boolean(isAdmin);
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, username: true, isAdmin: true },
  }).catch(() => null);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

usersRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await prisma.user.delete({ where: { id } }).catch(() => null);
  res.status(204).send();
});
