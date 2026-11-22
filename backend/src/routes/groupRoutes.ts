import { Router } from "express";
import * as groupController from "../controllers/groupController.js";
import { validateBody, validateIdParam, validateQuery } from "../middleware/validate.js";
import { moveToQuery } from "../schemas/common.js";
import { createGroupSchema, updateGroupSchema } from "../schemas/group.js";

export const groupRoutes = Router();

groupRoutes.param("id", validateIdParam);

groupRoutes.post("/", validateBody(createGroupSchema), groupController.createGroup);
groupRoutes.patch("/:id", validateBody(updateGroupSchema), groupController.updateGroup);
groupRoutes.delete("/:id", validateQuery(moveToQuery), groupController.deleteGroup);
