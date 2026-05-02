import { Router } from "express";
import { db } from "@workspace/db";
import { userProgressTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CHALLENGES } from "../data/challenges.js";

const router = Router();

function getSessionId(req: any): string {
  return req.session.id as string;
}

async function getCompletedIds(sessionId: string): Promise<string[]> {
  const rows = await db
    .select({ challengeId: userProgressTable.challengeId })
    .from(userProgressTable)
    .where(eq(userProgressTable.sessionId, sessionId));
  return rows.map((r) => r.challengeId);
}

router.get("/", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const completedIds = await getCompletedIds(sessionId);

    res.json({
      completedIds,
      totalCompleted: completedIds.length,
      totalChallenges: CHALLENGES.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress");
    res.status(500).json({ error: "Failed to get progress" });
  }
});

router.post("/:challengeId/complete", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { challengeId } = req.params;

    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Upsert: only insert if not already completed
    const existing = await db
      .select()
      .from(userProgressTable)
      .where(
        and(
          eq(userProgressTable.sessionId, sessionId),
          eq(userProgressTable.challengeId, challengeId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userProgressTable).values({
        sessionId,
        challengeId,
      });
    }

    const completedIds = await getCompletedIds(sessionId);

    res.json({
      completedIds,
      totalCompleted: completedIds.length,
      totalChallenges: CHALLENGES.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to mark challenge complete");
    res.status(500).json({ error: "Failed to mark challenge complete" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const sessionId = getSessionId(req);

    await db
      .delete(userProgressTable)
      .where(eq(userProgressTable.sessionId, sessionId));

    res.json({
      completedIds: [],
      totalCompleted: 0,
      totalChallenges: CHALLENGES.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to reset progress");
    res.status(500).json({ error: "Failed to reset progress" });
  }
});

export default router;
