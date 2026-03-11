import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const booksRouter = Router();

booksRouter.use(requireAuth);

const selectBook = {
  id: true,
  bkTitle: true,
  bkNumber: true,
  stName: true,
  stNumber: true,
  stTaName: true,
  stTaNumber: true,
  stSbCode: true,
  createdAt: true,
  updatedAt: true,
};

booksRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { stNumber: { contains: search, mode: "insensitive" as const } },
          { bkTitle: { contains: search, mode: "insensitive" as const } },
          { stName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, select: selectBook, orderBy: { updatedAt: "desc" }, skip, take: limit }),
    prisma.book.count({ where }),
  ]);

  res.json({ books, total, page, limit });
});

booksRouter.get("/:id", async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: req.params.id },
    select: selectBook,
  });
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(book);
});

booksRouter.post("/", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const data = {
    bkTitle: String(body.bkTitle ?? "").slice(0, 200),
    bkNumber: String(body.bkNumber ?? "").slice(0, 200),
    stName: String(body.stName ?? "").slice(0, 200),
    stNumber: String(body.stNumber ?? "").slice(0, 200),
    stTaName: String(body.stTaName ?? "").slice(0, 200),
    stTaNumber: String(body.stTaNumber ?? "").slice(0, 200),
    stSbCode: String(body.stSbCode ?? "").slice(0, 200),
    userId: req.session?.user?.id ?? null,
  };
  const book = await prisma.book.create({ data, select: selectBook });
  res.status(201).json(book);
});

booksRouter.patch("/:id", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const data: Record<string, string> = {};
  const keys = ["bkTitle", "bkNumber", "stName", "stNumber", "stTaName", "stTaNumber", "stSbCode"] as const;
  for (const key of keys) {
    if (body[key] !== undefined) data[key] = String(body[key]).slice(0, 200);
  }
  const book = await prisma.book
    .update({ where: { id: req.params.id }, data, select: selectBook })
    .catch(() => null);
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(book);
});

booksRouter.delete("/:id", async (req, res) => {
  await prisma.book.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).send();
});
