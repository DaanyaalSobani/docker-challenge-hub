import { Router, type IRouter, type Request, type Response } from "express";
import { db, userProgressTable } from "@workspace/db";
import { GetMyProgressResponse, PutMyProgressBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const EMPTY_PROGRESS = { completedIds: [], submissions: {} };

router.get("/progress", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [row] = await db
    .select()
    .from(userProgressTable)
    .where(eq(userProgressTable.userId, req.user.id));

  const data = row?.data ?? EMPTY_PROGRESS;
  const parsed = GetMyProgressResponse.safeParse(data);
  res.json(parsed.success ? parsed.data : EMPTY_PROGRESS);
});

router.put("/progress", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = PutMyProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid progress payload" });
    return;
  }

  const data = parsed.data;
  await db
    .insert(userProgressTable)
    .values({ userId: req.user.id, data })
    .onConflictDoUpdate({
      target: userProgressTable.userId,
      set: { data, updatedAt: new Date() },
    });

  res.json(data);
});

export default router;
