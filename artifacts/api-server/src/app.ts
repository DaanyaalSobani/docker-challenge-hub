import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Same-origin in production (the shared proxy fronts both the API and the
// frontend), but allow the configured Replit dev/published domains to send
// credentialed requests. Reflecting arbitrary origins with `credentials: true`
// would let any third-party site make authenticated calls against /api/me/*.
const allowedOrigins = new Set<string>(
  [
    ...(process.env["REPLIT_DOMAINS"]?.split(",") ?? []),
    process.env["REPLIT_DEV_DOMAIN"],
  ]
    .filter((d): d is string => Boolean(d))
    .flatMap((d) => [`https://${d}`, `http://${d}`]),
);

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // Same-origin requests have no Origin header; always allow.
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(null, false);
    },
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
