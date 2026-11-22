import type { Request, Response } from "express";
import * as groupService from "../services/groupService.js";

type IdParams = { id: string };

export async function createGroup(req: Request, res: Response) {
  res.status(201).json(await groupService.create(req.body));
}

export async function updateGroup(req: Request<IdParams>, res: Response) {
  res.json(await groupService.update(req.params.id, req.body));
}

export async function deleteGroup(req: Request<IdParams>, res: Response) {
  await groupService.remove(req.params.id, res.locals.query.moveTo);
  res.status(204).end();
}
