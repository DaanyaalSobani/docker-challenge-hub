import { Router } from "express";
import { CHALLENGES } from "../data/challenges.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const ordered = CHALLENGES.slice().sort((a, b) => a.order - b.order);

    const result = ordered.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      category: c.category,
      order: c.order,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list challenges");
    res.status(500).json({ error: "Failed to list challenges" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const challenge = CHALLENGES.find((c) => c.id === req.params.id);

    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    const { checks: _checks, ...rest } = challenge;
    res.json(rest);
  } catch (err) {
    req.log.error({ err }, "Failed to get challenge");
    res.status(500).json({ error: "Failed to get challenge" });
  }
});

router.post("/:id/submit", async (req, res) => {
  try {
    const challenge = CHALLENGES.find((c) => c.id === req.params.id);

    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    const { files } = req.body as { files: { name: string; content: string; language: string; readonly: boolean }[] };

    if (!Array.isArray(files)) {
      res.status(400).json({ error: "files must be an array" });
      return;
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
