import express from "express";
import cors from "cors";
import { config } from "../config/index.js";
import { errorHandler, notFound } from "../middleware/errorHandler.js";
import { apiRoutes } from "../routes/index.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
