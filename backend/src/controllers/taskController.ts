import type { Request, Response } from "express";
import * as taskService from "../services/taskService.js";

type IdParams = { id: string };

export async function getTasks(_req: Request, res: Response) {
  res.json(await taskService.list(res.locals.query));
}

export async function getTask(req: Request<IdParams>, res: Response) {
  res.json(await taskService.getById(req.params.id));
}

export async function createTask(req: Request, res: Response) {
  res.status(201).json(await taskService.create(req.body));
}

export async function updateTask(req: Request<IdParams>, res: Response) {
  res.json(await taskService.update(req.params.id, req.body));
}

export async function deleteTask(req: Request<IdParams>, res: Response) {
  await taskService.remove(req.params.id);
  res.status(204).end();
}
