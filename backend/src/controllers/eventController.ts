import type { Request, Response } from "express";
import * as eventService from "../services/eventService.js";

type IdParams = { id: string };

export async function getEvents(_req: Request, res: Response) {
  res.json(await eventService.list(res.locals.query));
}

export async function getEvent(req: Request<IdParams>, res: Response) {
  res.json(await eventService.getById(req.params.id));
}

export async function createEvent(req: Request, res: Response) {
  res.status(201).json(await eventService.create(req.body));
}

export async function updateEvent(req: Request<IdParams>, res: Response) {
  res.json(await eventService.update(req.params.id, req.body));
}

export async function deleteEvent(req: Request<IdParams>, res: Response) {
  await eventService.remove(req.params.id);
  res.status(204).end();
}
