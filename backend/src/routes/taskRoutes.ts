import { Router } from "express";
import * as taskController from "../controllers/taskController.js";
import { validateBody, validateIdParam, validateQuery } from "../middleware/validate.js";
import { createTaskSchema, listTasksQuery, updateTaskSchema } from "../schemas/task.js";

export const taskRoutes = Router();

taskRoutes.param("id", validateIdParam);

taskRoutes.get("/", validateQuery(listTasksQuery), taskController.getTasks);
taskRoutes.get("/:id", taskController.getTask);
taskRoutes.post("/", validateBody(createTaskSchema), taskController.createTask);
taskRoutes.patch("/:id", validateBody(updateTaskSchema), taskController.updateTask);
taskRoutes.delete("/:id", taskController.deleteTask);
