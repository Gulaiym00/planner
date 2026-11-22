import { Router } from "express";
import { eventRoutes } from "./eventRoutes.js";
import { groupRoutes } from "./groupRoutes.js";
import { sphereRoutes } from "./sphereRoutes.js";
import { taskRoutes } from "./taskRoutes.js";

export const apiRoutes = Router();

apiRoutes.use("/spheres", sphereRoutes);
apiRoutes.use("/groups", groupRoutes);
apiRoutes.use("/tasks", taskRoutes);
apiRoutes.use("/events", eventRoutes);
