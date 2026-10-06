import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import { prisma } from "./prisma.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const publicDir = path.resolve(process.cwd(), "public");

app.use(express.json());
app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/users", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { notes: true } } },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.post("/users", async (req, res, next) => {
  try {
    const { name, email } = req.body as { name?: string; email?: string };
    if (!name?.trim() || !email?.trim()) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }

    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.trim().toLowerCase() },
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

app.get("/notes", async (req, res, next) => {
  try {
    const published =
      req.query.published === undefined
        ? undefined
        : req.query.published === "true";

    const notes = await prisma.note.findMany({
      where: published === undefined ? undefined : { published },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

app.get("/notes/:id", async (req, res, next) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    if (!note) {
      res.status(404).json({ error: "note not found" });
      return;
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

app.post("/notes", async (req, res, next) => {
  try {
    const { title, content, authorId, published } = req.body as {
      title?: string;
      content?: string;
      authorId?: string;
      published?: boolean;
    };

    if (!title?.trim() || !content?.trim() || !authorId?.trim()) {
      res.status(400).json({ error: "title, content, and authorId are required" });
      return;
    }

    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) {
      res.status(400).json({ error: "author does not exist" });
      return;
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId,
        published: Boolean(published),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

app.patch("/notes/:id", async (req, res, next) => {
  try {
    const existing = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "note not found" });
      return;
    }

    const { title, content, published } = req.body as {
      title?: string;
      content?: string;
      published?: boolean;
    };

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(content !== undefined ? { content: content.trim() } : {}),
        ...(published !== undefined ? { published: Boolean(published) } : {}),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    res.json(note);
  } catch (error) {
    next(error);
  }
});

app.delete("/notes/:id", async (req, res, next) => {
  try {
    const existing = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "note not found" });
      return;
    }

    await prisma.note.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    res.status(409).json({ error: "a record with that unique value already exists" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "internal server error" });
});

const server = app.listen(port, () => {
  console.log(`Notes API listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
