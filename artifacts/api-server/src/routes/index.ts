import { Router, type IRouter } from "express";
import healthRouter from "./health";
import challengesRouter from "./challenges";
import authRouter from "./auth";
import meRouter from "./me";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/me", meRouter);
router.use("/challenges", challengesRouter);

export default router;
