import { Router } from "express";
import { db } from "@workspace/db";
import { userProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CHALLENGES, getChallengeOrder } from "../data/challenges.js";

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

function isLocked(challengeId: string, completedIds: string[]): boolean {
  const order = getChallengeOrder();
  const idx = order.indexOf(challengeId);
  if (idx === 0) return false;
  const prev = order[idx - 1];
  return !completedIds.includes(prev);
}

router.get("/", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const completedIds = await getCompletedIds(sessionId);
    const ordered = CHALLENGES.slice().sort((a, b) => a.order - b.order);

    const result = ordered.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      category: c.category,
      order: c.order,
      completed: completedIds.includes(c.id),
      locked: isLocked(c.id, completedIds),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list challenges");
    res.status(500).json({ error: "Failed to list challenges" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const completedIds = await getCompletedIds(sessionId);

    const byCategory: Record<string, { total: number; completed: number }> = {};
    const byDifficulty: Record<string, { total: number; completed: number }> = {};

    for (const c of CHALLENGES) {
      if (!byCategory[c.category]) byCategory[c.category] = { total: 0, completed: 0 };
      byCategory[c.category].total++;
      if (completedIds.includes(c.id)) byCategory[c.category].completed++;

      if (!byDifficulty[c.difficulty]) byDifficulty[c.difficulty] = { total: 0, completed: 0 };
      byDifficulty[c.difficulty].total++;
      if (completedIds.includes(c.id)) byDifficulty[c.difficulty].completed++;
    }

    res.json({
      total: CHALLENGES.length,
      completed: completedIds.length,
      byCategory,
      byDifficulty,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const completedIds = await getCompletedIds(sessionId);
    const challenge = CHALLENGES.find((c) => c.id === req.params.id);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const { checks: _checks, ...rest } = challenge;

    res.json({
      ...rest,
      completed: completedIds.includes(challenge.id),
      locked: isLocked(challenge.id, completedIds),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get challenge");
    res.status(500).json({ error: "Failed to get challenge" });
  }
});

router.post("/:id/submit", async (req, res) => {
  try {
    const challenge = CHALLENGES.find((c) => c.id === req.params.id);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const { files } = req.body as { files: { name: string; content: string; language: string; readonly: boolean }[] };

    if (!Array.isArray(files)) {
      return res.status(400).json({ error: "files must be an array" });
    }

    const checkResults = challenge.checks.map((check) => {
      let passed = false;
      try {
        passed = check.fn(files);
      } catch (_e) {
        passed = false;
      }
      return {
        name: check.name,
        passed,
        message: passed ? `${check.name}: passed` : check.message,
      };
    });

    const passedCount = checkResults.filter((c) => c.passed).length;
    const totalCount = checkResults.length;
    const allPassed = passedCount === totalCount;

    const outputLines: string[] = [
      `$ docker build . --no-cache`,
      `[+] Running ${passedCount}/${totalCount} checks`,
      "",
      ...checkResults.map((c) => (c.passed ? `  ✓ ${c.name}` : `  ✗ ${c.name}: ${c.message}`)),
      "",
      allPassed
        ? `Successfully validated! All ${totalCount} checks passed.`
        : `Build failed. ${totalCount - passedCount} check(s) did not pass.`,
    ];

    const feedback = allPassed
      ? `Great work! Your ${challenge.category === "dockerfile" ? "Dockerfile" : "docker-compose.yml"} is correct. All checks passed.`
      : `Not quite. ${totalCount - passedCount} check(s) failed. Review the hints and try again.`;

    res.json({
      passed: allPassed,
      score: passedCount,
      maxScore: totalCount,
      checks: checkResults,
      feedback,
      output: outputLines.join("\n"),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit challenge");
    res.status(500).json({ error: "Failed to submit challenge" });
  }
});

export default router;
