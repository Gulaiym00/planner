import { Router } from "express";
import * as sphereController from "../controllers/sphereController.js";
import { validateBody, validateIdParam, validateQuery } from "../middleware/validate.js";
import { moveToQuery } from "../schemas/common.js";
import { createSphereSchema, listSpheresQuery, updateSphereSchema } from "../schemas/sphere.js";

export const sphereRoutes = Router();

sphereRoutes.param("id", validateIdParam);

sphereRoutes.get("/", validateQuery(listSpheresQuery), sphereController.getSpheres);
sphereRoutes.post("/", validateBody(createSphereSchema), sphereController.createSphere);
sphereRoutes.patch("/:id", validateBody(updateSphereSchema), sphereController.updateSphere);
sphereRoutes.delete("/:id", validateQuery(moveToQuery), sphereController.deleteSphere);
