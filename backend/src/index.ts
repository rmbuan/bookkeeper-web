import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { booksRouter } from "./routes/books.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "bookkeeper-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/books", booksRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Bookkeeper API listening on http://localhost:${PORT}`);
});
