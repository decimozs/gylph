import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db";
import { verifications, type UpdateVerification } from "./schema";
import { eq } from "drizzle-orm";

const app = new Hono({ strict: false })
  .basePath("/api/v1")
  .use(
    "*",
    cors({
      origin: "http://localhost:5173",
      allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE", "PUT"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .get("/signatures", async (c) => {
    const data = await db.query.signatures.findMany({
      orderBy: (sig, { desc }) => [desc(sig.createdAt)],
    });
    return c.json(data);
  })
  .get("/signatures/:id", async (c) => {
    const { id } = c.req.param();
    const data = await db.query.signatures.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        documents: {
          orderBy: (log, { desc }) => [desc(log.createdAt)],
        },
        logs: {
          orderBy: (log, { desc }) => [desc(log.createdAt)],
        },
        verifications: {
          orderBy: (ver, { desc }) => [desc(ver.createdAt)],
        },
      },
    });

    if (!data) {
      return c.json({ error: "Signature not found" }, 404);
    }

    return c.json(data);
  })
  .get("/verifications", async (c) => {
    const data = await db.query.verifications.findMany({
      orderBy: (sig, { desc }) => [desc(sig.createdAt)],
    });
    return c.json(data);
  })
  .get("/verifications/:id", async (c) => {
    const { id } = c.req.param();
    const data = await db.query.verifications.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        signature: true,
        document: true,
      },
    });

    if (!data) {
      return c.json({ error: "Verification not found" }, 404);
    }

    return c.json(data);
  })
  .put("/verifications/:id", async (c) => {
    const { id } = c.req.param();
    const body: UpdateVerification = await c.req.json();

    const data = await db
      .update(verifications)
      .set(body)
      .where(eq(verifications.id, id))
      .returning();

    if (data.length === 0) {
      return c.json({ error: "Verification not found" }, 404);
    }

    return c.json(data[0]);
  })
  .get("/documents", async (c) => {
    const data = await db.query.documents.findMany({
      with: {
        verifications: true,
      },
      orderBy: (sig, { desc }) => [desc(sig.createdAt)],
    });
    return c.json(data);
  })
  .get("/documents/:id", async (c) => {
    const { id } = c.req.param();
    const data = await db.query.documents.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        signature: true,
        verifications: true,
      },
    });

    if (!data) {
      return c.json({ error: "Document not found" }, 404);
    }

    return c.json(data);
  });

export default app;
