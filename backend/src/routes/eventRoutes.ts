import { Router } from "express";
import * as eventController from "../controllers/eventController.js";
import { validateBody, validateIdParam, validateQuery } from "../middleware/validate.js";
import { createEventSchema, listEventsQuery, updateEventSchema } from "../schemas/event.js";

export const eventRoutes = Router();

eventRoutes.param("id", validateIdParam);

eventRoutes.get("/", validateQuery(listEventsQuery), eventController.getEvents);
eventRoutes.get("/:id", eventController.getEvent);
eventRoutes.post("/", validateBody(createEventSchema), eventController.createEvent);
eventRoutes.patch("/:id", validateBody(updateEventSchema), eventController.updateEvent);
eventRoutes.delete("/:id", eventController.deleteEvent);
